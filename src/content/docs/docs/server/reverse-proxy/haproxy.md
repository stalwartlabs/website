---
sidebar_position: 4
title: "HAProxy"
description: "Run Stalwart behind HAProxy with TCP passthrough and the PROXY protocol on the mail and HTTPS ports."
---

[HAProxy](https://www.haproxy.org) is a load balancer for both TCP and HTTP traffic. In front of Stalwart it is usually run in TCP mode, because the mail protocols are not HTTP. In that mode HAProxy forwards each connection unchanged to Stalwart, which terminates TLS itself. HAProxy hides the client's address, so it sends that address to Stalwart with the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol).

The configuration on this page does this for every default port. HAProxy can alternatively terminate TLS for HTTPS and forward plain HTTP to Stalwart. [Upstream patterns](/docs/server/reverse-proxy/#upstream-patterns) compares the two approaches.

When clients reach the server under a URL other than `https://<hostname>`, set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to that URL.

## Configuration

HAProxy binds the public ports on this host, and two programs cannot bind the same port. Stalwart's default listeners for those ports must therefore be removed or moved to other addresses, as described in [Listeners behind a proxy](/docs/server/reverse-proxy/#listeners-behind-a-proxy). The backends in the configuration point at the backend listeners on `127.0.0.1`, which accept the PROXY header from that address:

```txt
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    tcp
    option  tcplog
    option  dontlognull
    timeout connect 5s
    timeout client  30m
    timeout server  30m

frontend ft_smtp
    bind :25
    default_backend bk_smtp

frontend ft_submissions
    bind :465
    default_backend bk_submissions

frontend ft_imaps
    bind :993
    default_backend bk_imaps

frontend ft_pop3s
    bind :995
    default_backend bk_pop3s

frontend ft_sieve
    bind :4190
    default_backend bk_sieve

frontend ft_https
    bind :443
    default_backend bk_https

backend bk_smtp
    server stalwart 127.0.0.1:10025 send-proxy-v2

backend bk_submissions
    server stalwart 127.0.0.1:10465 send-proxy-v2

backend bk_imaps
    server stalwart 127.0.0.1:10993 send-proxy-v2

backend bk_pop3s
    server stalwart 127.0.0.1:10995 send-proxy-v2

backend bk_sieve
    server stalwart 127.0.0.1:14190 send-proxy-v2

backend bk_https
    server stalwart 127.0.0.1:10443 send-proxy-v2
```

### PROXY protocol version

`send-proxy-v2` sends version 2 of the PROXY header, without the SSL extension. That is correct here, because Stalwart performs the TLS handshake on these connections and knows that they are encrypted.

When HAProxy terminates TLS itself and forwards plain TCP to Stalwart, Stalwart can no longer see the TLS. In that setup, use `send-proxy-v2-ssl` instead, so that the header tells Stalwart that the client used TLS, and forward to a backend listener without TLS. [TLS detection](/docs/server/reverse-proxy/proxy-protocol#tls-detection) describes the mechanism.

### Timeouts

IMAP and ManageSieve sessions stay open for a long time while clients wait for new messages. IMAP clients in IDLE are expected to renew the command after 29 minutes, so the client and server timeouts are set to 30 minutes, just longer than that. Shorter timeouts make HAProxy close idle IMAP sessions, which clients see as dropped connections.

### Health checks

A health check (`check` on a `server` line) connects to the backend like any other client, so it must send the PROXY header as well, or the backend listener closes the connection. HAProxy sends the header when the check uses the server's own address and port. With a separate check port, `check-send-proxy` must be added.
