---
sidebar_position: 4
title: "Destinations"
---

A destination describes one backend the proxy can route to. It bundles together the host to connect to, the per-protocol ports and TLS modes that host listens on, how the proxy authenticates the backend's certificate, and how the real client's identity is conveyed to that backend. Every routing decision the proxy makes resolves to the name of a destination, and the [mapping](/docs/migration/proxy/mappings/) and [routing](/docs/migration/proxy/routing/) layers ultimately exist to pick which destination handles each account.

Destinations are declared as named tables, where the name is the identifier referenced by `routing.default_destination`, by mapping entries, and by HTTP routes:

```toml
[destination.legacy]
host = "10.0.1.10"
tls_server_name = "mail.legacy.example.com"
proxy_protocol = true

[destination.legacy.protocol.imap]
port = 993
tls = "implicit"

[destination.legacy.protocol.submission]
port = 587
tls = "starttls"
```

## Host and endpoints

The `host` key gives the backend address as either a hostname or a literal IP address. When a hostname is supplied, the proxy resolves it at connection time, which allows the underlying address to change without restarting the proxy.

Each protocol the backend serves is declared as a sub-table under `protocol`, naming the port and the TLS mode for that leg. The recognized protocols are `imap`, `pop3`, `managesieve`, `submission`, `smtp`, `lmtp` and `http`. The TLS mode is one of:

- `implicit`: the proxy opens a TLS connection directly to the backend port.
- `starttls`: the proxy connects in cleartext and issues the protocol's STARTTLS command to upgrade the connection before sending credentials.
- `plain`: the proxy connects in cleartext and does not upgrade.

A destination only needs to declare the protocols it will actually receive. The default destination must declare every interactive protocol that any listener accepts, since a connection that resolves to no explicit mapping falls back to it; this is enforced at startup.

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

By default the proxy verifies each backend's TLS certificate against the host's platform trust store, exactly as an ordinary client would, using the expected server name. The expected name is taken from `tls_server_name` if set, otherwise from `host`. When the host is given as an IP address and any of its legs use TLS, `tls_server_name` is required, because an IP address cannot be matched against a certificate's subject names; this is checked at startup.

```toml
[destination.new]
host = "10.0.1.20"
tls_server_name = "mail.new.example.com"
```

Two alternatives to platform verification are available for backends whose certificates are not issued by a public authority:

- `tls_pinned_cert_sha256` pins the backend to a specific certificate by its SHA-256 fingerprint, given as 64 hexadecimal characters (colons are permitted and ignored). The connection succeeds only if the backend presents exactly that certificate. This is the recommended way to authenticate a backend that uses a self-signed or privately issued certificate.
- `tls_allow_invalid_certs` disables certificate verification entirely.

```toml
[destination.new]
host = "10.0.1.20"
tls_server_name = "mail.new.example.com"
tls_pinned_cert_sha256 = "aa:bb:cc:dd:..."
```

:::danger
Setting `tls_allow_invalid_certs = true` makes the proxy-to-backend leg unauthenticated, which means real client credentials are forwarded over a connection that could be intercepted by a machine-in-the-middle. The proxy logs a warning at startup for every destination with this flag set. It is acceptable only on a trusted, isolated network segment, and certificate pinning should be preferred wherever possible.
:::

When the backend requires mutual TLS, a client certificate and key are supplied with `tls_client_cert` and `tls_client_key`; both must be set together.

## Client identity forwarding

Because the proxy terminates the client connection and opens a fresh one to the backend, the backend would otherwise see the proxy's address rather than the client's. Two independent mechanisms convey the real client identity, selected per destination by the `forwarding` key (and, for the PROXY protocol, by `proxy_protocol`):

- `forwarding = "proxy"` prefixes the backend connection with a PROXY protocol v2 header carrying the original source and destination addresses. This is the appropriate choice for Stalwart backends and any server that understands the PROXY protocol.
- `forwarding = "xclient"` instead announces the client over the application protocol itself, using the `XCLIENT` command for SMTP, POP3 and ManageSieve, and the `ID` command for IMAP. This is the appropriate choice for Dovecot and Postfix backends.
- `forwarding = "none"` sends no client metadata.

When `forwarding` is not set, the proxy infers a mode from `proxy_protocol`: if `proxy_protocol = true` (the default) it behaves as `proxy`, otherwise as `none`. A `forwarding` value may also be overridden for an individual protocol leg inside its `[destination.<id>.protocol.<proto>]` table. The mechanics of each mode, including which attributes are sent, are detailed under [Routing](/docs/migration/proxy/routing/).

For HTTP destinations, the `forwarded` boolean controls whether the proxy appends the client address to the `Forwarded` and `X-Forwarded-For` request headers before relaying to the backend. This is separate from the PROXY protocol and is the usual way to convey the client address to an HTTP/JMAP backend.

## Plaintext credentials

Several protocols carry credentials in the clear once the connection is established. To prevent passwords from being forwarded over an unencrypted backend leg, the proxy refuses, at startup, any destination that exposes a credential-bearing protocol (IMAP, POP3, ManageSieve, submission or HTTP) with `tls = "plain"`, unless `allow_plaintext_auth = true` is set on that destination. Even with the override in place, the proxy still asserts at connection time that the egress leg is encrypted before sending credentials, so the override is meant for backends reached over an already-secure channel such as a loopback interface or an encrypted tunnel.

```toml
[destination.local]
host = "127.0.0.1"
allow_plaintext_auth = true

[destination.local.protocol.imap]
port = 143
tls = "plain"
```

## Health and resilience

Each destination has an associated health state that acts as a circuit breaker. When a backend connection fails, the destination's consecutive-failure counter is incremented; once it reaches `server.host_down_threshold`, the destination is marked down for `server.host_down_cooldown`, during which new connections to it are rejected immediately rather than waiting for a timeout. The first connection after the cooldown elapses is allowed through as a probe, and a success resets the counter. Setting the threshold to `0` disables this behavior. The current health of every destination is visible through the [management API](/docs/migration/proxy/management/api), which can also reset a destination's health on demand.

Within the `backend_timeout` window, a connection attempt that fails for a retryable reason is retried up to `server.backend_connect_retries` times with a short delay between attempts. When the backend ultimately cannot be reached, the client receives a protocol-appropriate temporary-failure response rather than an abrupt disconnect.

## Source addresses

The `source_ips` key pins the local address the proxy binds before connecting to the backend. When more than one address is listed, the proxy selects among those matching the backend's address family in round-robin fashion, which spreads outbound connections across several local addresses. This is useful when the backend applies per-source connection limits or when outbound traffic must originate from specific addresses for firewall or routing reasons.

```toml
[destination.legacy]
host = "10.0.1.10"
source_ips = ["10.0.2.5", "10.0.2.6"]
```

## Hiding backend authentication errors

By default, when the backend rejects the replayed authentication, the proxy passes the backend's failure response back to the client verbatim. Setting `hide_auth_errors = true` on a destination replaces the backend's message with a generic authentication-failure response for the protocol in use. This prevents a backend from leaking distinguishing details (such as whether an account exists) through its error text, at the cost of less specific diagnostics for legitimate users.
