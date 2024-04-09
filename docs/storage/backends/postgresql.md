---
sidebar_position: 3
---

# PostgreSQL

PostgreSQL, often known simply as Postgres, is a powerful, open-source object-relational database system. It is highly respected for its proven architecture, reliability, data integrity, robust feature set, and extensibility. PostgreSQL is designed to handle a range of workloads, from single machines to data warehouses or Web services with many concurrent users. 

## Configuration

The following configuration settings are available for PostgreSQL, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the database type, set to `"postgresql"` for PostgreSQL.
- `host`: The hostname or IP address of the PostgreSQL server. Example: `"localhost"`.
- `port`: The port on which the PostgreSQL server is running. The default PostgreSQL port is `5432`.
- `database`: The name of the database to connect to, for example, `"stalwart"`.
- `user`: The username used for authentication with the PostgreSQL server. Example: `"postgres"`.
- `password`: The password for the specified user. Example: `"mysecretpassword"`.
- `timeout`: Specifies the maximum time to wait while trying to establish a connection to the PostgreSQL server. It is represented as a string denoting time, e.g., `"15s"` for 15 seconds.
- `pool.max-connections`: Specifies the maximum number of connections allowed in the pool. This setting helps manage the database's load and resources. For example, `10`.

### TLS configuration

The following configuration settings are available for TLS, which are specified under the `store.<name>.tls` section of the configuration file:

- `enable`: A boolean setting that enables (`true`) or disables (`false`) TLS. 
- `allow-invalid-certs`: Determines whether to allow connections with invalid TLS certificates. A boolean setting and the default value is set to `false` for stricter security.

### Example

```toml
[store."postgresql"]
type = "postgresql"
host = "localhost"
port = 5432
database = "stalwart"
user = "postgres"
password = "mysecretpassword"
timeout = "15s"

[store."postgresql".tls]
enable = false
allow-invalid-certs = false

[store."postgresql".pool]
max-connections = 10
```

## Lookup queries

When PostgreSQL is used as a [directory](/docs/auth/directory/overview) or [lookup store](/docs/storage/lookup), SQL queries can be mapped to lookup ids. This is done by specifying the query under `store.<name>.query.<lookup_name>` where `<name>` is the PostgreSQL store ID and `<lookup_name>` it the lookup ID to map the query to. 

For example:

```toml
[store."postgresql".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = $1 AND active = true"
members = "SELECT member_of FROM group_members WHERE name = $1"
recipients = "SELECT name FROM emails WHERE address = $1 ORDER BY name ASC"
emails = "SELECT address FROM emails WHERE name = $1 AND type != 'list' ORDER BY type DESC, address ASC"
verify = "SELECT address FROM emails WHERE address LIKE '%' || $1 || '%' AND type = 'primary' ORDER BY address LIMIT 5"
expand = "SELECT p.address FROM emails AS p JOIN emails AS l ON p.name = l.name WHERE p.type = 'primary' AND l.address = $1 AND l.type = 'list' ORDER BY p.address LIMIT 50"
domains = "SELECT 1 FROM emails WHERE address LIKE '%@' || $1 LIMIT 1"
```

## Initialization statements

On startup, Stalwart Mail Server can execute SQL statements before the first query is executed. This is useful for initializing the database with tables or data. These initialization statements are specified under the `store.<name>.init.execute` section of the configuration file.

For example:

```toml
[store."postgresql".init]
execute = [
    "CREATE TABLE IF NOT EXISTS accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT TRUE)",
    "CREATE TABLE IF NOT EXISTS group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of))",
    "CREATE TABLE IF NOT EXISTS emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address))"
]
```
