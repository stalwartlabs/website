---
sidebar_position: 5
title: "SMTP and submission"
---

The proxy handles SMTP in two distinct modes. Authenticated message submission is treated like the other interactive protocols: the proxy terminates the session, identifies the account from the authentication, and routes to the resolved backend. Mail transfer between servers (the SMTP and LMTP protocols used for incoming mail and local delivery) is instead bridged as an opaque stream to a single fixed destination, because such sessions are not authenticated and carry no account identity to route on.

## Submission

A submission listener serves authenticated clients sending outbound mail, typically on port 587 with STARTTLS or port 465 with implicit TLS. On connection the proxy sends a `220` greeting naming the configured hostname, and answers `EHLO`/`HELO`, `NOOP`, `RSET`, `STARTTLS` and `QUIT` itself during pre-authentication. The `EHLO` response advertises the keywords from `[capabilities.submission]` together with the available `AUTH` mechanisms, and `STARTTLS` on a STARTTLS listener before the upgrade.

Authentication uses the ESMTP `AUTH` command with a SASL mechanism, one of `PLAIN`, `OAUTHBEARER` or `XOAUTH2`, the initial response supplied inline or after a `334` continuation. Cleartext `PLAIN` is gated on transport security and refused with an encryption-required response until the connection is secured, unless `allow_plain_auth_without_tls` is set. The routing identifier is extracted from the credentials as described under [Routing](/docs/migration/proxy/routing/).

Having resolved the destination, the proxy connects to its submission endpoint, reads the `220` greeting, sends its own `EHLO`, and on a STARTTLS endpoint negotiates the upgrade and re-issues `EHLO`. When the destination uses `XCLIENT` forwarding and the backend advertises `XCLIENT`, the proxy issues an `XCLIENT` command, restricted to the attributes the backend announced support for, carrying the client address and port, the destination address and port, the client's HELO name, the protocol and the transport security; it then re-issues `EHLO` so the session reflects the forwarded identity. Finally it replays the client's `AUTH` command, relays the result, and bridges the session, after which the client and backend exchange the `MAIL`, `RCPT` and `DATA` phases directly.

## SMTP and LMTP pass-through

An `smtp` or `lmtp` listener handles unauthenticated mail transfer: incoming mail from other servers on port 25, or local delivery over LMTP. These sessions have no login to identify an account, so they are not routed per account. Instead the entire session is bridged verbatim to the destination named by `routing.smtp_passthrough_destination`, with the proxy acting as a transparent relay that does not interpret the SMTP dialogue.

```toml
[routing]
default_destination = "legacy"
smtp_passthrough_destination = "stalwart"
```

Because the proxy does not terminate the protocol in this mode, it cannot intercept a STARTTLS command, and so pass-through listeners may use only `plain` or `implicit` transport, never `starttls`; the STARTTLS combination is rejected at startup. The pass-through destination must declare the `smtp` protocol, and additionally the `lmtp` protocol if any LMTP listener is configured; both requirements are checked at startup. Client identity is still conveyed to the backend according to the destination's `forwarding` setting, so a PROXY protocol header can preserve the original sending server's address for the backend's own policy checks.

The pass-through destination is configured like any other [destination](/docs/migration/proxy/destinations); only its role differs, in that it receives every pass-through session rather than being selected by a mapping lookup.
