---
sidebar_position: 2
---

# Settings

Stalwart includes a built-in HTTP server, which primarily serves two functions: handling [JMAP](/docs/http/jmap/overview) and [WebDAV](/docs/http/webdav/overview) requests, and processing requests to the [REST management API](/docs/api/management/overview). HTTP server behaviour is configured on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><!-- /breadcrumb:Http -->).

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
