---
sidebar_position: 2
title: "Mail protocols"
description: "How the proxy handles IMAP, POP3 and ManageSieve sessions before authentication, which authentication commands it accepts, and how it connects to the backend."
---

The IMAP, POP3 and ManageSieve listeners follow the [connection sequence](/docs/migration/proxy/routing/#connection-sequence) shared by all interactive protocols. What differs between them is the protocol dialogue. For each protocol, this page lists the commands that the proxy answers before authentication, the authentication commands it accepts, and how it opens the session on the backend.

Two rules apply to all three protocols. Cleartext authentication is gated on TLS, as described under [Authentication mechanisms](/docs/migration/proxy/listeners#authentication-mechanisms), and `LOGIN` exchanges are replayed as `PLAIN`, as described under [Authentication replay](/docs/migration/proxy/routing/#authentication-replay).

## IMAP

The IMAP listener serves implicit TLS, usually on port 993, or STARTTLS, usually on port 143, according to its `tls` mode.

### Before authentication

On connection, the proxy sends an untagged `OK` greeting with the advertised capabilities and the configured banner. Until the client authenticates, the proxy handles a small set of commands itself:

- `CAPABILITY` is answered with the advertised capabilities.
- `NOOP` and `ID` are acknowledged.
- `LOGOUT` ends the connection.
- `STARTTLS` upgrades the connection, on a STARTTLS listener.

Other commands are refused as not allowed before authentication.

The capabilities are the `advertise` list of `[capabilities.imap]`, followed by the available `AUTH=` mechanisms. When cleartext authentication is not permitted on the connection, the proxy advertises `LOGINDISABLED`, and on a STARTTLS listener also `STARTTLS`.

### Authentication

The proxy accepts two commands. `AUTHENTICATE` works with `PLAIN`, `LOGIN`, `OAUTHBEARER` or `XOAUTH2`, with the initial response either on the command line (`SASL-IR`) or after a continuation. The `LOGIN` command is treated as `PLAIN`.

### Backend session

The proxy connects to the destination's IMAP endpoint and reads the greeting. On a STARTTLS endpoint, it issues `STARTTLS` and upgrades the connection. When the greeting carries a capability list, the proxy first checks that `STARTTLS` is advertised in it. It then checks that the connection is encrypted, unless the destination allows plaintext authentication.

When the destination uses XCLIENT forwarding and the backend's greeting lists `ID`, the proxy announces the client with an `ID` command. The command carries the client's and the proxy's addresses and ports, the forwarding time-to-live, a session identifier and the transport security.

The proxy then replays the authentication, adapting it to what the backend supports. The initial response is sent on the command line only when the backend advertised `SASL-IR`, either in its greeting or, on a STARTTLS endpoint, in its reply to `STARTTLS`. Otherwise, it is sent after the backend's continuation, which servers without `SASL-IR` require.

The proxy relays the result and, on success, joins the connections. From then on, client and backend exchange IMAP directly, including long `IDLE` sessions, until the connection closes or stays idle for longer than `server.bridge_idle`.

## POP3

The POP3 listener serves implicit TLS, usually on port 995, or STARTTLS, usually on port 110.

### Before authentication

On connection, the proxy sends a `+OK` greeting with the configured banner. It answers `CAPA`, `NOOP`, `UTF8` and `QUIT`, begins TLS on `STLS` on a STARTTLS listener, and answers `APOP` as unsupported.

The `CAPA` response always lists `TOP`, `RESP-CODES`, `PIPELINING`, `EXPIRE NEVER`, `UIDL`, `UTF8` and `IMPLEMENTATION Stalwart Server`. The rest depends on the connection. `USER` and the `PLAIN` and `LOGIN` mechanisms are listed only when cleartext authentication is permitted on the connection. When it is not, the `SASL` line still lists `OAUTHBEARER` and `XOAUTH2`. On a STARTTLS listener, the response also lists `STLS` until the upgrade.

### Authentication

The proxy accepts two forms of authentication. The `USER` and `PASS` commands are held until `PASS` arrives, and are then treated as `PLAIN`. `AUTH` works with `PLAIN`, `LOGIN`, `OAUTHBEARER` or `XOAUTH2`, with the initial response either on the command line or after a continuation. `AUTH` without an argument lists the available mechanisms.

### Backend session

The proxy connects to the destination's POP3 endpoint and reads the `+OK` greeting. On a STARTTLS endpoint, it sends `CAPA`, checks that `STLS` is advertised, and upgrades the connection. It then checks that the connection is encrypted.

When the destination uses XCLIENT forwarding and the backend's greeting contains `XCLIENT`, the proxy announces the client with an `XCLIENT` command. The command carries the client's and the proxy's addresses, a session identifier and the transport security. The proxy then replays the authentication, relays the result, and on success joins the connections.

## ManageSieve

The ManageSieve listener lets clients manage the Sieve scripts of their account on the backend. It is usually served with STARTTLS on port 4190.

### Before authentication

A ManageSieve server starts by announcing its capabilities, so on connection the proxy sends a capability block followed by `OK`. The block contains the following:

- The `implementation` string and the `sieve` extensions of `[capabilities.managesieve]`
- The protocol version
- The SASL mechanisms
- `STARTTLS`, on a STARTTLS listener before the upgrade

The proxy answers `CAPABILITY` (by sending the block again), `NOOP`, `LOGOUT` and `STARTTLS`.

### Authentication

The proxy accepts `AUTHENTICATE` with `PLAIN`, `LOGIN`, `OAUTHBEARER` or `XOAUTH2`. The initial response may be given on the command line, as a quoted string, or as a literal after the proxy's continuation, following the ManageSieve literal syntax. In a `LOGIN` exchange, the proxy sends its prompts as literals.

### Backend session

The proxy connects to the destination's ManageSieve endpoint and reads the capability block. On a STARTTLS endpoint, it checks that `STARTTLS` is advertised, issues it, and reads the capabilities again after the upgrade. It then checks that the connection is encrypted.

When the destination uses XCLIENT forwarding and the backend advertises `XCLIENT`, the proxy announces the client with an `XCLIENT` command. The command carries the client's and the proxy's addresses, a session identifier and the transport security. The proxy then replays the authentication, relays the result, and on success joins the connections.
