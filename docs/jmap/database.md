---
sidebar_position: 2
---

# Database

Stalwart Mail Server offers support for SQLite and FoundationDB, both of which are precompiled into the binary. The database selection can be changed by installing the corresponding binary for the chosen database.

## SQLite

SQLite is recommended for single node installations, owing to its simplicity and reliability for such setups. SQLite's features make it an ideal choice for environments where the overhead of a large database system may not be necessary. For redundancy, SQLite's data can be replicated using external solutions such as Litestream, which provides continuous replication of SQLite databases.

### Database location

The location where the SQLite database file is stored on disk is determined by the `store.db.path` attribute. For example:

```toml
[store.db]
path = "/opt/stalwart-mail/data/index.sqlite3"
```

### Pools

The connection and worker pools are configured in the `store.db.pool` section with the following attributes:

- `max-connections`: This defines the maximum number of database connections that the connection pool can open at the same time. It is used to limit the number of simultaneous connections to the database.
- `workers`: This setting specifies the number of worker threads dedicated to handling blocking database tasks. If this number is set to 0, the number of CPU cores will be used instead.

For example:

```toml
[store.db.pool]
max-connections = 10
workers = 8
```

### Cache

The `store.db.cache.size` specifies the size of the database's cache. The cache is used to store frequent queries or parts of the database that are accessed often, improving performance by reducing the need to fetch the same data from the database multiple times. The value represents the maximum number of entries in the cache.

For example:

```toml
[store.db.cache]
size = 1000
```

## FoundationDB

FoundationDB is recommended for distributed environments, as it is designed for high-scale, fault-tolerant and distributed systems. FoundationDB's capabilities, including its ability to handle large volumes of data across many machines while maintaining consistency and performance, make it a good fit for distributed scenarios.

Settings for your FoundationDB cluster are retrieved from the `fdb.cluster` file.

## Full text search

Stalwart Mail Server supports full-text search (FTS) capabilities that greatly improve the user experience when searching through email content. The FTS indexes are stored directly in the database using bloom filters, which are a space-efficient probabilistic data structure that can be used to determine whether an element is a member of a set. It’s important to note that, while bloom filters do not provide encryption, they do offer a level of privacy. This is because bloom filters obscure individual data items while allowing for effective searching, meaning that the content of your emails is not directly exposed in the search index.

Before indexing a message, the system will try to automatically detect its language. However, in certain scenarios where language detection may not be possible (for instance, if the text is too short or doesn't have clear language characteristics), the system will default to using the configured default language for text processing and indexing determined by the `jmap.fts.default-language` attribute. For example:

```toml
[jmap.fts]
default-language = "en"
```

## Maintenance schedule

Stalwart Mail Server runs periodically an automated task that performs essential database maintenance to ensure efficient use of storage and optimal database operations. In particular, this task takes care of removing expired entries and compacting logs. The schedule for this task can be configured in the `jmap.purge.schedule.db` section using a simplified cron-like syntax:

```txt
<minute> <hour> <week-day>
```

Where:

- ``<minute>``: minute to run the job, an integer ranging from 0 to 59.
- ``<hour>``: hour to run the job, an integer ranging from 0 to 23.
- ``<week-day>``: day of the week to run the job, ranging from ``1`` (Monday) to ``7`` (Sunday) or ``*`` to run the job every day. 

All values have to be specified using the server's local time. For example, to run the job every day at 3am local time:

```toml
[jmap.purge.schedule]
db = '0 3 *"
```

Or, to run the job every Tuesday at 5:45am local time:

```toml
[jmap.purge.schedule]
db = "45 5 2"
```