---
sidebar_position: 3
title: "POP3"
---

The POP3 listener serves the implicit-TLS convention on port 995 and the STARTTLS convention on port 110, depending on the listener's `tls` mode. Its behavior mirrors the [IMAP](/docs/migration/proxy/routing/imap) listener, adapted to the POP3 command set.

## Pre-authentication

On connection the proxy sends a `+OK` greeting carrying the configured banner. Before authentication it handles `CAPA` (returning the advertised capability list), `NOOP`, `UTF8`, `QUIT`, and `STLS` to begin TLS negotiation on a STARTTLS listener. `APOP` is acknowledged as unsupported. The advertised capabilities come from `[capabilities.pop3]`; the `USER` capability and the SASL mechanism list are only advertised when cleartext authentication is permitted on the current connection, and `STLS` is advertised on a STARTTLS listener before the upgrade.

## Authentication

POP3 offers two authentication paths. The legacy `USER` and `PASS` command pair supplies the username and password across two commands; the proxy holds the `USER` value and, on receiving `PASS`, assembles the credentials and proceeds. The `AUTH` command carries a SASL mechanism, one of `PLAIN`, `OAUTHBEARER` or `XOAUTH2`, with the initial response supplied inline or after a continuation prompt; `AUTH` with no argument lists the available mechanisms.

Cleartext authentication, meaning `USER`/`PASS` or `AUTH PLAIN`, is gated on transport security and is refused until the connection is encrypted unless `allow_plain_auth_without_tls` is set. The routing identifier is the supplied username, or the username carried in an OAuth frame, extracted as described under [Routing](/docs/migration/proxy/routing/).

## Backend handshake

The proxy connects to the destination's POP3 endpoint and reads the backend's `+OK` greeting. On a STARTTLS endpoint it issues `CAPA`, confirms the backend advertises `STLS`, performs the upgrade, and continues over the encrypted connection. It then verifies the backend leg is encrypted.

When the destination uses `XCLIENT` forwarding and the backend advertised `XCLIENT` in its greeting, the proxy issues an `XCLIENT` command conveying the client and destination addresses, a session identifier and the transport security before authenticating. It then replays the client's authentication, relays the result, and bridges the session on success.
