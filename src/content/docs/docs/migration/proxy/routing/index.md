---
sidebar_position: 1
title: "Overview"
---

Routing is the sequence of steps the proxy performs between accepting a client connection and bridging it to a backend. The same outline applies to every interactive protocol, with per-protocol details covered on the [IMAP](/docs/migration/proxy/routing/imap), [POP3](/docs/migration/proxy/routing/pop3), [ManageSieve](/docs/migration/proxy/routing/managesieve), [SMTP](/docs/migration/proxy/routing/smtp) and [HTTP](/docs/migration/proxy/routing/http) pages. This page describes the shared flow and the cross-cutting mechanisms: how the routing identifier is extracted, how authentication is replayed, how the client's identity is forwarded to the backend, and how TLS is bridged on each leg.

## Connection flow

For the interactive protocols, a connection proceeds through the following stages:

1. **Pre-authentication.** The proxy presents its greeting and capabilities, optionally negotiates STARTTLS, and reads the client's authentication command. This dialogue is answered by the proxy itself, using the configured [capabilities](/docs/migration/proxy/listeners), because the backend has not yet been chosen.
2. **Identifier extraction.** From the authentication command the proxy derives a routing identifier, normalizes it, and strips any master-user suffix.
3. **Resolution.** The identifier is looked up in the [mapping store](/docs/migration/proxy/mappings/), yielding a destination, or the default destination if there is no explicit mapping.
4. **Backend connection.** The proxy dials the destination's endpoint for the protocol in use, sending a PROXY protocol header or application-level forwarding metadata as configured, and negotiating TLS on the backend leg.
5. **Authentication replay.** The proxy replays the client's authentication to the backend and observes the result.
6. **Bridging.** On success, the two connections are spliced and the session continues directly between client and backend until either side closes or the idle timeout elapses.

The SMTP and LMTP pass-through protocols skip stages 1, 2, 3 and 5: they are bridged as an opaque stream to a fixed destination, as described on the [SMTP](/docs/migration/proxy/routing/smtp) page.

## Identifier extraction

The routing identifier is the account name the proxy uses to look up a destination. How it is obtained depends on the authentication method:

- For password-based authentication (SASL `PLAIN`, and the protocol-specific login commands), the identifier is the authentication username the client supplies.
- For `OAUTHBEARER` and `XOAUTH2`, the identifier is the username carried in the authentication frame when present.
- For a bearer token that carries no separate username, the proxy inspects the token itself. Stalwart access tokens, recognizable by their `sw1.` prefix, encode the account address directly and are decoded without interpreting the token as a JWT. Otherwise the token is treated as a JWT and the identifier is read from its claims, trying the configured `jwt_username_claim` first and then a series of common fallback claims (`email`, `preferred_username`, `upn`, `unique_name`, `sub`), accepting the first whose value looks like an address.

After extraction the identifier is normalized according to the [mapping](/docs/migration/proxy/mappings/) configuration and has any master-user suffix removed before lookup. An identifier containing control characters, spaces or quotes is rejected, and the connection receives a backend-unavailable response rather than being routed, which prevents malformed identifiers from being injected into the forwarding metadata sent to the backend.

The token or password itself is never used for routing beyond extracting the identifier, and is forwarded to the backend unchanged for the backend to validate.

## Authentication replay

The proxy does not verify credentials; it relays them to the backend and lets the backend decide. After connecting to the destination it reconstructs the client's authentication command in the form the backend expects and sends it, then reads the backend's response. A success is passed back to the client and the session is bridged; a failure is returned to the client (verbatim, or replaced with a generic message when the destination sets `hide_auth_errors`), and the connection is closed.

Because the proxy holds the credentials only for the duration of this exchange and never writes them anywhere, the backend remains the sole authority on authentication. The proxy refuses to send credentials over an unencrypted backend leg: before replaying authentication it asserts that the egress connection is encrypted, unless the destination has explicitly opted into plaintext authentication for a backend reached over an otherwise-secure channel.

When a backend is unreachable or has been marked down by the [health](/docs/migration/proxy/destinations) circuit breaker, the proxy returns a protocol-appropriate temporary-failure response so that clients retry later rather than treating the condition as an authentication error.

## Forwarding client identity

Since the backend sees a connection originating from the proxy, the proxy conveys the real client address and related metadata using one of two mechanisms, chosen per destination by the `forwarding` setting described under [Destinations](/docs/migration/proxy/destinations).

### PROXY protocol

With `forwarding = "proxy"`, the proxy prefixes the backend connection with a PROXY protocol version 2 header carrying the original source and destination socket addresses, before any application data. The backend reads this header and attributes the session to the real client. This is transparent to the application protocol and is the appropriate choice for Stalwart and any backend that understands the PROXY protocol. When the client and backend belong to different address families, the proxy emits an `UNKNOWN` header rather than misrepresenting the addresses.

### XCLIENT and IMAP ID

With `forwarding = "xclient"`, the proxy announces the client over the application protocol instead. For SMTP, POP3 and ManageSieve it issues an `XCLIENT` command carrying attributes such as the client address and port, the destination address and port, a session identifier and the transport security, and for SMTP additionally the client's HELO name and protocol. For IMAP, which has no `XCLIENT` command, it sends an `ID` command conveying the equivalent information as `x-originating-ip` and related fields. This is the appropriate choice for Dovecot and Postfix backends, which support these extensions.

The proxy only sends forwarding commands a backend has advertised support for, and for SMTP it filters the attributes down to those the backend's `XCLIENT` announcement lists, since some servers reject unknown attributes. Crucially, the login attribute is never forwarded: the proxy always replays the authentication exchange itself, so pre-authenticating the backend through `XCLIENT LOGIN` would be both unnecessary and unsafe.

### HTTP forwarding headers

HTTP destinations do not use the PROXY protocol or `XCLIENT`. Instead, when the destination sets `forwarded = true`, the proxy appends the client address to the `Forwarded` and `X-Forwarded-For` request headers before relaying. Inbound forwarding headers from clients are trusted or stripped according to the listener's `forwarded` setting. This is detailed on the [HTTP routing](/docs/migration/proxy/routing/http) page.

## TLS bridging

The client-facing and backend-facing legs of a session are encrypted independently. The client leg is governed by the listener's `tls` mode and the inbound [certificates](/docs/migration/proxy/configuration); the backend leg is governed by the protocol endpoint's `tls` mode and the destination's [verification](/docs/migration/proxy/destinations) settings. The two need not match: a client may connect over implicit TLS while the proxy reaches the backend over STARTTLS, or the reverse.

With an `implicit` backend leg, the proxy performs a TLS handshake immediately after connecting. With a `starttls` backend leg, the proxy connects in cleartext, confirms the backend advertises STARTTLS, issues the upgrade command, and only then performs the handshake; if the backend fails to advertise or accept STARTTLS, the connection is aborted rather than continuing in cleartext. With a `plain` leg, the connection is never encrypted, and the proxy will refuse to replay credentials over it unless the destination has set `allow_plaintext_auth`.

## Loop prevention

Because the proxy forwards a decremented time-to-live in its `XCLIENT` and `ID` metadata, and because a misconfiguration could in principle point a destination back at one of the proxy's own listeners, two safeguards detect routing loops. Before dialing, the proxy rejects any destination endpoint whose address and port coincide with one of its own bound listeners. For `XCLIENT` forwarding, it also rejects a connection whose forwarded time-to-live (`server.proxy_ttl`, decremented at each hop) has been exhausted, which breaks a loop formed by a chain of proxies.
