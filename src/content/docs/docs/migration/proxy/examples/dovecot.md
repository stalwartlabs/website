---
sidebar_position: 2
title: "Migrating from Dovecot"
---

This example fronts a legacy mail stack (Dovecot serving IMAP, POP3 and ManageSieve, with Postfix handling submission) and a new Stalwart server with a single proxy. Every account initially resolves to the legacy backend through the default destination, and as each mailbox is migrated to Stalwart it is given an explicit mapping. Clients keep their existing settings throughout.

The defining characteristic of this scenario is that the legacy backend speaks the Dovecot and Postfix conventions: it expects the client's real address to arrive through the `XCLIENT` command (and the IMAP `ID` command), not through a PROXY protocol header. The legacy destination therefore uses `forwarding = "xclient"`, while the Stalwart destination uses `forwarding = "proxy"`. The backends are reached over STARTTLS on the classic ports, and the legacy server presents a self-signed certificate that the proxy pins by name rather than trusting through a public authority.

## Configuration

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
negative_ttl = "30s"
positive_ttl = "10m"

[mapping.file]
path = "/etc/proxy/mappings.tsv"

[routing]
default_destination = "legacy"
smtp_passthrough_destination = "stalwart"

# Legacy Dovecot + Postfix backend. Announced to the backend over XCLIENT/ID.
[destination.legacy]
host = "10.0.1.10"
tls_server_name = "mail.legacy.example.com"
forwarding = "xclient"
tls_pinned_cert_sha256 = "aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99"

[destination.legacy.protocol.imap]
port = 143
tls = "starttls"
[destination.legacy.protocol.pop3]
port = 110
tls = "starttls"
[destination.legacy.protocol.submission]
port = 587
tls = "starttls"
[destination.legacy.protocol.managesieve]
port = 4190
tls = "starttls"

# New Stalwart backend. Announced to the backend over the PROXY protocol.
[destination.stalwart]
host = "10.0.1.20"
tls_server_name = "mail.new.example.com"
proxy_protocol = true
forwarding = "proxy"

[destination.stalwart.protocol.imap]
port = 993
tls = "implicit"
[destination.stalwart.protocol.pop3]
port = 995
tls = "implicit"
[destination.stalwart.protocol.submission]
port = 587
tls = "starttls"
[destination.stalwart.protocol.managesieve]
port = 4190
tls = "starttls"
[destination.stalwart.protocol.smtp]
port = 25
tls = "implicit"

# Client-facing listeners on the familiar ports.
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
[listener.submissions]
protocol = "submission"
bind = ["0.0.0.0:465", "[::]:465"]
tls = "implicit"
[listener.managesieve]
protocol = "managesieve"
bind = ["0.0.0.0:4190", "[::]:4190"]
tls = "starttls"

[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
```

## Mapping file

The mapping file starts empty, so every account falls through to `legacy`. As mailboxes are migrated to Stalwart, a line is added for each:

```text
# identifier              destination
carol@example.com         stalwart
dave@example.com          stalwart
```

## Cutting an account over

When an account's mailbox has been copied to Stalwart, add its line to the mapping file, reload the file, and force the account to re-resolve and reconnect:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
# after appending "carol@example.com  stalwart" to the file
curl -sk -X POST -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/mappings/reload
curl -sk -X POST -H "Authorization: Bearer $TOKEN" "https://127.0.0.1:9443/cache/invalidate?identifier=carol@example.com"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" "https://127.0.0.1:9443/connections/kick?identifier=carol@example.com"
```

Alternatively, with a writable store the same effect is achieved in one call, since a mapping write invalidates the cache automatically:

```bash
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=carol@example.com&destination=stalwart"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=carol@example.com"
```

## Incoming mail

The configuration also routes incoming mail on port 25 to Stalwart through the pass-through destination, declared with `smtp_passthrough_destination = "stalwart"` and the `smtp` protocol on that destination. If incoming mail must instead continue to land on the legacy server until the cutover completes, point the pass-through destination at `legacy` (adding an `smtp` endpoint there) and add an `smtp` listener. Because pass-through sessions are not authenticated, they are bridged as a stream and are not routed per account.
