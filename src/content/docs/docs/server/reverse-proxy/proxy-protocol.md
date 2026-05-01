---
sidebar_position: 2
title: "Proxy Protocol"
---

The Proxy Protocol (also known as the HAProxy protocol) extends a TCP connection with metadata describing the original client. Without it, a server behind a proxy sees only the proxy's IP address, which breaks IP-based access controls, sender authentication, and accurate logging. The Proxy Protocol prepends each forwarded connection with a small header that the back-end server parses to recover the original client IP and the TLS status of the original connection.

When Stalwart runs behind HAProxy, Caddy, NGINX, or Traefik, enabling the Proxy Protocol preserves every signal the server needs. The client's remote IP is required for SPF and DMARC checks; per-IP rate limiting and auto-banning need the real source address; and whether the incoming connection was protected by TLS is a policy input on several code paths.

## Configuration

Stalwart supports both version 1 and version 2 of the Proxy Protocol, including the version-2 TLV extensions. The Proxy Protocol is enabled by declaring the set of trusted IP addresses or CIDR ranges from which Proxy Protocol headers will be accepted. Connections from other addresses are rejected if they carry a Proxy Protocol header and processed without it otherwise.

Server-wide trusted networks are set through [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->). Each entry is an IP address or a CIDR mask, for example `127.0.0.0/8`, `::1`, or `10.0.0.0/8`.

The same list can also be set on an individual [NetworkListener](/docs/ref/object/network-listener) through [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks). The per-listener value replaces the server-wide list for that listener, so different listeners can trust different proxies.

:::tip Note

- Configure the Proxy Protocol on both the proxy and Stalwart. A mismatch (only one side sending or accepting the header) will break connections silently or expose the proxy's address instead of the client's.
- Not every proxy supports the Proxy Protocol; confirm compatibility before wiring it into a production path.
- The exact syntax for enabling the Proxy Protocol varies between proxies. See the Stalwart pages for [HAProxy](/docs/server/reverse-proxy/haproxy), [Caddy](/docs/server/reverse-proxy/caddy), [NGINX](/docs/server/reverse-proxy/nginx), and [Traefik](/docs/server/reverse-proxy/traefik) for product-specific examples.

:::
