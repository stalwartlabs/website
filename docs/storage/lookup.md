---
sidebar_position: 5
---

# Lookup store

Although the term "lookup store" might initially sound ambiguous, it essentially refers to a key-value store. Lookup stores are primarily utilized by the SMTP server to rapidly and efficiently retrieve data. They serve various functions such as:

- [Rules](/docs/configuration/rules/syntax): Lookup stores are used from rules to dynamically configure different settings and perform routing decisions.
- [Sieve scripts](/docs/sieve/overview): Sieve scripts, used for filtering and organizing incoming emails, have the possibility to store and retrieve data from lookup stores. 
- [Spam filter database](/docs/spamfilter/settings/database): One of the critical uses of lookup stores is in managing spam filter databases. This includes sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

The following backends can be utilized as a lookup store:

- [Redis](/docs/storage/backends/redis): A popular in-memory database.
- [Data store](/docs/storage/data): Any of the supported data store backends can be used as a lookup store, which is useful when you want to minimize the number of external dependencies.
- [In-memory](/docs/storage/backends/memory): A simple in-memory key-value store. Can only store static data, does not support write operations.

Lookup store do not require any additional configuration as they are referenced by their ID from [rules](/docs/configuration/rules/syntax) and [Sieve scripts](/docs/sieve/overview).

## Maintenance

When using a data store as a lookup store, it is necessary to periodically run an automated task that removes expired keys from the database. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```



