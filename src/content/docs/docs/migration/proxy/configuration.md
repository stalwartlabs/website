---
sidebar_position: 3
title: "Configuration"
---

The proxy is configured by a single TOML file whose path is given on the command line or in the `PROXY_CONFIG` environment variable. The file is parsed and validated in full at startup, and the proxy will not begin serving if validation fails. Validation is strict by design: it checks that every listener references a protocol the default destination actually offers, that credential-bearing protocols are not exposed over plaintext without an explicit override, that TLS legs to IP-addressed backends carry a server name, and that the selected mapping source has its corresponding configuration section. The intent is that a configuration which passes validation cannot misroute or leak credentials at runtime through a simple omission.

This page covers the global server options and inbound TLS termination. The remaining areas have dedicated pages: backend [destinations](/docs/migration/proxy/destinations), [listeners](/docs/migration/proxy/listeners), [mappings](/docs/migration/proxy/mappings/) and [routing](/docs/migration/proxy/routing/).

## File layout

A configuration file is composed of a small number of top-level tables. The `[server]` table holds process-wide tuning, `[tls]` defines inbound certificates and protocol policy, `[listener.*]` tables declare the sockets the proxy accepts on, `[destination.*]` tables describe the backends, `[routing]` and `[mapping]` control how accounts are resolved to destinations, `[capabilities.*]` customize what the proxy advertises to clients, `[http.route]` entries govern HTTP routing, and an optional `[admin]` table enables the management API. A complete annotated example is provided under [Examples](/docs/migration/proxy/examples/).

## Server options

The `[server]` table is optional; every key has a default, so an empty table or none at all yields a sensible configuration. The available keys are:

| Key | Default | Description |
| --- | --- | --- |
| `threads` | `0` | Number of worker threads in the async runtime. `0` uses one per available CPU core. |
| `hostname` | unset | Hostname the proxy presents in SMTP greetings and forwarded metadata. When unset, the local socket address is used. |
| `shutdown_grace` | `30s` | Time allowed for active connections to drain after a shutdown signal before the process exits. |
| `bridge_idle` | `1800s` | Maximum idle time on an established bridged session before it is closed. |
| `backend_timeout` | `10s` | Time limit for establishing and authenticating a backend connection. |
| `backend_connect_retries` | `1` | Number of additional attempts for a retryable backend connection failure. |
| `host_down_threshold` | `5` | Consecutive backend failures after which a destination is marked down. `0` disables the circuit breaker. |
| `host_down_cooldown` | `30s` | Duration a destination stays marked down before the next connection is allowed to probe it. |
| `proxy_ttl` | `7` | Initial forwarding time-to-live, decremented at each hop, used to detect proxy loops. |
| `log_level` | `info` | Tracing verbosity. Overridden by the `RUST_LOG` environment variable when set. |

Durations are written as a number followed by a unit: `ms`, `s`, `m`, `h` or `d`. For example, `shutdown_grace = "45s"` or `bridge_idle = "1h"`.

The `bridge_idle` value applies to the data-transfer phase of a session and should be set high enough to accommodate long-lived IMAP `IDLE` connections. The `backend_timeout`, retry and circuit-breaker settings shape how the proxy reacts when a backend is slow or unavailable; their interaction with backend health is described under [Destinations](/docs/migration/proxy/destinations).

## Inbound TLS

The proxy terminates TLS for clients on listeners configured with implicit TLS or STARTTLS. Inbound certificates are declared as named entries under `[tls.certificate.*]`, and the cryptographic policy is set under `[tls.protocols]`.

### Certificates

Each certificate entry names a PEM-encoded certificate chain and private key, and optionally the subject names it should serve and whether it is the default:

```toml
[tls.certificate.primary]
cert = "/etc/proxy/tls/fullchain.pem"
key = "/etc/proxy/tls/privkey.pem"
subjects = ["mail.example.com", "*.example.com"]
default = true
```

The `cert` file must contain the leaf certificate followed by any intermediate certificates; the `key` file holds the matching private key. The `subjects` list declares the hostnames the certificate answers for during the TLS handshake. When `subjects` is omitted, the proxy reads the subject alternative names (or, failing that, the common name) directly from the certificate, so an explicit list is only needed to override what the certificate itself declares. Setting `default = true` marks the certificate as the catch-all presented when no other entry matches the requested name.

Multiple certificates may be declared, and the proxy selects one per connection using the Server Name Indication the client sends. Selection proceeds from most to least specific: an exact match on the requested name is preferred, then a match on the parent domain (so a certificate registered for `example.com` serves `host.example.com`), then the entry marked `default`. If only a single certificate is configured it is used for every connection regardless of the requested name. When nothing matches and no default is set, the proxy presents an internally generated self-signed certificate, which allows the handshake to complete but will not be trusted by clients; production deployments should always configure a real certificate and a default.

A wildcard entry registered under the name `*` (or a certificate marked `default`) acts as the fallback for unmatched names.

### Protocol policy

The `[tls.protocols]` table tunes the handshake policy applied to all inbound TLS:

```toml
[tls.protocols]
min_version = "1.2"
ignore_client_order = false
disable_cipher_suites = []
```

`min_version` accepts `"1.2"` or `"1.3"`; the default of `"1.2"` enables both TLS 1.2 and 1.3, while `"1.3"` restricts the proxy to TLS 1.3 only. `ignore_client_order`, when set to `true`, makes the server's cipher-suite preference order take precedence over the client's. `disable_cipher_suites` is a list of cipher-suite names to remove from the negotiated set, identified by their standard names; removing every available suite is rejected at startup.

TLS on the legs from the proxy to each backend is configured independently, per destination, and is covered under [Destinations](/docs/migration/proxy/destinations).

## Environment overrides

A few environment variables influence startup independently of the configuration file. `PROXY_CONFIG` supplies the configuration path when no command-line argument is given. `RUST_LOG` overrides `server.log_level` with a tracing filter expression. `PROXY_ADMIN_TOKEN` supplies the management API bearer token and takes precedence over the token configured in the `[admin]` table. These are described in context under [Management](/docs/migration/proxy/management/).
