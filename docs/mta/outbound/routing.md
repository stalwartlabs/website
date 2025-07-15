---
sidebar_position: 4
---

# Routing

Message routing is the process of determining the final destination host to which an email message should be delivered. When a message is processed for delivery, the selected **routing strategy** defines whether it should be delivered locally, resolved through DNS, or sent through an intermediate relay server.

There are three types of routing strategies supported:

* **Local**: Delivers the message to the local message store, typically for users hosted on the same system or domain.
* **MX**: Uses DNS MX record resolution to determine the destination server for remote delivery.
* **Relay**: Forwards the message to a predefined relay host, regardless of recipient domain.

Each message recipient can be routed independently using different strategies. This allows, for example, some messages to be delivered locally while others are relayed or sent via MX resolution based on domain, authentication status, or other delivery context.

Routing strategies are defined in the configuration under the `queue.route.<id>` section, where `<id>` is the name of the routing strategy. The type of routing to use is specified using the `queue.route.<id>.type` setting, which must be one of the following: `local`, `mx`, or `relay`.

Once defined, routing strategies can be dynamically selected for each recipient via the [route strategy](/docs/mta/outbound/strategy) expression, allowing administrators to apply different routing logic depending on message attributes or system policies.

## Local Delivery

The **local** routing strategy is used to deliver messages to the server's internal message store, where they are made available to users through standard mail access protocols such as **JMAP**, **IMAP**, or **POP3**. This route is typically used for delivering messages to domains and users hosted on the same Stalwart MTA instance.

Messages routed using the local strategy are not forwarded to external systems. Instead, they are written directly into the mailbox storage backend, where they can be retrieved by the intended recipients using supported client protocols.

The local route requires no additional configuration parameters. To define a local routing strategy, simply create an entry under the `queue.route.<id>` section and set the route type to `local`:

```toml
[queue.route.local]
type = "local"
```

Once defined, this route can be selected dynamically for specific recipients using a routing strategy expression. This allows messages destined for local users to be handled separately from those requiring external delivery.

## MX Delivery

The **MX** routing strategy is used for delivering messages to remote domains using **Mail Exchanger (MX) DNS resolution**. When a message is routed using this strategy, Stalwart queries DNS for the MX records of the recipient's domain and attempts delivery to the listed mail servers in priority order. MX resolution works by retrieving all MX records associated with the target domain. Each record includes a hostname and a priority value. The MTA attempts delivery to the host(s) with the lowest priority value first, moving to the next available one if delivery fails.

To configure an MX route, define a route with `type` set to `mx` under the `queue.route.<id>` section:

```toml
[queue.route.mx]
type = "mx"
```

### MX Limits

The `queue.route.<id>.limits.mx` setting controls the **maximum number of MX hosts** that the MTA will attempt to contact during a single delivery attempt.

```toml
[queue.route.mx.limits]
mx = 3
```

In this example, if a domain has five MX records, only the first three (ordered by priority) will be considered during the delivery attempt. This can help limit connection time and resource usage when dealing with domains that have many fallback servers.

### Multihomed Limits

The `queue.route.<id>.limits.multihomed` setting defines the **maximum number of IP addresses** to try for each MX host, in cases where a host resolves to multiple IPs (i.e., multihomed servers).

```toml
[queue.route.mx.limits]
multihomed = 2
```

If an MX hostname resolves to several A or AAAA records, only the first two addresses will be tried during delivery. This is useful to avoid long delays when some IPs are unreachable or non-responsive.

### IP Lookup Strategy

The `queue.route.<id>.ip-lookup` setting controls the **IP address resolution strategy** when looking up the addresses of MX hosts. It determines whether the MTA should prefer IPv4 or IPv6 addresses, or use only one type.

Available options:

* `ipv4_only`: Use only IPv4 addresses (A records).
* `ipv6_only`: Use only IPv6 addresses (AAAA records).
* `ipv6_then_ipv4`: Prefer IPv6 addresses; fallback to IPv4 if none are available.
* `ipv4_then_ipv6`: Prefer IPv4 addresses; fallback to IPv6 if none are available.

Example:

```toml
[queue.route.mx]
ip-lookup = "ipv4_then_ipv6"
```

This configuration will attempt delivery using IPv4 addresses first, and use IPv6 only if no IPv4 addresses are available for the destination host.

## Relay Delivery

The **relay** routing strategy is used to deliver messages through a predefined **relay host** instead of sending them directly to the recipient's domain via MX resolution. A relay host is a server that accepts email from another server and then forwards it to its final destination. The server that accepts and forwards the emails is known as a relay because it functions as an intermediate stop for messages on their way to their final destination.

In the realm of email delivery, relay hosts are particularly useful in various scenarios. For instance, some organizations might not want to handle the complexity of direct delivery, so they send all their outgoing mail to a relay host (like an Internet Service Provider's mail server) which handles the details of delivery.

Another common usage scenario is when sending emails from a network that's behind a firewall or when the server IP is on a blocklist. In these cases, a relay host that has a trusted IP address can deliver the email on behalf of the originating server. This can help overcome delivery problems related to IP reputation.

Relay hosts can also be used for security purposes. Emails can be sent to a relay host that scans them for viruses and spam before they are delivered to the final recipient. This way, potentially harmful or unwanted messages can be detected and stopped before they reach their destination.

To configure a relay route, define a route with `type` set to `relay` under the `queue.route.<id>` section:

```toml
[queue.route.relay]
type = "relay"
```

Once the route type is defined, additional settings can be configured to specify the relay host, port, authentication credentials, and other delivery options. These will be described in detail in the relay route configuration section.

### Host Settings

For each remote host, the following parameters can be specified as sub-keys of `route.<id>`:

- `address`: The fully-qualified domain name of the remote server, for example "mail.domain.org".
- `port`: The port on the remote server that should be used for the connection.
- `protocol`: The communication protocol to use, with valid options being `lmtp` or `smtp`.

### TLS Options

The configuration of TLS for remote servers is managed through the following parameters, which are located under the `route.<id>.tls` key in the configuration file:

- `implicit`: Specifies whether TLS should be implicitly established upon connecting to the remote host, or if it should be negotiated on a clear-text connection using the `STARTTLS` command (defaults to `true`).
- `allow-invalid-certs`: A flag indicating whether self-signed and invalid certificates should be accepted (defaults to `false`).

### Authentication

Authentication can be configured using the following parameters located under the `route.<id>.auth` key in the configuration file:

- `username`: The username to be used for authentication.
- `secret`: The password to be used for authentication. Can also be specified using an [environment variable](/docs/configuration/macros).

## Examples

### Relay host

In Stalwart, messages can be routed to a relay host by adding it as a route in the routing configuration. For example:

```toml
[queue.strategy]
route = [ { if = "is_local_domain('', rcpt_domain)", then = "'relay'" }, 
          { else = "'mx'" } ]

[route."relay"]
type = "relay"
address = "relay.example.org"
port = 25
protocol = "smtp"

[route."relay".tls]
implicit = false
allow-invalid-certs = false

[route."mx"]
type = "mx"
ip-lookup = "ipv4_then_ipv6"
```

### Failover delivery

Failover delivery is a mechanism used to ensure that messages are delivered using an alternative host when the delivery to the primary host fails. This is achieved by configuring an expression that forwards messages to a secondary host after the `nth` delivery attempt. The following example demonstrates how to configure failover delivery after the second delivery attempt:

```toml
[queue.strategy]
route = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
          { if = "retry_num > 1", then = "'fallback'" }, 
          { else = "'mx'" } ]

[route."fallback"]
type = "relay"
address = "fallback.example.org"
port = 25
protocol = "smtp"

[route."mx"]
type = "mx"
ip-lookup = "ipv4_then_ipv6"

[route."local"]
type = "local"
```

### LMTP delivery

The Local Mail Transfer Protocol (LMTP) is a derivative of the Simple Mail Transfer Protocol (SMTP), designed for the specific purpose of delivering email to a local recipient's mail store, such as a maildir or mbox file. Unlike SMTP, which is used to transport emails across the Internet between servers, LMTP is intended for the final delivery of email to a user's mailbox within a local network or system.

To deliver messages to a local mail store over LMTP, the following configuration can be used that only delivers messages for local domains to the LMTP server:

```toml
[queue.strategy]
route= [ { if = "is_local_domain('', rcpt_domain)", then = "'lmtp'" }, 
         { else = "'mx'" } ]

[route."lmtp"]
type = "relay"
address = "localhost"
port = 24
protocol = "lmtp"

[route."lmtp".tls]
implicit = false
allow-invalid-certs = true

[route."lmtp".auth]
username = "relay_server"
secret = "123456"

[route."mx"]
type = "mx"
ip-lookup = "ipv4_then_ipv6"

```

