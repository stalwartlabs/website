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

### Directory queries

When PostgreSQL is used as a [directory](/docs/auth/backend/overview), it is necessary to define the SQL queries that will be used to retrieve authentication data from the database. These queries are specified under the `store.<name>.query` section of the configuration file. For more details on the queries, please refer to the [SQL directory queries](/docs/auth/backend/sql#directory-queries) section.

Example:

```toml
[store."postgresql".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = $1 AND active = true"
members = "SELECT member_of FROM group_members WHERE name = $1"
recipients = "SELECT name FROM emails WHERE address = $1 ORDER BY name ASC"
emails = "SELECT address FROM emails WHERE name = $1 ORDER BY type DESC, address ASC"
```

## Example

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
