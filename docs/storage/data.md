---
sidebar_position: 2
---

# Data store

In Stalwart Mail Server, the data store is where e-mail metadata, folders, settings, and most data is kept. It is important to note that the data store does not hold email messages, sieve scripts, or other large binary files. These are managed separately by the [blob store](/docs/storage/blob) to optimize performance and manageability.

The following database backends can be utilized as a data store:

- [RocksDB](/docs/storage/backends/rocksdb): A high performance embedded database for key-value data (recommended for single node installations).
- [FoundationDB](/docs/storage/backends/foundationdb): A distributed database designed to handle large volumes of data across clusters of machines (recommended for multi-node installations).
- [PostgreSQL](/docs/storage/backends/postgresql): A powerful, open-source object-relational database system.
- [MySQL](/docs/storage/backends/mysql): An open-source relational database management system.
- [SQLite](/docs/storage/backends/sqlite): A C library that provides a lightweight disk-based database.

Due to their performance and scalability, [RocksDB](/docs/storage/backends/rocksdb) is the recommended backend for single node installations, while [FoundationDB](/docs/storage/backends/foundationdb) is recommended for multi-node installations.

## Configuration

To configure the data store, you need to specify the ID of the store you wish to use under the `jmap.store.data` attribute in the configuration file. For example, to use the `rocksdb` store as the data store:

```toml
[jmap.store]
data = "rocksdb"
```

## Maintenance

In order ensure efficient use of storage and optimal database operations, Stalwart Mail Server runs periodically automated tasks that perform essential maintenance such as removing expired entries or compacting logs. The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/overview/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 3am local time on the `foundationdb` store, you would add the following to your configuration file:

```toml
[store."foundationdb".purge]
frequency = "0 3 *"
```

