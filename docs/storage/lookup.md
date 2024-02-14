---
sidebar_position: 5
---

# Lookup store

Although the term "lookup store" might initially sound ambiguous, it essentially refers to a key-value store. Lookup stores are primarily utilized by the SMTP server to rapidly and efficiently retrieve data. They serve various functions such as:

- [Expressions](/docs/configuration/expressions/overview): Lookup stores are used from expressions to dynamically configure different settings and perform routing decisions.
- [Sieve scripts](/docs/sieve/overview): Sieve scripts, used for filtering and organizing incoming emails, have the possibility to store and retrieve data from lookup stores. 
- [Spam filter database](/docs/spamfilter/settings/database): One of the critical uses of lookup stores is in managing spam filter databases. This includes sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.
- [Rate limiting](/docs/smtp/inbound/throttle) and [Fail2ban](/docs/server/fail2ban): Lookup stores are used to store and retrieve rate limiting data, such as the number of messages sent by a specific sender or the number of connections from a specific IP address.

The following backends can be utilized as a lookup store:

- [Redis](/docs/storage/backends/redis): A popular in-memory database.
- [Data store](/docs/storage/data): Any of the supported data store backends can be used as a lookup store, which is useful when you want to minimize the number of external dependencies.
- [In-memory](/docs/storage/backends/memory): A simple in-memory key-value store. Can only store static data, does not support write operations.

## Configuration

Lookup stores do not require any additional configuration as they are referenced by their ID from [expressions](/docs/configuration/expressions/overview) and [Sieve scripts](/docs/sieve/overview). However, it is possible to define a default lookup store, which is used when no store is specified in a Sieve lookup function. To configure the default lookup store, you need to specify its ID under the `storage.lookup` attribute in the configuration file. For example, to use the `redis` store as the default lookup store:

```toml
[storage]
lookup = "redis"
```

## Maintenance

When using a data store as a lookup store, it is necessary to periodically run an automated task that removes expired keys from the database. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```



