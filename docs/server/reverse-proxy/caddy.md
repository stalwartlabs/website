---
sidebar_position: 3
---

# Caddy

Caddy is an open-source, HTTP/2-enabled web server that is renowned for its simplicity, flexibility, and powerful automatic HTTPS features. It is designed to make setting up web servers quick and easy, with an emphasis on security and performance. Caddy is highly configurable, supporting a wide range of use cases, from simple static file serving to complex reverse proxy setups, all while providing automatic TLS certificate management.

Stalwart Mail Server supports Caddy, allowing you to leverage Caddy's robust feature set to manage and route traffic to your email server seamlessly. Using Caddy as a reverse proxy, you can benefit from its automatic HTTPS configuration, easy-to-use syntax, and powerful performance enhancements to ensure that your Stalwart Mail Server operates efficiently and securely.

## Note on Proxy Protocol

Caddy, while being a powerful and easy-to-use web server and reverse proxy, does not natively support the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol). This protocol is typically used to pass client connection information such as IP addresses and TLS connection statuses through multiple layers of proxies. To achieve this functionality, you would need to integrate [HAProxy](/docs/server/reverse-proxy/haproxy) or [NGINX](/docs/server/reverse-proxy/nginx), which can handle the Proxy Protocol and forward traffic to Caddy for further processing.

In a typical setup, [HAProxy](/docs/server/reverse-proxy/haproxy) or [NGINX](/docs/server/reverse-proxy/nginx) would listen on the required ports (such as 25 for SMTP, 143 for IMAP, 465 for SMTPS, 993 for IMAPS, and 443 for HTTPS), use the Proxy Protocol to send the necessary client connection details, and forward the traffic to Caddy running on alternate ports. Caddy would then handle the reverse proxy duties and forward the traffic to the respective Stalwart Mail Server ports.

For those looking to enable Proxy Protocol support directly within Caddy, there is a community-contributed plugin called [proxy_protocol](https://github.com/mastercactapus/caddy2-proxyprotocol). This plugin is a listener wrapper for Caddy 2 that adds support for PROXY headers on new connections, allowing Caddy to handle the Proxy Protocol directly without the need for HAProxy.

## Configuration

### Caddy configuration

```txt
mail.example.com {
	redir https://example.com{uri}
}

example.com {
	# Set this path to your site's directory.
	root * /usr/share/caddy

	# Enable the static file server.
	file_server
}

mail.example.com {
	reverse_proxy 127.0.0.1:8080
}
```

### Crontab entries

The following crontab entries can be used to automate copying the certificates obtained by Caddy:

```bash
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.crt > /opt/stalwart-mail/cert/example.com.pem
0 3 * * * cat /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/example.com/example.com.key > /opt/stalwart-mail/cert/example.com.priv.pem
```

### Stalwart configuration

```toml
server.tls.certificate = "default"
certificate.default.cert = "%{file:/opt/stalwart-mail/cert/example.com.pem}%"
certificate.default.default = true
certificate.default.private-key = "%{file:/opt/stalwart-mail/cert/example.com.priv.pem}%"
```
