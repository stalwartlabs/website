---
sidebar_position: 4
---

# MySQL / MariaDB

MySQL is a widely used open-source relational database management system (RDBMS). It is renowned for its reliability, simplicity, and compatibility with various platforms and programming languages. MySQL is designed to efficiently manage large volumes of data, making it a popular choice for web applications and online transaction processing. 

## Configuration

The following configuration settings are available for mySQL, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `"mysql"` for MySQL.
- `host`: The hostname or IP address of the MySQL server.
- `port`: The port number on which the MySQL server listens.
- `database`: The name of the database to connect to within the MySQL server.
- `user`: The username used to log in to the MySQL database.
- `password`: The password associated with the specified user.
- `max-allowed-packet`: The maximum size of the packet (specified in bytes) that can be sent to or received from the MySQL server. The default value is `4MB`.
- `timeout`: Defines the maximum time the system should wait for a response from the MySQL server before timing out. The time is specified as a string, such as `"15s"` for 15 seconds.
- `tls.enable`: If set to `true`, enables TLS encryption for the connection to the MySQL server.
- `tls.allow-invalid-certs`: If set to `true`, allows the use of self-signed certificates or certificates signed by unknown certificate authorities. This is useful for testing or development environments.

### Connection Pool

The following configuration settings are available for the connection pool, which are specified under the `store.<name>.pool` section of the configuration file:

- `max-connections`: Specifies the maximum number of active connections to the MySQL server that can be maintained in the pool.
- `min-connections`: Determines the minimum number of active connections that are maintained in the pool, ensuring a baseline level of readiness and resource allocation.

### Example

```toml
[store."mysql"]
type = "mysql"
host = "localhost"
port = 3306
database = "stalwart"
user = "root"
password = "password"
disable = true
max-allowed-packet = 1073741824
timeout = "15s"

[store."mysql".pool]
max-connections = 10
min-connections = 5
```

## Lookup queries

When mySQL is used as a [directory](/docs/auth/backend/overview) or [lookup store](/docs/storage/lookup), SQL queries can be mapped to lookup ids. This is done by specifying the query under `store.<name>.query.<lookup_name>` where `<name>` is the mySQL store ID and `<lookup_name>` it the lookup ID to map the query to. 

For example:

```toml
[store."mysql".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = ? AND active = true"
members = "SELECT member_of FROM group_members WHERE name = ?"
recipients = "SELECT name FROM emails WHERE address = ? ORDER BY name ASC"
emails = "SELECT address FROM emails WHERE name = ? AND type != 'list' ORDER BY type DESC, address ASC"
verify = "SELECT address FROM emails WHERE address LIKE CONCAT('%', ?, '%') AND type = 'primary' ORDER BY address LIMIT 5"
expand = "SELECT p.address FROM emails AS p JOIN emails AS l ON p.name = l.name WHERE p.type = 'primary' AND l.address = ? AND l.type = 'list' ORDER BY p.address LIMIT 50"
domains = "SELECT 1 FROM emails WHERE address LIKE CONCAT('%@', ?) LIMIT 1"
```

## Initialization statements

On startup, Stalwart Mail Server can execute SQL statements before the first query is executed. This is useful for initializing the database with tables or data. These initialization statements are specified under the `store.<name>.init.execute` section of the configuration file.

For example:

```toml
[store."mysql".init]
execute = [
    "CREATE TABLE IF NOT EXISTS accounts (name VARCHAR(32) PRIMARY KEY, secret VARCHAR(1024), description VARCHAR(1024), type VARCHAR(32) NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT 1)",
    "CREATE TABLE IF NOT EXISTS group_members (name VARCHAR(32) NOT NULL, member_of VARCHAR(32) NOT NULL, PRIMARY KEY (name, member_of))",
    "CREATE TABLE IF NOT EXISTS emails (name VARCHAR(32) NOT NULL, address VARCHAR(128) NOT NULL, type VARCHAR(32), PRIMARY KEY (name, address))"
]
```


