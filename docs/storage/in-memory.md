---
sidebar_position: 5
---

# In-memory store

Although the term "in-memory store" might initially sound ambiguous, it essentially refers to a key-value store. In-memory stores are primarily utilized by the SMTP server to rapidly and efficiently retrieve data. They serve various functions such as:

- [Expressions](/docs/configuration/expressions/overview): In-memory stores are used from expressions to dynamically configure different settings and perform routing decisions.
- [Sieve scripts](/docs/sieve/overview): Sieve scripts, used for filtering and organizing incoming emails, have the possibility to store and retrieve data from in-memory stores. 
- [Spam filter database](/docs/spamfilter/settings/database): One of the critical uses of in-memory stores is in managing spam filter databases. This includes sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.
- [Rate limiting](/docs/smtp/inbound/throttle) and [Fail2ban](/docs/auth/authentication/security#fail2ban): In-memory stores are used to store and retrieve rate limiting data, such as the number of messages sent by a specific sender or the number of connections from a specific IP address.
- [OAuth auth codes](/docs/auth/oauth/overview): OAuth authorization codes are stored in in-memory stores to validate the authorization process.

The following backends can be utilized as a in-memory store:

- [Redis](/docs/storage/backends/redis): A popular in-memory database.
- [Data store](/docs/storage/data): Any of the supported data store backends can be used as a in-memory store, which is useful when you want to minimize the number of external dependencies.
- [In-memory](/docs/storage/backends/memory): A simple in-memory key-value store. Can only store static data, does not support write operations.

## Configuration

In-memory stores do not require any additional configuration as they are referenced by their ID from [expressions](/docs/configuration/expressions/overview) and [Sieve scripts](/docs/sieve/overview). However, it is possible to define a default in-memory store, which is used when no store is specified in a Sieve lookup function. To configure the default in-memory store, you need to specify its ID under the `storage.lookup` attribute in the configuration file. For example, to use the `redis` store as the default in-memory store:

```toml
[storage]
lookup = "redis"
```

## Maintenance

When using a data store as a in-memory store, it is necessary to periodically run an automated task that removes expired keys from the database. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```



