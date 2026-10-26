---
sidebar_position: 3
title: "Caddy"
description: "Run Stalwart behind Caddy: HTTPS through reverse_proxy, mail ports through the caddy-l4 plugin with the PROXY protocol, and sharing Caddy's certificates with Stalwart."
---

[Caddy](https://caddyserver.com) is a web server and reverse proxy that obtains and renews its certificates automatically. In front of Stalwart it is typically used when the host already runs Caddy for websites on port 443, and Stalwart has to share that port.

This page shows a configuration with a division of labour between the two. Caddy handles HTTPS for the mail host name. It forwards the mail ports unchanged to Stalwart, which terminates TLS for them, using certificates copied from Caddy.

When clients reach the server under a URL other than `https://<hostname>`, set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to that URL. [Public URL](/docs/server/reverse-proxy/#public-url) explains why.

## Mail ports

Caddy forwards only HTTP by itself, and the mail protocols (SMTP, IMAP, POP3, ManageSieve) are not HTTP. Forwarding the mail ports therefore requires a Caddy binary built with the community-maintained [caddy-l4](https://github.com/mholt/caddy-l4) plugin, which adds TCP forwarding and the PROXY protocol. The following `xcaddy` command builds such a binary:

```txt
xcaddy build --with github.com/mholt/caddy-l4
```

Where a custom build is not wanted, forward the mail ports with HAProxy or NGINX instead, as described on their pages, and use Caddy for HTTP only.

## Configuration

Caddy binds the public ports on this host, and two programs cannot bind the same port. Stalwart's default listeners for those ports must therefore be removed or moved to other addresses.

The following Caddyfile does two things. It forwards the mail ports to the [backend listeners](/docs/server/reverse-proxy/#listeners-behind-a-proxy) on `127.0.0.1`, with PROXY protocol version 2. It also proxies HTTPS for `mail.example.com` to the backend HTTPS listener:

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
        0.0.0.0:465 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:10465
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
        0.0.0.0:995 {
            route {
                proxy {
                    proxy_protocol v2
                    upstream 127.0.0.1:10995
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

mail.example.com {
    reverse_proxy https://127.0.0.1:10443 {
        transport http {
            proxy_protocol v2
            tls_server_name mail.example.com
        }
    }
}
```

The two kinds of traffic take different paths. The mail connections reach Stalwart unchanged, so Stalwart performs the TLS handshake for them. HTTPS is decrypted by Caddy and encrypted again towards the backend listener, and `tls_server_name` makes Caddy request the certificate for `mail.example.com` from Stalwart.

Caddy sends the PROXY header without the SSL extension. That is correct here, because Stalwart sees the TLS connections itself.

This setup affects how Stalwart gets its certificates. Caddy occupies port 443, so the TLS-ALPN-01 challenge of Stalwart's own ACME client cannot reach Stalwart. There are two ways around this: let Stalwart obtain its certificates with the DNS-01 challenge, or copy Caddy's certificates as described below.

## Sharing Caddy's certificates

Caddy already obtains a certificate for the mail host name, so Stalwart can use the same one. Caddy stores the certificates it obtains under its data directory, in `certificates/<issuer>/<host>/<host>.crt`, with the private key in `<host>.key`. For the Caddy service on Linux, the data directory is usually `/var/lib/caddy/.local/share/caddy`.

A Stalwart [Certificate](/docs/ref/object/certificate) (found in the WebUI under <!-- breadcrumb:Certificate --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › Certificates<!-- /breadcrumb:Certificate -->) can read copies of these files:

```json
{
  "certificate": {"@type": "File", "filePath": "/etc/stalwart/tls/mail.example.com.crt"},
  "privateKey": {"@type": "File", "filePath": "/etc/stalwart/tls/mail.example.com.key"}
}
```

Stalwart reads the files only when it loads its certificates. After each renewal by Caddy, the files must therefore be copied again, and the certificates reloaded with the `ReloadTlsCertificates` action, as described in [Certificates](/docs/server/tls/certificates#reloading-certificates).

A systemd path unit can do this automatically, whenever Caddy writes a new certificate. It consists of two units: a path unit that watches the certificate file, and a service unit that copies the files and reloads the certificates.

*stalwart-certs.path:*

```ini
[Unit]
Description=Copy Caddy certificates to Stalwart

[Path]
PathModified=/var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.crt

[Install]
WantedBy=multi-user.target
```

*stalwart-certs.service:*

```ini
[Unit]
Description=Copy Caddy certificates to Stalwart

[Service]
Type=oneshot
ExecStart=/usr/bin/install -o stalwart -g stalwart -m 0640 /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.crt /etc/stalwart/tls/
ExecStart=/usr/bin/install -o stalwart -g stalwart -m 0600 /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.example.com/mail.example.com.key /etc/stalwart/tls/
ExecStart=/usr/local/bin/stalwart-cli --url https://mail.example.com --api-key <token> create Action/ReloadTlsCertificates
```

Enable the path unit with `systemctl enable --now stalwart-certs.path`. Without systemd, a daily cron job that runs the same three commands has the same effect, with a delay of up to a day after a renewal.

Clients that send no server name receive the default certificate. To have them receive this certificate, set [`SystemSettings.defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) to it.
