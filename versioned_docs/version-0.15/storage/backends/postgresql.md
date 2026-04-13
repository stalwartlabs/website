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

## FTS Limitations

PostgreSQL provides a built-in full text search engine based on `tsvector` and `tsquery`. While this is a reliable and well-integrated solution for many applications, it has important [limitations](https://www.postgresql.org/docs/current/textsearch-limitations.html) that are particularly relevant when indexing email content.

The most significant constraint is that the total size of a `tsvector`, including both lexemes and positional information, must not exceed **1 megabyte**. Because positional data is stored alongside the indexed terms, the amount of actual text that can be indexed is substantially less than 1 MB, especially for natural language content with many tokens and repeated words.

For email workloads, this limitation directly affects message bodies and attachments, which can easily exceed the effective size limit when indexed as full text. To ensure indexing remains reliable and does not exceed PostgreSQL’s hard limits, Stalwart truncates content before it is converted into a `tsvector`. Message bodies are truncated to **650 KB**, and attachments are also truncated to **650 KB total**, combined across all attachments in a message. In practical terms, only the first 650 KB of the message body is indexed, and only the first 650 KB of all attachments combined are indexed. Any content beyond these limits is not searchable.

This truncation is a deliberate and conservative choice that leaves sufficient room for lexeme positions and avoids indexing failures caused by exceeding PostgreSQL’s maximum `tsvector` size. For most typical email messages, this behavior is not noticeable and does not materially affect search quality.

However, in environments where messages frequently contain very large bodies or where full search coverage of large attachments is required, this limitation may be problematic. In such cases, administrators should consider using a different [full text search backend](/docs/storage/fts) that does not impose strict per-document size limits.

These constraints are inherent to PostgreSQL’s full text search implementation and should be taken into account when deciding whether PostgreSQL is an appropriate full text search backend for email workloads.
