---
sidebar_position: 5
---

# Throttling

Throttling is a mechanism that restricts the rate at which outbound messages are sent to a remote SMTP server. It is used to prevent the remote SMTP server from being overwhelmed by too many outgoing messages, which can lead to performance degradation, connectivity issues, or even being marked as a spammer by ISPs. Concurrency limiting and rate limiting are two techniques used in Stalwart SMTP to control the amount of outbound traffic.

## Settings

Stalwart SMTP supports an unlimited number of outbound throttles, which can be dynamically configured to limit email delivery based on multiple variables. Throttles are defined as TOML arrays under the `queue.throttle[]` keys using the following attributes:

- `concurrency`: Specifies the maximum number of concurrent requests that the throttle will allow.
- `rate`: Specifies the rate limit that the throttle will impose.
- `key`: An optional list of context variables that determine where this throttle should be applied.
- `match`: An optional rule that indicates the conditions under which this throttle should be applied.

Throttles can either include both a concurrency limit and rate limit, or just one of the two strategies.

## Concurrency limit

Concurrency limiting is the process of limiting the number of simultaneous connections to a remote server. This is useful in preventing overloading a remote server by establishing too many connections. For example, a rule can be configured to limit the number of concurrent connections to a single IP address to prevent overwhelming the remote host.

The `queue.throttle[].concurrency` attribute determines the number of concurrent outbound connections that the throttle will allow. For example, to limit the server to maintain a maximum number of 5 concurrent outgoing connections globally:

```toml
[[queue.throttle]]
concurrency = 5
```

Please note that the above example will impose a global concurrency limiter, to apply a more granular limiter please refer to the [throttle groups](#groups) section below.

## Rate limit

Rate limiting is the process of limiting the number of outgoing requests over a specific period of time. This is useful in preventing sending too many messages in a short amount of time, which could result in being marked as spammer by the remote host. For example, a rule can be configured to rate limit the number of outgoing emails per minute to a remote IP address or domain name.

The `queue.throttle[].rate` attribute determines the number of outgoing messages over a period of time that the rate limiter will allow. For example, to limit the server to send a maximum of 100 messages per seconds:

```toml
[[queue.throttle]]
rate = "100/1s"
```

Please note that the above example will impose a global rate limiter, to apply a more granular limiter please refer to the [throttle groups](#groups) section below.

## Groups

The `queue.throttle[].key` attribute enables the creation of throttle groups based on a combination of context variables. Available context variables are:

- `remote-ip`: The remote IP address.
- `local-ip`: The local IP address (only available when a [source IP](/docs/smtp/outbound/transport#source-ip) is configured).
- `mx`: The remote host's MX hostname.
- `sender`: The return path specified in the `MAIL FROM` command.
- `sender-domain`: The domain component of the return path specified in the `MAIL FROM` command.
- `rcpt`: The recipient's address specified in the `RCPT TO` command.
- `rcpt-domain`: The domain component of the recipient's address specified in the `RCPT TO` command.

For example, to implement a concurrency limiter per remote IP address:

```toml
[[queue.throttle]]
key = ["remote-ip"]
concurrency = 5
```

And, to limit the rate at which messages are sent to any domain name to 25 messages per hour:

```toml
[[queue.throttle]]
key = ["rcpt-domain"]
rate = "25/1h"
```

## Rules

Throttle rules enable the imposition of concurrency and rate limits only when a specific condition is met. These [rules](/docs/smtp/overview) can be configured using the `queue.throttle[].match` attribute. For example, to impose a concurrency and rate limiter by sender only for messages sent to the IP address 10.0.0.20:

```toml
[[queue.throttle]]
match = {if = "remote-ip", eq = "10.0.0.20"}
key = ["sender", "rcpt-domain"]
concurrency = 5
rate = "100/1h"
```


