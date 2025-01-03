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

### Directory queries

When SQLite is used as a [directory](/docs/auth/backend/overview), it is necessary to define the SQL queries that will be used to retrieve authentication data from the database. These queries are specified under the `store.<name>.query` section of the configuration file. For more details on the queries, please refer to the [SQL directory queries](/docs/auth/backend/sql#directory-queries) section.

Example:

```toml
[store."sqlite".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = ? AND active = true"
members = "SELECT member_of FROM group_members WHERE name = ?"
recipients = "SELECT name FROM emails WHERE address = ?"
emails = "SELECT address FROM emails WHERE name = ? ORDER BY type DESC, address ASC"
```

## Example

```toml
[store."sqlite"]
type = "sqlite"
path = "/var/lib/data/index.sqlite3"

[store."sqlite".pool]
max-connections = 10
workers = 10
```
