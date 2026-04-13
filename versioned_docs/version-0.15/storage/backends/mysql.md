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

### Directory queries

When mySQL is used as a [directory](/docs/auth/backend/overview), it is necessary to define the SQL queries that will be used to retrieve authentication data from the database. These queries are specified under the `store.<name>.query` section of the configuration file. For more details on the queries, please refer to the [SQL directory queries](/docs/auth/backend/sql#directory-queries) section.

Example:

```toml
[store."mysql".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = ? AND active = true"
members = "SELECT member_of FROM group_members WHERE name = ?"
recipients = "SELECT name FROM emails WHERE address = ? ORDER BY name ASC"
emails = "SELECT address FROM emails WHERE name = ? ORDER BY type DESC, address ASC"
```

## Example

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

## FTS Limitations

MySQL’s built-in full text search is a lightweight feature designed primarily for simple keyword matching. While it can be sufficient for basic search use cases, it has several inherent limitations that are important to understand when using it as a full text search backend for email.

One significant limitation is that MySQL full text search does not support **multiple languages within the same indexed column**. A full text index is tied to a single parser and language configuration, which means that messages containing mixed languages cannot be tokenized or ranked correctly. In mail environments where users regularly exchange messages in different languages, this can lead to inconsistent or incomplete search results.

MySQL full text search also does **not support stemming**. Words are indexed and matched in their exact forms, so different grammatical variants of the same word (such as singular versus plural or different verb tenses) are treated as unrelated terms. As a result, searches are less tolerant of natural language variation and may miss relevant messages unless users search for the exact word forms present in the message.

Another important constraint is that **words shorter than three characters are not indexed** by default. Common short words, abbreviations, and identifiers—many of which are common in email content—will therefore not be searchable at all. This can be particularly noticeable when searching for short names, acronyms, or codes.

Taken together, these limitations can significantly affect search quality and recall. If accurate, language-aware, and user-friendly search behavior is a priority for your deployment, it is strongly recommended to consider using a different [full text search backend](/docs/storage/fts) that provides better linguistic support and more robust indexing capabilities.
