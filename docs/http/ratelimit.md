---
sidebar_position: 7
---

# Rate limiting

Rate limiting is a strategy to limit network traffic. As the name suggests, it puts a limit on how often someone can repeat an action (such as trying to log into an account) within a given time period.
Rate limiting can help mitigate certain types of malicious activity such as brute force attacks. It is also  useful to reduce the load on your server.

In Stalwart, rate limiting works by tracking the IP addresses from which requests are coming from and keeping a record of how much time passes between each request. Then, Stalwart measures the number of requests received from each IP address as well as the time elapsed between each request. If there are too many requests from a given IP within a configured timeframe, Stalwart will reject all further requests coming from that IP address for some time until the limit is restored.

## Anonymous Limits

The setting ``http.rate-limit.anonymous`` controls the amount of requests that an anonymous IP address can make in a timeframe. The format of this parameter is ``<number_of_requests>/<time>`` and the default value is ``100/1m`` (100 requests per minute).

Example:

```toml
[http.rate-limit]
anonymous = "100/1m"
```

## Authenticated Limits

The setting ``http.rate-limit.account`` controls the amount of requests that an authenticated user can make in a timeframe. The format of this parameter is ``<number_of_requests>/<time>`` and the default value is ``1000/1m`` (1000 requests per minute).

Example:

```toml
[http.rate-limit]
account = "1000/1m"
```

