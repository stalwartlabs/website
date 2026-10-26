---
sidebar_position: 6
title: "HTTP"
description: "Reference for HTTP routing in the proxy: route rules, fallback destinations, identifier extraction, forwarding headers, keep-alive and the [http] options."
---

The HTTP listener carries web traffic. For Stalwart, this means JMAP, WebDAV, the discovery documents under `/.well-known`, the OAuth endpoints, the WebUI and WebSocket connections.

HTTP has no single authentication step at the start of a connection. Each request may carry its own credentials, and one connection may carry many requests. HTTP is therefore routed per request, by an ordered list of rules. The proxy accepts HTTP/1.1 only, and answers other versions with `505 HTTP Version Not Supported`.

## Route rules

Route rules are declared as an ordered array of `[[http.route]]` tables. Each rule has a glob pattern, `match`, that is compared with the request path. A rule does one of two things:

- It pins the request to a destination, with `destination`.
- It derives an account identifier from the request, with `extract`, and resolves it through the [mapping store](/docs/migration/proxy/mappings/).

The first rule that matches decides, so specific patterns come before general ones. A request that matches no rule receives `404 Not Found`, and the connection is closed. An HTTP listener without rules therefore serves nothing.

```toml
[[http.route]]
match = "/.well-known/**"
destination = "legacy"

[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "legacy"
```

The two kinds of rule suit different endpoints. A pinned rule sends every matching request to its destination, whoever makes it. This suits endpoints that belong to one server and are not tied to an account. An `extract` rule routes the request like a mail session: the identifier is looked up, and a mapping entry decides the destination. When the request yields no identifier, or the identifier has no mapping entry, the request goes to the rule's `fallback` destination, or to `routing.default_destination` when the rule has no `fallback`.

Patterns are compared case-sensitively with the request path, without the query string and without percent-decoding. Both `*` and `**` match across `/`, and `{a,b}` matches either alternative. The path is also tried without its trailing slash, so a rule for `/api` also matches `/api/`. A pattern such as `/admin/**`, however, does not match `/admin` itself, which needs a rule of its own.

The names in `destination` and `fallback` must be declared destinations that declare the `http` protocol. Both are checked at startup, with one of these errors:

- `http route destination "<name>" does not declare the http protocol`
- `http route fallback "<name>" does not declare the http protocol`
- `undeclared destination "<name>"`

Releases of the proxy up to 1.0.4 ignore `fallback`, and send such requests to `routing.default_destination`.

The protocols of the default destination, by contrast, are not checked for HTTP listeners. A configuration whose default destination serves no HTTP, such as a Dovecot backend, routes HTTP with pinned rules, or with a `fallback` that names a destination with HTTP.

## Identifier extraction

The `extract` table names where in the request the account identifier is found:

- `from = "authorization"` reads the `Authorization` header. For `Basic` credentials, the user name, lowercased, is the identifier. A `Bearer` token is read as for the mail protocols, as described under [Routing identifier](/docs/migration/proxy/routing/#routing-identifier).
- `from = "query"` reads the query parameter named by `param`, URL-decoded. This suits endpoints such as an OAuth authorisation request that carries a `login_hint`.
- `from = "header"` reads the request header named by `header`.
- `from = "body"` applies the regular expression in `regex` to the request body and uses its first capture group, form-decoded. This suits form-encoded endpoints such as an OAuth token request.

```toml
[[http.route]]
match = "/oauth/authorize"
extract = { from = "query", param = "login_hint" }
fallback = "legacy"

[[http.route]]
match = "/auth/token"
extract = { from = "body", regex = "client_id=([^&]+)" }
fallback = "legacy"
```

The identifier is normalised, and stripped of a master user suffix, in the same way as for the mail protocols.

Body extraction has to read the body before the request can be routed. The proxy reads the request body up to `http.body_extract_cap` bytes, applies the pattern, and forwards the body. Only bodies with a `Content-Length` header are read this way. A chunked body therefore yields no identifier, and the request goes to the fallback destination.

A startup check requires `regex` for `body`, `param` for `query` and `header` for `header`. It also rejects patterns and regular expressions that do not compile.

## Forwarding headers

Two settings, on two different objects, control the `Forwarded` and `X-Forwarded-For` headers. The listener setting governs what is accepted from clients, and the destination setting governs what the proxy adds for the backend.

By default, an HTTP listener removes the `Forwarded` and `X-Forwarded-For` headers that a client sends, so that a client cannot forge its address chain. A listener behind a trusted front end keeps them, with `forwarded = "trust"`.

Independently, when the destination sets `forwarded = true`, the proxy appends the client's address to both headers before passing the request on. The PROXY header that the destination's `forwarding` setting selects is sent in addition, as described under [Destinations](/docs/migration/proxy/destinations#client-address-forwarding).

## Connection handling

The proxy keeps HTTP connections open for further requests, and reuses the backend connection while the requests resolve to the same destination. When a later request on the same connection resolves to another destination, the proxy answers `421 Misdirected Request` and closes the connection, because one backend connection cannot serve two destinations. A connection is also tied to the first account whose credentials it carries, and a request with another account's credentials receives the same status. Requests without an identifier are not affected.

Once a request identifies an account, the connection is registered for that account, so that [`POST /connections/kick`](/docs/migration/proxy/management/api#connections) closes it. The registration remains after a WebSocket upgrade, which is how a kick reaches a JMAP session over WebSocket. Requests routed by a pinned rule identify no account, and are not registered.

The proxy also handles the HTTP features that change the shape of an exchange:

- A request with `Expect: 100-continue` receives `100 Continue` from the backend. On a rule with body extraction, which must read the body before routing, the proxy sends it itself.
- After a `101 Switching Protocols` response to a WebSocket upgrade, the proxy stops interpreting the stream, and joins the two connections.
- Server-sent event streams are passed to the client without buffering.
- Chunked and length-delimited bodies are relayed in both directions.

A destination endpoint for `http` must use `implicit` or `plain`. Requests to a `starttls` endpoint fail with `502 Bad Gateway`, as do requests that resolve to a destination without an `http` endpoint.

## Errors returned by the proxy

Besides passing on the responses of the backends, the proxy returns some statuses itself. It sends them as plain text, and then closes the connection:

| Status | Cause |
| --- | --- |
| `400 Bad Request` | A malformed request head, such as a bare line feed, a folded header, conflicting `Content-Length` and `Transfer-Encoding` headers, or not exactly one `Host` header |
| `404 Not Found` | No route matches the path |
| `405 Method Not Allowed` | A `CONNECT` request |
| `408 Request Timeout` | No request head within the listener's `preauth_timeout` |
| `421 Misdirected Request` | A request on a kept-alive connection resolves to another destination or account |
| `431 Request Header Fields Too Large` | A request head larger than `max_head_size`, or more than 100 header fields |
| `502 Bad Gateway` | The backend cannot be reached or is marked down, the destination has no `http` endpoint, or the endpoint uses `starttls` |
| `505 HTTP Version Not Supported` | A version other than HTTP/1.1 |

## HTTP options

The `[http]` table holds the HTTP options:

| Key | Default | Description |
| --- | --- | --- |
| `body_extract_cap` | `65536` | Maximum number of body bytes read for body extraction. |
| `max_head_size` | `65536` | Maximum size, in bytes, of a request or response head. |
| `relay_idle` | `60s` | Maximum idle time while a request or response head or body is being relayed. Server-sent event streams and streams that last until the connection closes use `server.bridge_idle`. |
| `keepalive_timeout` | `75s` | Time within which the next request head on a kept-alive connection must arrive. After it, the connection is closed without a response. |
| `max_keepalive_requests` | `1000` | Maximum number of requests on one connection. `0` removes the limit. |
