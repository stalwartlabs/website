---
sidebar_position: 2
---

# Routing

Message routing is the process of determining the final destination host to which an email message should be delivered. This step is essential for ensuring that messages are delivered to their intended recipients accurately and efficiently. In a mail server, routing involves resolving the recipient domain's address to identify the mail server responsible for accepting messages for that domain.

By default, **Stalwart** uses **MX (Mail Exchange) resolution** to determine where to deliver outgoing messages. MX resolution is a DNS-based process that retrieves Mail Exchange records associated with the recipient's domain. These records specify which mail servers are authorized to handle email for that domain, along with their priority levels. During this process, Stalwart queries the DNS for MX records of the recipient's domain. If multiple MX records are found, they are sorted based on their priority values, with the lowest number indicating the highest priority. The server attempts delivery to the highest-priority host first and, if that fails, proceeds to try the next available host in the sorted list.

While MX resolution is the default mechanism, Stalwart also provides a flexible way to customize routing behavior. Administrators can define specific delivery rules to override MX lookups, tailoring the routing process to fit unique organizational needs. These custom rules allow messages to be directed based on various criteria, such as the recipient domain, sender domain, network conditions, or even specific message content. This flexibility enables Stalwart to support advanced routing requirements and adapt to complex email delivery scenarios.

## Configuration

Message routing is controlled through the `queue.outbound.next-hop` setting. This setting determines how the server selects the relay host for delivering messages. It expects an [expression](/docs/configuration/expressions/overview) which dynamically evaluates and returns the name of the relay host to use for message delivery. 

When the `queue.outbound.next-hop` expression is evaluated, it must return the identifier of the desired relay host. This identifier specifies the host to which the message will be forwarded for delivery. If the expression evaluates to `false` instead of a relay host identifier, Stalwart defaults to using **MX (Mail Exchange) resolution** to determine the delivery target. This fallback behavior ensures that the server can still route messages based on standard DNS records when no custom routing is explicitly defined.

### Local delivery

To route a message for local delivery, the `queue.outbound.next-hop` expression can return the special internal identifier `local`. When this identifier is returned, Stalwart interprets it as an instruction to bypass MX resolution and deliver the message directly to a local mailbox or domain hosted on the server. This mechanism is particularly useful for ensuring that messages addressed to locally managed domains are handled entirely within the server, without attempting to route them through external hosts.

For example, the following configuration can be used to deliver messages for local domains:

```toml
[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
             { else = false } ]
```

### Relay hosts

Relay hosts enable the definition of external SMTP and LMTP servers for the purpose of relaying messages. These servers are specified in the configuration file using the `remote.<id>` keys, where `<id>` is the internal identifier for the host.

#### Host Settings

For each remote host, the following parameters can be specified as sub-keys of `remote.<id>`:

- `address`: The fully-qualified domain name of the remote server, for example "mail.domain.org".
- `port`: The port on the remote server that should be used for the connection.
- `protocol`: The communication protocol to use, with valid options being `lmtp` or `smtp`.

#### TLS Options

The configuration of TLS for remote servers is managed through the following parameters, which are located under the `remote.<id>.tls` key in the configuration file:

- `implicit`: Specifies whether TLS should be implicitly established upon connecting to the remote host, or if it should be negotiated on a clear-text connection using the `STARTTLS` command (defaults to `true`).
- `allow-invalid-certs`: A flag indicating whether self-signed and invalid certificates should be accepted (defaults to `false`).

#### Authentication

Authentication can be configured using the following parameters located under the `remote.<id>.auth` key in the configuration file:

- `username`: The username to be used for authentication.
- `secret`: The password to be used for authentication. Can also be specified using an [environment variable](/docs/configuration/macros).

### EHLO hostname

The `queue.outbound.hostname` parameter indicates which EHLO hostname to use when sending messages to remote SMTP servers. If not specified, the `config_get('server.hostname')` expression is be used.

Example:

```toml
[queue.outbound]
hostname = "'mx.example.org'"
```

## Examples

### Relay host

A relay host is a server that accepts email from another server and then forwards it to its final destination. The server that accepts and forwards the emails is known as a relay because it functions as an intermediate stop for messages on their way to their final destination.

In the realm of email delivery, relay hosts are particularly useful in various scenarios. For instance, some organizations might not want to handle the complexity of direct delivery, so they send all their outgoing mail to a relay host (like an Internet Service Provider's mail server) which handles the details of delivery.

Another common usage scenario is when sending emails from a network that's behind a firewall or when the server IP is on a blocklist. In these cases, a relay host that has a trusted IP address can deliver the email on behalf of the originating server. This can help overcome delivery problems related to IP reputation.

Relay hosts can also be used for security purposes. Emails can be sent to a relay host that scans them for viruses and spam before they are delivered to the final recipient. This way, potentially harmful or unwanted messages can be detected and stopped before they reach their destination.

In Stalwart, messages can be routed to a relay host by adding it as the next hop in the routing configuration. For example:

```toml
[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'relay'" }, 
             { else = false } ]

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

### Failover delivery

Failover delivery is a mechanism used to ensure that messages are delivered using an alternative host when the delivery to the primary host fails. This is achieved by configuring an expression that forwards messages to a secondary host after the `nth` delivery attempt. The following example demonstrates how to configure failover delivery after the second delivery attempt:

```toml
[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
             { if = "retry_num > 1", then = "'fallback'" }, 
             { else = false } ]

[remote."fallback"]
address = "fallback.example.org"
port = 25
protocol = "smtp"
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

