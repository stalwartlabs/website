---
sidebar_position: 2
---

# Routing

Stalwart SMTP allows to define how messages should be delivered to their final destination through routing rules. Rules are configured under the `queue.outbound.next-hop` parameter, which can either point to a [remote host](#remote-hosts) defined in the configuration file or contain the value `false` which indicates that the message delivery should be done through DNS resolution. Routing rules are useful for tasks such as forwarding messages for local domains to a message store over LMTP.

## Remote hosts

Remote hosts enable the definition of external SMTP and LMTP servers for the purpose of relaying messages. These servers are specified in the configuration file using the `remote.<id>` keys, where `<id>` is the internal identifier for the host.

### Host Settings

For each remote host, the following parameters can be specified as sub-keys of `remote.<id>`:

- `address`: The fully-qualified domain name of the remote server, for example "mail.domain.org".
- `port`: The port on the remote server that should be used for the connection.
- `protocol`: The communication protocol to use, with valid options being `lmtp` or `smtp`.

### TLS Options

The configuration of TLS for remote servers is managed through the following parameters, which are located under the `remote.<id>.tls` key in the configuration file:

- `implicit`: Specifies whether TLS should be implicitly established upon connecting to the remote host, or if it should be negotiated on a clear-text connection using the `STARTTLS` command (defaults to `true`).
- `allow-invalid-certs`: A flag indicating whether self-signed and invalid certificates should be accepted (defaults to `false`).

### Authentication

Authentication can be configured using the following parameters located under the `remote.<id>.auth` key in the configuration file:

- `username`: The username to be used for authentication.
- `secret`: The password to be used for authentication. Can also be specified using an [environment variable](/docs/configuration/macros).

## Local host

In a setup where Stalwart SMTP is run together with Stalwart JMAP, a special host type known as `local` is automatically created. This special host is not a traditional mail server with an IP address or domain name. Instead, it represents the local JMAP message store, the primary location where Stalwart Mail Server stores email messages.
This local host allows Stalwart SMTP to directly deliver messages to the local JMAP message store without the need for any network communication. This mechanism bypasses the typical SMTP or LMTP protocols that are commonly used for transferring messages between servers or to the final mailbox respectively.

For example, the following configuration can be used to deliver messages for local domains to the local JMAP message store:

```toml
[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
             { else = false } ]
```

## Examples

### Relay host

A relay host is a server that accepts email from another server and then forwards it to its final destination. The server that accepts and forwards the emails is known as a relay because it functions as an intermediate stop for messages on their way to their final destination.

In the realm of email delivery, relay hosts are particularly useful in various scenarios. For instance, some organizations might not want to handle the complexity of direct delivery, so they send all their outgoing mail to a relay host (like an Internet Service Provider's mail server) which handles the details of delivery.

Another common usage scenario is when sending emails from a network that's behind a firewall or when the server IP is on a blocklist. In these cases, a relay host that has a trusted IP address can deliver the email on behalf of the originating server. This can help overcome delivery problems related to IP reputation.

Relay hosts can also be used for security purposes. Emails can be sent to a relay host that scans them for viruses and spam before they are delivered to the final recipient. This way, potentially harmful or unwanted messages can be detected and stopped before they reach their destination.

In Stalwart SMTP, messages can be routed to a relay host by adding it as the next hop in the routing configuration. For example:

```toml
[queue.outbound]
next-hop = "relay"

[remote."relay"]
address = "relay.example.org"
port = 25
protocol = "smtp"

[remote."relay".tls]
implicit = false
allow-invalid-certs = false
```

**Note**: When using a relay host, make sure both [MTA-STS](/docs/smtp/outbound/tls#mta-sts) and [DANE](/docs/smtp/outbound/tls#dane) are disabled in the configuration file:

```toml
[queue.outbound.tls]
mta-sts = "disable"
dane = "disable"
```

### LMTP delivery

The Local Mail Transfer Protocol (LMTP) is a derivative of the Simple Mail Transfer Protocol (SMTP), designed for the specific purpose of delivering email to a local recipient's mail store, such as a maildir or mbox file. Unlike SMTP, which is used to transport emails across the Internet between servers, LMTP is intended for the final delivery of email to a user's mailbox within a local network or system.

To deliver messages to a local mail store over LMTP, the following configuration can be used that only delivers messages for local domains to the LMTP server:

```toml
[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'lmtp'" }, 
             { else = false } ]

[remote."lmtp"]
address = "localhost"
port = 24
protocol = "lmtp"

[remote."lmtp".tls]
implicit = false
allow-invalid-certs = true

[remote."lmtp".auth]
username = "relay_server"
secret = "123456"
```

