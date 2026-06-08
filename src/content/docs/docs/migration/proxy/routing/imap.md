---
sidebar_position: 2
title: "IMAP"
---

The IMAP listener accepts client connections, conducts the pre-authentication dialogue, and bridges the authenticated session to the resolved backend. It serves the implicit-TLS convention on port 993 and the STARTTLS convention on port 143, depending on the listener's `tls` mode.

## Pre-authentication

On connection the proxy sends an untagged `OK` greeting that embeds the advertised capability list and the configured banner. Before authentication it answers a small set of commands itself: `CAPABILITY` returns the advertised capabilities, `NOOP` and `ID` are acknowledged, `LOGOUT` ends the connection, and `STARTTLS` upgrades the connection on a STARTTLS listener. All other commands are refused as not allowed in the pre-authentication state.

The advertised capabilities are drawn from `[capabilities.imap]`. The `advertise` list provides the base tokens (by default including `IMAP4rev2`, `IMAP4rev1`, `SASL-IR`, `LITERAL+` and others), to which the proxy appends the available `AUTH=` mechanisms. When cleartext authentication is not permitted on the current connection, the proxy advertises `LOGINDISABLED` and adds `STARTTLS` on a STARTTLS listener, signalling to clients that the connection must be secured first.

## Authentication

Two authentication paths are accepted. The `AUTHENTICATE` command carries a SASL mechanism, one of `PLAIN`, `OAUTHBEARER` or `XOAUTH2`; the initial response may be supplied inline (when the client uses `SASL-IR`) or provided after the proxy's continuation prompt. The `LOGIN` command supplies a username and password directly, which the proxy treats as `PLAIN`. The `AUTH=LOGIN` mechanism is not offered, and an attempt to use it is rejected.

Cleartext authentication, meaning `LOGIN` or `AUTHENTICATE PLAIN`, is gated on transport security: unless `allow_plain_auth_without_tls` is set, it is refused with a privacy-required error until the connection is encrypted by implicit TLS or STARTTLS. From the accepted credentials the proxy extracts the routing identifier as described under [Routing](/docs/migration/proxy/routing/), resolves the destination, and proceeds to the backend.

## Backend handshake

The proxy connects to the destination's IMAP endpoint and reads the backend's greeting. On a STARTTLS endpoint it confirms the backend advertises `STARTTLS`, issues the command, and upgrades the connection before continuing. It then verifies the backend leg is encrypted (or that the destination has opted into plaintext authentication).

When the destination uses `XCLIENT` forwarding, the proxy sends an `ID` command before authenticating, provided the backend advertised `ID` support, conveying the originating and connected addresses and ports, the forwarding time-to-live, a session identifier and the transport security in the `x-originating-ip`, `x-connected-ip` and related fields. It then replays the client's `AUTHENTICATE` command to the backend, relays the result to the client, and on success bridges the two connections. From that point the client and backend exchange IMAP traffic directly, including long-lived `IDLE` sessions, until the connection closes or the `bridge_idle` timeout is reached.
