---
sidebar_position: 5
---

# In-memory store

In-memory data stores (such as Redis) are high-performance databases that store data entirely in memory, enabling extremely fast read and write operations. These systems are often used for caching, message brokering, and as temporary storage for dynamic data that does not require long-term persistence.

In Stalwart, in-memory stores play a crucial role in handling a wide variety of tasks. They are used for storing:

- [Spam filter data](/docs/spamfilter/settings/database) such as sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.
- [Rate limiting](/docs/mta/queue/limits/rate-limit) and [fail2ban](/docs/server/auto-ban) data, such as the number of messages sent by a specific sender or the number of failed authentication attempts from a specific IP address.
- Distributed locks for managing concurrent tasks, such as purging accounts, processing email queues, and running housekeeping tasks.
- [OAuth authorization codes](/docs/auth/oauth/overview) to validate the authorization process.
- [ACME tokens](/docs/server/tls/acme/overview) for SSL/TLS certificate management.

Additionally, in-memory stores can be queried and modified from [expressions](/docs/configuration/expressions/overview) and [Sieve scripts](/docs/sieve/overview) using functions such as `key_get`, `key_set`, and related operations. This integration makes in-memory stores a flexible and powerful tool for dynamically influencing server behavior.

## Backends

Stalwart supports the following backends as in-memory stores:

- [Redis, Memcached, or compatible](/docs/storage/backends/redis): Ideal for high-performance, distributed, or heavy-load environments. Redis, in particular, is recommended for such cases because of its speed and versatility as a cache, database, and message broker.
- [Data store](/docs/storage/data): For administrators aiming to minimize external dependencies, any supported data store backend (SQL, FoundationDB, RocksDB) can also function as an in-memory store. While data store backends provide flexibility, Redis is better suited for heavy loads and distributed setups due to its optimized performance.

## Key Prefixes

In-memory stores operate as key-value stores, where each key is prefixed with a unique identifier to prevent conflicts. Stalwart uses predefined prefixes for different types of data, ensuring clear organization within the store.

Below is a mapping of key prefixes used by Stalwart, including their assigned unsigned integer values:

| **Short name**                 | **Description**                                  | **Integer prefix** |
|----------------------------|------------------------------------------------------|--------------|
| `KV_ACME`                  | ACME tokens for SSL/TLS certificate management       | 0            |
| `KV_OAUTH`                 | OAuth tokens for authentication                      | 1            |
| `KV_RATE_LIMIT_RCPT`       | Rate limiting data for recipient addresses           | 2            |
| `KV_RATE_LIMIT_SCAN`       | Rate limiting data for email scanning                | 3            |
| `KV_RATE_LIMIT_LOITER`     | Rate limiting data for idle connections              | 4            |
| `KV_RATE_LIMIT_AUTH`       | Rate limiting data for authentication attempts       | 5            |
| `KV_RATE_LIMIT_SMTP`       | Rate limiting data for SMTP throttles         | 6            |
| `KV_RATE_LIMIT_CONTACT`    | Rate limiting data for contact forms          | 7            |
| `KV_RATE_LIMIT_HTTP_AUTHENTICATED` | Rate limiting data for authenticated HTTP requests | 8            |
| `KV_RATE_LIMIT_HTTP_ANONYMOUS`    | Rate limiting data for anonymous HTTP requests     | 9            |
| `KV_RATE_LIMIT_IMAP`       | Rate limiting data for IMAP connections              | 10           |
| `KV_TOKEN_REVISION`        | Revision number for access tokens                    | 11           |
| `KV_REPUTATION_IP`         | Spam filter reputation data for IP addresses         | 12           |
| `KV_REPUTATION_FROM`       | Spam filter reputation data for senders              | 13           |
| `KV_REPUTATION_DOMAIN`     | Spam filter reputation data for domains              | 14           |
| `KV_REPUTATION_ASN`        | Spam filter reputation data for ASNs                 | 15           |
| `KV_GREYLIST`              | Spam filter greylist tokens                          | 16           |
| `KV_BAYES_MODEL_GLOBAL`    | Global Bayesian spam filter model                    | 17           |
| `KV_BAYES_MODEL_USER`      | User-specific Bayesian spam filter models            | 18           |
| `KV_TRUSTED_REPLY`         | Spam filter trusted replies tracking                 | 19           |
| `KV_LOCK_PURGE_ACCOUNT`    | Lock for purging accounts                            | 20           |
| `KV_LOCK_QUEUE_MESSAGE`    | Lock for SMTP message queues                         | 21           |
| `KV_LOCK_QUEUE_REPORT`     | Lock for report queues                               | 22           |
| `KV_LOCK_EMAIL_TASK`       | Lock for email-related tasks                         | 23           |
| `KV_LOCK_HOUSEKEEPER`      | Lock for housekeeping tasks                          | 24           |

This structured approach ensures data integrity and prevents key collisions across different types of operations within the in-memory store.

## Data Persistence

It is generally not necessary to configure the in-memory store for persistent storage of most key prefixes. Many types of data, such as rate limiter and fail2ban information, are transient and do not require recovery after a server restart.

However, it is strongly recommended to persist Bayesian model data (`KV_BAYES_MODEL_GLOBAL` and `KV_BAYES_MODEL_USER`). Persisting this data ensures that the spam filter retains its training and accuracy across restarts. Without persistence, the Bayesian models would need to be retrained from scratch, potentially resulting in degraded spam detection performance until sufficient new data has been processed. 

For setups requiring persistence, Redis and compatible systems support reliable persistence mechanisms, making them a suitable choice for storing critical data like Bayesian models.


## Configuration

The main in-memory store is defined under the `storage.lookup` attribute in the configuration file. For example, to use the `redis` store as the default in-memory store:

```toml
[storage]
lookup = "redis"
```

Although Stalwart requires a default in-memory store, it is possible to define multiple in-memory stores to be used from expressions](/docs/configuration/expressions/overview) and [Sieve scripts](/docs/sieve/overview). 

## Maintenance

When using a data store as an in-memory store, it is necessary to periodically run an automated task that removes expired keys from the database. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```
