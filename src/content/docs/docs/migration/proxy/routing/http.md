---
sidebar_position: 6
title: "HTTP"
---

The HTTP listener proxies web traffic, which for Stalwart means the JMAP API, the autodiscovery and `.well-known` endpoints, the administrative interface and WebSocket connections. Unlike the mail protocols, HTTP has no single authentication step at the start of the connection; each request may carry its own credentials, and a single connection may be reused for many requests. Routing is therefore driven by per-request rules that examine the request and decide which destination handles it.

## Route rules

HTTP routes are declared as an ordered list of `[[http.route]]` entries. Each entry has a glob pattern matched against the request path, and either pins the request to a fixed destination or extracts an identifier from the request and resolves it through the [mapping store](/docs/migration/proxy/mappings/). The first matching rule wins, so more specific patterns should precede broader ones.

```toml
[[http.route]]
match = "/.well-known/**"
destination = "legacy"

[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "default"
```

A rule with a `destination` key pins every matching request to that destination regardless of who is making it, which suits path-based endpoints such as autodiscovery that are not tied to a particular account. A rule with an `extract` block instead derives an account identifier from the request and routes it the same way the mail protocols do; the optional `fallback` names the destination to use when no identifier can be extracted. Patterns are matched against the path with and without a trailing slash, so a rule for `/api` also matches `/api/`.

## Identifier extraction

The `extract` block names where in the request the account identifier is found:

- `from = "authorization"` reads the `Authorization` header. A `Basic` credential is decoded and the login portion (before the colon) is used, lowercased. A `Bearer` token is decoded the same way as for the mail protocols: a Stalwart `sw1.` token yields the account address directly, and any other token is interpreted as a JWT and the identifier read from its claims.
- `from = "query"` reads a named query-string parameter, given by `param`, with URL decoding applied. This is useful for endpoints such as OAuth authorization that carry a `login_hint`.
- `from = "header"` reads a named request header, given by `header`.
- `from = "body"` applies a regular expression, given by `regex`, to the request body and uses the first capture group, with form decoding applied. This supports form-encoded login endpoints such as a token exchange that carries the username in the request body.

```toml
[[http.route]]
match = "/oauth/authorize"
extract = { from = "query", param = "login_hint" }
fallback = "default"

[[http.route]]
match = "/auth/token"
extract = { from = "body", regex = "username=([^&]+)" }
```

When extraction reads from the body, the proxy buffers the request body up to `http.body_extract_cap` (64 KB by default) so the pattern can be applied, then forwards it; body extraction is therefore the only mode that requires reading the body before routing.

## Inbound and outbound forwarding headers

By default the proxy strips any `Forwarded` and `X-Forwarded-For` headers a client sends, so a client cannot forge a forwarding chain. A listener that genuinely sits behind a trusted front-end can preserve them by setting `forwarded = "trust"` on the listener. Independently, when the resolved destination sets `forwarded = true`, the proxy appends the real client address to both headers before relaying, so the backend learns the client's address. These two settings are separate: the listener setting governs what is accepted from clients, and the destination setting governs what the proxy adds toward the backend.

## Connection handling

The proxy maintains HTTP keep-alive, serving multiple requests on one client connection and reusing the backend connection while requests continue to resolve to the same destination. If a later request on a kept-alive connection resolves to a different destination, the proxy responds with a misdirected-request status and closes, since a single backend connection cannot serve two destinations. The number of requests served on one connection is bounded by `http.max_keepalive_requests`, and an idle kept-alive connection is closed after `http.keepalive_timeout`.

Several HTTP features that change the shape of a response are handled transparently. An `Expect: 100-continue` request is acknowledged so the client proceeds to send its body. A `101 Switching Protocols` response to a WebSocket upgrade causes the proxy to stop interpreting the stream and bridge the two connections opaquely, which is how JMAP-over-WebSocket sessions are carried. A server-sent-events response is streamed to the client without buffering. Chunked and length-delimited bodies are relayed in both directions, and the request and response heads are bounded by `http.max_head_size`.
