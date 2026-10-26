---
sidebar_position: 3
title: "Configuration"
description: "Layout of the proxy's TOML configuration file, the server options, inbound TLS certificates and protocol policy, and the environment overrides."
---

The proxy reads one TOML file, whose path is given as the first command-line argument or in the `PROXY_CONFIG` environment variable. TOML is the proxy's own configuration format, and has no relation to how Stalwart is configured.

The file is parsed and validated in full at startup, and the proxy does not start when validation fails. Among other things, validation checks the following:

- The default destination offers every mail protocol (IMAP, POP3, ManageSieve and submission) that a listener accepts.
- No destination sends credentials over a plaintext connection without an explicit override.
- A TLS connection to a backend addressed by IP address has a server name.
- The selected mapping store has its configuration section.

Validation does not catch everything. Keys that the proxy does not know are ignored without a warning, so a misspelled key silently takes its default value.

This page covers the layout of the file, the server options and inbound TLS. Backend [destinations](/docs/migration/proxy/destinations), [listeners](/docs/migration/proxy/listeners), [mappings](/docs/migration/proxy/mappings/) and [routing](/docs/migration/proxy/routing/) each have their own page.

## File layout

The file is divided into TOML tables, each for one part of the proxy:

| Table | Content |
| --- | --- |
| `[server]` | Process-wide options |
| `[tls]` | Inbound certificates (`[tls.certificate.<name>]`) and protocol policy (`[tls.protocols]`) |
| `[listener.<name>]` | The sockets the proxy accepts connections on |
| `[destination.<name>]` | The backends |
| `[routing]` | The default destination, the pass-through destination and the master user separators |
| `[mapping]` | The mapping store and its cache |
| `[capabilities.<protocol>]` | What the proxy advertises to clients before authentication |
| `[http]` and `[[http.route]]` | HTTP options and the ordered list of HTTP routing rules |
| `[oauth]` | The token claim used as routing identifier |
| `[admin]` | The management API (optional) |

The [examples](/docs/migration/proxy/#examples) contain complete annotated files.

## Server options

The `[server]` table holds the process-wide options. It is optional, and every key has a default:

| Key | Default | Description |
| --- | --- | --- |
| `threads` | `0` | Number of worker threads. `0` uses one per CPU core. |
| `hostname` | unset | Host name in the proxy's own submission greeting and replies. When unset, the greeting uses the local address. The proxy's `EHLO` to the backend uses the name the client announced, or this host name when the client announced none (`proxy` when `hostname` is unset). |
| `shutdown_grace` | `30s` | Time during which active sessions may finish after a shutdown signal. |
| `bridge_idle` | `1800s` | Maximum idle time of an established session before it is closed. |
| `backend_timeout` | `10s` | Time limit for each attempt to connect to a backend, and for the authentication on the backend. |
| `backend_connect_retries` | `1` | Number of additional attempts after a backend connection fails for a reason that can be retried. |
| `host_down_threshold` | `5` | Consecutive backend failures after which a destination is marked down. `0` disables the circuit breaker. |
| `host_down_min_clients` | `2` | Number of distinct client addresses that a streak of failures attributable to clients must span before it marks a destination down. `0` removes the requirement. |
| `host_down_cooldown` | `30s` | Time a destination stays marked down before connections are let through again. |
| `proxy_ttl` | `7` | Forwarding time-to-live sent to backends announced with XCLIENT or IMAP `ID`, decremented by one. A value of `1` or less makes the proxy refuse such connections. |
| `log_level` | `info` | Log verbosity. The `RUST_LOG` environment variable overrides it. |

Durations are a number followed by a unit, one of `ms`, `s`, `m`, `h` or `d`, for example `shutdown_grace = "45s"` or `bridge_idle = "1h"`.

`bridge_idle` applies after authentication, while client and backend exchange data. It must be long enough for IMAP `IDLE` sessions, which stay quiet for long periods. `backend_timeout`, the retries and the circuit breaker interact with backend health, as described under [Destinations](/docs/migration/proxy/destinations#health-and-resilience).

## Inbound TLS

The proxy terminates TLS for clients, both on listeners that use implicit TLS or STARTTLS and on the management API. Two parts of the configuration govern it: the certificates, declared under `[tls.certificate.<name>]`, and the protocol policy, under `[tls.protocols]`.

### Certificates

Each certificate entry names a PEM certificate chain and its private key. It can also name the host names it serves, and whether it is the default:

```toml
[tls.certificate.primary]
cert = "/etc/proxy/tls/fullchain.pem"
key = "/etc/proxy/tls/privkey.pem"
subjects = ["mail.example.com", "*.example.com"]
default = true
```

The `cert` file holds the leaf certificate followed by the intermediate certificates, and the `key` file holds the matching private key. The `subjects` list names the host names that the certificate is presented for. When the list is omitted, the proxy reads the subject alternative names, or else the common name, from the certificate. `default = true` makes the certificate the one presented when no other entry matches. The name of the table (`primary` above) is a label only.

With a single certificate, that certificate is presented for every connection. When several certificates are declared, the proxy selects one per connection, from the Server Name Indication of the client, in this order:

1. An exact match on the requested name
2. A match on the name with its first label removed, so that an entry for `example.com`, or for `*.example.com`, serves `host.example.com`
3. The default certificate

A wildcard subject `*.example.com` is registered as `example.com`, and therefore also matches the name `example.com` itself.

When nothing matches and no default is set, the proxy presents a self-signed certificate that clients do not trust. A production configuration therefore always sets a default.

### Protocol policy

The `[tls.protocols]` table sets the handshake policy for all inbound TLS:

```toml
[tls.protocols]
min_version = "1.2"
ignore_client_order = false
disable_cipher_suites = []
```

`min_version` is `"1.2"` (the default, which allows TLS 1.2 and 1.3) or `"1.3"`. With `ignore_client_order = true`, the server's cipher suite order takes precedence over the client's. `disable_cipher_suites` lists cipher suites, by their standard names, to remove from the negotiated set. Unknown names are ignored, and a list that removes every suite is rejected at startup.

The policy applies to client connections and to the management API, not to backends. Connections to backends always use TLS 1.2 or later, and their TLS is configured per destination, as described under [Destinations](/docs/migration/proxy/destinations#backend-certificate-verification).

## Environment overrides

Three environment variables take precedence over the file:

- `PROXY_CONFIG` names the configuration file.
- `RUST_LOG` overrides `server.log_level`.
- `PROXY_ADMIN_TOKEN` overrides the management token in `[admin]`.

They are described in [Environment overrides](/docs/migration/proxy/management/#environment-overrides).
