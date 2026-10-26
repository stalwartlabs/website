---
sidebar_position: 2
title: "Migrating from Dovecot"
description: "Annotated proxy configuration for moving accounts from a Dovecot and Postfix stack to Stalwart, with XCLIENT forwarding for the existing stack."
---

This example moves accounts one at a time from a Dovecot and Postfix stack to a new Stalwart server. The proxy sits in front of both. In the stack, Dovecot serves IMAP, POP3 and ManageSieve, and Postfix handles submission and inbound mail.

Every account initially resolves to the existing stack, through the default destination. An account receives a mapping to Stalwart when it moves.

This is the proxy configuration that the [migration guide](/docs/migration/guide/) uses for a [Dovecot and Postfix](/docs/migration/guide/configure-source/dovecot-postfix/) source. The guide also describes the changes on Dovecot and Postfix (trusting the proxy, the master user for Vandelay, and the relay from Stalwart), and the procedure for each account.

A ready-to-edit copy of the configuration ships in the proxy repository as [`resources/config.dovecot-postfix.toml`](https://github.com/stalwartlabs/proxy/blob/main/resources/config.dovecot-postfix.toml), with the values to edit marked `CHANGE ME`. The changes for Dovecot 2.3 and Postfix are collected in [`resources/dovecot-postfix-trust.conf`](https://github.com/stalwartlabs/proxy/blob/main/resources/dovecot-postfix-trust.conf).

The two backends learn the client's address in different ways. Dovecot and Postfix read it from the XCLIENT command and the IMAP `ID` command, so their destination uses `forwarding = "xclient"`; a PROXY header sent to them would break the connection. Stalwart reads a PROXY protocol header, so its destination uses `forwarding = "proxy"`.

The mail protocols reach both backends over TLS, on their usual ports. The pass-through SMTP connection to Stalwart is passed on unencrypted, and STARTTLS is negotiated between the sending server and Stalwart.

## Proxy configuration

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
default_destination = "legacy"
smtp_passthrough_destination = "stalwart"

# Dovecot and Postfix, announced with XCLIENT and IMAP ID.
[destination.legacy]
host = "legacy.internal.example.com"
tls_server_name = "legacy.internal.example.com"
forwarding = "xclient"
tls_pinned_cert_sha256 = "<64 hexadecimal characters>"

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

# Stalwart, announced with the PROXY protocol.
[destination.stalwart]
host = "new.internal.example.com"
tls_server_name = "new.internal.example.com"
forwarding = "proxy"
forwarded = true

[destination.stalwart.protocol.imap]
port = 993
tls = "implicit"
[destination.stalwart.protocol.pop3]
port = 995
tls = "implicit"
[destination.stalwart.protocol.submission]
port = 465
tls = "implicit"
[destination.stalwart.protocol.managesieve]
port = 4190
tls = "starttls"
[destination.stalwart.protocol.http]
port = 443
tls = "implicit"
[destination.stalwart.protocol.smtp]
port = 25
tls = "plain"

# All HTTP belongs to Stalwart.
[[http.route]]
match = "/**"
destination = "stalwart"

# Client listeners on the usual ports.
[listener.imaps]
protocol = "imap"
bind = ["[::]:993"]
tls = "implicit"
[listener.imap]
protocol = "imap"
bind = ["[::]:143"]
tls = "starttls"
[listener.pop3s]
protocol = "pop3"
bind = ["[::]:995"]
tls = "implicit"
[listener.pop3]
protocol = "pop3"
bind = ["[::]:110"]
tls = "starttls"
[listener.submission]
protocol = "submission"
bind = ["[::]:587"]
tls = "starttls"
[listener.submissions]
protocol = "submission"
bind = ["[::]:465"]
tls = "implicit"
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

[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
```

The existing stack often presents a self-signed certificate on its internal address. The example pins it by its SHA-256 fingerprint, which the proxy compares with the certificate that the backend presents. Replace the placeholder with the fingerprint; a value that is not 64 hexadecimal characters stops the proxy from starting. On an isolated internal network, `tls_allow_invalid_certs = true` can be used instead, as described under [Destinations](/docs/migration/proxy/destinations#backend-certificate-verification).

Stalwart receives submission on port 465 with implicit TLS, because it has no submission listener on port 587 by default. The proxy still accepts submission from clients on both ports, and forwards both to that listener.

## HTTP

Dovecot and Postfix serve no HTTP, so every HTTP request belongs to Stalwart, and the single route pins all paths to it.

The route is needed from the first account move. Stalwart advertises the public hostname as its URL, so Vandelay, which writes each account to Stalwart over JMAP, and the JMAP, CalDAV, CardDAV and WebUI clients of moved accounts all reach Stalwart through this listener. Without a route, the proxy answers every HTTP request with `404 Not Found`. The default destination needs no `http` protocol for this, because HTTP listeners are not checked against it.

The existing stack may also serve HTTP on the public hostname, for example webmail or a CalDAV server. In that case, the requests are routed by account instead, as in the [Stalwart example](/docs/migration/proxy/examples/stalwart#http-routing): `extract = { from = "authorization" }`, with a `fallback` destination for the existing web server, declared with its own `http` protocol.

## Mapping file

The mapping file starts empty, so every account resolves to `legacy`. When an account moves, a line is added for it, as in this file after two moves:

```text
# identifier              destination
carol@example.com         stalwart
dave@example.com          stalwart
```

The master user logins that Vandelay uses, such as `carol@example.com%vmadmin`, do not pass through the proxy, because Vandelay reads the existing stack at its internal address. If they did, the proxy would route them by the mailbox owner, because `%` is its default master user separator.

## Inbound mail

The pass-through destination is `stalwart`, which declares the `smtp` protocol, so inbound mail on port 25 reaches Stalwart. Pass-through sessions are not authenticated, and are not routed per account. Stalwart sorts the mail out itself with split delivery: it delivers mail for moved accounts, and relays mail for the others to Postfix, which delivers it through its existing transport.

## Moving accounts

Accounts are moved with the proxy's [management API](/docs/migration/proxy/management/api), in three steps. Their mapping is switched to `stalwart`. Their sessions are closed, so that clients reconnect to Stalwart. The changes made on the source before the switch are then copied. [Migrating accounts](/docs/migration/guide/migrate-accounts/) describes the commands, together with the copy of the account's data with Vandelay, and the rollback.
