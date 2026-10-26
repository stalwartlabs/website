---
sidebar_position: 2.5
title: "Access control"
description: "Restrict which HTTP endpoints each client can reach with the allowedEndpoints expression: variables, examples, testing a rule and recovering from a lock-out."
---

Every HTTP endpoint of Stalwart is served on every HTTP listener, from JMAP and WebDAV to the management API, the WebUI, metrics and SCIM. Without access control rules, any client that can reach a listener can therefore reach every endpoint, limited only by authentication. That is often more exposure than an administrator wants. Access control rules restrict it by request attributes, such as the path, the client's address or the listener. A rule can, for example, serve the management API only to an internal network, or expose only JMAP on a public listener.

## Rule evaluation

The rules are the [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) expression on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->). It is an [expression](/docs/configuration/expressions/) that returns an HTTP status code.

The expression is evaluated for every request, before the request is routed. This includes requests for WebUI files, `/jmap/ws`, `/auth/` and the discovery documents. A result of `200` lets the request through. Any other result is returned to the client as the response status, with a JSON problem body. Until it is changed, the expression is <!-- default:Http.allowedEndpoints -->`200`<!-- /default -->, which allows every request.

Some requests are never restricted. The rules do not apply to requests from loopback addresses (`127.0.0.1` and `::1`), so that a rule cannot lock out administration from the server itself. They are not applied in [recovery mode](/docs/configuration/recovery-mode) either.

The loopback exemption matters behind a reverse proxy on the same host. There, every request arrives from loopback, so no rule applies to any request, unless the client address is taken from the PROXY protocol or from a forwarding header, as described in [Client IP address](/docs/http/settings#client-ip-address). An expression whose evaluation fails is treated as `200`.

The expression can use the following variables, listed on the [HttpVariable](/docs/ref/expression/variable/http-variable) reference page:

- `remote_ip`, `remote_port`: the client's address and port. With [`clientIpSource`](/docs/http/settings#client-ip-address) set to a forwarding header, the address is the one taken from the header.
- `local_ip`, `local_port`: the address and port the request arrived on.
- `listener`: the name of the listener.
- `protocol`: `https` or `http`.
- `is_tls`: whether the connection uses TLS.
- `path`: the path of the request, without the query string.
- `url`: the path and the query string, as received.
- `method`: the request method.
- `headers`: the request headers, as an array of `Name: value` strings.

The status that a rule returns decides what the client learns. Status `404` hides the existence of an endpoint from clients that are not expected to use it, whereas `403` states that access is refused.

## Test before applying

A mistaken rule can lock administrators out. A rule that refuses the paths the WebUI uses, such as `/admin`, `/login`, `/auth/`, `/api/` or `/jmap`, locks administrators out of the WebUI from every address but the loopback interface. Before reloading the settings with a new rule, take two precautions.

First, keep an SSH session to the server open. From it, the CLI, or a browser through an SSH tunnel, reaches the server over loopback, which the rules do not restrict.

Second, after the reload, check the endpoints that must remain reachable from outside, for example with `curl -i https://mail.example.com/.well-known/jmap`.

If the server is no longer reachable for administration, start it in recovery mode, where the rules are not applied, and correct the expression.

## Examples

The following rule serves `/api/` only to requests from `127.0.0.1`, and answers all others with `404`:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "starts_with(path, '/api') && remote_ip != '127.0.0.1'", "then": "404"}
    },
    "else": "200"
  }
}
```

The following rule allows `/robots.txt` and the discovery documents under `/.well-known/` from anywhere, and every other request only from the `192.168.1.0/24` network:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "is_ip_in_cidr(remote_ip, '192.168.1.0/24') || contains(['robots.txt', '.well-known'], split(path, '/')[1])", "then": "200"}
    },
    "else": "403"
  }
}
```

The rule relies on `split(path, '/')`, which splits `/.well-known/jmap` into `['', '.well-known', 'jmap']`. Element `1` is therefore the first segment of the path.

The following rule uses two HTTP listeners. Through a `private-http` listener bound to an internal address, every request is allowed. Through the public listener, only `/jmap`, `/robots.txt` and `/.well-known/` are reachable. The listeners are [NetworkListener](/docs/ref/object/network-listener) objects with these names:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "listener == 'private-http' || contains(['jmap', 'robots.txt', '.well-known'], split(path, '/')[1])", "then": "200"}
    },
    "else": "404"
  }
}
```

A public listener restricted this way also blocks the WebUI, and the OAuth sign-in of JMAP clients that sign in through the browser. When such clients use the listener, allow `login`, `auth` and `api` as well.

The following rule serves the [SCIM provisioning endpoint](/docs/auth/scim/) only to the identity provider's network, and leaves every other endpoint unchanged:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "starts_with(path, '/scim') && !is_ip_in_cidr(remote_ip, '203.0.113.0/24')", "then": "404"}
    },
    "else": "200"
  }
}
```

The following rule disables JMAP, except for `OPTIONS` requests. The WebUI uses JMAP, so the rule also disables the WebUI for every client except those on the loopback interface:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "starts_with(path, '/jmap') && method != 'OPTIONS'", "then": "403"}
    },
    "else": "200"
  }
}
```
