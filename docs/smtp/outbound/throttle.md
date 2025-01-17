---
sidebar_position: 5
---

# Throttling

Throttling is a mechanism that restricts the rate at which outbound messages are sent to a remote SMTP server. It is used to prevent the remote SMTP server from being overwhelmed by too many outgoing messages, which can lead to performance degradation, connectivity issues, or even being marked as a spammer by ISPs. Concurrency limiting and rate limiting are two techniques used in Stalwart Mail Server to control the amount of outbound traffic.

## Settings

Stalwart Mail Server supports an unlimited number of outbound throttles, which can be dynamically configured to limit email delivery based on multiple variables. Throttles are defined as TOML arrays under the `queue.throttle[]` keys using the following attributes:

- `concurrency`: Specifies the maximum number of concurrent requests that the throttle will allow.
- `rate`: Specifies the rate limit that the throttle will impose.
- `key`: An optional list of context variables that determine where this throttle should be applied.
- `match`: An optional rule that indicates the conditions under which this throttle should be applied.
- `enable`: An boolean attribute that specifies whether the throttle is enabled. If not specified, the throttle is ignored.

Throttles can either include both a concurrency limit and rate limit, or just one of the two strategies.

Memory usage of the rate limiters is controlled by the `limiter.capacity` and `limiter.shard` attributes in the configuration file. The `limiter.capacity` attribute specifies the maximum number of rate limiter entries that can be stored in memory, while the `limiter.shard` attribute determines the number of shards used to distribute the entries across the memory space. By default the number of shards is set to twice the number of CPUs available on the server. 

## Delivery Threads

Stalwart maintains a pool of delivery threads that are used to send messages both locally and to remote SMTP servers. It is important to configure the number of delivery threads to ensure that the server can handle the required load. A number too low can result in slow message delivery, while a number too high can lead to high memory usage and CPU load.

The number of threads used to deliver messages to remote SMTP servers is controlled by the `queue.outbound.threads` attribute and the default value is set to 25 threads. For example, to increase the number of threads to 50:

```toml
[queue.threads]
remote = 50
```

The number of threads used to deliver messages locally is controlled by the `queue.local.threads` attribute and the default value is set to 10 threads. For example, to increase the number of threads to 20:

```toml
[queue.threads]
local = 20
```

## Concurrency limit

Concurrency limiting is the process of limiting the number of simultaneous connections to a remote server. This is useful in preventing overloading the local or remote server by establishing too many connections. For example, a rule can be configured to limit the number of concurrent connections to a single IP address to prevent overwhelming the remote host.

Custom concurrency limits can be imposed based on specific criteria. The `queue.throttle[].concurrency` attribute determines the number of concurrent outbound connections that the throttle will allow. For example, to limit the server to maintain a maximum number of 5 concurrent outgoing connections globally:

```toml
[[queue.throttle]]
concurrency = 5
enable = true
```

Please note that the above example will impose a global concurrency limiter, to apply a more granular limiter please refer to the [throttle groups](#groups) section below.

## Rate limit

Rate limiting is the process of limiting the number of outgoing requests over a specific period of time. This is useful in preventing sending too many messages in a short amount of time, which could result in being marked as spammer by the remote host. For example, a rule can be configured to rate limit the number of outgoing emails per minute to a remote IP address or domain name. Rate limiters are stored in the [in-memory store](/docs/storage/in-memory) and are shared across all server instances.

The `queue.throttle[].rate` attribute determines the number of outgoing messages over a period of time that the rate limiter will allow. For example, to limit the server to send a maximum of 100 messages per seconds:

```toml
[[queue.throttle]]
rate = "100/1s"
enable = true
```

Please note that the above example will impose a global rate limiter, to apply a more granular limiter please refer to the [throttle groups](#groups) section below.

## Groups

The `queue.throttle[].key` attribute enables the creation of throttle groups based on a combination of context variables. Available context variables are:

- `remote_ip`: The remote IP address.
- `local_ip`: The local IP address (only available when a [source IP](/docs/smtp/outbound/transport#source-ip) is configured).
- `mx`: The remote host's MX hostname.
- `sender`: The return path specified in the `MAIL FROM` command.
- `sender_domain`: The domain component of the return path specified in the `MAIL FROM` command.
- `rcpt`: The recipient's address specified in the `RCPT TO` command.
- `rcpt_domain`: The domain component of the recipient's address specified in the `RCPT TO` command.

For example, to implement a concurrency limiter per remote IP address:

```toml
[[queue.throttle]]
key = ["remote_ip"]
concurrency = 5
enable = true
```

And, to limit the rate at which messages are sent to any domain name to 25 messages per hour:

```toml
[[queue.throttle]]
key = ["rcpt_domain"]
rate = "25/1h"
enable = true
```

## Expressions

Throttle expressions enable the imposition of concurrency and rate limits only when a specific condition is met. These [expressions](/docs/configuration/expressions/overview) can be configured using the `queue.throttle[].match` attribute. For example, to impose a concurrency and rate limiter by sender only for messages sent to the IP address 192.0.2.20:

```toml
[[queue.throttle]]
match = "remote_ip = '192.0.2.20'"
key = ["sender", "rcpt_domain"]
concurrency = 5
rate = "100/1h"
enable = true
```
