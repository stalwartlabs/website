---
sidebar_position: 2
---

# Settings

Stalwart Mail Server includes a built-in HTTP server, which primarily serves two functions: handling [JMAP](/docs/jmap/overview) (JSON Meta Application Protocol) requests and processing requests to the [REST management API](/docs/api/management/overview). The following settings can be configured to customize the behavior of the HTTP server.

## URL

The `server.http.url` setting is an [expression](/docs/configuration/expressions/overview) that specifies the URL of the HTTP server. It is essential for guiding clients to the correct address when they make `.well-known` requests for the JMAP (JSON Meta Application Protocol) and OAuth resources. It is returned to clients as part of the discovery process, enabling them to configure themselves with the appropriate service URLs for JMAP access or initiating OAuth authentication flows.

If unspecified, the server will use the following setting:

```toml
[server.http]
url = "protocol + '://' + key_get('default', 'hostname') + ':' + local_port"
```

## Response headers

The `server.http.headers` configuration option allows administrators to specify custom HTTP headers that the JMAP server should include in its responses. This can be beneficial for various purposes, including setting security policies, caching behaviors, or adding custom identification headers. The `jmap.http.headers` option accepts an array of string values. Each string value represents a full HTTP header in the format `Header-Name: Header-Value`.

For example:

```toml
[server.http]
headers = ["Cache-Control: max-age=3600", "Server: Stalwart JMAP"]
```

While this option provides flexibility in customizing response headers, administrators should exercise caution. Setting or overriding specific headers could impact the behavior of clients or intermediary systems that interact with the JMAP server. Always consult relevant documentation and ensure the desired behavior before setting custom headers.

## Use Forwarded IP

When running Stalwart Mail Server behind a proxy such as Cloudflare or Amazon CloudFront, the server needs to be instructed to obtain the client's IP address from the ``Forwarded`` or ``X-Forwarded-For`` HTTP header rather than from the socket source address (which most likely is the proxy's address). This setting should not be enabled when the [proxy protocol](/docs/server/reverse-proxy/proxy-protocol) is being used.

This can be done by setting the ``server.http.use-x-forwarded`` parameter to ``true``, for example:

```toml
[server.http]
use-x-forwarded = false
```

Care must be taken when enabling this feature. It should only be used if Stalwart is behind a trusted proxy. Untrusted sources can easily forge these headers, potentially leading to security vulnerabilities or incorrect logging information. When not using a proxy server, make sure that this parameter is set to ``false`` to avoid malicious clients from forging their source IP address.

