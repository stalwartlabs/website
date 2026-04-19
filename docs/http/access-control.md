---
sidebar_position: 5
---

# Access Control

Stalwart provides a flexible access control mechanism for the HTTP server. Rules can restrict access by IP address, resource path, method name, listener identity, and other request attributes, so that sensitive services can be exposed only to the clients and listeners that require them.

## Configuration

Access rules are carried by the [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) expression on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><!-- /breadcrumb:Http -->). The expression is evaluated for each incoming request; it must return an HTTP status code. A result of `200` permits the request, while any other value denies it and the server responds with the returned status. By default the expression evaluates to `200`, allowing every endpoint.

## Examples

### Restriction by IP address

The following rule restricts access to `/api/*` to requests originating from `127.0.0.1`:

```json
{
  "allowedEndpoints": {
    "match": [
      {"if": "starts_with(url_path, '/api') && remote_ip != '127.0.0.1'", "then": "404"}
    ],
    "else": "200"
  }
}
```

### Restriction by IP range

The following rule allows public access to `/robots.txt` and `/.well-known/*`; all other requests are denied unless they originate from the `192.168.1.*` network.

```json
{
  "allowedEndpoints": {
    "match": [
      {"if": "starts_with(remote_ip, '192.180.1.') || contains(['robots.txt', '.well-known'], split(url_path, '/')[1])", "then": "200"}
    ],
    "else": "400"
  }
}
```

### Restriction by listener

Two HTTP listeners can be defined on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->): a `private-http` listener bound to localhost, and a `public-http` listener bound to all interfaces. HTTP requests arriving through `private-http` are unrestricted, while requests coming from `public-http` are only allowed for the `/jmap`, `/robots.txt`, and `/.well-known/*` endpoints.

The rule on the Http singleton:

```json
{
  "allowedEndpoints": {
    "match": [
      {"if": "listener == 'private-http' || contains(['jmap', 'robots.txt', '.well-known'], split(url_path, '/')[1])", "then": "200"}
    ],
    "else": "404"
  }
}
```

### Restriction by endpoint and method

The following rule disables JMAP access unless the request is an `OPTIONS` request:

```json
{
  "allowedEndpoints": {
    "match": [
      {"if": "!starts_with(url, '/jmap') || method == 'OPTIONS'", "then": "200"}
    ],
    "else": "400"
  }
}
```
