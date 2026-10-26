---
sidebar_position: 1
title: "Overview"
description: "Run Stalwart behind a reverse proxy or load balancer: the public URL, upstream patterns, preserving client addresses with the PROXY protocol or forwarding headers, backend listeners, first setup and sign-in problems."
---

A reverse proxy or load balancer sits in front of Stalwart, accepts the client connections and passes them on to the server. Deployments use one for three reasons: to share an IP address and port 443 with other services, to balance load over several cluster nodes, or to terminate TLS in one central place.

Stalwart works behind HAProxy, NGINX, Caddy, Traefik and similar products. Two things need configuring for it to work well. The first is the public URL that Stalwart publishes to clients, which must match the URL the proxy serves. The second is the way the client's real address reaches Stalwart, which the proxy otherwise hides. This page explains both. The pages for [HAProxy](/docs/server/reverse-proxy/haproxy), [NGINX](/docs/server/reverse-proxy/nginx), [Caddy](/docs/server/reverse-proxy/caddy) and [Traefik](/docs/server/reverse-proxy/traefik) give the configuration for each product.

## Public URL

Clients and the WebUI do not hard-code the addresses of Stalwart's HTTP endpoints. They read them from discovery documents:

- The OAuth authorization server metadata (`/.well-known/oauth-authorization-server`)
- The OpenID Connect configuration (`/.well-known/openid-configuration`)
- The JMAP session resource (`/jmap/session`)

The absolute URLs in these documents are built from the server's public URL. That URL is the value of [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) or, when the variable is unset, a URL derived from `STALWART_HTTPS_PORT` or from the server hostname on port 443, as described in [Public URLs](/docs/configuration/environment-variables#public-urls).

The public URL has a second role. Together with the host names of the JMAP, CalDAV, CardDAV and WebDAV entries in [`SystemSettings.services`](/docs/server/general#mail-exchangers-and-advertised-services), also determines the host names for which the server accepts OAuth sign-in.

Behind a proxy, the URL derived from the server's own settings may not be the one users reach. Set `STALWART_PUBLIC_URL` to the URL users type in the browser, for example `https://mail.example.com`, or `https://mail.example.com:8443` for a proxy on another port. The proxy must serve that URL over HTTPS, because Stalwart accepts sign-in only for HTTPS origins.

Some applications rebuild their URLs from headers such as `X-Forwarded-Proto` or `X-Forwarded-Host`. Stalwart's documents do not depend on these headers, so the proxy does not need to send them.

The public URL consists of a scheme, a host name and an optional port, with no path. Stalwart must therefore be served at the root of its host name. A proxy cannot publish it under a path such as `https://example.com/mail`.

## Upstream patterns

The proxy can reach Stalwart in two ways, which differ in where TLS ends.

With **TLS termination at the proxy**, the proxy decrypts HTTPS and forwards plain HTTP to an HTTP listener of Stalwart. That can be the default `http` listener on port 8080, or a dedicated listener bound to a private address. The TLS certificates are managed at the proxy. For the mail protocols, a proxy that terminates TLS must also tell Stalwart that the client used TLS, through the PROXY protocol, as described in [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol#tls-detection).

With **TCP passthrough**, the proxy forwards the TCP connection unchanged, usually choosing the backend from the TLS server name. Stalwart terminates TLS itself, with its own certificates, including ACME certificates obtained through the TLS-ALPN-01 challenge.

Both patterns produce the same discovery documents, so the choice rests on other grounds. TCP passthrough keeps encryption end to end and works for every protocol. TLS termination fits deployments where the proxy already holds the certificates for the domain.

## Preserving the client IP

Many functions depend on the client's IP address: auto-ban, rate limits, SPF and other checks on incoming mail, and the addresses in the logs. Behind a proxy that does not pass the address on, every connection appears to come from the proxy. Rate limits then apply to all users together. Worse, a ban caused by one client, or by the sum of many users' failed sign-ins, blocks the proxy and with it every user, as described in [Auto-ban](/docs/server/auto-ban#clients-behind-a-proxy).

Two mechanisms pass the address on: the PROXY protocol and forwarding headers.

### PROXY protocol

The PROXY protocol prefixes each TCP connection with a header that carries the client's address. Because it works below the application protocol, it serves every protocol, including SMTP, IMAP, POP3 and HTTP. Stalwart reads the header from connections that come from the networks in [`SystemSettings.proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks), or in a listener's [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks). Every connection from those networks must carry the header, or it is dropped. [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) describes it in detail.

### Forwarding headers

A forwarding header is an HTTP header that the proxy adds to each request it forwards: `X-Forwarded-For`, or the standard `Forwarded` header ([RFC 7239](https://www.rfc-editor.org/rfc/rfc7239)). It serves HTTP only, when the proxy terminates TLS and forwards HTTP requests.

Stalwart reads the header when [`Http.clientIpSource`](/docs/ref/object/http#clientipsource) is set to `xForwardedFor` or `forwarded`. While the field keeps its default, <!-- default:Http.clientIpSource -->`peer`<!-- /default -->, both headers are ignored.

Each proxy on the way appends an entry to the header, so the header can list several addresses. [`forwardedHops`](/docs/ref/object/http#forwardedhops) is the number of proxies that append to it, <!-- default:Http.forwardedHops -->1<!-- /default --> unless changed, and the client address is taken that many entries from the right. [HTTP settings](/docs/http/settings#client-ip-address) describe the exact behaviour.

### Choosing a mechanism

Use one mechanism per connection path. The two are scoped differently. A listener that receives the PROXY header is configured through the trusted networks. The forwarding header, by contrast, applies to every HTTP listener, because `clientIpSource` is a server-wide setting.

That difference matters for security. Any client can set a forwarding header, so when `clientIpSource` is not `peer`, every HTTP listener must be reachable only through the proxy. Otherwise a client that connects directly can claim any address, including an allowed one.

### Checking the address

To see which address Stalwart attributes to a client, look at the `remoteIp` field of the connection events (`smtp.connection-start`, `imap.connection-start`, `http.connection-start`). For HTTP with a forwarding header, the address taken from the header is the `remoteIp` of the `http.request-url` event. These events are logged at the `debug` level.

## Listeners behind a proxy

A proxy that sends the PROXY protocol is best pointed at a separate set of [NetworkListener](/docs/ref/object/network-listener) objects, found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->. Every connection from a trusted network must carry a PROXY header, so trusting the proxy on the default listeners would affect other local services too. Dedicated listeners avoid that. They accept only proxied connections and trust only the proxy's address, so connections from other local services to Stalwart are not required to carry a PROXY header. The proxy examples on the following pages forward to these ports on `127.0.0.1`:

```json
[
  {"name": "smtp-proxy", "protocol": "smtp", "bind": {"127.0.0.1:10025": true},
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}},
  {"name": "submissions-proxy", "protocol": "smtp", "bind": {"127.0.0.1:10465": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}},
  {"name": "imaps-proxy", "protocol": "imap", "bind": {"127.0.0.1:10993": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}},
  {"name": "pop3s-proxy", "protocol": "pop3", "bind": {"127.0.0.1:10995": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}},
  {"name": "sieve-proxy", "protocol": "manageSieve", "bind": {"127.0.0.1:14190": true},
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}},
  {"name": "https-proxy", "protocol": "http", "bind": {"127.0.0.1:10443": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"127.0.0.1": true}}
]
```

These listeners expect TCP passthrough, because the ones with `implicitTls` perform the TLS handshake themselves. A proxy that terminates TLS for a mail protocol and sends the PROXY v2 SSL extension needs a backend listener without TLS instead, such as the following one for IMAP:

```json
{"name": "imap-proxy-plain", "protocol": "imap", "bind": {"127.0.0.1:10143": true}, "useTls": false,
 "overrideProxyTrustedNetworks": {"127.0.0.1": true}}
```

Where the proxy runs decides what else must change. When it runs on the same host, it binds the public ports 25, 465, 993, 995, 4190 and 443 itself. Stalwart's default listeners bind the same ports on all addresses, so one of the two cannot start. Remove the default listeners for these ports, or change their `bind` to addresses the proxy does not use.

When the proxy runs on another host, bind the backend listeners to an address that host can reach, and list the proxy's address in `overrideProxyTrustedNetworks`. The listener's list does not exempt the proxy from auto-ban, so also add the proxy's address to the [allowed list](/docs/server/auto-ban#exemptions).

The listener objects are created in the WebUI, with `stalwart-cli create NetworkListener`, or with `x:NetworkListener/set`, as described in [Listeners](/docs/server/listener). Listener changes take effect after a restart.

## Initial setup behind a proxy

A new server needs special care behind a proxy. During [bootstrap mode](/docs/configuration/bootstrap-mode), the server answers only on its setup listener, plain HTTP on port 8080. It accepts the WebUI sign-in only from the address and scheme that the request itself arrived with. A proxy that terminates TLS and forwards plain HTTP breaks this rule. Complete the setup without the proxy, then put the proxy in front:

1. Open the wizard directly at `http://<stalwart-host>:8080/admin`, from the same network or through an SSH tunnel, and complete it.
2. Before restarting, set `STALWART_PUBLIC_URL` to the URL the proxy will serve, if it differs from `https://<hostname>`.
3. Restart Stalwart, configure the proxy, and sign in through it at `<public URL>/admin`.

The same applies to [recovery mode](/docs/configuration/recovery-mode), which also uses the plain HTTP listener on port 8080.

## Sign-in failures behind a proxy

Most sign-in failures behind a proxy come from a mismatch between the URL in the browser and the public URL that Stalwart publishes. Two conditions must hold:

1. `STALWART_PUBLIC_URL` must be the URL clients use, with scheme, host, and port if it is not 443. Without it, the server publishes `https://<hostname>`, which sends the browser to an address the proxy may not serve. A mismatch shows on the sign-in page as `Client metadata documents are disabled`, and a proxy that serves the WebUI over plain HTTP gives `Unknown client id`.
2. The proxy must serve that URL over HTTPS.

To check the first condition, fetch the configuration through the proxy and compare every URL in it with the public URL:

```sh
curl -s https://mail.example.com/.well-known/openid-configuration
```

A different symptom points to a different cause. If the proxy, or every user behind it, is suddenly refused, check whether the proxy's address has been banned, as described in [Diagnosing and clearing a ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban).
