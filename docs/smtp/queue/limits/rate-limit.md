---
sidebar_position: 3
---

# Rate Limits

Rate limiting is a mechanism used to control the flow of connections and messages by restricting the number of requests or actions allowed over a specific time period. In Stalwart Mail Server, rate limiting ensures that email traffic is managed efficiently, preventing resource overuse and protecting the server from abuse, such as spam or denial-of-service (DoS) attacks.

Stalwart supports enforcing rate limits on both inbound connections and outbound connections. Inbound rate limits apply to connections from remote servers on standard ports, such as 25 (SMTP) and 465 (submissions), helping to regulate the flow of incoming messages. Outbound rate limits, on the other hand, apply to connections initiated automatically by the message queue when delivering messages to remote hosts. These limits help manage the volume of outgoing traffic and ensure that the server does not overwhelm external systems.

In distributed environments, Stalwart's rate limiting system is shared across the entire cluster. This ensures consistent enforcement of limits across all nodes, regardless of which node handles a specific connection. To achieve this, rate limiters are stored in the server's default [in-memory store](/docs/storage/in-memory), providing low-latency access and efficient synchronization across the cluster.

By leveraging rate limits, administrators can maintain control over email traffic, protect their infrastructure, and ensure smooth operation in both standalone and distributed setups.

## Inbound Limits

Inbound rate limits in Stalwart Mail Server are designed to regulate the flow of incoming connections and messages from remote servers. These limits are particularly useful for mitigating attacks, such as spam campaigns and denial-of-service (DoS) attempts, as well as preventing issues like routing loops that can cause excessive resource usage.

When the configured inbound rate limit is exceeded, Stalwart responds by rejecting any additional messages with a `451 4.4.5 Rate limit exceeded, try again later.` error. This temporary rejection prevents the server from being overwhelmed while signaling the remote sender to retry delivery at a later time. The server will continue rejecting messages until the rate limit is restored, ensuring that normal operations are not disrupted by excessive inbound traffic.

## Outbound Limits

Outbound rate limits regulate the flow of connections and messages initiated by Stalwart Mail Server to deliver messages to remote systems. These limits help prevent overwhelming external servers and can be used to throttle message delivery based on the server's operational policies or constraints.

Unlike inbound rate limits, outbound rate limiting does not reject or discard messages. Instead, when an outbound rate limit is reached, affected messages remain in the server's message queue until the limit is restored. Once the rate limit resets, the server resumes delivering the queued messages according to its configured retry schedule.

## Settings

Stalwart Mail Server supports an unlimited number of rate limiters, which can be dynamically configured to limit email delivery based on multiple variables. Rate limiters are defined in the configuration file under the `queue.limiter.outbound[]` (for outbound connections) and `queue.limiter.inbound[]` (for inbound connections) keys using the following attributes:

- `concurrency`: Specifies the maximum number of concurrent requests that the throttle will allow.
- `rate`: Specifies the rate limit that the throttle will impose.
- `key`: An optional list of context variables that determine where this throttle should be applied.
- `match`: An optional rule that indicates the conditions under which this throttle should be applied.
- `enable`: An boolean attribute that specifies whether the throttle is enabled. If not specified, the throttle is ignored.

### Rate

The `rate` attribute determines the number of outgoing messages over a period of time that the rate limiter will allow. For example, to limit the server to send a maximum of 100 messages per seconds:

```toml
[[queue.limiter.outbound]]
rate = "100/1s"
enable = true
```

Please note that the above example will impose a global rate limiter, to apply a more granular limiter please refer to the [limit groups](#groups) section below.

### Groups

The `key` attribute enables the creation of limit groups based on a combination of context variables. Available context variables for outbound limiters are:

- `remote_ip`: The remote IP address.
- `local_ip`: The local IP address (only available when a [source IP](/docs/smtp/outbound/ip-strategy#source-ip) is configured).
- `mx`: The remote host's MX hostname.
- `sender`: The return path specified in the `MAIL FROM` command.
- `sender_domain`: The domain component of the return path specified in the `MAIL FROM` command.
- `rcpt`: The recipient's address specified in the `RCPT TO` command.
- `rcpt_domain`: The domain component of the recipient's address specified in the `RCPT TO` command.

Available context variables for inbound limiters are:

- `remote_ip`: The IP address of the client.
- `listener`: The identifier of the listener that received the connection.
- `helo_domain`: The domain name used in the `EHLO` command.
- `sender`: The return path specified in the `MAIL FROM` command.
- `sender_domain`: The domain component of the return path specified in the `MAIL FROM` command.
- `rcpt`: The recipient's address specified in the `RCPT TO` command.
- `rcpt_domain`: The domain component of the recipient's address specified in the `RCPT TO` command.
- `authenticated_as`: The username used for authentication.

For example, to limit the rate at which messages are sent to any domain name to 25 messages per hour:

```toml
[[queue.limiter.outbound]]
key = ["rcpt_domain"]
rate = "25/1h"
enable = true
```

And, to limit the rate at which a domain name can send messages to any given recipient to 6 messages per minute:

```toml
[[queue.limiter.inbound]]
key = ["sender_domain", "rcpt"]
rate = "6/1m"
enable = true
```

### Expressions

Expressions enable the imposition of rate limits only when a specific condition is met. These [expressions](/docs/configuration/expressions/overview) can be configured using the `match` attribute.

For example, to impose an outbound rate limiter by sender only for messages sent to the IP address 192.0.2.20:

```toml
[[queue.limiter.outbound]]
match = "remote_ip = '192.0.2.20'"
key = ["sender", "rcpt_domain"]
rate = "100/1h"
enable = true
```

And, to impose an inbound rate limiter by recipient for messages coming from the IP address 192.0.2.25:

```toml
[[queue.limiter.inbound]]
match = "remote_ip = '192.0.2.25'"
key = ["rcpt"]
rate = "5/1h"
enable = true
```



