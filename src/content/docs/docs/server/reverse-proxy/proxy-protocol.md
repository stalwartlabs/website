---
sidebar_position: 2
title: "PROXY protocol"
description: "Accept the PROXY protocol from load balancers and proxies: trusted networks, what happens to connections without the header, TLS detection, and the options of common proxies."
---

When a load balancer or proxy forwards a TCP connection to Stalwart, the server sees the connection as coming from the proxy, not from the client. Many functions depend on the client's real address: auto-ban blocks it after repeated failures, rate limits count against it, sender authentication checks it against SPF, and the logs record it. Behind a proxy, all of them would see only the proxy's address.

The [PROXY protocol](https://github.com/haproxy/haproxy/blob/master/doc/proxy-protocol.txt), defined by HAProxy and supported by most load balancers, solves this. At the start of each connection, the proxy sends the backend server a short header with the client's IP address and port. Version 1 of the header is text. Version 2 is binary and can carry optional extensions, such as whether the client connected with TLS.

Stalwart reads the header on every protocol it serves, so that these functions see the client's address and not the proxy's. It accepts both version 1 and version 2 headers. Of the version 2 extensions, it uses only the SSL extension described below, and ignores the others, such as a unique id or the server name.

## Trusted networks

A PROXY header states a client address, and the server has no way to check it. Accepting the header from anyone would let any client claim any address. Stalwart therefore reads the header only on connections that come from trusted networks, which are configured in two places:

- [`SystemSettings.proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) lists them for all listeners, as IP addresses or CIDR ranges such as `10.0.0.0/8`. SystemSettings is found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->.
- A listener's [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) replaces the list for that listener.

The two lists differ in one respect. The networks in `proxyTrustedNetworks` are also exempt from auto-ban and IP blocking, so that the proxy itself is never banned. The networks in a listener's override list are not exempt.

Connections from other addresses are never examined for a header. For them, the peer address is taken as the client address.

## Connections without the header

Every connection from a trusted network must begin with a PROXY header. A connection that starts with anything else is closed, and the server logs a `network.proxy-error` event with the address and port of the connecting proxy. When the header is malformed, the event's reason is `invalid PROXY header`.

The header must also arrive in time, within the listener's [`tlsTimeout`](/docs/ref/object/network-listener#tlstimeout), which is <!-- default:NetworkListener.tlsTimeout -->1 minute<!-- /default --> unless changed. A connection that sends nothing is closed when the time runs out, with a `network.timeout` event whose reason is `PROXY protocol header timeout`.

This rule has consequences for anything else that connects from a trusted address:

- Health checks and monitoring probes that connect from the proxy's address must send the PROXY header too, or they fail. HAProxy, for example, sends it on checks when the check uses the server's address and port.
- Clients that connect directly from an address inside a trusted range are disconnected for the same reason. An example is another service on the same host when `127.0.0.1` is trusted.

To keep some listeners usable for direct connections, trust the proxy only on dedicated listeners, through `overrideProxyTrustedNetworks`. [Listeners behind a proxy](/docs/server/reverse-proxy/#listeners-behind-a-proxy) shows such a set of listeners.

## TLS detection

The server needs to know whether the client's connection is encrypted, and how it learns this depends on where TLS ends.

When the proxy passes TLS through unchanged, Stalwart terminates TLS itself, so it knows the connection is encrypted. It treats the connection as TLS, including a connection on which the client issues STARTTLS.

When the proxy terminates TLS and forwards plain TCP, the server receives an unencrypted connection, and only the header can tell it that the client used TLS. Stalwart treats such a connection as TLS when the header is version 2 and carries the SSL extension (`PP2_TYPE_SSL`) with the `PP2_CLIENT_SSL` flag set. A version 1 header, or a version 2 header without that extension, marks the connection as plain text.

Whether a connection counts as TLS affects the following:

- Whether SMTP, IMAP, POP3 and ManageSieve offer STARTTLS on it
- Whether these protocols accept password authentication and the `OAUTHBEARER` and `XOAUTH2` mechanisms
- The `is_tls` variable of [expressions](/docs/configuration/expressions/), the `Received` header added to incoming messages, and the spam filter's view of the connection

The effect on OAuth is easy to miss. `OAUTHBEARER` and `XOAUTH2` are neither offered nor accepted on a plain-text connection. Behind a proxy that terminates TLS without sending the SSL extension, mail clients therefore cannot sign in with OAuth.

For HTTP, the flag sets the `is_tls` and `protocol` variables of the HTTP expressions, such as the [access control](/docs/http/access-control) rules. It also determines how the server derives the origin of the request for the OAuth pages and for the WebUI's discovery request.

## Proxy options

Each product has its own options for sending the header, and they differ in which version they send and whether they include the SSL extension.

### HAProxy

`send-proxy` sends version 1, and `send-proxy-v2` sends version 2 without the SSL extension. `send-proxy-v2-ssl` adds the SSL extension, with `PP2_CLIENT_SSL` set when the client connected to HAProxy over TLS. `send-proxy-v2-ssl-cn` adds the common name of the client certificate as well.

The following frontend terminates TLS for IMAP and forwards the connection to a plain-text listener:

```
frontend imaps
    mode tcp
    bind :993 ssl crt /etc/haproxy/certs/mail.pem
    default_backend stalwart_imap

backend stalwart_imap
    mode tcp
    server stalwart 127.0.0.1:10143 send-proxy-v2-ssl
```

The backend is a listener without TLS, such as `imap-proxy-plain` in [Listeners behind a proxy](/docs/server/reverse-proxy/#listeners-behind-a-proxy).

### NGINX

In the `stream` module, `proxy_protocol on;` sends version 1. `proxy_protocol v2;`, available from NGINX 1.31.4, sends version 2, with the SSL extension when NGINX terminated TLS for the client. The `http` module does not send the PROXY protocol to upstreams.

### Traefik

The `proxyProtocol` setting of a TCP service sends version 1 or 2, without any extensions. Use TLS passthrough (`tls.passthrough: true` on the TCP router) for the mail ports, so that Stalwart terminates TLS itself.

### Caddy

`proxy_protocol v1` or `v2`, in the HTTP transport of `reverse_proxy` or in the `proxy` handler of the layer 4 app, sends the header without extensions.

### Envoy

The upstream PROXY protocol transport socket sends version 2. It does not derive the SSL extension from the client connection. From Envoy 1.34, however, a fixed extension can be added with `added_tlvs`: type `32` with the value `AQAAAAA=`, which encodes `PP2_CLIENT_SSL`. Because the extension is then sent unconditionally, configure it only on clusters that receive TLS-terminated traffic.
