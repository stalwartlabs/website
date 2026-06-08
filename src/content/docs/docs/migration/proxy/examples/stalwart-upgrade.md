---
sidebar_position: 3
title: "Upgrading Stalwart"
---

This example runs an older Stalwart deployment and a newer one side by side behind the proxy, migrating accounts from one to the other gradually. Because both backends are Stalwart, they understand the PROXY protocol, so both destinations use `forwarding = "proxy"` with `proxy_protocol = true`. Beyond the mail protocols, this scenario also routes HTTP and JMAP traffic, including WebSocket connections, which is configured through HTTP routes that resolve each request by the credentials it carries.

The default destination is the old deployment, so accounts that have not yet been migrated continue to resolve there. As each account is moved, it is given an explicit mapping to the new deployment.

## Mail and HTTP configuration

```toml
[server]
hostname = "mail.example.com"

[tls.certificate.default]
cert = "/etc/proxy/tls/fullchain.pem"
key = "/etc/proxy/tls/privkey.pem"
default = true

[mapping]
source = "file"
normalize = "lowercase"

[mapping.file]
path = "/etc/proxy/mappings.tsv"

[routing]
default_destination = "old"

# Older Stalwart deployment.
[destination.old]
host = "10.0.1.10"
tls_server_name = "old.example.com"
proxy_protocol = true
forwarding = "proxy"
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

# Newer Stalwart deployment.
[destination.new]
host = "10.0.1.20"
tls_server_name = "new.example.com"
proxy_protocol = true
forwarding = "proxy"
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

# HTTP/JMAP routing: pinned discovery endpoints, then per-account by credential.
[[http.route]]
match = "/.well-known/**"
destination = "old"

[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "default"

[listener.imap]
protocol = "imap"
bind = ["0.0.0.0:993", "[::]:993"]
tls = "implicit"
[listener.imap-starttls]
protocol = "imap"
bind = ["0.0.0.0:143", "[::]:143"]
tls = "starttls"
[listener.pop3]
protocol = "pop3"
bind = ["0.0.0.0:995", "[::]:995"]
tls = "implicit"
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

[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
```

## HTTP routing by credential

The two HTTP routes work together. The first pins the `/.well-known/**` discovery paths to the old deployment, since those requests are not tied to an account. The second matches everything else and extracts an identifier from the `Authorization` header: a JMAP client presenting Stalwart's `sw1.` bearer token has the account address decoded directly from the token, while a request using HTTP Basic authentication has the login decoded from the header. The extracted identifier resolves through the same mapping table the mail protocols use, so an account is routed consistently across IMAP and JMAP. Requests with no recognizable credential fall through to the default destination named by `fallback`.

WebSocket connections require no special configuration: when a JMAP-over-WebSocket request is upgraded, the proxy detects the `101 Switching Protocols` response and bridges the connection opaquely from then on.

The `forwarded = true` setting on each destination makes the proxy append the client address to the `Forwarded` and `X-Forwarded-For` request headers, so the Stalwart backend records the real client address. The HTTP listener sets `forwarded = "off"` so that forwarding headers arriving from clients are stripped rather than trusted.

## Cutting accounts over

Migration proceeds the same way as for a legacy backend: copy the mailbox to the new deployment, add or update the account's mapping to `new`, and force it to re-resolve. With a writable store this is a single call followed by a disconnect:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=heidi@example.com&destination=new"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=heidi@example.com"
```

Because the same mapping governs both mail and JMAP, the account's web client follows to the new deployment on its next request without any additional step.
