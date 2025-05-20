---
sidebar_position: 6
---

# Security

Stalwart provides several security settings that can help enhance the security of the HTTP server. These settings include HTTP Strict Transport Security (HSTS) and CORS policies. By configuring these settings, administrators can enforce secure communication practices and control cross-origin requests to the server.

## Strict Transport Security

HTTP Strict Transport Security (HSTS) is a web security policy mechanism that helps to protect websites against man-in-the-middle attacks such as protocol downgrade attacks and cookie hijacking. It allows web servers to declare that web browsers (or other complying user agents) should interact with it using only secure HTTPS connections, and not via the insecure HTTP protocol. This ensures that all communications between the server and the user are encrypted and secure.

Implementing HSTS increases the security of your server by ensuring that all connections are made over HTTPS, thus preventing attackers from exploiting any unsecured entry points during data transmission. This is particularly important to mitigate the risk of attacks that rely on intercepting or modifying data in transit, such as active eavesdropping or session hijacking.

In Stalwart, HSTS can be easily enabled by setting `http.hsts` to `true`. This setting forces the server to use HTTPS exclusively, providing an additional layer of security for the administrative interface and any other web-based services it offers.

Example:

```toml
[http]
hsts = true
```

## Permissive CORS Policy

CORS, or Cross-Origin Resource Sharing, is a security feature implemented by web browsers to control how web pages in one domain (origin) can request and interact with resources in a different domain. It's designed to safeguard against potentially harmful cross-site request behaviors that could compromise user data or website integrity.

Web pages make requests to servers using the XMLHttpRequest or Fetch APIs. By default, web browsers restrict these requests to the same origin for security reasons. However, there are legitimate scenarios where a web page from one domain needs to request resources from another domain (e.g., loading fonts, accessing APIs). CORS provides a mechanism for servers to tell browsers which cross-origin requests should be allowed.

The server communicates its CORS policy to the browser through specific HTTP headers. The browser then decides whether to allow the web page to make the cross-origin request based on these headers. For example, if a web page from `example.com` tries to fetch data from `api.example.net`, the server at `api.example.net` would need to include the appropriate CORS headers in its response to allow this.

A permissive CORS policy might be necessary when managing Stalwart using a webadmin interface hosted on a different domain. To set a permissive CORS policy that allows any origin to access the resources on the server, you would need to set the `http.permissive-cors` headers to `true`. Here's how you can set this in the configuration file:

```toml
[http]
permissive-cors = true
```

However, while this is the most permissive setting and allows any website to interact with the server, it can introduce security risks. When setting such a permissive policy, it's crucial to be aware of the potential implications and ensure that the server doesn't expose sensitive data or operations without proper authentication and authorization checks.
