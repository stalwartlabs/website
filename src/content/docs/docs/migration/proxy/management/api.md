---
sidebar_position: 4
title: "Management API"
description: "Reference for the proxy's management API: configuration, authentication, and the endpoints for health, statistics, destinations, mappings, cache, connections and reload."
---

The management API is an HTTP interface for observing and changing a running proxy. It serves statistics, destination health, mapping management, cache control, connection control and configuration reload. The API is available only when the configuration contains an `[admin]` table.

## Configuration

The `[admin]` table configures the API's listener and its authentication:

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
| `bind` | required | Address and port of the API's listener. |
| `tls` | `implicit` | Must be `implicit`. Any other value is rejected with `admin.tls must be implicit (plaintext admin is rejected)`. |
| `bearer_token_file` | unset | File holding the bearer token. Surrounding white space is removed. |
| `bearer_token` | unset | Bearer token given inline in the configuration file. |
| `min_token_len` | `32` | Minimum token length, in bytes. |
| `lockout_threshold` | `5` | Failed authentications from one address after which the address is locked out. |
| `lockout_duration` | `5m` | How long a locked-out address is refused. |

The API is always served over TLS, with the certificates of `[tls.certificate.*]` as they were at startup. A request without Server Name Indication, such as one to an IP address, receives the single configured certificate, or the default one.

The token is taken from the `PROXY_ADMIN_TOKEN` environment variable, then from `bearer_token_file`, then from `bearer_token`. At least one must be present (`admin requires bearer_token_file, bearer_token, or PROXY_ADMIN_TOKEN`), and a token shorter than `min_token_len` stops the proxy from starting. The token is read only at startup, so changing it requires a restart.

The bind address decides who can reach the API. Binding it to the loopback address, as in the example, makes it reachable only from the host. A routable address exposes it to the network, and is appropriate only on a trusted segment.

Failed authentications are counted per client address. When an address reaches `lockout_threshold`, it is refused with `429 Too Many Requests` for `lockout_duration`, on every endpoint, including the health check. A successful authentication resets the count.

## Requests

Every endpoint except the health check requires the token in an `Authorization: Bearer` header, with `Bearer` written in that case. A missing or wrong token receives `401 Unauthorized`, for any path, and counts towards the lockout.

Each connection serves one request. Parameters are passed in the query string, and are percent-decoded, but a `+` is not decoded as a space. A trailing slash on the path is ignored. An unknown path receives `404 Not Found`, and a known path with the wrong method receives `405 Method Not Allowed`. Responses are plain text, except those described as JSON.

The examples use `curl -k`, which skips certificate verification, for an API whose certificate does not match the address used:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
curl -sk -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/stats
```

## Endpoints

| Method and path | Parameters | Purpose |
| --- | --- | --- |
| `GET /healthz` | | Liveness check, without authentication |
| `GET /stats` | | Cache and connection counters |
| `GET /destinations` | | Health of every destination |
| `POST /destinations/reset` | `destination` | Return a destination to service |
| `GET /mappings` | `identifier` | How an identifier resolves |
| `PUT /mappings` | `identifier`, `destination` | Create or replace a mapping |
| `DELETE /mappings` | `identifier` | Remove a mapping |
| `POST /mappings/reload` | | Read the mapping file again |
| `POST /cache/invalidate` | `identifier` (optional) | Clear cached lookups |
| `POST /connections/kick` | `identifier` | Close an account's sessions |
| `POST /connections/delay` | `identifier`, `seconds` | Hold an account's new sessions |
| `POST /config/reload` | | Read the configuration file again |

### Health

`GET /healthz` returns `200 OK` with the body `ok`, without authentication, for liveness checks:

```bash
curl -sk https://127.0.0.1:9443/healthz
```

### Statistics

`GET /stats` returns JSON with the cumulative cache hits and misses, the hit rate as a percentage, the number of cached entries, and the number of active connections:

```json
{
  "cache_hits": 18234,
  "cache_misses": 412,
  "hit_rate_pct": 97.79,
  "cache_entries": 380,
  "active_connections": 27
}
```

The counters start again at zero after a configuration reload.

### Destinations

`GET /destinations` returns JSON with each destination's count of consecutive failures, and whether the circuit breaker has marked it down. Two further fields help interpret the count. `failure_sources` is the number of distinct client addresses in the current streak of failures. `host_level_failure` is true when the streak includes a failure to connect to the backend at all. Together, they distinguish a failing backend from a backend that rejects one banned client, as described under [Destinations](/docs/migration/proxy/destinations#health-and-resilience):

```json
{
  "destinations": [
    {
      "destination": "legacy",
      "consecutive_failures": 12,
      "failure_sources": 1,
      "host_level_failure": false,
      "down": false
    }
  ]
}
```

`POST /destinations/reset?destination=<name>` clears the destination's failure count and down state, and returns `ok`. A missing parameter receives `400 Bad Request`, and an unknown destination receives `404 Not Found`:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/destinations/reset?destination=legacy"
```

### Mappings

`GET /mappings?identifier=<identifier>` returns JSON describing how the identifier resolves: its normalised form, the destination, whether the destination is the default destination, and whether the result was cached before the request.

The request performs a real lookup, so it fills the cache. It does not remove a master user suffix, so pass the account name without it:

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

`routed_to_default` is true whenever the destination is the default destination, including when an explicit mapping names it.

`PUT /mappings?identifier=<identifier>&destination=<name>` creates or replaces a mapping, and returns `ok`. It also invalidates the identifier's cache entry, so that the change applies to the next connection. The destination must be declared, or the request receives `400 Bad Request` with `unknown destination`:

```bash
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.com&destination=stalwart"
```

`DELETE /mappings?identifier=<identifier>` removes a mapping and invalidates its cache entry. It returns `removed`, or `absent` when there was no mapping. The account then resolves to the default destination:

```bash
curl -sk -X DELETE -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.com"
```

Writes require a writable store. The file and Redis stores are writable, while a SQL store is writable only when `upsert_query` and `delete_query` are set. A write to a read-only store receives `501 Not Implemented` with `mapping store is read-only`, and a failed write receives `500 Internal Server Error`.

`POST /mappings/reload` reads the mapping file again, and returns `reloaded`. For the Redis and SQL stores, it reads nothing, and returns the same. In both cases, it ends every login delay set with `POST /connections/delay`. The lookup cache is not cleared:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  https://127.0.0.1:9443/mappings/reload
```

### Cache

`POST /cache/invalidate?identifier=<identifier>` removes the cached lookup of one identifier. Without the parameter, it clears the whole cache. It returns `ok`. The [cache invalidation](/docs/migration/proxy/management/cache) page describes when to use each form:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/cache/invalidate?identifier=alice@example.com"
```

### Connections

`POST /connections/kick?identifier=<identifier>` closes every session of the account, and returns `kicked <n>`, the number of sessions closed. Closing the sessions makes the account's clients reconnect, and their new connections are routed by the current mapping.

A mail session is registered for its account once the backend accepts its authentication. An HTTP connection is registered once one of its requests identifies the account, which includes JMAP sessions over WebSocket:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=alice@example.com"
```

`POST /connections/delay?identifier=<identifier>&seconds=<n>` holds the account's new sessions for the given number of seconds, and returns `ok`. Each new session of the account waits until the delay ends, but for at most 120 seconds. It is then routed to the account's destination as it stands at that moment. An HTTP connection is held once one of its requests identifies the account. A client that retries is therefore held for at most 120 seconds per attempt:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/delay?identifier=alice@example.com&seconds=600"
```

Calling the endpoint again for the same identifier sets a new end for the delay. The new end also applies to the sessions already waiting, so `seconds=0` releases them at once. A `seconds` value that is not a whole number, or is too large to represent, receives `400 Bad Request` with `invalid seconds`.

A delay also ends when the account's mapping changes through the API, so that the held sessions go to the new destination at once:

- `PUT /mappings` and `DELETE /mappings` end the delay of their identifier.
- `POST /mappings/reload` ends every delay.
- With a Redis or SQL store, where mappings are changed outside the proxy, `POST /cache/invalidate` ends the delay of the identifier it names, or every delay when it names none.

Ending a delay removes it, so later sessions of the account are not held either. A configuration reload does not end delays.

Both endpoints require `identifier`, and the delay endpoint also requires `seconds`. A request without them receives `400 Bad Request` with `identifier required` or `identifier and seconds required`. Both endpoints take the account name without a master user suffix, normalised like a lookup. They act only on that exact identifier, so an account that signs in with two login forms, such as a bare name and an address, is kicked once for each.

### Configuration reload

`POST /config/reload` reads and validates the configuration file, and replaces the running configuration only when the file is valid. It returns JSON, `{"reloaded": true, "note": "..."}`. An invalid file receives `400 Bad Request` with `reload failed: <error>`. The [Management](/docs/migration/proxy/management/#configuration-reload) page lists what a reload applies and resets:

```bash
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  https://127.0.0.1:9443/config/reload
```
