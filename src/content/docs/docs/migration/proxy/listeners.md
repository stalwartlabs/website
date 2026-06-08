---
sidebar_position: 5
title: "Listeners"
---

A listener is a socket the proxy accepts client connections on, bound to one protocol. Listeners are declared as named tables under `[listener.*]`; the name is an arbitrary label used in logs and has no other significance. A typical deployment declares one listener per protocol and port, often with both an implicit-TLS and a STARTTLS variant of the same protocol so that clients using either convention are served.

```toml
[listener.imap]
protocol = "imap"
bind = ["0.0.0.0:993", "[::]:993"]
tls = "implicit"

[listener.imap-starttls]
protocol = "imap"
bind = ["0.0.0.0:143", "[::]:143"]
tls = "starttls"
```

## Listener options

| Key | Default | Description |
| --- | --- | --- |
| `protocol` | required | One of `imap`, `pop3`, `managesieve`, `submission`, `smtp`, `lmtp` or `http`. |
| `bind` | required | List of socket addresses to listen on. At least one is required. |
| `tls` | required | `implicit`, `starttls` or `plain`. |
| `proxy_protocol` | `off` | Whether to accept a PROXY protocol header from the connecting peer: `off`, `optional` or `required`. |
| `proxy_trusted` | empty | CIDR ranges allowed to send a PROXY header. Required when `proxy_protocol` is not `off`. |
| `max_connections` | `8192` | Maximum number of simultaneous connections on this listener. |
| `preauth_timeout` | `30s` | Time limit for the client to complete the pre-authentication dialogue. |
| `max_auth_attempts` | `3` | Number of authentication failures tolerated before the connection is dropped. |
| `forwarded` | `off` | For HTTP listeners, whether inbound `Forwarded` and `X-Forwarded-For` headers from the client are trusted. |

The `bind` list accepts both IPv4 and IPv6 addresses, so binding a protocol on `0.0.0.0` and `[::]` serves clients on both stacks. Binding privileged ports below 1024 requires the proxy to hold the `CAP_NET_BIND_SERVICE` capability, which the supplied service unit and container image already arrange.

## Transport modes

The `tls` mode determines how the connection begins. With `implicit`, the proxy performs a TLS handshake immediately upon accepting the connection, which is the convention for ports such as 993 (IMAPS), 995 (POP3S) and 465 (submissions). With `starttls`, the connection begins in cleartext and the client may upgrade it with the protocol's STARTTLS command, the convention for ports such as 143, 110 and 587. With `plain`, the connection is never encrypted; this is intended for the SMTP and LMTP pass-through protocols on trusted networks, and for backends reached over an already-secure channel.

The pass-through protocols `smtp` and `lmtp` cannot use `starttls`, because the proxy bridges them as an opaque byte stream rather than terminating the protocol, and therefore cannot intercept a STARTTLS command to perform the upgrade. This combination is rejected at startup; `plain` or `implicit` must be used instead. The distinction between the interactive and pass-through protocols is explained under [Routing](/docs/migration/proxy/routing/).

Every interactive protocol a listener accepts must be declared on the default destination, since connections without an explicit mapping fall back to it. A listener for a protocol the default destination does not offer is rejected at startup.

## Connection limits and timeouts

`max_connections` caps the number of concurrent connections a listener will serve; once the limit is reached, further connections are dropped until existing ones close. `preauth_timeout` bounds the time a client has to authenticate, which limits how long a half-open connection can hold resources before the proxy abandons it. `max_auth_attempts` closes a connection after the configured number of authentication failures, which slows down credential-guessing against the proxy.

## Accepting the PROXY protocol

When the proxy itself sits behind a load balancer or another proxy, the connecting peer is not the real client, and the client's true address arrives in a PROXY protocol header. Setting `proxy_protocol` to `optional` or `required` instructs the listener to read that header and adopt the addresses it carries. The `proxy_trusted` list names the CIDR ranges permitted to send such a header and is mandatory whenever `proxy_protocol` is enabled, so that an untrusted client cannot spoof its address.

```toml
[listener.imap]
protocol = "imap"
bind = ["0.0.0.0:993"]
tls = "implicit"
proxy_protocol = "required"
proxy_trusted = ["10.0.0.0/8"]
```

With `optional`, a header from a trusted peer is honored and its absence is tolerated; a connection from outside the trusted ranges is served using its real socket address. With `required`, a trusted peer that fails to send a valid header is rejected, and an untrusted peer is rejected outright. This inbound PROXY handling is independent of the PROXY headers the proxy emits toward backends, which are configured per [destination](/docs/migration/proxy/destinations).

For HTTP listeners, the `forwarded` key plays an analogous role at the application layer: when set to `trust`, inbound `Forwarded` and `X-Forwarded-For` headers are preserved and extended; when `off`, they are stripped so that a client cannot inject a forged forwarding chain. This is described further on the [HTTP routing](/docs/migration/proxy/routing/http) page.

## Advertised capabilities and banners

For the interactive protocols, the proxy conducts the pre-authentication dialogue itself rather than relaying it to a backend, since the backend is not selected until the client has authenticated. As a result, the greeting banner, the advertised protocol extensions, and the offered authentication mechanisms are produced by the proxy and are configurable under `[capabilities.*]`. Each interactive protocol has its own table: `[capabilities.imap]`, `[capabilities.pop3]`, `[capabilities.submission]` and `[capabilities.managesieve]`.

The defaults advertise a broad, modern capability set and are suitable for most deployments; customization is mainly useful to match what a particular backend supports or to constrain the authentication mechanisms on offer. The common keys are:

- `sasl`: the list of SASL mechanisms advertised. The defaults are `PLAIN`, `OAUTHBEARER` and `XOAUTH2`. The proxy intercepts and replays these mechanisms regardless of the backend; the `LOGIN` mechanism is never advertised because the proxy reconstructs it as `PLAIN` internally.
- `allow_plain_auth_without_tls`: whether cleartext authentication (`PLAIN`, and the IMAP `LOGIN` and POP3 `USER`/`PASS` commands) is permitted before TLS is established. The default is `false`, which causes the proxy to advertise `LOGINDISABLED` and to reject cleartext authentication with a privacy-required error until the connection is encrypted.
- `banner`: the greeting text presented on connection.

```toml
[capabilities.imap]
banner = "Stalwart IMAP4rev2 at your service."
allow_plain_auth_without_tls = false
sasl = ["PLAIN", "OAUTHBEARER", "XOAUTH2"]
```

The IMAP table additionally accepts `advertise`, the list of capability tokens announced in the greeting and in response to the `CAPABILITY` command. The ManageSieve table accepts `sieve`, the list of supported Sieve extensions, and `implementation`, the implementation string reported to clients. The submission table accepts `ehlo`, the list of ESMTP keywords announced in the `EHLO` response.

Whether cleartext authentication is permitted is computed from `allow_plain_auth_without_tls` together with whether the connection is already encrypted, so on an implicit-TLS listener cleartext mechanisms are always available, while on a STARTTLS listener they only become available after the upgrade unless the override is set.

## OAuth identity claim

When clients authenticate with an OAuth bearer token rather than a password, the proxy derives the routing identifier from a claim inside the token. The `[oauth]` table selects which claim to read:

```toml
[oauth]
jwt_username_claim = "email"
```

The default claim is `email`. For tokens that are not standard JWTs, including Stalwart's own access tokens, the proxy applies built-in extraction rules described under [Routing](/docs/migration/proxy/routing/). The claim setting only affects how the routing identifier is determined; the token itself is forwarded unchanged for the backend to validate.
