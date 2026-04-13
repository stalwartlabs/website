---
sidebar_position: 5
---

# Connection

A connection strategy in Stalwart MTA defines how the system establishes SMTP connections to remote servers during message delivery. While [routing strategies](/docs/mta/outbound/routing) determine *where* messages are delivered, connection strategies control *how* those connections are made. Each connection strategy specifies parameters such as which source IP address to bind to, the hostname to advertise in the `EHLO` command, and timeout values for various stages of the SMTP session. This level of control is particularly useful in complex environments, such as multi-homed systems, outbound IP rotation setups, or when complying with specific policy or network constraints.

Connection strategies are defined under the `queue.connection.<id>` section of the configuration, where `<id>` is the name of the connection strategy. These strategies can then be dynamically selected using the [connection strategy expression](/docs/mta/outbound/strategy), allowing different delivery behaviors depending on the message or recipient.

Each connection strategy operates independently and may be tailored to the needs of specific domains, message types, or security requirements. For example, administrators might configure one connection strategy that uses a dedicated IP address and hostname for high-volume transactional mail, while another strategy uses a different set of parameters for low-volume or internal mail.

## EHLO hostname

The `queue.connection.<id>.ehlo-hostname` parameter indicates which EHLO hostname to use when sending messages to remote SMTP servers. If not specified, the `server.hostname` setting is be used.

Example:

```toml
[queue.connection.default]
ehlo-hostname = "mx.example.org"
```

## Source IP

The source IP strategy determines a list of local IPv4 and IPv6 addresses to use when delivery emails to remote SMTP servers. If multiple source addresses are provided, Stalwart will randomly choose one from the list each time a new connection is established. The list of local IPv4 and IPv6 addresses to use is configured with the `queue.connection.<id>.source-ips` parameter.

Proper configuration of the `queue.connection.<id>.source-ips` setting is crucial for successful email delivery. If your server uses multiple IP addresses, it is essential to specify these addresses to ensure optimal deliverability. When multiple IPs are available, failing to configure this setting appropriately might result in the selection of an undesired IP, potentially affecting the deliverability of your emails. Therefore, to maintain consistent and reliable email delivery, it is recommended to configure this setting carefully when using multiple IP addresses.

Example:

```toml
[queue.connection.default]
source-ips = ['192.0.2.10', '192.0.2.11', '2001:db8::a', '2001:db8::b']
```

The EHLO hostname for each source IP address can be overridden by specifying the `queue.source-ip.<ip-address>.ehlo-hostname` parameter. This allows for different EHLO hostnames to be used for each source IP address, which can be useful in scenarios where different IPs are associated with different domains or services.

For example:

```toml
[queue.source-ip."192.0.2.10"]
ehlo-hostname = "mx-192-0-2-10.example.org"
```

## Timeouts

Timeout options determine the time limit for the SMTP server to complete a specific step in the SMTP transaction process. These following timeout settings can defined in the configuration file under the `queue.connection.<id>.timeout`:

- `connect`: The maximum time to wait for the connection to be established.
- `greeting`: The maximum time to wait for the SMTP server's greeting message.
- `ehlo`: The maximum time to wait for the `EHLO` command.
- `mail-from`: The maximum time to wait for the `MAIL FROM` command.
- `rcpt-to`: The maximum time to wait for the `RCPT TO` command.
- `data`: The maximum time to wait for the `DATA` command.

Example:

```toml
[queue.connection.default.timeout]
connect = "3m"
greeting = "3m"
ehlo = "3m"
mail-from = "3m"
rcpt-to = "3m"
data = "10m"
```

