---
sidebar_position: 3
---

# Transport

The transport layer of the SMTP client is responsible for establishing connections to remote SMTP servers and delivering messages to them. The transport layer is configured under the `queue.outbound` key in the outbound queue configuration file.

## IP Strategy

An IP strategy determines which type of source and remote IP addressed to use when delivering emails to a remote SMTP server.

### Remote IP

The remote IP strategy determines which type of IP address to use when delivering emails to a remote SMTP server. The IP strategy is configured with the `queue.outbound.ip-strategy` parameter and can be set to use only IPv4 addresses, only IPv6 addresses, or both IPv4 and IPv6 addresses:

- `ipv4_only`: Use only IPv4 addresses.
- `ipv6_only`: Use only IPv6 addresses.
- `ipv6_then_ipv4`: Try first using IPv6 addresses and fallback to IPv4 if unavailable.
- `ipv4_then_ipv6`: Try first using IPv4 addresses and fallback to IPv6 if unavailable.

Example:

```toml
[queue.outbound]
ip-strategy = "ipv4_then_ipv6"
```

In some cases administrators might want to dynamically change the IP strategy and, for example, attempt to use exclusively IPv6 and fall back to IPv4 after a failed delivery attempt. This can be achieved by using expressions:

```toml
[queue.outbound]
ip-strategy = [ { if = "retry_num == 0", then = "ipv6_only" }, 
                { else = "ipv4_only" } ]
```

### Source IP

The source IP strategy determines a list of local IPv4 and IPv6 addresses to use when delivery emails to remote SMTP servers. If multiple source addresses are provided, Stalwart Mail Server will randomly choose one from the list each time a new connection is established. The list of local IPv4 addresses to use is configured with the `queue.outbound.source-ip.v4` parameter while IPv6 addresses are configured under the `queue.outbound.source-ip.v6` parameter.

Proper configuration of the `queue.outbound.source-ip` setting is crucial for successful email delivery. If your server uses multiple IP addresses, it is essential to specify these addresses to ensure optimal deliverability. When multiple IPs are available, failing to configure this setting appropriately might result in the selection of an undesired IP, potentially affecting the deliverability of your emails. Therefore, to maintain consistent and reliable email delivery, it is recommended to configure this setting carefully when using multiple IP addresses.

Example:

```toml
[queue.outbound.source-ip]
v4 = "['192.0.2.10', '192.0.2.11']"
v6 = "['2001:db8::a', '2001:db8::b']"
```

## EHLO hostname

The `queue.outbound.hostname` parameter indicates which EHLO hostname to use when sending messages to remote SMTP servers. If not specified, the `key_get('default', 'hostname')` expression is be used.

Example:

```toml
[queue.outbound]
hostname = "'mx.example.org'"
```

## Limits

The following transport limits can be configured under the `queue.outbound.limits` key:

- `mx`: The maximum number of MX hosts to try on each delivery attempt.
- `multihomed`: For multi-homed remote servers, it is the maximum number of IP addresses to try on each delivery attempt.

Example:

```toml
[queue.outbound.limits]
mx = 7
multihomed = 2
```

## Timeouts

Timeout options determine the time limit for the SMTP server to complete a specific step in the SMTP transaction process. These following timeout settings can defined in the configuration file under the `queue.outbound.timeouts`:

- `connect`: The maximum time to wait for the connection to be established.
- `greeting`: The maximum time to wait for the SMTP server's greeting message.
- `tls`: The maximum time to wait for the TLS negotiation process.
- `ehlo`: The maximum time to wait for the `EHLO` command.
- `mail-from`: The maximum time to wait for the `MAIL FROM` command.
- `rcpt-to`: The maximum time to wait for the `RCPT TO` command.
- `data`: The maximum time to wait for the `DATA` command.
- `mta-sts`: The maximum time to wait for a MTA-STS policy lookup.

Example:

```toml
[queue.outbound.timeouts]
connect = "3m"
greeting = "3m"
tls = "2m"
ehlo = "3m"
mail-from = "3m"
rcpt-to = "3m"
data = "10m"
mta-sts = "2m"
```
