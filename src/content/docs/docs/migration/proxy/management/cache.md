---
sidebar_position: 3
title: "Cache invalidation"
---

The proxy caches the result of every mapping lookup in memory so that established accounts resolve without consulting the [mapping store](/docs/migration/proxy/mappings/). The cache is what keeps the store off the hot path, but it also means that a change to a mapping does not take effect instantly: an account already in the cache continues to resolve to its old destination until the cached entry expires. During a migration cutover, where an account is moved and should immediately follow to its new backend, the cache is invalidated to force the account to be re-resolved at once.

## Cache lifetimes

The cache distinguishes three kinds of result, each with its own lifetime configured under `[mapping]`:

- A **resolved** mapping is held for `positive_ttl` (10 minutes by default). An account with an explicit destination stays resolved to it for this long.
- A **fall-through** to the default destination is held for `negative_ttl` (30 seconds by default). The shorter lifetime means that giving an account a new explicit mapping takes effect quickly, since the previous fall-through expires soon.
- A **transient** result, produced when the store is unreachable, is held for only a few seconds, so the store is retried promptly.

These lifetimes are bound at startup and require a restart to change. The natural consequence is that, without intervention, a migrated account picks up its new destination within `positive_ttl` if it had an explicit mapping, or within `negative_ttl` if it was previously falling through to the default. Invalidation is the way to make the change immediate.

## Forcing re-resolution

A single account is re-resolved immediately by invalidating its cache entry through the [management API](/docs/migration/proxy/management/api):

```bash
curl -sk -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/cache/invalidate?identifier=alice@example.com"
```

The next connection for that account misses the cache, consults the store, and picks up its new destination. The same endpoint with no `identifier` parameter clears the entire cache, which forces every account to be re-resolved on its next connection; this is appropriate after a bulk update to the mapping table.

## Reloading the mapping table

Invalidation only clears cached lookups; it does not re-read the underlying store. For the [file source](/docs/migration/proxy/mappings/file), where the mapping table is loaded into memory at startup, editing the file on disk additionally requires a reload to take effect:

```bash
curl -sk -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings/reload"
```

A reload re-reads and validates the file, replacing the in-memory table only if the file is valid. The Redis and SQL sources read from their database on each cache miss, so they have nothing to reload; for them, invalidating the cache is sufficient to surface a change made directly in the store.

A typical bulk cutover therefore updates the mapping table (regenerating the file and reloading it, or writing the new rows to Redis or SQL), then invalidates the cache so the changes take effect without waiting for entries to expire.
