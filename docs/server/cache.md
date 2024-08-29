---
sidebar_position: 7
---

# Cache

Stalwart Mail Server utilizes different caches in order to improve performance. These caches are implemented as an in-memory data structure that is accessible to multiple threads. The default capacity and shard size of each cache is controlled by the `cache.capacity` and `cache.shard` parameters in the configuration file:

```toml
[cache]
shard = 32
capacity = 1024
```

## Mailbox cache

In order to improve JMAP and IMAP performance, Stalwart Mail Server keeps in an LRU (Least Recently Used) cache the message UIDs in a mailbox, the account mailbox structure, and thread IDs. The size of each one of these LRU caches are controlled by the `cache.mailbox.size`, `cache.account.size` and `cache.thread.size` parameters in the configuration file:

```toml
[cache]
mailbox.size = 2048
account.size = 2048
thread.size = 2048
```

## JMAP Session cache

A session represents the stateful interaction between the client and the server. It maintains the state of a user's actions and can be used to handle user requests more efficiently. When a client connects to the JMAP server, a new session is initiated. This session contains necessary details like account details, permissions, disk quotas, etc. 

The JMAP session cache is a memory data structure that stores active session data for fast access and usage. The `cache.session.ttl` determines how long a session will stay alive in the cache without being accessed before it is considered expired and thus subject to removal. For example:

```toml
[cache.session]
ttl = "1h"
```

Stalwart Mail Server runs periodically an automated task for purging expired sessions from the cache. A session is considered expired when it has not been accessed for a certain period of time, known as its Time-To-Live (TTL). When a session exceeds its TTL without being accessed, Stalwart identifies it as "expired". The cleanup task runs at a configurable interval, and during each run, it identifies and deletes these expired sessions, freeing up memory and reducing clutter in the system.

The schedule for this task can be configured in the `jmap.session.purge.frequency` section using a simplified [cron-like syntax](/docs/configuration/values/cron). For example, to run the job every hour at 15 minutes past the hour:

```toml
[jmap.session.purge]
frequency = "15 * *"
```

## Bayesian filter cache

The Bayesian filter cache is used to reduce the number of requests to the [lookup store](/docs/storage/lookup) when checking if a message is spam. The size of the Bayesian filter cache is controlled by the `cache.bayes.capacity` parameter in the configuration file while the TTL of positive and negative cache entries is controlled by the `cache.byes.ttl.positive` and `cache.bayes.negative` parameters. For example:

```toml
[cache.bayes]
capacity = 1024

[cache.bayes.ttl]
positive = "1h"
negative = "30m"
```

## DNS cache

DNS caching is a technique used to store DNS query results in a cache to reduce the number of DNS queries and improve the performance of applications that rely on DNS resolution. The cache is stored in memory and is used to quickly answer subsequent queries for the same domain name without the need to query the authoritative DNS servers again.

The caching size is configured under the `resolver.cache` key and indicate the maximum number of items that can be stored in the cache for each of the following DNS record types:

- `txt`: DNS Text (TXT) records.
- `mx`: DNS Mail Exchange (MX) records.
- `ipv4`: DNS A (Address) records for IPv4 addresses.
- `ipv6`: DNS AAAA (Address) records for IPv6 addresses.
- `ptr`: DNS Pointer (PTR) records.
- `tlsa`: DNS Transport Layer Security Association (TLSA) records.
- `mta-sts`: DNS MTA-STS (Mail Transfer Agent Strict Transport Security) records.

Example:

```toml
[cache.resolver]
txt.size = 2048
mx.size = 1024
ipv4.size = 1024
ipv6.size = 1024
ptr.size = 1024
tlsa.size = 1024
mta-sts.size = 1024
```
