---
sidebar_position: 3
---

# Caddy

Caddy is an open-source, HTTP/2-enabled web server that is renowned for its simplicity, flexibility, and powerful automatic HTTPS features. It is designed to make setting up web servers quick and easy, with an emphasis on security and performance. Caddy is highly configurable, supporting a wide range of use cases, from simple static file serving to complex reverse proxy setups, all while providing automatic TLS certificate management.

Stalwart Mail Server supports Caddy, allowing you to leverage Caddy's robust feature set to manage and route traffic to your email server seamlessly. Using Caddy as a reverse proxy, you can benefit from its automatic HTTPS configuration, easy-to-use syntax, and powerful performance enhancements to ensure that your Stalwart Mail Server operates efficiently and securely.

## Note on Layer 4 support

Caddy does not natively support routing raw TCP/UDP streams (layer 4), which would be necessary for SMTP(S) and IMAP(S). You could either let [HAProxy](/docs/server/reverse-proxy/haproxy) or [NGINX](/docs/server/reverse-proxy/nginx) these ports, or make a custom Caddy build with non-standard modules which bring support for layer 4.

For examle, using `xcaddy`:
```txt
xcaddy build --with github.com/mholt/caddy-l4/modules/l4proxy \
    --with github.com/mholt/caddy-l4/modules/l4tls \
    --with github.com/mholt/caddy-l4/modules/l4proxyprotocol
```

## Configuration

With this custom Caddy, the following Caddyfile should work:

```txt
{
    layer4 {
        0.0.0.0:25 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:10025
                }
            }
        }

        0.0.0.0:993 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:10993
                }
            }
        }

        0.0.0.0:465 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:10465
                }
            }
        }

        0.0.0.0:4190 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:14190
                }
            }
        }
    }
}

example.com {
    redir https://www.example.com{uri}
}

www.example.com {
    root * /var/www/imkerei

    file_server
}

mail.example.com {
    reverse_proxy https://127.0.0.1:10443 {
        transport http {
            proxy_protocol v2
            tls_server_name mail.example.com
        }
    }
}
```

### Crontab entries

The following crontab entries can be used to automate copying the certificates obtained by Caddy:

```bash
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.crt > /opt/stalwart-mail/cert/example.com.pem
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.key > /opt/stalwart-mail/cert/example.com.priv.pem
```

### Systemd

As an alternative to crontab, it is also possible to let systemd watch the certificate file for updates, copy the renewed certificate files and restart Stalwart:

*stalwart.path:*

```
[Unit]
Description=import certs from caddy to stalwart

[Path]
PathModified=/var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.crt

[Install]
WantedBy=multi-user.target
```

*stalwart.service:*

```
[Unit]
Description=imports certs from caddy to stalwart

[Service]
Type=oneshot
ExecStart=/usr/bin/cp -f /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.pem /opt/stalwart-mail/cert/
ExecStart=/usr/bin/cp -f /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.priv.pem /opt/stalwart-mail/cert/
ExecStart=/usr/bin/curl -X GET -H "Accept: aplication/json" -H "Authorization: Bearer <TOKEN>"  https://mail.example.com/api/reload/certificate 

[Install]
WantedBy=multi-user.target
```

### Stalwart configuration

```toml
server.tls.certificate = "default"
certificate.default.cert = "%{file:/opt/stalwart-mail/cert/example.com.pem}%"
certificate.default.default = true
certificate.default.private-key = "%{file:/opt/stalwart-mail/cert/example.com.priv.pem}%"
```
