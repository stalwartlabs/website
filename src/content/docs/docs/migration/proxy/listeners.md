---
sidebar_position: 5
title: "Listeners"
description: "Reference for proxy listeners and the capabilities, banners and authentication mechanisms the proxy advertises before authentication."
---

A listener is a socket on which the proxy accepts client connections for one protocol. Listeners are declared as named tables under `[listener.<name>]`, where the name is a label used in logs.

A deployment usually declares one listener per protocol and port. It often declares both an implicit TLS and a STARTTLS listener for the same protocol, so that clients using either convention are served:

```toml
[listener.imap]
protocol = "imap"
bind = ["[::]:993"]
tls = "implicit"

[listener.imap-starttls]
protocol = "imap"
bind = ["[::]:143"]
tls = "starttls"
```

Listener settings are read only at startup, so changing them requires restarting the proxy.

## Listener options

| Key | Default | Description |
| --- | --- | --- |
| `protocol` | required | `imap`, `pop3`, `managesieve`, `submission`, `smtp`, `lmtp` or `http`. |
| `bind` | required | Socket addresses to listen on; at least one. |
| `tls` | required | `implicit`, `starttls` or `plain`. |
| `proxy_protocol` | `off` | Whether a PROXY protocol header is accepted from the connecting peer: `off`, `optional` or `required`. |
| `proxy_trusted` | empty | Networks, in CIDR notation, allowed to send a PROXY header. Required when `proxy_protocol` is not `off`. |
| `max_connections` | `8192` | Maximum number of simultaneous connections on the listener. |
| `preauth_timeout` | `30s` | Time limit for each step before authentication: reading a PROXY header, the TLS handshake, each command exchange, and for HTTP the first request head. |
| `max_auth_attempts` | `3` | Number of failed authentications after which the connection is closed. |
| `forwarded` | `off` | For HTTP listeners, whether `Forwarded` and `X-Forwarded-For` headers sent by the client are kept (`trust`) or removed (`off`). |

`bind` accepts IPv4 and IPv6 addresses, and the right list depends on the system. On Linux, with the default `net.ipv6.bindv6only = 0`, binding `[::]` accepts both IPv4 and IPv6 connections. An additional `0.0.0.0` entry for the same port then fails, because the port is already in use. The examples in this section therefore bind `[::]` only. On a system where IPv6 sockets accept only IPv6, list both `0.0.0.0` and `[::]`.

An address that cannot be bound is skipped, with `failed to bind` in the log, and the proxy runs with the other addresses and listeners. Binding ports below 1024 requires the `CAP_NET_BIND_SERVICE` capability, which the service unit of the install script and the container image grant.

## TLS modes

The `tls` mode sets how a connection starts:

- With `implicit`, the proxy performs the TLS handshake as soon as it accepts the connection. This is the convention of ports 993 (IMAP), 995 (POP3) and 465 (submission).
- With `starttls`, the connection starts without TLS, and the client upgrades it with the protocol's STARTTLS command. This is the convention of ports 143, 110 and 587.
- With `plain`, the proxy never encrypts the connection.

The pass-through protocols `smtp` and `lmtp` cannot use `starttls`. The proxy passes these sessions to the backend as an uninterpreted stream, so it cannot answer a STARTTLS command itself, and the combination is rejected at startup. Two modes remain for them:

- With `plain`, a STARTTLS negotiation between the sending server and the backend passes through the proxy unchanged. Inbound mail on port 25 is therefore still encrypted between the two.
- With `implicit`, the proxy terminates TLS with its own certificate, and passes the decrypted session to the backend.

The difference between the interactive and the pass-through protocols is explained under [Routing](/docs/migration/proxy/routing/).

The default destination must offer every mail protocol (IMAP, POP3, ManageSieve and submission) that a listener accepts, because connections of accounts without a mapping go to it. A listener for such a protocol that the default destination does not declare is rejected at startup.

## Connection limits and timeouts

`max_connections` limits the number of concurrent connections on a listener. Further connections are refused until existing ones close.

`preauth_timeout` limits each step before authentication, and starts again after each rejected attempt. It bounds how long an idle, unauthenticated connection holds resources. An HTTP client that sends no request head in time receives `408 Request Timeout`.

`max_auth_attempts` closes a connection after the given number of failed authentications. It counts both the attempts that the proxy rejects itself and the credentials that the backend rejects. This slows down password guessing through the proxy, and limits the number of backend connections that one client connection can cause.

## Accepting the PROXY protocol

The proxy itself may sit behind a load balancer or another proxy. The connecting peer is then not the client, and the client's address arrives in a PROXY protocol header. With `proxy_protocol` set to `optional` or `required`, the listener reads the header and uses the addresses it carries.

`proxy_trusted` lists the networks allowed to send the header. It is mandatory whenever `proxy_protocol` is enabled, so that other peers cannot forge their address:

```toml
[listener.imap]
protocol = "imap"
bind = ["[::]:993"]
tls = "implicit"
proxy_protocol = "required"
proxy_trusted = ["10.0.0.0/8"]
```

The two modes differ in how they treat a connection without a valid header:

- With `optional`, a header from a trusted peer is honoured, and a connection without one is accepted. A connection from outside the trusted networks is served with its socket address.
- With `required`, a trusted peer that sends no valid header is rejected, and so is any peer outside the trusted networks.

This setting concerns only the PROXY headers that the proxy receives. The headers it sends to backends are configured per [destination](/docs/migration/proxy/destinations#client-address-forwarding).

For HTTP listeners, `forwarded` plays the same role for request headers. With `off`, the proxy removes `Forwarded` and `X-Forwarded-For` headers sent by the client, so that a client cannot forge its address chain. With `trust`, the headers are kept, and they are extended with the client's address when the destination sets `forwarded = true`. The [HTTP routing](/docs/migration/proxy/routing/http#forwarding-headers) page describes both settings.

## Capabilities and banners

The proxy conducts the dialogue before authentication itself, because it chooses the backend only once the client has authenticated. The greeting, the advertised protocol extensions and the offered authentication mechanisms therefore come from the proxy, not from the backend. They are configured under `[capabilities.imap]`, `[capabilities.pop3]`, `[capabilities.submission]` and `[capabilities.managesieve]`.

The defaults advertise a modern set of capabilities, and suit most deployments. Changing them is useful in two cases: to match what a particular backend supports, or to restrict the authentication mechanisms on offer. Every table accepts the following keys:

| Key | Default | Description |
| --- | --- | --- |
| `sasl` | `["PLAIN", "LOGIN", "OAUTHBEARER", "XOAUTH2"]` | SASL mechanisms advertised. Only these four values are valid; an unknown or repeated value is rejected at startup. |
| `allow_plain_auth_without_tls` | `false` | Allows cleartext authentication before the connection is encrypted. |

The other keys depend on the protocol:

| Table | Key | Default |
| --- | --- | --- |
| `[capabilities.imap]` | `banner` | `Stalwart IMAP4rev2 at your service.` |
| | `advertise` | `["IMAP4rev2", "IMAP4rev1", "ENABLE", "SASL-IR", "LITERAL+", "ID", "UTF8=ACCEPT", "JMAPACCESS"]` |
| `[capabilities.pop3]` | `banner` | `Stalwart POP3 at your service.` |
| `[capabilities.submission]` | `banner` | `at your service.` (the greeting is `220 <hostname> ESMTP <banner>`) |
| | `ehlo` | `["ENHANCEDSTATUSCODES", "8BITMIME", "BINARYMIME", "SMTPUTF8", "PIPELINING", "CHUNKING", "REQUIRETLS", "SIZE"]` |
| `[capabilities.managesieve]` | `implementation` | `Stalwart ManageSieve` |
| | `sieve` | The Sieve extensions Stalwart supports |

Each list appears in a specific place in the protocol dialogue:

- The IMAP `advertise` list is announced in the greeting and in response to `CAPABILITY`, followed by the available `AUTH=` mechanisms.
- The submission `ehlo` list is announced in the `EHLO` response, to which the proxy adds `STARTTLS` and `AUTH`.
- The ManageSieve `sieve` list is announced as the supported Sieve extensions. ManageSieve has no `banner` key.

The following table sets the IMAP greeting and mechanisms:

```toml
[capabilities.imap]
banner = "Stalwart IMAP4rev2 at your service."
allow_plain_auth_without_tls = false
sasl = ["PLAIN", "LOGIN", "OAUTHBEARER", "XOAUTH2"]
```

### Authentication mechanisms

The `sasl` list decides only what is advertised, so the proxy accepts `PLAIN`, `OAUTHBEARER` and `XOAUTH2` whether or not they are in it. `LOGIN` is the exception: when it is removed from the list, it is neither advertised nor accepted. The proxy conducts a `LOGIN` exchange itself, and passes the result to the backend as `PLAIN`, as described under [Routing](/docs/migration/proxy/routing/#authentication-replay). Remove `LOGIN` only when every client supports `PLAIN`, because some older clients authenticate with `LOGIN` only.

Removing `PLAIN` from the list, by contrast, does not disable password logins. The IMAP `LOGIN` command and the POP3 `USER` and `PASS` commands are governed only by the TLS rule below.

Cleartext authentication covers the `PLAIN` and `LOGIN` mechanisms, the IMAP `LOGIN` command, and the POP3 `USER` and `PASS` commands. It is permitted when the connection is encrypted, or when `allow_plain_auth_without_tls` is `true`. On an implicit TLS listener, it is therefore always available. On a STARTTLS listener, it becomes available after the upgrade. Before the upgrade, the proxy advertises `LOGINDISABLED` in IMAP, and rejects the attempt with a protocol-specific reply:

- `NO [PRIVACYREQUIRED]` in IMAP
- `-ERR cleartext authentication requires TLS` in POP3
- `538 5.7.11 Encryption required for requested authentication mechanism` in submission

## OAuth identity claim

When a client authenticates with an OAuth bearer token, the proxy derives the routing identifier from the token. For a JSON Web Token, the `[oauth]` table selects the claim that is read first:

```toml
[oauth]
jwt_username_claim = "email"
```

The default claim is `email`. Stalwart's own access tokens are not JSON Web Tokens, and are read as described under [Routing](/docs/migration/proxy/routing/#routing-identifier).

The claim decides only the routing identifier. The token itself is passed to the backend unchanged, and the backend validates it.
