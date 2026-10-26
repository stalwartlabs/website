---
sidebar_position: 5
title: "SMTP and submission"
description: "How the proxy routes authenticated SMTP submission per account and passes inbound SMTP and LMTP through to one destination."
---

The proxy handles SMTP in two ways, depending on who is sending.

Message submission by authenticated clients is handled like the other interactive protocols. The proxy conducts the session until authentication, identifies the account, and routes it.

Mail transfer between servers, inbound SMTP and LMTP, is handled differently. These sessions are not authenticated and carry no account to route on, so they are passed as an uninterpreted stream to one fixed destination.

## Submission

A submission listener serves clients that send mail, usually on port 587 with STARTTLS, or on port 465 with implicit TLS. On connection, the proxy sends a `220` greeting with `server.hostname`. Before authentication, it answers `EHLO`, `HELO`, `NOOP`, `RSET`, `STARTTLS` and `QUIT` itself. The `EHLO` response lists the `ehlo` keywords of `[capabilities.submission]`, the available `AUTH` mechanisms and, on a STARTTLS listener before the upgrade, `STARTTLS`.

The proxy accepts `AUTH` with `PLAIN`, `LOGIN`, `OAUTHBEARER` or `XOAUTH2`, with the initial response either on the command line or after a `334` continuation. Offering `LOGIN` keeps clients working that support only that mechanism, and the proxy replays it as `PLAIN`, as described under [Authentication replay](/docs/migration/proxy/routing/#authentication-replay). Until the connection is encrypted, cleartext mechanisms are refused with `538 5.7.11 Encryption required for requested authentication mechanism`, unless `allow_plain_auth_without_tls` is set.

Once the destination is resolved, the proxy connects to its submission endpoint, reads the `220` greeting, and sends its own `EHLO`. On a STARTTLS endpoint, it then upgrades the connection and sends `EHLO` again.

When the destination uses XCLIENT forwarding and the backend advertises `XCLIENT`, the proxy announces the client with an `XCLIENT` command. The command carries those of the following attributes that the backend lists: the client's address and port, the proxy's address and port, the client's `HELO` name, the protocol and the transport security. The proxy then sends `EHLO` again, so that the session reflects the announced client.

Finally, the proxy replays the authentication, relays the result, and joins the connections. From then on, client and backend exchange `MAIL`, `RCPT` and `DATA` directly.

## SMTP and LMTP pass-through

An `smtp` or `lmtp` listener handles unauthenticated mail transfer: inbound mail from other servers on port 25, or local delivery over LMTP. These sessions have no login, so they are not routed per account. The proxy passes the whole session, byte for byte, to the destination named by `routing.smtp_passthrough_destination`, without interpreting the SMTP dialogue:

```toml
[routing]
default_destination = "legacy"
smtp_passthrough_destination = "stalwart"
```

Because the proxy does not interpret the session, it cannot answer a STARTTLS command itself. Pass-through listeners therefore use `plain` or `implicit`, and `starttls` is rejected at startup.

A `plain` listener does not mean unencrypted mail. The proxy passes the sending server's STARTTLS negotiation to the backend unchanged, so TLS is established between the sending server and the backend, with the backend's certificate. An `implicit` listener, by contrast, terminates TLS at the proxy and passes the decrypted session on.

The pass-through destination must declare the `smtp` protocol, and also the `lmtp` protocol when an LMTP listener exists. Both are checked at startup.

On the backend side, an `implicit` endpoint wraps the connection in TLS. `plain` and `starttls` both pass it unencrypted, leaving STARTTLS to the two ends.

Of the forwarding modes, only `proxy` has an effect. The connection starts with a PROXY header, which tells the backend the sending server's address for its own checks. `xclient` sends nothing on a pass-through connection.

When the backend cannot be reached, the proxy closes the client's connection without an SMTP reply, and the sending server retries later.
