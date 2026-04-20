---
sidebar_position: 2
---

# Listeners

Stalwart accepts incoming TCP connections through one or more listeners. Each listener is represented by a [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->), and any number of listeners can coexist on the server.

## Bind settings

The addresses and ports a listener accepts connections on are set through [`bind`](/docs/ref/object/network-listener#bind), which takes a list of `host:port` entries. A single listener can bind to multiple IPv4 and IPv6 endpoints:

```json
{
  "name": "smtp",
  "protocol": "smtp",
  "bind": ["192.0.2.1:25", "203.0.113.9:25", "[2001:db8::2]:25"]
}
```

To bind on every interface, use an unspecified address such as `[::]:25`.

## Protocol

Each listener selects its application protocol through [`protocol`](/docs/ref/object/network-listener#protocol). The supported values are `smtp`, `lmtp`, `http`, `imap`, `pop3`, and `manageSieve`. For example, an SMTP listener on port 25 alongside an IMAP listener on port 143:

```json
[
  {"name": "smtp", "protocol": "smtp", "bind": ["[::]:25"]},
  {"name": "imap", "protocol": "imap", "bind": ["[::]:143"]}
]
```

## Maximum connections

The server-wide cap on concurrent connections is set through [`maxConnections`](/docs/ref/object/system-settings#maxconnections) on the [SystemSettings](/docs/ref/object/system-settings) singleton, and defaults to `8192`. Each NetworkListener also exposes its own [`maxConnections`](/docs/ref/object/network-listener#maxconnections) field so that a specific listener (for example an implicit-TLS submissions endpoint) can be capped independently of the server default:

```json
{
  "name": "submissions",
  "protocol": "smtp",
  "bind": ["[::]:465"],
  "tlsImplicit": true,
  "maxConnections": 1024
}
```

## TCP socket options

Socket-level behaviour is configured per listener through the following fields on [NetworkListener](/docs/ref/object/network-listener):

- [`socketReuseAddress`](/docs/ref/object/network-listener#socketreuseaddress): whether the socket can be bound to an address that is already in use. Default `true`.
- [`socketReusePort`](/docs/ref/object/network-listener#socketreuseport): whether multiple sockets can be bound to the same address and port, useful for certain load-balancing scenarios. Default `true`.
- [`socketBacklog`](/docs/ref/object/network-listener#socketbacklog): maximum number of pending incoming connections. Default `1024`.
- [`socketTtl`](/docs/ref/object/network-listener#socketttl): time-to-live value for outgoing packets.
- [`socketSendBufferSize`](/docs/ref/object/network-listener#socketsendbuffersize): size of the send buffer in bytes.
- [`socketReceiveBufferSize`](/docs/ref/object/network-listener#socketreceivebuffersize): size of the receive buffer in bytes.
- [`socketTosV4`](/docs/ref/object/network-listener#sockettosv4): type-of-service (TOS) value for IPv4 traffic, used to signal traffic priority.
- [`socketNoDelay`](/docs/ref/object/network-listener#socketnodelay): whether the Nagle algorithm should be disabled. Default `true`.

## TLS on a listener

Listener-level TLS is controlled by [`useTls`](/docs/ref/object/network-listener#usetls), [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit), [`tlsTimeout`](/docs/ref/object/network-listener#tlstimeout), [`tlsDisableProtocols`](/docs/ref/object/network-listener#tlsdisableprotocols), [`tlsDisableCipherSuites`](/docs/ref/object/network-listener#tlsdisableciphersuites), and [`tlsIgnoreClientOrder`](/docs/ref/object/network-listener#tlsignoreclientorder). Each NetworkListener carries its own TLS fields and is configured independently: implicit TLS on a submissions endpoint is set by flipping [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit) on that listener alone, without touching other listeners. See [TLS overview](/docs/server/tls/overview) for the list of supported protocols and cipher suites.

## Example

The following listeners define an SMTP server on port 25, an explicit-TLS submission endpoint on port 587, an implicit-TLS submissions endpoint on port 465, and an HTTP management endpoint on port 8080:

```json
[
  {"name": "smtp", "protocol": "smtp", "bind": ["[::]:25"]},
  {"name": "submission", "protocol": "smtp", "bind": ["[::]:587"]},
  {"name": "submissions", "protocol": "smtp", "bind": ["[::]:465"], "tlsImplicit": true},
  {"name": "management", "protocol": "http", "bind": ["127.0.0.1:8080"]}
]
```
