---
sidebar_position: 1
---

# Overview

A reverse proxy accepts client connections on behalf of one or more back-end servers and relays traffic between them. Placing a reverse proxy in front of a mail server typically provides load balancing across multiple back-end nodes, a single ingress point for operational monitoring, and centralised TLS termination when that is the desired topology.

Stalwart operates without modification behind a reverse proxy, and is compatible with common reverse-proxy products such as HAProxy, Caddy, NGINX, and Traefik.

## Proxy Protocol

The [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol), introduced by HAProxy, forwards connection metadata (the original client IP and whether the transport is TLS) from the proxy to the back-end server. Without this extension, Stalwart sees only the proxy's IP address and cannot distinguish one client from another.

Enabling the Proxy Protocol is recommended whenever Stalwart runs behind a reverse proxy. Several pieces of server behaviour depend on it:

- **Sender authentication** checks such as SPF and DMARC rely on the remote client's IP address. Without the Proxy Protocol those checks run against the proxy's address and are meaningless.
- **Rate limiting and auto-banning** need the real client IP to enforce per-source limits and to create [BlockedIp](/docs/ref/object/blocked-ip) entries against the offending source rather than against the proxy.
- **Policy decisions and logging** often depend on whether the original connection was protected by TLS; the Proxy Protocol carries that bit across the proxy hop.

Configuring the reverse proxy to emit the Proxy Protocol header and the server to accept it from the proxy's address is what preserves these signals end-to-end.
