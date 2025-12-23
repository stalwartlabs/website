---
sidebar_position: 3
---

# Caddy

Caddy is an open-source, HTTP/2-enabled web server that is renowned for its simplicity, flexibility, and powerful automatic HTTPS features. It is designed to make setting up web servers quick and easy, with an emphasis on security and performance. Caddy is highly configurable, supporting a wide range of use cases, from simple static file serving to complex reverse proxy setups, all while providing automatic TLS certificate management.

Stalwart supports Caddy, allowing you to leverage Caddy's robust feature set to manage and route traffic to your email server seamlessly. Using Caddy as a reverse proxy, you can benefit from its automatic HTTPS configuration, easy-to-use syntax, and powerful performance enhancements to ensure that your Stalwart operates efficiently and securely.

You can use Caddy to either proxy all protocols (HTTP, SMTP, IMAP and POP) or only HTTP.

## HTTP Only Proxy Configuration

The following is an example of a Caddyfile configuration that can be used to set up Caddy as a reverse proxy for Stalwart for only HTTP protocol. This configuration includes support for the Proxy Protocol, which is essential for preserving client IP addresses and TLS connection information when using Caddy in front of Stalwart.

```txt
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


## Note on Layer 4 support

Caddy, while being a powerful and easy-to-use web server and reverse proxy, does not natively support raw TCP streams (layer 4) and consequently the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol). This protocol is typically used to pass client connection information such as IP addresses and TLS connection statuses through multiple layers of proxies. To achieve this functionality, you would need to integrate [HAProxy](/docs/server/reverse-proxy/haproxy) or [NGINX](/docs/server/reverse-proxy/nginx), which can handle the Proxy Protocol and forward traffic to Caddy for further processing.

For those looking to enable Layer 4 support directly within Caddy, there is a community-contributed plugin called caddy-l4. This plugin is a listener wrapper for Caddy that adds support for Layer 4 forwarding and Proxy headers on new connections, allowing Caddy to handle the Proxy Protocol directly without the need for HAProxy.

For examle, using `xcaddy`:
```txt
xcaddy build --with github.com/mholt/caddy-l4/modules/l4proxy \
    --with github.com/mholt/caddy-l4/modules/l4tls \
    --with github.com/mholt/caddy-l4/modules/l4proxyprotocol
```

## Full Proxy Configuration

The following is an example of a Caddyfile configuration that can be used to set up Caddy as a reverse proxy for Stalwart. This configuration includes support for the Proxy Protocol, which is essential for preserving client IP addresses and TLS connection information when using Caddy in front of Stalwart.

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

## Certificate management

### Crontab

The following crontab entries can be used to automate copying the certificates obtained by Caddy:

```bash
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.crt > /opt/stalwart/cert/example.com.pem
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.key > /opt/stalwart/cert/example.com.priv.pem
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
ExecStart=/usr/bin/cp -f /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.pem /opt/stalwart/cert/
ExecStart=/usr/bin/cp -f /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.priv.pem /opt/stalwart/cert/
ExecStart=/usr/bin/curl -X GET -H "Accept: application/json" -H "Authorization: Bearer <TOKEN>"  https://mail.example.com/api/reload/certificate

[Install]
WantedBy=multi-user.target
```

## Stalwart configuration

```toml
server.tls.certificate = "default"
certificate.default.cert = "%{file:/opt/stalwart/cert/example.com.pem}%"
certificate.default.default = true
certificate.default.private-key = "%{file:/opt/stalwart/cert/example.com.priv.pem}%"
```
