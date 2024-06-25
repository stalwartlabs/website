---
sidebar_position: 4
---

# HAProxy

HAProxy is a powerful, open-source software widely recognized for its high performance, reliability, and flexibility as a load balancer and reverse proxy. It is commonly used in environments requiring high availability and scalability, such as web servers, databases, and various application services. HAProxy excels in managing large volumes of traffic, distributing load evenly across multiple servers, and providing advanced features like health checks, SSL termination, and connection persistence.

Stalwart Mail Server supports HAProxy, enabling you to take full advantage of HAProxy's robust capabilities to manage and route email traffic efficiently. By using HAProxy as a reverse proxy, you can ensure that your Stalwart Mail Server benefits from HAProxy's sophisticated load balancing, failover mechanisms, and traffic management features.

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
