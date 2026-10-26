---
sidebar_position: 3
title: "Migrating between Stalwart servers"
description: "Annotated proxy configuration for moving accounts from a Stalwart 0.15 or 0.16 server to a new Stalwart server, including HTTP routing between the two."
---

This example places a Stalwart 0.15 server and a new Stalwart server behind the proxy, and moves accounts from the first to the second, one at a time. It is the proxy configuration that the [migration guide](/docs/migration/guide/) uses for a [Stalwart 0.15](/docs/migration/guide/configure-source/previous-stalwart) source. The guide describes the preparation of both servers, and the procedure for each account.

A ready-to-edit copy of the configuration below ships in the proxy repository as [`resources/config.stalwart-upgrade.toml`](https://github.com/stalwartlabs/proxy/blob/main/resources/config.stalwart-upgrade.toml), with the values to edit marked `CHANGE ME`.

A [Stalwart 0.16](/docs/migration/guide/configure-source/previous-stalwart) source uses the same configuration, with these differences:

- The routes pinned to `old` for the web administration interface of Stalwart 0.15, `/api/oauth`, `/authorize` and `/authorize/**`, and the `webadmin` mapping entry are left out, because Stalwart 0.16 has neither these routes nor that client.
- Stalwart 0.16 serves its WebUI and its sign-in under the same paths as the new deployment, which the configuration pins to `new`. Through the proxy, only the new deployment's WebUI is reachable. For the duration of the migration, the WebUI of the source is opened at the source's internal address.
- OAuth access tokens issued by Stalwart 0.16.27 carry the account name, so the proxy routes requests that carry them by account, as it does for tokens of the new deployment.

Both servers understand the PROXY protocol, so the proxy announces the client to each of them with a PROXY header. Besides the mail protocols, this configuration routes HTTP, including JMAP, WebDAV and WebSocket connections, between the two servers.

## Destinations and default routing

The source is the default destination, so every account without a mapping resolves to it. At the start of the migration, that is every account. Inbound SMTP on port 25 goes to the new deployment, which delivers mail for moved accounts and relays the rest to the source:

```toml
[routing]
default_destination = "old"
smtp_passthrough_destination = "new"

[mapping]
source = "file"
normalize = "lowercase"

[mapping.file]
path = "/etc/proxy/mappings.tsv"
```

When an account moves, a mapping entry points it at the new deployment. On a source that also accepted bare login names, both forms are listed, because the proxy treats them as separate identifiers:

```text
alice@example.org   new
alice               new
```

## Backends

Both destinations use `forwarding = "proxy"`. Every connection, HTTP included, therefore starts with a PROXY version 2 header, and each server records the client's address. `forwarded = true` also adds the client's address to the `Forwarded` and `X-Forwarded-For` headers of HTTP requests, although a Stalwart server with its default settings ignores these headers and uses the PROXY header.

Both servers trust the proxy's address on every listener except the source's port 25 listener, which receives the relay from the new deployment without a PROXY header. The guide describes this trust for [the new deployment](/docs/migration/guide/configure-new/#trusting-the-proxy) and [the source](/docs/migration/guide/configure-source/previous-stalwart#accepting-the-proxy-on-every-listener-except-port-25).

```toml
[destination.old]
host = "source.internal.example.org"
tls_server_name = "source.internal.example.org"
forwarding = "proxy"
forwarded = true

[destination.old.protocol.imap]
port = 993
tls = "implicit"
[destination.old.protocol.pop3]
port = 995
tls = "implicit"
[destination.old.protocol.submission]
port = 465
tls = "implicit"
[destination.old.protocol.managesieve]
port = 4190
tls = "starttls"
[destination.old.protocol.http]
port = 443
tls = "implicit"

[destination.new]
host = "new.internal.example.org"
tls_server_name = "new.internal.example.org"
forwarding = "proxy"
forwarded = true

[destination.new.protocol.imap]
port = 993
tls = "implicit"
[destination.new.protocol.pop3]
port = 995
tls = "implicit"
[destination.new.protocol.submission]
port = 465
tls = "implicit"
[destination.new.protocol.managesieve]
port = 4190
tls = "starttls"
[destination.new.protocol.http]
port = 443
tls = "implicit"
[destination.new.protocol.smtp]
port = 25
tls = "plain"
```

Both servers receive submission on port 465 with implicit TLS. Stalwart 0.15, 0.16 and 1.0 all have this listener by default, while Stalwart 0.16 and 1.0 have no submission listener on port 587. The proxy still accepts submission from clients on both ports.

The new deployment also declares `smtp`, because it is the pass-through destination. When a server presents a self-signed or internal certificate, pin it with `tls_pinned_cert_sha256`, or, on an isolated internal network, set `tls_allow_invalid_certs = true`, as described under [Destinations](/docs/migration/proxy/destinations#backend-certificate-verification).

## HTTP routing

Many HTTP routes exist on both servers, for example `/jmap`, `/dav`, `/.well-known/*`, `/auth/token` and the autoconfig and Autodiscover documents, so these requests cannot be routed by path. The rules below therefore do three things. They pin the routes that exist on only one server, split the shared token endpoint by OAuth client, and route every other request by the account it identifies. The first matching rule decides:

```toml
# Routes of the Stalwart 0.15 web administration interface.
[[http.route]]
match = "/api/oauth"
destination = "old"
[[http.route]]
match = "/authorize"
destination = "old"
[[http.route]]
match = "/authorize/**"
destination = "old"

# Routes of the new deployment's WebUI and sign-in pages.
[[http.route]]
match = "/api/auth"
destination = "new"
[[http.route]]
match = "/api/auth/**"
destination = "new"
[[http.route]]
match = "/api/discover/**"
destination = "new"
[[http.route]]
match = "/admin"
destination = "new"
[[http.route]]
match = "/admin/**"
destination = "new"
[[http.route]]
match = "/account"
destination = "new"
[[http.route]]
match = "/account/**"
destination = "new"
[[http.route]]
match = "/login"
destination = "new"
[[http.route]]
match = "/device"
destination = "new"

# The OAuth token endpoint exists on both: route by client identifier.
[[http.route]]
match = "/auth/token"
extract = { from = "body", regex = "client_id=([^&]+)" }
fallback = "old"

# Everything else: route by account, or to the source.
[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "old"
```

The pinned routes serve the sign-in of each server's web interface. A user who opens either interface therefore reaches the server that serves it, before presenting any credential.

Stalwart 0.15 serves its web administration interface for any path that is not an API route, including `/login` and `/account`. The rules send those two paths to the new deployment, so through the proxy, the 0.15 interface is opened at the root of the public hostname.

The token endpoint, `/auth/token`, needs its own rule: it exists on both servers, and a token request carries no account. The rule extracts the `client_id` from the request body, and resolves it through the mapping table, which therefore contains an entry for each WebUI. The Stalwart 0.15 web administration interface uses the client identifier `webadmin`. The new deployment's WebUI uses the URL of its client metadata document under the public hostname, one for each of its two paths, unless it is configured with a fixed client identifier:

```text
webadmin                                             old
https://mail.example.org/admin/oauth-client.json     new
https://mail.example.org/account/oauth-client.json   new
```

The last rule routes every other request by its `Authorization` header: the login of HTTP Basic authentication, or the account name in an access token issued by the new deployment. Requests that identify no account go to the source, and so do requests with an access token issued by Stalwart 0.15, which carries no account name. The fallback destination therefore receives the login pages, the OAuth and OpenID Connect discovery documents, and the autoconfig and Autodiscover documents.

WebSocket upgrades need no rule of their own. After `101 Switching Protocols`, the proxy joins the two connections.

Sessions, OAuth tokens and ACME challenges belong to the server that created them, and are not valid on the other. After an account moves, its users sign in to the WebUI again, and its OAuth clients authorise again.

An OAuth client other than the WebUI discovers the source's authorisation server, because the discovery documents, `/authorize` and its token requests reach the fallback destination. It therefore obtains its tokens from the source, and its HTTP requests keep reaching the source until the fallback destination is the new deployment. Until then, users of moved accounts sign in from such clients with an [app password](/docs/auth/authentication/app-password) created on the new deployment, which the proxy routes by its login.

ACME challenges for the public hostname reach the proxy, which affects how the new deployment obtains its certificate. A TLS-ALPN-01 challenge fails, because the proxy terminates TLS. An HTTP-01 challenge reaches only the fallback destination, and only when the proxy also listens on port 80. The new deployment therefore obtains its certificate for the public hostname with the DNS-01 challenge, or uses the certificate installed on the proxy.

## Listeners

The proxy takes over the public ports of the source. Port 25 is a pass-through listener, and uses `plain`: the proxy passes STARTTLS between the sending server and the new deployment unchanged.

```toml
[listener.imaps]
protocol = "imap"
bind = ["[::]:993"]
tls = "implicit"
[listener.imap]
protocol = "imap"
bind = ["[::]:143"]
tls = "starttls"
[listener.submission]
protocol = "submission"
bind = ["[::]:587"]
tls = "starttls"
[listener.managesieve]
protocol = "managesieve"
bind = ["[::]:4190"]
tls = "starttls"
[listener.https]
protocol = "http"
bind = ["[::]:443"]
tls = "implicit"
forwarded = "off"
[listener.smtp]
protocol = "smtp"
bind = ["[::]:25"]
tls = "plain"
```

The `pop3`, `pop3s` and `submissions` listeners are declared the same way in the sample file. The HTTPS listener sets `forwarded = "off"`, so that forwarding headers sent by clients are removed, and the proxy sets its own from the client's address.

## Moving accounts

Accounts are moved with the proxy's [management API](/docs/migration/proxy/management/api), in three steps. Their mapping is switched to `new`. Their sessions are closed, so that clients reconnect to the new deployment. The changes made on the source before the switch are then copied.

The same mapping governs mail and HTTP, so the account's web and JMAP clients follow on their next request. [Migrating accounts](/docs/migration/guide/migrate-accounts/) describes the commands, together with the copy of the account's data with Vandelay, and the rollback.
