---
sidebar_position: 4
title: "Management API"
---

The management API is a small HTTP interface for inspecting and adjusting a running proxy. It exposes statistics, mapping management, cache control, connection control and configuration reload. The API is optional and is only available when an `[admin]` table is present in the configuration.

## Enabling the API

The `[admin]` table configures the listener and its authentication:

```toml
[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
min_token_len = 32
lockout_threshold = 5
lockout_duration = "5m"
```

| Key | Default | Description |
| --- | --- | --- |
| `bind` | required | Address the management listener binds to. |
| `tls` | `implicit` | Must be `implicit`; plaintext administration is rejected. |
| `bearer_token_file` | unset | Path to a file containing the bearer token. |
| `bearer_token` | unset | Inline bearer token. |
| `min_token_len` | `32` | Minimum acceptable token length. |
| `lockout_threshold` | `5` | Failed attempts from one address before it is locked out. |
| `lockout_duration` | `5m` | How long a locked-out address is refused. |

The listener always uses TLS; a configuration that sets `tls` to anything other than `implicit` is rejected at startup, so the API is never served in the clear. The bearer token may be supplied from a file, inline, or through the `PROXY_ADMIN_TOKEN` environment variable, which takes precedence over both; at least one source must be present, and the token must be at least `min_token_len` characters. Binding to the loopback address, as in the example, keeps the API reachable only from the host; binding to a routable address exposes it to the network and should be done only on a trusted segment.

Repeated authentication failures from a single address are counted, and once `lockout_threshold` is reached that address is refused for `lockout_duration`, which slows brute-force attempts against the token.

## Authentication

Every endpoint except the health check requires a bearer token in the `Authorization` header. The token is compared in constant time. Because the listener uses TLS with a certificate that may be internally generated, the examples below use `curl -k` to skip certificate verification; in a deployment with a trusted certificate on the management listener this is unnecessary.

```bash
TOKEN=$(cat /etc/proxy/admin.token)
curl -sk -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/stats
```

## Endpoints

### Health

`GET /healthz` returns `200 OK` and requires no authentication. It is intended for liveness probes.

```bash
curl -sk https://127.0.0.1:9443/healthz
```

### Statistics

`GET /stats` returns the cache and connection counters as JSON: cumulative cache hits and misses, the hit rate as a percentage, the number of cached entries, and the number of active connections.

```bash
curl -sk -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/stats
```

```json
{
  "cache_hits": 18234,
  "cache_misses": 412,
  "hit_rate_pct": 97.79,
  "cache_entries": 380,
  "active_connections": 27
}
```

### Destinations

`GET /destinations` lists every destination with its consecutive-failure count and whether it is currently marked down by the health circuit breaker.

```bash
curl -sk -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/destinations
```

`POST /destinations/reset?destination=<id>` clears a destination's failure count and down state, returning it to service immediately.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/destinations/reset?destination=legacy"
```

### Mappings

`GET /mappings?identifier=<id>` reports how an identifier resolves: the normalized form, the destination it maps to, whether that is the default (a fall-through), and whether the result is currently cached. This is the diagnostic for confirming where a given account will be routed.

```bash
curl -sk -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.com"
```

```json
{
  "identifier": "alice@example.com",
  "normalized": "alice@example.com",
  "destination": "stalwart",
  "routed_to_default": false,
  "cached": true
}
```

`PUT /mappings?identifier=<id>&destination=<dest>` creates or replaces a mapping and invalidates the cached entry for that identifier, so the change takes effect on the next connection. The store must be writable and the destination must be declared; otherwise the request is refused.

```bash
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.com&destination=stalwart"
```

`DELETE /mappings?identifier=<id>` removes a mapping and invalidates its cached entry; the account then falls through to the default destination.

```bash
curl -sk -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.com"
```

Writes are only accepted when the mapping store supports them: the file and Redis sources are always writable, while a SQL source is writable only when both `upsert_query` and `delete_query` are configured. A write against a read-only store returns a not-implemented response.

`POST /mappings/reload` re-reads the mapping store from its source. This is meaningful for the file source, which is loaded into memory at startup; the Redis and SQL sources read on each lookup and return success without doing anything.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  https://127.0.0.1:9443/mappings/reload
```

### Cache

`POST /cache/invalidate?identifier=<id>` drops the cached entry for one account; with no `identifier` parameter it clears the whole cache. The [cache invalidation](/docs/migration/proxy/management/cache) page covers when to use each form.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/cache/invalidate?identifier=alice@example.com"
```

### Connections

`POST /connections/kick?identifier=<id>` disconnects all currently bridged sessions for an account and reports how many were terminated. This is useful to force a migrated account off its old backend immediately, so its next connection re-resolves to the new destination.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=alice@example.com"
```

`POST /connections/delay?identifier=<id>&seconds=<n>` holds back new logins for an account for the given number of seconds, pausing each new session briefly before it is established. This smooths a cutover by letting in-flight operations settle before the account begins connecting to its new backend.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/delay?identifier=alice@example.com&seconds=30"
```

### Configuration reload

`POST /config/reload` re-reads and validates the configuration file, swapping the running configuration only if it is valid. The response notes which settings require a restart instead. See [Management](/docs/migration/proxy/management/) for the reload semantics.

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  https://127.0.0.1:9443/config/reload
```
