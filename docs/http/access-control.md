---
sidebar_position: 5
---

# Access Control

Stalwart provides a flexible access control mechanism for the HTTP server. Rules can restrict access by IP address, resource path, method name, listener identity, and other request attributes, so that sensitive services can be exposed only to the clients and listeners that require them.

## Configuration

Access rules are carried by the [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) expression on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->). The expression is evaluated for each incoming request; it must return an HTTP status code. A result of `200` permits the request, while any other value denies it and the server responds with the returned status. By default the expression evaluates to `200`, allowing every endpoint.

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
      {"if": "starts_with(remote_ip, '192.168.1.') || contains(['robots.txt', '.well-known'], split(url_path, '/')[1])", "then": "200"}
    ],
    "else": "400"
  }
}
```

### Restriction by listener

Two HTTP listeners can be defined on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->): a `private-http` listener bound to localhost, and a `public-http` listener bound to all interfaces. HTTP requests arriving through `private-http` are unrestricted, while requests coming from `public-http` are only allowed for the `/jmap`, `/robots.txt`, and `/.well-known/*` endpoints.

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
