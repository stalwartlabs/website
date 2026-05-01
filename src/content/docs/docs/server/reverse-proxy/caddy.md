---
sidebar_position: 3
title: "Caddy"
---

[Caddy](https://caddyserver.com) is an open-source, HTTP/2-enabled web server with automatic HTTPS. It covers static file serving, simple reverse proxies, and TLS management out of the box, and is often chosen for the conciseness of its Caddyfile syntax.

Stalwart can sit behind Caddy for HTTP traffic. Caddy handles HTTPS termination and certificate management, then forwards requests to Stalwart.

The example below forwards to Stalwart's HTTPS listener with Proxy Protocol v2, but a plain HTTP-upstream pattern (Caddy forwarding plain HTTP to Stalwart's port `8080`) works equally well and produces the same OAuth, OIDC, and JMAP discovery responses. See [How discovery URLs are composed](/docs/server/reverse-proxy/#how-discovery-urls-are-composed) for the model that drives those responses, and set the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) variable to the URL clients reach Caddy on whenever it differs from `https://<defaultHostname>` on port `443`.

## Note on Layer 4 support

Caddy does not natively forward raw TCP streams, so it cannot forward the mail ports (SMTP, IMAP, POP3, ManageSieve) or preserve the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol) on them. To carry client IPs into Stalwart's mail listeners, either put [HAProxy](/docs/server/reverse-proxy/haproxy) or [NGINX](/docs/server/reverse-proxy/nginx) in front of Caddy, or build a Caddy binary that includes the community-maintained `caddy-l4` plugin. The plugin adds layer-4 forwarding and Proxy Protocol emission to Caddy.

For example, using `xcaddy`:

```txt
xcaddy build --with github.com/mholt/caddy-l4/modules/l4proxy \
    --with github.com/mholt/caddy-l4/modules/l4tls \
    --with github.com/mholt/caddy-l4/modules/l4proxyprotocol
```

## Configuration

The following Caddyfile forwards the mail ports (25, 465, 993, 4190) using `caddy-l4` with Proxy Protocol v2 and reverse-proxies HTTPS for `mail.example.com`:

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

Automate copying Caddy-issued certificates into Stalwart's certificate directory from cron:

```bash
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.crt > /opt/stalwart/cert/example.com.pem
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.key > /opt/stalwart/cert/example.com.priv.pem
```

### Systemd

As an alternative to cron, a systemd path unit can watch the Caddy certificate file, copy the renewed files into place, and trigger a hot reload on Stalwart:

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

Create a [Certificate](/docs/ref/object/certificate) object (found in the WebUI under <!-- breadcrumb:Certificate --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › Certificates<!-- /breadcrumb:Certificate -->) pointing at the copied certificate and private-key files, and reference it from [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->) so that it is presented when clients do not send SNI. The Certificate fields look like:

```json
{
  "certificate": {
    "@type": "File",
    "filePath": "/opt/stalwart/cert/example.com.pem"
  },
  "privateKey": {
    "@type": "File",
    "filePath": "/opt/stalwart/cert/example.com.priv.pem"
  }
}
```
