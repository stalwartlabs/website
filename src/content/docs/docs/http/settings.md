---
sidebar_position: 2
title: "Settings"
---

Stalwart includes a built-in HTTP server that handles [JMAP](/docs/http/jmap/) and [WebDAV](/docs/http/webdav/) requests. HTTP server behaviour is configured on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->).

## Response headers

Additional HTTP headers returned with every response are configured through [`responseHeaders`](/docs/ref/object/http#responseheaders), a map of header name to header value. Typical uses include setting security policies, caching behaviour, or adding custom identification headers.

For example, to advertise a `Server` header and a cache-control policy:

```json
{
  "responseHeaders": {
    "Cache-Control": "max-age=3600",
    "Server": "Stalwart"
  }
}
```

Administrators should exercise caution when overriding headers: certain values can affect the behaviour of clients or intermediary systems. Consult the relevant specifications before introducing custom headers.

## Use Forwarded IP

When Stalwart runs behind a reverse proxy such as Cloudflare or Amazon CloudFront, the client IP address must be read from the `Forwarded` or `X-Forwarded-For` HTTP header rather than from the socket source address, which would otherwise report the proxy's address. This is controlled by [`useXForwarded`](/docs/ref/object/http#usexforwarded); setting the flag to `true` instructs the server to trust those headers. The flag should not be enabled when the [proxy protocol](/docs/server/reverse-proxy/proxy-protocol) is in use.

Care must be taken when enabling this feature. It should only be used when Stalwart is behind a trusted proxy, because untrusted sources can forge these headers and mislead logging or access control decisions. When no proxy is present, [`useXForwarded`](/docs/ref/object/http#usexforwarded) must remain `false` to prevent malicious clients from spoofing their source IP address.

The base URL advertised in well-known responses (for example `/.well-known/jmap` and OAuth discovery metadata) is derived automatically from the listener address and server hostname; no explicit configuration field is required.
