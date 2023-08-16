---
sidebar_position: 1
---

# Overview

JMAP (JSON Meta Application Protocol) is a modern, efficient, and stateful protocol for synchronizing mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format. This makes it highly accessible and easy to implement across various platforms. JMAP is designed to handle large amounts of data and manage this efficiently, offering performance benefits over traditional mail protocols. It offers a consistent interface for different types of data, making it easier for developers to understand and use. The protocol also provides built-in support for push updates, ensuring that changes are immediately reflected on all connected devices.

## Listener

In order to be able to accept JMAP connections, a [listener](/docs/configuration/listener) has to be created with the `protocol` attribute set to `jmap`. The JMAP listener expects an additional attribute `url` to be set, which is the URL that JMAP clients will use to connect to the server. 

For example:

```toml
[server.listener."jmap"]
bind = ["[::]:8080"]
url = "jmap.example.org:8080"
protocol = "jmap"
```

## Authentication

User authentication is handled by the [directory](/docs/directory/overview) specified in the `jmap.directory` configuration attribute. This means that the credentials provided by a user are validated against the information stored in the designated directory. Depending on your setup, the directory could be configured to authenticate against different sources, such as SQL, LDAP, or a static in-memory directory. 

For example:

```toml
[jmap]
directory = "sql"
```

## HTTP headers

The `jmap.http.headers` configuration option allows administrators to specify custom HTTP headers that the JMAP server should include in its responses. This can be beneficial for various purposes, including setting security policies, caching behaviors, or adding custom identification headers. The `jmap.http.headers` option accepts an array of string values. Each string value represents a full HTTP header in the format `Header-Name: Header-Value`.

For example:

```toml
[jmap.http]
headers = ["Cache-Control: max-age=3600", "Server: Stalwart JMAP"]
```

While this option provides flexibility in customizing response headers, administrators should exercise caution. Setting or overriding specific headers could impact the behavior of clients or intermediary systems that interact with the JMAP server. Always consult relevant documentation and ensure the desired behavior before setting custom headers.

### CORS Policy

CORS, or Cross-Origin Resource Sharing, is a security feature implemented by web browsers to control how web pages in one domain (origin) can request and interact with resources in a different domain. It's designed to safeguard against potentially harmful cross-site request behaviors that could compromise user data or website integrity.

Web pages make requests to servers using the XMLHttpRequest or Fetch APIs. By default, web browsers restrict these requests to the same origin for security reasons. However, there are legitimate scenarios where a web page from one domain needs to request resources from another domain (e.g., loading fonts, accessing APIs). CORS provides a mechanism for servers to tell browsers which cross-origin requests should be allowed.

The server communicates its CORS policy to the browser through specific HTTP headers. The browser then decides whether to allow the web page to make the cross-origin request based on these headers. For example, if a web page from `example-client.com` tries to fetch data from `example-api.com`, the server at `example-api.com` would need to include the appropriate CORS headers in its response to allow this.

### Permissive CORS Policy

To set a permissive CORS policy that allows any origin to access the resources on the server, you would need to set the `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers` headers to `*`. Here's how you can set this in the configuration file:

```toml
[jmap.http]
headers = ["Access-Control-Allow-Origin: *", 
           "Access-Control-Allow-Methods: POST, GET, HEAD, OPTIONS", 
           "Access-Control-Allow-Headers: *"]
```

However, while this is the most permissive setting and allows any website to interact with the server, it can introduce security risks. When setting such a permissive policy, it's crucial to be aware of the potential implications and ensure that the server doesn't expose sensitive data or operations without proper authentication and authorization checks.

