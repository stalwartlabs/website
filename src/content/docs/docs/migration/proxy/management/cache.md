---
sidebar_position: 3
title: "Cache invalidation"
description: "How long the proxy caches mapping lookups, and how to make a changed mapping take effect at once for one account or for all."
---

The proxy caches the result of every mapping lookup in memory, so that established accounts resolve without reading the [mapping store](/docs/migration/proxy/mappings/). The cache has a side effect: a change made directly in the store does not take effect at once. An account in the cache keeps resolving to its previous destination until its entry expires. When an account moves and must follow at once, its cache entry is therefore invalidated.

## Cache lifetimes

The lifetimes are set in `[mapping]`. `positive_ttl`, 10 minutes by default, applies to a lookup that found a mapping. `negative_ttl`, 30 seconds by default, applies to a lookup that found none. A failed lookup is cached for 5 seconds or `negative_ttl`, whichever is shorter, as described under [Caching](/docs/migration/proxy/mappings/#caching).

Without intervention, an account whose mapping changes in the store picks up its new destination within one of these lifetimes: within `positive_ttl` when it had a mapping before, and within `negative_ttl` when it resolved to the default destination.

Not every change needs intervention. Changes made through `PUT /mappings` and `DELETE /mappings` on the [management API](/docs/migration/proxy/management/api#mappings) invalidate the account's cache entry themselves, and need no further step. A configuration reload also empties the cache, and applies changed lifetimes.

## Invalidating one account or the whole cache

The cached lookup of one account is removed with:

```bash
curl -sk -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/cache/invalidate?identifier=alice@example.com"
```

The account's next connection reads the store, and picks up its current destination.

Without the `identifier` parameter, the same call clears the whole cache, so that every account is looked up again on its next connection. This is the step that follows a bulk change of the store.

Invalidating the cache does not close open sessions. They keep their backend until they end, or until they are closed with `POST /connections/kick`.

## Reloading the mapping file

Invalidating the cache does not read the store again. This matters for the [file store](/docs/migration/proxy/mappings/#file-source), which holds the file's content in memory. After the file is edited, reload it first, and then clear the cache:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings/reload"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/cache/invalidate"
```

The reload reads and checks the file, and replaces the table in memory only when the file is valid. The Redis and SQL stores are read on every cache miss, and have nothing to reload. For them, invalidating the cache is enough to make a change in the store visible.

A bulk switch of accounts therefore takes three steps:

1. Write the new entries to the store, by editing and reloading the file, or by writing to Redis or SQL.
2. Clear the cache.
3. Close the switched accounts' sessions with `POST /connections/kick`.
