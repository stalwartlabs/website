---
sidebar_position: 2
---

# Data store

In Stalwart Mail Server, the data store is where e-mail metadata, folders, settings, and most data is kept. It is important to note that the data store does not hold email messages, sieve scripts, or other large binary files. These are managed separately by the [blob store](/docs/storage/blob) to optimize performance and manageability.

## Configuration

The choice of data store is specified using the `jmap.store.data` attribute in the configuration file. To configure the data store, you need to specify the ID of the store you wish to use.

For example, to use the `rocksdb` store as the data store:

```toml
[jmap.store]
data = "rocksdb"
```

## Maintenance

In oder ensure efficient use of storage and optimal database operations, Stalwart Mail Server runs periodically automated tasks that perform essential maintenance such as removing expired entries or compacting logs. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/overview/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```

