---
sidebar_position: 3
---

# Access Control

Stalwart provides a flexible access control mechanism that allows administrators to define custom rules for controlling access to the HTTP server. By setting access control rules based on various criteria such as IP address, resource, method name, and more, administrators can ensure secure and tailored access to the server's HTTP services. This flexibility enables the server to be effectively managed and integrated with other systems, meeting diverse operational needs.

## Configuration

The `server.http.allowed-endpoint` setting is an [expression](/docs/configuration/expressions/overview) that controls which [endpoints](/docs/server/http/overview#http-endpoints) are accessible via the HTTP server. This setting can be used to restrict access to specific endpoints based on the client's IP address, listener id, or other criteria. By defining a list of allowed endpoints, administrators can enforce access control policies that limit the exposure of sensitive information or operations to unauthorized clients.

This setting is evaluated for each incoming request to determine whether the client is allowed to access the requested endpoint. If the expression evaluates to `200`, the request is allowed to proceed. If the expression evaluates to any other status code, the request is denied, and the server responds with an appropriate error message. By default, all endpoints are allowed.

## Examples

### Restriction by IP address

The following example restricts access to the `/api/*` endpoint to requests originating from `127.0.0.1`:

```toml
[server.http]
allowed-endpoint = [ { if = "starts_with( url_path, '/api' ) && remote_ip != '127.0.0.1'", 
                       then = "404" },
                     { else = "200" } ]
```

### Restriction by IP range

The following example allows public access to the `/robots.txt` and `/.well-known/*` endpoints, all other requests are denied unless they originate from the `192.168.1.*` network.

```toml
[server.http]
allowed-endpoint = [ { if = "starts_with( remote_ip, '192.180.1.' ) || contains( [ 'robots.txt', '.well-known' ], split( url_path, '/' )[1] )", 
                       then = "200" },
                     { else = "400" } ]
```


### Restriction by listener

The following example defines two HTTP listeners, `private-http` bound to localhost and `public-http` bound to all interfaces. HTTP requests coming from `private-http` are unrestricted, while requests coming from `public-http` are only allowed for the `/jmap`, `/robots.txt`, and `/.well-known/*` endpoints:

```toml
[server.listener."private-http"]
bind = ["127.0.0.1:8080"]
protocol = "http"
tls.implicit = true

[server.listener."public-http"]
bind = ["[::]:443"]
protocol = "http"
tls.implicit = true

[server.http]
allowed-endpoint = [ { if = "listener == 'private-http' || contains( [ 'jmap', 'robots.txt', '.well-known' ], split( url_path, '/' )[1] )", 
                       then = "200" },
                     { else = "404" } ]
```

### Restriction by endpoint and method

The following example disables JMAP access unless the request is an `OPTIONS` request:

```toml
[server.http]
allowed-endpoint = [ { if = "!starts_with( url, '/jmap' ) || method == 'OPTIONS'", 
                       then = "200"},
                     { else = "400" } ]
```
