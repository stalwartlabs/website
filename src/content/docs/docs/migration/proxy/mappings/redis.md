---
sidebar_position: 3
title: "Redis source"
---

The Redis source resolves mappings from a Redis database. It suits deployments where mappings change frequently or are shared between several proxy instances, since every proxy reads from the same central store and a change made anywhere is visible everywhere once cache entries expire. Lookups are still served from each proxy's in-memory cache, so Redis is consulted only on cache misses.

```toml
[mapping]
source = "redis"
normalize = "lowercase"

[mapping.redis]
url = "redis://10.0.3.1:6379"
key_prefix = "route:"
pool_size = 16
```

The keys under `[mapping.redis]` are:

| Key | Default | Description |
| --- | --- | --- |
| `url` | required | Connection URL for the Redis server. |
| `key_prefix` | `route:` | Prefix prepended to each identifier to form the Redis key. |
| `pool_size` | `16` | Number of connections held open to the server. |

The `url` follows the standard Redis URL syntax, including the `rediss://` scheme for TLS and an optional password and database number.

## Key layout

Each mapping is stored as a single string value under a key formed by concatenating `key_prefix` with the normalized identifier. With the default prefix, the destination for `alice@example.com` is read from the key `route:alice@example.com`. A lookup is a plain `GET`; a missing key, or a key whose value is empty, is treated as the absence of a mapping and routes the connection to the default destination.

```text
GET route:alice@example.com   ->  "legacy"
GET route:carol@example.com   ->  "stalwart"
```

Mappings are populated using ordinary Redis commands, so an external tool can manage the table directly:

```bash
redis-cli SET route:carol@example.com stalwart
redis-cli DEL route:alice@example.com
```

## Runtime updates

The Redis source is writable, so the [management API](/docs/migration/proxy/management/api) can create, replace and delete mappings, which the proxy performs with `SET` and `DEL` against the prefixed keys. Because the cache sits in front of Redis, a change made directly in Redis by an external tool becomes visible to a proxy once the relevant cache entry expires, or immediately if the entry is invalidated through the management API. The proxy maintains a small pool of `pool_size` connections and distributes requests across them.
