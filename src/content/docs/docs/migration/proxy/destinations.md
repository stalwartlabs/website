---
sidebar_position: 4
title: "Destinations"
description: "Reference for proxy destinations: backend endpoints and TLS modes, certificate verification and pinning, client address forwarding, plaintext credentials, health and source addresses."
---

A destination describes one backend that the proxy can route to. Every routing decision resolves to the name of a destination, and the [mappings](/docs/migration/proxy/mappings/) and [routing](/docs/migration/proxy/routing/) rules exist to choose that destination for each account.

A destination answers four questions about its backend: which host to connect to, which port and TLS mode each protocol uses on that host, how the proxy verifies the backend's certificate, and how the proxy announces the client to the backend.

Destinations are declared as named tables. The name is how `routing.default_destination`, `routing.smtp_passthrough_destination`, mapping entries and HTTP routes refer to the destination:

```toml
[destination.legacy]
host = "10.0.1.10"
tls_server_name = "mail.legacy.example.com"

[destination.legacy.protocol.imap]
port = 993
tls = "implicit"

[destination.legacy.protocol.submission]
port = 587
tls = "starttls"
```

## Keys

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `host` | string | required | Host name or IP address of the backend. A host name is resolved at each connection. |
| `tls_server_name` | string | `host` | Name expected in the backend's certificate. Required when `host` is an IP address and any protocol of the destination uses TLS. |
| `proxy_protocol` | boolean | `true` | Default client announcement when `forwarding` is not set: `true` selects `proxy`, `false` selects `none`. |
| `forwarding` | `proxy`, `xclient`, `none` | unset | How the client is announced to the backend. |
| `forwarded` | boolean | `false` | Adds the client address to the `Forwarded` and `X-Forwarded-For` headers of HTTP requests. |
| `tls_allow_invalid_certs` | boolean | `false` | Disables verification of the backend's certificate. |
| `tls_pinned_cert_sha256` | string | unset | SHA-256 fingerprint of the only certificate accepted from the backend. |
| `tls_client_cert` | path | unset | PEM client certificate for mutual TLS. Set together with `tls_client_key`. |
| `tls_client_key` | path | unset | PEM private key of the client certificate. |
| `source_ips` | list of addresses | `[]` | Local addresses that connections to the backend are made from. |
| `hide_auth_errors` | boolean | `false` | Replaces the backend's authentication failure message with a generic one. |
| `allow_plaintext_auth` | boolean | `false` | Allows credentials to be sent over a `plain` connection. |
| `protocol.<p>.port` | port | required | Port of protocol `<p>` on the backend. |
| `protocol.<p>.tls` | `implicit`, `starttls`, `plain` | required | TLS mode of protocol `<p>`. |
| `protocol.<p>.forwarding` | `proxy`, `xclient`, `none` | unset | Client announcement for protocol `<p>`, overriding `forwarding`. |

## Protocols and TLS modes

Each protocol that the backend serves is declared as a table under `protocol`, with the port and the TLS mode for that protocol. The protocols are `imap`, `pop3`, `managesieve`, `submission`, `smtp`, `lmtp` and `http`. The TLS modes are:

- `implicit`: the proxy starts TLS as soon as it connects.
- `starttls`: the proxy connects without TLS, and upgrades the connection with the protocol's STARTTLS command before sending credentials. For `smtp` and `lmtp`, which the proxy passes through without interpreting them, `starttls` behaves as `plain`. For `http`, it is not supported, and requests to such an endpoint fail with `502 Bad Gateway`.
- `plain`: the proxy connects without TLS.

A destination declares only the protocols it receives, with two exceptions. The default destination must declare every mail protocol (IMAP, POP3, ManageSieve and submission) that a listener accepts, because an account without a mapping falls back to it; the proxy checks this at startup. The pass-through destination must declare `smtp`, and also `lmtp` when an LMTP listener exists.

```toml
[destination.legacy.protocol.pop3]
port = 995
tls = "implicit"

[destination.legacy.protocol.managesieve]
port = 4190
tls = "starttls"

[destination.legacy.protocol.http]
port = 443
tls = "implicit"
```

## Backend certificate verification

By default, the proxy verifies the backend's certificate against the platform's trust store. The expected name is `tls_server_name`, or `host` when it is not set. An IP address cannot be matched against a certificate's names, so a destination whose `host` is an IP address, and which uses TLS, must set `tls_server_name`. The proxy checks this at startup.

```toml
[destination.new]
host = "10.0.1.20"
tls_server_name = "mail.new.example.com"
```

Two alternatives exist for backends whose certificates are not issued by a public authority:

- `tls_pinned_cert_sha256` accepts only the certificate whose SHA-256 fingerprint is given, as 64 hexadecimal characters, optionally separated by colons. Only the fingerprint of the backend's own certificate is compared; its names and validity dates are not checked. Pinning is the recommended way to authenticate a backend with a self-signed or privately issued certificate.
- `tls_allow_invalid_certs` disables verification. When it is set, a pin on the same destination is ignored.

```toml
[destination.new]
host = "10.0.1.20"
tls_server_name = "mail.new.example.com"
tls_pinned_cert_sha256 = "<64 hexadecimal characters>"
```

:::danger
With `tls_allow_invalid_certs = true`, the connection to the backend is not authenticated, and the clients' credentials are sent over a connection that a machine in the middle could intercept. The proxy logs a warning at startup for each destination with this setting. Use it only on an isolated, trusted network segment, and prefer certificate pinning.
:::

Some backends also require mutual TLS. For these, `tls_client_cert` and `tls_client_key` supply the client certificate and its key, and both must be set.

## Client address forwarding

The proxy terminates the client's connection and opens a new one to the backend. Without further information, the backend would therefore see the proxy's address as the client. The `forwarding` key selects how the proxy announces the real client:

- `proxy` starts the connection with a PROXY protocol version 2 header that carries the client's and the proxy's addresses. Stalwart and other servers that understand the PROXY protocol use this mode.
- `xclient` announces the client inside the protocol: with the `XCLIENT` command for submission, POP3 and ManageSieve, and with the `ID` command for IMAP, each only when the backend advertises it. A backend that rejects the command fails the connection with `backend rejected XCLIENT`. Dovecot and Postfix use this mode. For `http`, `smtp` and `lmtp`, it sends nothing.
- `none` sends no client information.

The mode for a protocol is taken from `protocol.<p>.forwarding`, then from `forwarding`, then from `proxy_protocol`. Because `proxy_protocol` defaults to `true`, every connection, including HTTP and pass-through SMTP, starts with a PROXY header unless the destination sets another mode. A backend that does not expect the header fails to read the connection. The details of each mode are described under [Routing](/docs/migration/proxy/routing/#forwarding-the-client-address).

For HTTP, `forwarded = true` additionally appends the client address to the `Forwarded` and `X-Forwarded-For` request headers. The headers and the PROXY header are independent, and a backend uses whichever it is configured to trust.

## Plaintext credentials

IMAP, POP3, ManageSieve, submission and HTTP carry credentials, so the proxy guards against sending them unencrypted in two places. At startup, a destination that declares one of these protocols with `tls = "plain"` is rejected, unless it sets `allow_plaintext_auth = true`. For the mail protocols, the proxy also checks, before replaying credentials, that the connection to the backend is encrypted. `allow_plaintext_auth` disables this check as well, for the `plain` endpoints of the destination.

The override is intended for backends reached over a connection that is protected by other means, such as the loopback interface or an encrypted tunnel:

```toml
[destination.local]
host = "127.0.0.1"
allow_plaintext_auth = true

[destination.local.protocol.imap]
port = 143
tls = "plain"
```

## Health and resilience

Each destination has a health state that acts as a circuit breaker. A failed connection to the backend increments the destination's count of consecutive failures. When the count reaches `server.host_down_threshold`, the destination is marked down for `server.host_down_cooldown`, and new connections to it fail at once. After the cooldown, connections are let through again.

The count, however, is reset only by a successful connection. A further failure that counts towards the threshold on its own therefore marks the destination down again at once. A threshold of `0` disables the circuit breaker. The [management API](/docs/migration/proxy/management/api#destinations) shows the health of each destination, and can reset it.

Not every failed connection shows that the backend is unhealthy. The proxy forwards the client's address, so a backend that has banned an abusive client rejects the connections that the proxy opens for that client, while it serves every other account normally. To keep one client from taking a destination down for everyone, the proxy classifies each failure by the stage at which it happened:

- A failure to connect (name resolution or the TCP connection), and a backend that does not complete the connection within `server.backend_timeout`, count towards the threshold on their own.
- A failure after the connection is established (a TLS error, an error greeting, or the backend closing the connection) is attributed to the client. Such failures mark the destination down only when the streak spans at least `server.host_down_min_clients` distinct client addresses.

An outage affects every client, and still trips the breaker, whereas a banned client never does. A value of `0` for `host_down_min_clients` counts failures alone.

The management API reports two values for each destination that help tell these cases apart. `failure_sources` is the number of distinct client addresses in the current streak, counted up to 64. `host_level_failure` is true when the streak includes a failure that counts on its own. A count that climbs while `failure_sources` stays at 1 points at one banned or misbehaving client, not at the backend.

Each connection attempt is limited by `server.backend_timeout`. An attempt that fails for a reason that can be retried is repeated up to `server.backend_connect_retries` times, and only the final failure counts towards the circuit breaker.

When the backend cannot be reached, the client receives a failure suited to its protocol. A mail client receives the protocol's temporary failure response, such as `[UNAVAILABLE]` in IMAP. An HTTP client receives `502 Bad Gateway`, and a pass-through SMTP connection is closed without a reply.

## Source addresses

`source_ips` sets the local addresses that connections to the backend are made from. With several addresses, the proxy uses those of the backend's address family in turn, which spreads the connections over them. This helps in two situations: when the backend limits connections per source address, and when traffic to the backend must leave from particular addresses.

```toml
[destination.legacy]
host = "10.0.1.10"
source_ips = ["10.0.2.5", "10.0.2.6"]
```

## Hiding backend authentication errors

When the backend rejects the replayed authentication, the proxy returns the backend's failure response to the client unchanged. With `hide_auth_errors = true`, it returns a generic authentication failure for the protocol instead. The setting applies to IMAP, POP3, ManageSieve and submission; HTTP responses are always passed unchanged.

The setting is a tradeoff. It keeps a backend from revealing details, such as whether an account exists, through its error text. In exchange, failures become harder to diagnose for legitimate users.
