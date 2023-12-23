---
sidebar_position: 5
---

# SQLite

SQLite is typically suited for small to medium-sized installations operating on a single node. It is a self-contained, serverless, and zero-configuration database engine, making it simple to manage. Moreover, its data can be replicated using solutions such as LiteStream, enhancing its flexibility for diverse use cases.


SQLite is recommended for single node installations, owing to its simplicity and reliability for such setups. SQLite's features make it an ideal choice for environments where the overhead of a large database system may not be necessary. For redundancy, SQLite's data can be replicated using external solutions such as Litestream, which provides continuous replication of SQLite databases.

## Database location

The location where the SQLite database file is stored on disk is determined by the `store.db.path` attribute. For example:

```toml
[store.db]
path = "/opt/stalwart-mail/data/index.sqlite3"
```

## Pools

The connection and worker pools are configured in the `store.db.pool` section with the following attributes:

- `max-connections`: This defines the maximum number of database connections that the connection pool can open at the same time. It is used to limit the number of simultaneous connections to the database.
- `workers`: This setting specifies the number of worker threads dedicated to handling blocking database tasks. If this number is set to 0, the number of CPU cores will be used instead.

For example:

```toml
[store.db.pool]
max-connections = 10
workers = 8
```

## Cache

The `store.db.cache.size` specifies the size of the database's cache. The cache is used to store frequent queries or parts of the database that are accessed often, improving performance by reducing the need to fetch the same data from the database multiple times. The value represents the maximum number of entries in the cache.

For example:

```toml
[store.db.cache]
size = 1000
```
