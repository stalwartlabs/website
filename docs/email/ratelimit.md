---
sidebar_position: 4
---

# Rate limiting

Rate limiting is a strategy to limit network traffic. As the name suggests, it puts a limit on how often someone can repeat an action (such as trying to log into an account) within a given time period. Rate limiting can help mitigate certain types of malicious activity such as brute force attacks. It is also useful to reduce the load on your mail server.

## IMAP/POP3

### Concurrency

To limit the number of concurrent IMAP and POP3 connections that a user can have, use the `imap.rate-limit.concurrent` setting. For example:

```toml
[imap.rate-limit]
concurrent = 4
```

### Requests

To limit the number of IMAP and POP3 requests that a user can make within a given time period, use the `imap.rate-limit.requests` setting. For example:

```toml
[imap.rate-limit]
requests = "2000/1m"
```

## JMAP

Refer to the [JMAP Protocol limits](/docs/http/jmap/protocol) section for details on how to configure rate limiting for JMAP.


