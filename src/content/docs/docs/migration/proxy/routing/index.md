---
sidebar_position: 1
title: "Overview"
description: "How the proxy routes a connection: the routing identifier, authentication replay, client address forwarding, TLS on both legs and loop prevention."
---

Routing is what the proxy does between accepting a client connection and joining it to a backend. The same sequence applies to every interactive protocol. This page describes that shared sequence, and the mechanisms that every protocol uses. The protocol pages ([mail protocols](/docs/migration/proxy/routing/imap), [SMTP and submission](/docs/migration/proxy/routing/smtp) and [HTTP](/docs/migration/proxy/routing/http)) describe what differs.

## Connection sequence

A connection of an interactive protocol (IMAP, POP3, ManageSieve or submission) goes through these stages:

1. **Before authentication.** The proxy sends its greeting and [capabilities](/docs/migration/proxy/listeners#capabilities-and-banners), negotiates STARTTLS where requested, and reads the client's authentication command. The proxy answers this dialogue itself, because the backend is not chosen yet.
2. **Routing identifier.** The proxy derives a routing identifier from the credentials, normalises it and removes a master user suffix.
3. **Resolution.** The identifier is looked up in the [mapping store](/docs/migration/proxy/mappings/), which returns a destination, or the default destination when the account has no mapping.
4. **Backend connection.** The proxy connects to the destination's endpoint for the protocol, announces the client as configured, and negotiates TLS with the backend.
5. **Authentication replay.** The proxy replays the client's authentication to the backend and reads the result.
6. **Bridging.** On success the two connections are joined, and the session continues between client and backend until either side closes it or it stays idle for longer than `server.bridge_idle`.

Two kinds of traffic depart from this sequence. SMTP and LMTP pass-through sessions skip stages 1, 2, 3 and 5: they are passed to one fixed destination as an uninterpreted stream, as described under [SMTP and submission](/docs/migration/proxy/routing/smtp). HTTP requests are routed one by one, by [route rules](/docs/migration/proxy/routing/http).

## Routing identifier

The routing identifier is the account name that the proxy looks up. It is taken from the authentication, in a way that depends on the mechanism:

- For password authentication (SASL `PLAIN` and `LOGIN`, the IMAP `LOGIN` command and the POP3 `USER` command), the identifier is the user name the client supplies. An authorisation identity in `PLAIN` is ignored.
- For `OAUTHBEARER`, the identifier is the authorisation identity in the frame (`a=`) when it contains `@`, and otherwise comes from the token.
- For `XOAUTH2`, and for a bearer token without a user name, the identifier comes from the token.

Tokens come in two forms, and the proxy reads the identifier from each differently:

- A Stalwart access token is recognised by its `sw1.` prefix. It carries the account name in a readable part, which the proxy uses. The rest of the token is encrypted, and is not read.
- Any other token is read as a JSON Web Token. The identifier is the first claim whose value contains `@`, trying the configured `jwt_username_claim` first, and then `email`, `preferred_username`, `upn`, `unique_name` and `sub`.

The proxy does not validate tokens. Their signature, expiry and audience are checked by the backend that receives them.

Tokens that carry no account name in either form yield no identifier. The proxy then uses the default destination for mail protocols, and the rule's fallback destination for HTTP. Older Stalwart servers issue such tokens, as described in the [migration troubleshooting](/docs/migration/guide/troubleshooting/#a-client-of-a-moved-account-still-reaches-the-source-over-http).

The identifier is then normalised as configured in the [mapping store](/docs/migration/proxy/mappings/#identifier-normalisation), and a master user suffix is removed, as described under [Master users](/docs/migration/proxy/mappings/#master-users).

For the mail protocols, an identifier containing control characters, spaces or double quotes is rejected: the client receives the backend-unavailable response, and the connection is closed. This keeps malformed identifiers out of the announcement sent to the backend.

The password or token is used only to derive the identifier, and is passed to the backend unchanged.

## Authentication replay

The proxy does not verify credentials. After connecting to the destination, the proxy rebuilds the client's authentication command in the form the backend expects, sends it, and reads the backend's reply.

On success, the proxy passes the reply to the client and joins the connections. On failure, it returns the backend's reply to the client (or a generic one when the destination sets `hide_auth_errors`), closes the backend connection, and continues its own dialogue with the client. The client may then authenticate again on the same connection. Each attempt is routed on its own, so a second attempt for another account reaches that account's destination. Rejections by the backend count towards the listener's `max_auth_attempts`.

The proxy holds the credentials only during this exchange, and never writes them anywhere. Before replaying credentials over a mail protocol, it checks that the connection to the backend is encrypted. The exception is a destination that sets `allow_plaintext_auth`, for a backend reached over a connection that is protected by other means.

Some mechanisms are converted on the way. The proxy conducts a SASL `LOGIN` exchange itself, sending the Base64 `Username:` and `Password:` prompts, and rebuilds the result as a `PLAIN` authentication. The IMAP `LOGIN` command and the POP3 `USER` and `PASS` commands are rebuilt the same way. The backend therefore only ever receives `PLAIN`, `OAUTHBEARER` or `XOAUTH2`.

A client may send the Base64 user name as the initial response of `LOGIN`, and may cancel the exchange with `*`. `LOGIN` is offered only when it is in the protocol's `sasl` list and cleartext authentication is permitted on the connection, as described under [Authentication mechanisms](/docs/migration/proxy/listeners#authentication-mechanisms).

A backend may also be unavailable: it cannot be reached, or its destination is marked down by the [circuit breaker](/docs/migration/proxy/destinations#health-and-resilience). The client then receives the protocol's temporary failure response, and the connection is closed, so that the client retries later instead of reporting an authentication error. The responses are:

- `NO [UNAVAILABLE] backend unavailable` in IMAP
- `-ERR backend unavailable` in POP3
- `421 4.3.0 backend unavailable` in submission
- `NO "backend unavailable"` in ManageSieve

## Forwarding the client address

The backend sees a connection from the proxy, not from the client. The proxy therefore announces the client's address, with one of two mechanisms. The mechanism is selected per destination, by the `forwarding` key described under [Destinations](/docs/migration/proxy/destinations#client-address-forwarding).

### PROXY protocol

With `forwarding = "proxy"`, the proxy starts the backend connection with a PROXY protocol version 2 header, before any protocol data and before TLS. The header carries the client's and the proxy's socket addresses. The backend reads it, and attributes the session to the client.

The mechanism is independent of the protocol, and is used for Stalwart and other backends that understand the PROXY protocol. When the client's address and the proxy's own address on that connection belong to different address families, the proxy sends the version 1 line `PROXY UNKNOWN` instead.

### XCLIENT and IMAP ID

With `forwarding = "xclient"`, the proxy announces the client inside the protocol. Dovecot and Postfix support these extensions.

For submission, POP3 and ManageSieve, the proxy sends an `XCLIENT` command. It carries the client's address and port, the proxy's address and port, a session identifier, the forwarding time-to-live and the transport security. For submission, it also carries the client's `HELO` name and protocol.

IMAP has no `XCLIENT` command, so for IMAP the proxy sends an `ID` command instead. It carries the same information in fields such as `x-originating-ip` and `x-connected-ip`, together with the forwarding time-to-live.

The proxy sends these commands only to a backend that advertises them. For submission, it also sends only the attributes that the backend's `XCLIENT` announcement lists, because some servers reject unknown attributes. The `LOGIN` attribute of `XCLIENT` is never sent. The proxy always replays the authentication, so pre-authenticating the session through `XCLIENT` is neither needed nor safe.

### HTTP headers

For HTTP, a destination with `forwarded = true` also receives the client's address in the `Forwarded` and `X-Forwarded-For` request headers. These come in addition to the PROXY header, when `forwarding` resolves to `proxy`. Headers sent by the client are kept or removed according to the listener's `forwarded` setting, as described under [HTTP routing](/docs/migration/proxy/routing/http#forwarding-headers).

## TLS on both legs

The connection to the client and the connection to the backend are encrypted independently. The client side follows the listener's `tls` mode and the inbound [certificates](/docs/migration/proxy/configuration#certificates). The backend side follows the `tls` mode of the destination's endpoint, and the destination's [verification](/docs/migration/proxy/destinations#backend-certificate-verification) settings. The two need not match: a client may connect with implicit TLS while the proxy reaches the backend with STARTTLS, or the reverse.

On the backend side, each mode behaves as follows:

- With an `implicit` endpoint, the proxy starts TLS as soon as it connects.
- With a `starttls` endpoint, the proxy connects without TLS, checks that the backend advertises STARTTLS, issues the command, and then starts TLS. When the backend does not advertise or accept STARTTLS, the connection is closed; it never continues without encryption.
- With a `plain` endpoint, the connection is not encrypted, and the proxy does not replay credentials over it unless the destination sets `allow_plaintext_auth`.

## Loop prevention

A misconfigured destination could make the proxy connect to itself. Two checks guard against such loops, within limits.

The first check compares addresses. Before connecting, the proxy refuses a destination whose `host` is an IP address that, together with the endpoint's port, equals the exact address of one of its own listeners. The refusal reads `proxying loop: destination is one of our own listeners`. Destinations given by host name, and listeners bound to a wildcard address, are not matched.

The second check uses a forwarding time-to-live. For backends announced with XCLIENT or IMAP `ID`, the proxy sends a forwarding time-to-live of `server.proxy_ttl` minus one. It refuses such connections with `proxying loop: forwarded TTL exhausted` when `server.proxy_ttl` is 1 or less.

The proxy does not read a time-to-live from incoming connections, so it does not detect a chain of proxies that loops.
