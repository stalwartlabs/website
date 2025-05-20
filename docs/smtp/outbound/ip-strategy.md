---
sidebar_position: 4
---

# IP Strategy

An IP strategy determines which type of source and remote IP addresses to use when delivering emails to a remote SMTP server. This configuration allows fine-tuning of both the source IP strategy—which determines the local IP address used when sending emails—and the remote IP strategy, which defines the order in which IPv4 and IPv6 addresses are tried when connecting to remote hosts.

The source IP strategy enables administrators to specify the local IP address that the mail server will use as the source when establishing connections to remote servers. This is particularly useful in environments where multiple IP addresses are assigned to the server, allowing for configurations that align with network policies, load balancing requirements, or compliance considerations.

The remote IP strategy provides flexibility in choosing whether the server should prioritize IPv4 or IPv6 when attempting to connect to a remote host. Administrators can configure the mail server to try IPv4 first and fallback to IPv6, or vice versa, depending on their networking environment and compatibility needs. This ensures efficient and reliable communication, even in mixed IP environments.

## Remote IP

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

## Source IP

The source IP strategy determines a list of local IPv4 and IPv6 addresses to use when delivery emails to remote SMTP servers. If multiple source addresses are provided, Stalwart will randomly choose one from the list each time a new connection is established. The list of local IPv4 addresses to use is configured with the `queue.outbound.source-ip.v4` parameter while IPv6 addresses are configured under the `queue.outbound.source-ip.v6` parameter.

Proper configuration of the `queue.outbound.source-ip` setting is crucial for successful email delivery. If your server uses multiple IP addresses, it is essential to specify these addresses to ensure optimal deliverability. When multiple IPs are available, failing to configure this setting appropriately might result in the selection of an undesired IP, potentially affecting the deliverability of your emails. Therefore, to maintain consistent and reliable email delivery, it is recommended to configure this setting carefully when using multiple IP addresses.

Example:

```toml
[queue.outbound.source-ip]
v4 = "['192.0.2.10', '192.0.2.11']"
v6 = "['2001:db8::a', '2001:db8::b']"
```
