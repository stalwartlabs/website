---
sidebar_position: 3
title: "Upgrading Stalwart"
---

This example runs an older Stalwart deployment and a newer one side by side behind the proxy and migrates accounts from one to the other gradually. It is the reference proxy configuration for the [Stalwart migration guide](/docs/migration/guide/), which walks through the full end-to-end procedure. This page concentrates on the proxy configuration itself and the reasoning behind each decision. A ready-to-edit version of the file below ships in the proxy repository as `resources/config.stalwart-upgrade.toml`.

Because both backends are Stalwart, both understand the PROXY protocol, so each destination announces the real client to its backend. Beyond the mail protocols, this scenario also routes HTTP and JMAP traffic, including WebDAV and WebSocket connections. The two deployments expose different web interfaces and login endpoints, and the same hostname has to serve both, so the HTTP rules pin the handful of paths that are unique to each version and resolve everything else by the account behind the request.

A defining feature of a Stalwart-to-Stalwart upgrade is that inbound mail is handled by the new deployment for the entire duration of the migration. The new server becomes the public mail exchanger and performs split delivery: a message addressed to an account that already lives on the new server is delivered locally, while a message for an account that is still on the old server is relayed there. The proxy supports this by sending all raw SMTP on port 25 to the new deployment, regardless of which backend currently owns the recipient.

## Destinations and default routing

The old deployment is the default destination, so any account without an explicit mapping resolves there. This is the correct starting state, because at the beginning of the migration every account still lives on the old server. As each mailbox is moved, an entry is added to the mapping table that points that account at the new deployment, and from that moment its connections follow.

Raw SMTP is governed separately by `smtp_passthrough_destination`, which names the new deployment. Port 25 carries no login to route on, so the whole session is handed to a single fixed backend rather than resolved per account. Pointing it at the new server is what enables split delivery.

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

The mapping file lists migrated accounts. When the old server allowed logging in with a bare account name as well as a full e-mail address, both forms are listed so that either login resolves to the same destination:

```
alice@example.org   new
alice               new
```

## Backends and the PROXY protocol

Both destinations use `forwarding = "proxy"` with `proxy_protocol = true`, so the proxy prepends a PROXY v2 header to every mail connection and the backend records the real client address instead of the proxy's. On the HTTP leg, `forwarded = true` appends the client address to the `Forwarded` and `X-Forwarded-For` headers. For these headers to be honoured, both Stalwart deployments are configured to trust the proxy and to expect the PROXY protocol on their listeners. The one deliberate exception is the old server's port 25: the new server relays not-yet-migrated recipients to it as an ordinary SMTP client that does not send a PROXY header, so proxy-protocol acceptance is left disabled on that single port. The details of trusting the proxy on each backend are covered in the migration guide.

```toml
[destination.old]
host = "old.internal.example.org"
tls_server_name = "old.internal.example.org"
forwarding = "proxy"
proxy_protocol = true
forwarded = true

[destination.old.protocol.imap]
port = 993
tls = "implicit"
[destination.old.protocol.pop3]
port = 995
tls = "implicit"
[destination.old.protocol.submission]
port = 587
tls = "starttls"
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
proxy_protocol = true
forwarded = true

[destination.new.protocol.imap]
port = 993
tls = "implicit"
[destination.new.protocol.pop3]
port = 995
tls = "implicit"
[destination.new.protocol.submission]
port = 587
tls = "starttls"
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

The new deployment declares an `smtp` protocol endpoint because it is the pass-through destination for port 25. If either backend presents a self-signed or internal certificate on its TLS legs, pin it with `tls_pinned_cert_sha256` or, on a trusted internal network, set `tls_allow_invalid_certs = true` on that destination.

## HTTP routing

The two Stalwart versions serve different web applications and expose different unauthenticated endpoints, so a request that is not yet associated with an account still has to reach the right backend. The rules below pin only the paths that are genuinely unique to one version and route everything else by credential. Rules are evaluated in order and the first match wins.

```toml
# Endpoints served only by the old deployment.
[[http.route]]
match = "/api/oauth"
destination = "old"
[[http.route]]
match = "/authorize"
destination = "old"
[[http.route]]
match = "/authorize/**"
destination = "old"

# Endpoints served only by the new deployment.
[[http.route]]
match = "/api/auth"
destination = "new"
[[http.route]]
match = "/api/discover/**"
destination = "new"
[[http.route]]
match = "/admin/**"
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

# OAuth token exchange is shared; route it by the web client that requested it.
[[http.route]]
match = "/auth/token"
extract = { from = "body", regex = "client_id=([^&]+)" }
fallback = "old"

# Everything else: route by the authenticated account, fall back to default.
[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "default"
```

The unique endpoints are the login and discovery paths of each version's web interface. The older administration interface drives its login through `/api/oauth` and the `/authorize` endpoints, while the newer interface is served under `/admin` and `/account` and signs in through `/api/auth`, `/api/discover` and a server-rendered `/login` page. Pinning these means that an administrator who opens the web interface reaches whichever deployment serves it, even before presenting any credential.

The OAuth token exchange at `/auth/token` is common to both versions, so it cannot be pinned by path alone. It is split instead by the `client_id` carried in the request body, extracted by a regular expression and resolved through the mapping table. Adding two entries to that table, `webadmin` for the old interface and `stalwart-webui` for the new one, sends each token request to the deployment that issued the authorization code.

Every remaining request carries credentials and is routed by them. The final rule extracts an identifier from the `Authorization` header: a JMAP client presenting Stalwart's `sw1.` bearer token has the account address decoded from the token, while a request using HTTP Basic authentication has the login decoded from the header. The identifier resolves through the same mapping table the mail protocols use, so JMAP, WebDAV and IMAP all follow an account to the same backend. Requests with no recognizable credential fall through to the default destination. WebSocket upgrades need no special handling: once a JMAP-over-WebSocket request returns `101 Switching Protocols`, the proxy bridges the connection opaquely.

One consequence of routing by credential is worth noting. The older Stalwart releases issue opaque OAuth access tokens that do not embed the account, so the proxy cannot derive a routing identifier from them. Accounts that are still on the old server are therefore routed by HTTP Basic authentication or by their mail login rather than by a bearer token issued by the old server. The newer releases issue `sw1.` tokens, which the proxy decodes and routes correctly. This matters only while an account remains on the old deployment.

## Listeners

The proxy takes over the public ports that the old server used to answer on directly. Port 25 is a raw pass-through and therefore plain: a pass-through listener cannot offer STARTTLS, because it does not interpret the SMTP dialogue.

```toml
[listener.imaps]
protocol = "imap"
bind = ["0.0.0.0:993", "[::]:993"]
tls = "implicit"
[listener.imap]
protocol = "imap"
bind = ["0.0.0.0:143", "[::]:143"]
tls = "starttls"
[listener.submission]
protocol = "submission"
bind = ["0.0.0.0:587", "[::]:587"]
tls = "starttls"
[listener.managesieve]
protocol = "managesieve"
bind = ["0.0.0.0:4190", "[::]:4190"]
tls = "starttls"
[listener.https]
protocol = "http"
bind = ["0.0.0.0:443", "[::]:443"]
tls = "implicit"
forwarded = "off"
[listener.smtp]
protocol = "smtp"
bind = ["0.0.0.0:25", "[::]:25"]
tls = "plain"
```

The `pop3`, `pop3s` and `submissions` listeners are configured the same way and are included in the sample file shipped with the proxy. The HTTPS listener sets `forwarded = "off"` so that any forwarding headers arriving from clients are stripped rather than trusted; the proxy sets its own from the real peer address.

## Cutting accounts over

Once a mailbox has been copied to the new deployment, the account is moved by updating its mapping to `new` and forcing any live session to reconnect. With a writable mapping store this is a single call followed by a disconnect:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.org&destination=new"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=alice@example.org"
```

Because the same mapping governs mail and JMAP alike, the account's web client follows to the new deployment on its next request. The complete migration procedure, including how data is copied with Vandelay and how to roll an account back, is described in the [migration guide](/docs/migration/guide/).
