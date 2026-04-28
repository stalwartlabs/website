---
sidebar_position: 1
---

# Overview

A reverse proxy accepts client connections on behalf of one or more back-end servers and relays traffic between them. Placing a reverse proxy in front of a mail server typically provides load balancing across multiple back-end nodes, a single ingress point for operational monitoring, and centralised TLS termination when that is the desired topology.

Stalwart operates without modification behind a reverse proxy, and is compatible with common reverse-proxy products such as HAProxy, Caddy, NGINX, and Traefik.

## How discovery URLs are composed

Mail clients, the WebUI, and OIDC relying parties locate Stalwart's endpoints through a small number of discovery documents: the OAuth 2.0 authorization-server metadata (`/.well-known/oauth-authorization-server`), the OpenID Connect configuration (`/.well-known/openid-configuration`), the JMAP session resource (`/.well-known/jmap`), and the WebUI's `/api/discover` response. Every absolute URL published in those documents is built from a single source of truth:

- The **scheme** is always `https`. Stalwart serves these documents over HTTPS only in normal operation; the bootstrap and recovery modes serve path-relative URLs and do not include a scheme at all.
- The **host** is the value of [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) on the [SystemSettings](/docs/ref/object/system-settings) singleton, which is the hostname the operator entered in Step 1 of the setup wizard.
- The **port** is `443`, unless the [`STALWART_HTTPS_PORT`](/docs/configuration/environment-variables#public-urls) environment variable is set, in which case its value is appended to the URL.

The published URLs are independent of how the request reached Stalwart. Whether the proxy talks to Stalwart on the HTTP listener (port `8080`), on the HTTPS listener (port `443`), with or without Proxy Protocol, the discovery documents contain `https://<defaultHostname>[:STALWART_HTTPS_PORT]/...` in every case. The proxy is free to use whichever upstream pattern fits the deployment best; it does not need to forward `X-Forwarded-Proto` or `X-Forwarded-Host` for OAuth and JMAP discovery to work correctly.

What the proxy **does** need to satisfy is consistency between what its clients see and what the discovery documents publish:

- **The public hostname must match `defaultHostname`.** When the proxy hostname differs (for example the proxy serves `mail.example.com` while the wizard recorded `stalwart.internal`), browsers will be redirected to a host they cannot reach. Update `defaultHostname` through Settings › Network › Services in the WebUI, or with the [CLI](/docs/management/cli/overview), so that it matches the public-facing hostname.
- **The public HTTPS port must match the value Stalwart publishes.** If the proxy listens on a port other than `443` (for example `8443`), set [`STALWART_HTTPS_PORT`](/docs/configuration/environment-variables#public-urls) to that port and restart the server.
- **The proxy must serve traffic on HTTPS.** Browsers refuse to complete OAuth flows over plain HTTP for non-localhost origins, and JMAP credentials should never traverse plain HTTP. The proxy is the right place to terminate TLS for clients; how the proxy reaches Stalwart on its side of the hop is an implementation detail.

## Choosing the upstream pattern

There are two equivalent ways for the proxy to reach Stalwart, and both produce correct discovery URLs:

- **HTTP upstream (recommended for simplicity).** The proxy terminates TLS for clients and forwards plain HTTP to Stalwart's HTTP listener (default port `8080`). This is the conventional reverse-proxy pattern and the one used by every example in the proxy guides below. No backend TLS configuration is required.
- **HTTPS or TCP-passthrough upstream.** The proxy either re-encrypts to Stalwart's HTTPS listener (default port `443`) or passes the TLS session through to it untouched (using a TCP-mode router with SNI). This is useful when end-to-end TLS is a deployment requirement, when the proxy is on a separate host on an untrusted network, or when Proxy Protocol is being used to preserve the client IP on the HTTPS listener.

Both patterns are documented in the per-proxy pages. Pick the one that fits the operational model of the deployment; the OAuth, OIDC, and JMAP discovery responses are identical either way.

## Proxy Protocol

The [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol), introduced by HAProxy, forwards connection metadata (the original client IP and whether the transport is TLS) from the proxy to the back-end server. Without this extension, Stalwart sees only the proxy's IP address and cannot distinguish one client from another.

Enabling the Proxy Protocol is recommended whenever Stalwart runs behind a reverse proxy. Several pieces of server behaviour depend on it:

- **Sender authentication** checks such as SPF and DMARC rely on the remote client's IP address. Without the Proxy Protocol those checks run against the proxy's address and are meaningless.
- **Rate limiting and auto-banning** need the real client IP to enforce per-source limits and to create [BlockedIp](/docs/ref/object/blocked-ip) entries against the offending source rather than against the proxy.
- **Policy decisions and logging** often depend on whether the original connection was protected by TLS; the Proxy Protocol carries that bit across the proxy hop.

Configuring the reverse proxy to emit the Proxy Protocol header and the server to accept it from the proxy's address is what preserves these signals end-to-end. Note that Proxy Protocol is independent of HTTP `X-Forwarded-*` headers and serves a different purpose: client IP and TLS-status preservation for security and logging, not URL composition.

## Initial setup behind a proxy

The setup wizard runs in **bootstrap mode** on plain HTTP at `http://<host>:8080/admin`. Bootstrap and recovery modes deliberately publish path-relative URLs in their discovery responses (`/login`, `/auth/token`, etc.) so that the wizard can be reached without HTTPS, before a hostname or certificate has been configured. Once the wizard finishes and the server restarts in normal mode, the discovery documents start emitting absolute `https://...` URLs as described above.

The smoothest path through this transition for deployments that already have a reverse proxy in front of Stalwart is to **bypass the proxy for the duration of the wizard and the first sign-in**, then put the proxy back in the path:

1. From a host on the same network, point a browser at `http://<stalwart-host>:8080/admin` directly. Complete the wizard.
2. After Stalwart restarts, sign in once at `https://<stalwart-host>/admin` directly, accepting any self-signed certificate warning. This is the period during which the WebUI moves from path-relative URLs to absolute `https://<defaultHostname>/...` URLs.
3. With a permanent administrator created and the WebUI confirmed working, restore the reverse-proxy configuration. From this point on, every browser, mail client, and OIDC relying party reaches Stalwart through the proxy, and the discovery documents already point at the public hostname over HTTPS.

The same approach works for migrations from earlier releases: a proxy in front of a freshly migrated `v0.16` instance is a known source of confusion during the recovery-mode admin step, and bypassing the proxy until the first sign-in succeeds is the most reliable way through it.

## Preserving the client IP

Stalwart's automatic banning, rate limiting, and SPF/DMARC sender authentication all depend on seeing the real client IP. Without that, every request appears to come from the proxy, which can trigger a self-inflicted ban that locks every user out behind the proxy.

There are two standard mechanisms for forwarding the client IP, and they are not interchangeable on a given listener:

- **[Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol)** is a transport-level extension that prepends a small header to the TCP stream. It works for every protocol Stalwart speaks (SMTP, IMAP, POP3, JMAP, HTTP) and carries both the original client IP and the original TLS bit, which is what makes SPF and DMARC checks meaningful end-to-end. Configure the proxy to emit the header and the listener to accept it from the proxy's address.
- **`X-Forwarded-For`** is an HTTP-only header set by the proxy. It is appropriate for HTTP listeners when the proxy operates in HTTP mode rather than TCP mode. Stalwart picks up this header when the listener is configured to trust forwarded headers from the proxy's IP.

A single listener should be configured for one of these mechanisms; Stalwart cannot decode both on the same connection. The HTTP listener defaults to `X-Forwarded-For` because most reverse proxies emit it natively in HTTP mode; switch to Proxy Protocol when the proxy operates at the TCP layer (for example HAProxy `mode tcp`, or NGINX `stream` blocks).

Whichever mechanism is used, the proxy's address must be marked as a trusted network so that the forwarded IP is honoured rather than treated as the source of a request from the proxy itself. See [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol) for the per-product configuration and the trusted-network setting.

## When sign-in fails behind a proxy

The most common failure mode is that the proxy terminates HTTPS but talks plain HTTP to Stalwart, and the discovery URLs Stalwart publishes end up pointing at the wrong scheme or port. Three things have to line up:

1. **`defaultHostname`** matches the public-facing hostname the proxy serves. Edit it through *Settings › Network › Services* in the WebUI or with the [CLI](/docs/management/cli/overview).
2. **[`STALWART_HTTPS_PORT`](/docs/configuration/environment-variables#public-urls)** is set to the public HTTPS port when that port is not `443`. Without it, the discovery documents publish `https://<host>/...` (port `443` implied) and clients are sent to a port the proxy is not listening on.
3. **The proxy serves on HTTPS to clients.** Browsers refuse OAuth flows over plain HTTP for non-localhost origins.

If those three are correct, the upstream pattern (HTTP to `:8080`, HTTPS to `:443`, or TCP-passthrough) is an implementation detail and any of them produces the same discovery URLs. If sign-in still fails, bypass the proxy temporarily as described in [Initial setup behind a proxy](#initial-setup-behind-a-proxy) above to confirm the server is healthy, then re-introduce the proxy and check each of the three points in turn.
