---
sidebar_position: 5
---

# SQLite

SQLite is a self-contained, serverless, and zero-configuration database engine, making it simple to manage. It is typically suited for small installations operating on a single nodes, owing to its simplicity and reliability for such setups. For redundancy, SQLite's data can be replicated using external solutions such as Litestream, which provides continuous replication of SQLite databases.

## Configuration

The following configuration settings are available for SQLite, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `"sqlite"` for SQLite.
- `path`: The path to the SQLite database file. If the database file does not exist, it will be created automatically.

### Connection Pool

The connection and worker pools are configured in the `store.<name>.pool` section with the following attributes:

- `max-connections`: This defines the maximum number of database connections that the connection pool can open at the same time. It is used to limit the number of simultaneous connections to the database.
- `workers`: This setting specifies the number of worker threads dedicated to handling blocking database tasks. If this value is absent or set to 0, the number of CPU cores will be used instead.

### Example

```toml
[store."sqlite"]
type = "sqlite"
path = "/var/lib/data/index.sqlite3"

[store."sqlite".pool]
max-connections = 10
workers = 10
```

## Lookup queries

When SQLite is used as a [directory](/docs/auth/backend/overview) or [lookup store](/docs/storage/lookup), SQL queries can be mapped to lookup ids. This is done by specifying the query under `store.<name>.query.<lookup_name>` where `<name>` is the SQLite store ID and `<lookup_name>` it the lookup ID to map the query to. 

For example:

```toml
[store."sqlite".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = ? AND active = true"
members = "SELECT member_of FROM group_members WHERE name = ?"
recipients = "SELECT name FROM emails WHERE address = ?"
emails = "SELECT address FROM emails WHERE name = ? ORDER BY type DESC, address ASC"
```

## Initialization statements

On startup, Stalwart Mail Server can execute SQL statements before the first query is executed. This is useful for initializing the database with tables or data. These initialization statements are specified under the `store.<name>.init.execute` section of the configuration file.

For example:

```toml
[store."sqlite".init]
execute = [
    "CREATE TABLE IF NOT EXISTS accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of))",
    "CREATE TABLE IF NOT EXISTS emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address))"
]
```


