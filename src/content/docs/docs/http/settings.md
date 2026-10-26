---
sidebar_position: 2
title: "HTTP server"
description: "Settings of the HTTP server: client address behind proxies, the root redirect, response headers, HSTS, CORS and request rate limits."
---

Stalwart's HTTP server serves JMAP, CalDAV, CardDAV and WebDAV, the WebUI, OAuth and the management API on every HTTP listener. A few decisions concern all of these at once: how the server learns the client's real address behind a proxy, which headers it adds to its responses, and how fast a client may send requests. They are made on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->), whose settings apply to all HTTP listeners and take effect after a [settings reload](/docs/configuration/#applying-changes).

Two related settings live elsewhere. The ports and the TLS of the listeners are set on the [listeners](/docs/server/listener). Which paths are reachable by whom is set with [access control](/docs/http/access-control) rules, in the same object's `allowedEndpoints`.

The base URL that the server publishes in its discovery documents is not an Http setting either. It comes from `STALWART_PUBLIC_URL` or from the server hostname, as described in [Public URLs](/docs/configuration/environment-variables#public-urls).

## Client IP address

The server uses the client's address for rate limiting and banning, so it needs the real one. Normally it takes the address from the TCP connection, or from the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) header of a trusted proxy. Behind a reverse proxy that terminates TLS and forwards HTTP requests, however, every connection comes from the proxy. The client's address then travels in a forwarding header that the proxy adds. [`clientIpSource`](/docs/ref/object/http#clientipsource) selects where the address is taken from:

- `peer`: the connection's address, ignoring forwarding headers.
- `xForwardedFor`: the `X-Forwarded-For` header.
- `forwarded`: the `for=` parameter of the `Forwarded` header defined in [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239).

The default is <!-- default:Http.clientIpSource -->`peer`<!-- /default -->. Behind such a proxy, every request therefore appears to come from the proxy until the field is changed.

Forwarding headers can contain several addresses, and not all of them can be trusted. Each proxy appends the address it received the request from to the end of the header. The rightmost entries are therefore written by trusted proxies, and the leftmost by whoever sent the request. [`forwardedHops`](/docs/ref/object/http#forwardedhops) is the number of proxies in front of Stalwart, at most 16. The client address is taken that many entries from the right, and entries further left are ignored. The default of <!-- default:Http.forwardedHops -->1<!-- /default --> suits a single proxy, whose last entry is used. With a CDN in front of the proxy, set it to 2.

Only the selected header is read, and malformed headers are refused. A request is refused with HTTP `400`, and logs `http.x-forwarded-invalid`, when its selected entry is missing, cannot be parsed or names a loopback address, or when its header has fewer entries than `forwardedHops`. A request without the header is processed with the connection's address. That case is logged as `http.x-forwarded-missing`, unless the connection comes from a loopback address. Requests from banned addresses receive HTTP `403`.

Forwarding headers carry a risk. Anyone who can connect to an HTTP listener directly can send a forwarding header with any address, including an allowed one. When `clientIpSource` is not `peer`, make every HTTP listener reachable only through the proxy. When the address comes from a forwarding header, malformed requests also do not count towards the scanning ban of [auto-ban](/docs/server/auto-ban#clients-behind-a-proxy).

## Root redirect

A request for `/` is redirected with HTTP `302` to the path in [`redirectRoot`](/docs/ref/object/http#redirectroot), which is <!-- default:Http.redirectRoot -->`/account`<!-- /default --> unless changed. When the field is unset, `/` returns `404`.

## Response headers

[`responseHeaders`](/docs/ref/object/http#responseheaders) adds headers to every response, as a map from header name to value. A typical use is a `Content-Security-Policy`, or a header that identifies the server behind a load balancer:

```json
{
  "responseHeaders": {
    "X-Served-By": "mail1"
  }
}
```

A configured header replaces any header of the same name that the server would otherwise send. Overriding headers such as `Cache-Control` or `Content-Type` can therefore break clients.

## Security

Two settings add security headers to every response. The first is [`enableHsts`](/docs/ref/object/http#enablehsts), which adds HTTP Strict Transport Security ([RFC 6797](https://www.rfc-editor.org/rfc/rfc6797)): `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Browsers that receive this header use only HTTPS for the host and its subdomains, for a year. The setting is <!-- default:Http.enableHsts as=enabled -->disabled<!-- /default --> until it is turned on. Because the commitment lasts a year and covers subdomains, enable it only when every name under the host is served over HTTPS, and not on a server whose WebUI is still used over plain HTTP.

The second is [`usePermissiveCors`](/docs/ref/object/http#usepermissivecors), <!-- default:Http.usePermissiveCors as=enabled -->disabled<!-- /default --> until it is turned on. Browsers normally stop a web page from calling a server on another origin, unless the server allows it with Cross-Origin Resource Sharing (CORS) headers. With this setting, the server adds the following CORS headers to every response, which allow web pages on any origin to call it from a browser:

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With
Access-Control-Allow-Methods: POST, GET, PATCH, PUT, DELETE, HEAD, OPTIONS
```

The setting is needed when a web application hosted on another origin calls the JMAP or management API directly. It does not open any endpoint, because authentication still applies to every one.

Permissive CORS is sometimes enabled regardless of the setting. In [bootstrap mode](/docs/configuration/bootstrap-mode), which runs the setup wizard on a new installation, and in [recovery mode](/docs/configuration/recovery-mode), the maintenance mode for repairing a configuration, it is always enabled. Some public discovery documents, such as the autoconfiguration and OAuth metadata, also carry these headers whatever the setting.

## Rate limiting

Two request rates limit how fast a client can send HTTP requests, one for anonymous clients and one for authenticated accounts. [`rateLimitAnonymous`](/docs/ref/object/http#ratelimitanonymous) applies per client IP address to unauthenticated requests, including failed sign-ins, and allows <!-- default:Http.rateLimitAnonymous -->100 per minute<!-- /default --> unless changed. [`rateLimitAuthenticated`](/docs/ref/object/http#ratelimitauthenticated) applies per account to authenticated requests, and allows <!-- default:Http.rateLimitAuthenticated -->1000 per minute<!-- /default --> unless changed.

Each rate is a `count` of requests within a `period` in milliseconds, and setting it to null removes the limit:

```json
{
  "rateLimitAnonymous": {"count": 100, "period": 60000},
  "rateLimitAuthenticated": {"count": 1000, "period": 60000}
}
```

A request over the limit is refused with HTTP `429`. The response carries a `Retry-After` header with the seconds until the window ends, `RateLimit-Policy` and `RateLimit` headers, and a JSON problem body, and the server logs a `limit.too-many-requests` event.

Some clients are exempt. Addresses in the [allowed IP list](/docs/server/auto-ban) and the networks in [`SystemSettings.proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) are not limited, and neither are accounts holding the `unlimitedRequests` [permission](/docs/auth/authorization/permissions). Loopback addresses are not exempt. In recovery mode, the limits are not applied.
