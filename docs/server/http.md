---
sidebar_position: 4
---

# HTTP

Stalwart Mail Server includes a built-in HTTP server, which primarily serves two functions: handling [JMAP](/docs/jmap/overview) (JSON Meta Application Protocol) requests and processing requests to the [REST management API](/docs/api/management/overview). JMAP is a modern, JSON-based API for synchronizing emails, contacts, calendars, and tasks. In addition to JMAP, Stalwart's HTTP server provides a RESTful management API. This API offers administrators a convenient way to configure and manage the mail server's operations remotely. 

## URL

The `server.http.url` setting is an expression that specifies the URL of the HTTP server. It is essential for guiding clients to the correct address when they make `.well-known` requests for the JMAP (JSON Meta Application Protocol) and OAuth resources. It is returned to clients as part of the discovery process, enabling them to configure themselves with the appropriate service URLs for JMAP access or initiating OAuth authentication flows.

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

## Strict Transport Security

HTTP Strict Transport Security (HSTS) is a web security policy mechanism that helps to protect websites against man-in-the-middle attacks such as protocol downgrade attacks and cookie hijacking. It allows web servers to declare that web browsers (or other complying user agents) should interact with it using only secure HTTPS connections, and not via the insecure HTTP protocol. This ensures that all communications between the server and the user are encrypted and secure.

Implementing HSTS increases the security of your server by ensuring that all connections are made over HTTPS, thus preventing attackers from exploiting any unsecured entry points during data transmission. This is particularly important to mitigate the risk of attacks that rely on intercepting or modifying data in transit, such as active eavesdropping or session hijacking.

In Stalwart Mail Server, HSTS can be easily enabled by setting `server.http.hsts` to `true`. This setting forces the server to use HTTPS exclusively, providing an additional layer of security for the administrative interface and any other web-based services it offers.

Example:

```toml
[server.http]
hsts = true
```

## Permissive CORS Policy

CORS, or Cross-Origin Resource Sharing, is a security feature implemented by web browsers to control how web pages in one domain (origin) can request and interact with resources in a different domain. It's designed to safeguard against potentially harmful cross-site request behaviors that could compromise user data or website integrity.

Web pages make requests to servers using the XMLHttpRequest or Fetch APIs. By default, web browsers restrict these requests to the same origin for security reasons. However, there are legitimate scenarios where a web page from one domain needs to request resources from another domain (e.g., loading fonts, accessing APIs). CORS provides a mechanism for servers to tell browsers which cross-origin requests should be allowed.

The server communicates its CORS policy to the browser through specific HTTP headers. The browser then decides whether to allow the web page to make the cross-origin request based on these headers. For example, if a web page from `example.com` tries to fetch data from `api.example.net`, the server at `api.example.net` would need to include the appropriate CORS headers in its response to allow this.

A permissive CORS policy might be necessary when managing Stalwart Mail Server using a webadmin interface hosted on a different domain. To set a permissive CORS policy that allows any origin to access the resources on the server, you would need to set the `server.http.permissive-cors` headers to `true`. Here's how you can set this in the configuration file:

```toml
[server.http]
permissive-cors = true
```

However, while this is the most permissive setting and allows any website to interact with the server, it can introduce security risks. When setting such a permissive policy, it's crucial to be aware of the potential implications and ensure that the server doesn't expose sensitive data or operations without proper authentication and authorization checks.


