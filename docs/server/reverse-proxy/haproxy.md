---
sidebar_position: 4
---

# HAProxy

[HAProxy](https://www.haproxy.org) is an open-source TCP and HTTP load balancer widely used in high-availability deployments. It supports health checks, TLS termination, connection persistence, and the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol).

Stalwart can sit behind HAProxy for any of its listener protocols. The `send-proxy-v2` directive on each backend carries the original client IP and TLS status through to Stalwart, which accepts the Proxy Protocol header when the source address is listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><!-- /breadcrumb:SystemSettings -->) or in [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) on the matching [NetworkListener](/docs/ref/object/network-listener).

## Configuration

```yaml
# Global settings
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    ca-base /etc/ssl/certs
    crt-base /etc/ssl/private
    ssl-default-bind-options no-sslv3
    ssl-default-bind-ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!DSS:!RC4
    tune.ssl.default-dh-param 2048

# Default settings
defaults
    log     global
    mode    tcp
    option  tcplog
    option  dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

# Frontend configuration for various ports
frontend ft_smtp
    bind *:25
    mode tcp
    option tcplog
    default_backend bk_smtp

frontend ft_imap
    bind *:143
    mode tcp
    option tcplog
    default_backend bk_imap

frontend ft_smtps
    bind *:465
    mode tcp
    option tcplog
    default_backend bk_smtps

frontend ft_imaps
    bind *:993
    mode tcp
    option tcplog
    default_backend bk_imaps

frontend ft_https
    bind *:443
    mode tcp
    option tcplog
    default_backend bk_https

# Backend configuration
backend bk_smtp
    mode tcp
    option tcplog
    server stalwart_mail_smtp 127.0.0.1:10025 send-proxy-v2

backend bk_imap
    mode tcp
    option tcplog
    server stalwart_mail_imap 127.0.0.1:10143 send-proxy-v2

backend bk_smtps
    mode tcp
    option tcplog
    server stalwart_mail_smtps 127.0.0.1:10465 send-proxy-v2

backend bk_imaps
    mode tcp
    option tcplog
    server stalwart_mail_imaps 127.0.0.1:10993 send-proxy-v2

backend bk_https
    mode tcp
    option tcplog
    server stalwart_mail_https 127.0.0.1:10443 send-proxy-v2

# Enable HAProxy stats
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if LOCALHOST
    stats auth admin:admin
```
