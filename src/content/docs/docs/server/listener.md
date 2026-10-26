---
sidebar_position: 2
title: "Listeners"
description: "Network listeners: the default listener set, bind addresses, protocols, implicit TLS and STARTTLS, connection limits, socket options and bind failures."
---

Before a client can use any service, the server must accept its connection on some port. A listener is the part of the configuration that does this: it accepts TCP connections on one or more addresses and serves one protocol on them. Each listener is a [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->), and the server can run any number of them. Together, the listeners determine three things: which ports are open, whether each port starts with TLS, and how many clients each port accepts at once.

## Default listeners

At the first start after the setup wizard, the server creates a standard set of listeners. Each is bound to `[::]`, which accepts IPv4 and IPv6 connections on all interfaces:

| Name | Port | Protocol | TLS |
|---|---|---|---|
| `smtp` | 25 | SMTP | STARTTLS |
| `submissions` | 465 | SMTP | Implicit |
| `imaps` | 993 | IMAP | Implicit |
| `pop3s` | 995 | POP3 | Implicit |
| `sieve` | 4190 | ManageSieve | STARTTLS |
| `https` | 443 | HTTP | Implicit |
| `http` | 8080 | HTTP | None |

The server creates these listeners whenever no listener exists at startup. Deleting some of them is therefore permanent, but deleting all of them brings back the whole default set at the next start.

The set contains no listener for submission with STARTTLS on 587, IMAP on 143 or POP3 on 110. These are added by hand when needed, as described in [Adding a listener](#adding-a-listener).

On a host without IPv6, an unspecified IPv6 bind address falls back to `0.0.0.0`, and the server logs the fallback as a warning.

The listeners are not started during [bootstrap](/docs/configuration/bootstrap-mode) and [recovery mode](/docs/configuration/recovery-mode). In those modes, the server opens only a plain HTTP listener on port 8080, or the port set by `STALWART_RECOVERY_MODE_PORT`. That listener is always bound to `[::]`, and its address cannot be changed.

## Bind addresses and protocol

Each listener answers two questions: where it accepts connections, and what it speaks on them.

[`bind`](/docs/ref/object/network-listener#bind) is the set of addresses and ports the listener accepts connections on. Because it is a set, one listener can bind several IPv4 and IPv6 addresses. [`protocol`](/docs/ref/object/network-listener#protocol) is one of `smtp`, `lmtp`, `http`, `imap`, `pop3` and `manageSieve`.

The following listener accepts SMTP on two IPv4 addresses and one IPv6 address:

```json
{
  "name": "smtp",
  "protocol": "smtp",
  "bind": {
    "192.0.2.1:25": true,
    "203.0.113.9:25": true,
    "[2001:db8::2]:25": true
  }
}
```

The `lmtp` protocol accepts deliveries over LMTP, a variant of SMTP meant for handing messages to a final mail store. It serves another mail system that delivers to Stalwart, for example a front-end MTA that hands messages to Stalwart for local delivery. No default listener serves it, and it is normally bound to an internal address only.

## Implicit TLS and STARTTLS

Mail protocols use TLS in one of two modes, and each port expects one of them:

- With implicit TLS, the connection starts with a TLS handshake, before any protocol data. Ports 465, 993, 995 and 443 work this way.
- With STARTTLS, the connection starts in plain text, and the client upgrades it to TLS with a protocol command. Ports 25, 587, 143, 110 and 4190 work this way.

[RFC 8314](https://www.rfc-editor.org/rfc/rfc8314) prefers implicit TLS for client access. Server-to-server SMTP on port 25 has no such choice, because STARTTLS is the only mode available there.

Two fields select the mode:

- [`useTls`](/docs/ref/object/network-listener#usetls) enables TLS on the listener. When it is `false`, the listener offers no TLS at all, so SMTP, IMAP, POP3 and ManageSieve do not advertise STARTTLS.
- [`implicitTls`](/docs/ref/object/network-listener#implicittls) starts every connection with a TLS handshake.

A listener created with neither field set has TLS <!-- default:NetworkListener.useTls as=enabled -->enabled<!-- /default --> and implicit TLS <!-- default:NetworkListener.implicitTls as=enabled -->disabled<!-- /default -->, which makes mail protocols offer STARTTLS.

HTTP has no STARTTLS, so for HTTP only `implicitTls` matters. An HTTP listener with `implicitTls` set to `false` serves plain HTTP, whatever `useTls` is set to. HTTPS needs `implicitTls` set to `true`.

[`tlsTimeout`](/docs/ref/object/network-listener#tlstimeout) limits the time a client has to complete the handshake. The protocol versions and cipher suites that a listener accepts are also set per listener, as described in [TLS](/docs/server/tls/). The certificate, on the other hand, is not a listener setting: it is chosen from the name the client requests, as described in [Certificates](/docs/server/tls/certificates).

## Adding a listener

Ports that the default set does not cover are opened by adding a listener. The following objects add submission with STARTTLS on port 587 and IMAP with STARTTLS on port 143:

```json
[
  {"name": "submission", "protocol": "smtp", "bind": {"[::]:587": true}},
  {"name": "imap", "protocol": "imap", "bind": {"[::]:143": true}}
]
```

Neither object sets `useTls` or `implicitTls`, so both listeners offer STARTTLS.

Opening a port does not make clients use it. To advertise the new ports to clients in SRV records and autoconfiguration, also set `cleartext` on the corresponding entry of [`SystemSettings.services`](/docs/server/general#mail-exchangers-and-advertised-services).

Not every setup needs a new listener. A reverse proxy on the same host that connects over plain HTTP can use the default `http` listener, and a second listener on the same port would conflict with the existing one. To keep the default `http` listener out of reach of other hosts, restrict it to the loopback interface by changing its `bind` to `{"127.0.0.1:8080": true}`.

## Connection limits

[`maxConnections`](/docs/ref/object/network-listener#maxconnections) limits the number of concurrent connections that a listener accepts. All the listener's bind addresses share the limit. When the field is unset, the listener uses [`SystemSettings.maxConnections`](/docs/ref/object/system-settings#maxconnections), which is <!-- default:SystemSettings.maxConnections -->8192<!-- /default --> unless changed.

The limit applies per listener, so two listeners without their own limit can each hold that many connections. A connection beyond the limit is closed at once and logged as `limit.concurrent-connection`.

The following listener caps submissions at 1024 connections:

```json
{
  "name": "submissions",
  "protocol": "smtp",
  "bind": {"[::]:465": true},
  "implicitTls": true,
  "maxConnections": 1024
}
```

## PROXY protocol

A proxy in front of the server hides the client's address, and the PROXY protocol passes it on in a header at the start of each connection. Connections from the networks in [`SystemSettings.proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) must begin with such a header, and the server takes the client's address from it. [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) replaces that list for one listener. [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) describes the consequences for connections that do not send the header.

## Socket options

Socket options tune how the operating system handles the listener's connections. The following fields set them per listener. Their defaults, listed in the reference, suit most deployments:

- [`socketBacklog`](/docs/ref/object/network-listener#socketbacklog): maximum number of connections waiting to be accepted
- [`socketNoDelay`](/docs/ref/object/network-listener#socketnodelay): disables the Nagle algorithm
- [`socketReuseAddress`](/docs/ref/object/network-listener#socketreuseaddress): sets `SO_REUSEADDR`
- [`socketReusePort`](/docs/ref/object/network-listener#socketreuseport): sets `SO_REUSEPORT`
- [`socketSendBufferSize`](/docs/ref/object/network-listener#socketsendbuffersize) and [`socketReceiveBufferSize`](/docs/ref/object/network-listener#socketreceivebuffersize): socket buffer sizes in bytes, the operating system's when unset
- [`socketTtl`](/docs/ref/object/network-listener#socketttl): IP time-to-live of outgoing packets
- [`socketTosV4`](/docs/ref/object/network-listener#sockettosv4): IPv4 type-of-service value

## Applying changes

Listener changes, including new and deleted listeners, take effect only when the server restarts, because reloading the settings does not open or close ports.

In a [cluster](/docs/cluster/), a node starts only the listeners enabled for its [role](/docs/cluster/configuration/roles) and skips those excluded by the role's `listeners` setting.

A listener can fail to bind one of its addresses, because another process holds the port or because the server lacks the privilege to bind a port below 1024. The listener then skips that address, and the server continues to start. The failure is logged as a `registry.build-error` event for the listener, with the reason `Failed to bind to <address>: <error>`. [Troubleshooting installation](/docs/install/troubleshooting#a-port-fails-to-bind) lists the usual causes.

## STARTTLS not offered or TLS handshake fails

TLS problems on a listener usually come from a mismatch between the port, the client's expectation and the listener's TLS mode:

- **The client expects STARTTLS but the server does not offer it.** The listener has `useTls` set to `false`, or the client connects to an implicit-TLS port and sends plain text. Port 465 requires implicit TLS, and port 587 requires STARTTLS.
- **The handshake is closed immediately.** The client connects to an implicit-TLS port with a plain-text protocol, or the other way round, or the client rejects the certificate because it does not cover the name the client connected to. A server without any certificate presents a self-signed certificate for `localhost`, which clients reject.
- **The connection is closed before any data is exchanged.** The client's address is banned. The server drops connections from banned addresses before the TLS handshake and before the greeting. [Auto-ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban) describes how to confirm and clear the ban.
