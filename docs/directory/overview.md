---
sidebar_position: 1
---

# Overview

Stalwart Mail Server doesn't store any account details or login credentials but rather defers this responsibility to a directory server.
This server is used for user authentication and the retrieval of account details, such as full names and disk quotas. 
Directories are commonly SQL databases such as MySQL, PostgreSQL and SQLite, or LDAP servers such as OpenLDAP or Active Directory.

## Directory types

Directory servers are configured under the `directory.<name>` section of the configuration file. Each directory requires the `address` attribute that specifies the address of the directory server and the `type` attribute that specifies the type of directory server. Supported types are:

- `sql`: SQL database
- `ldap`: LDAP server
- `memory`: In-memory static directory (for small deployments or testing purposes)

Additionally, when running the standalone SMTP package, it is also possible to perform authentication against a remote SMTP, LMTP or IMAP server:

- `smtp`: Remote SMTP server
- `lmtp`: Remote LMTP server
- `imap`: Remote IMAP server

For example:

```toml
[directory."my-sql"]
type = "sql"
address = "mysql://localhost:3306"
```

## Connection pool

Stalwart Mail Server maintains a connection pool for each directory server. The connection pool is used to reduce the number of connections made to the directory server and to improve performance. The connection pool is configured through the following parameters located under the `directory.<name>.pool` key in the configuration file. It accepts the following parameters:

- `max-connections`: This setting defines the maximum number of connections that can be maintained simultaneously in the connection pool. 
- `min-connections`: This setting determines the minimum number of connections that should always be kept alive in the pool. If this value is set to 0, it means there's no need to keep any connections open when they are not in use.
- `max-lifetime`: This parameter establishes the maximum lifetime for a connection. After a connection has been open for this duration, it will be closed and removed from the pool. This setting can prevent potential issues that might occur with long-lived connections in certain environments.
- `idle-timeout`: This setting controls the maximum amount of time that a connection can stay idle (i.e., open but not used) in the pool. If a connection is idle for more than this duration, it will be closed and removed from the pool.
- `connect-timeout`: This parameter defines the maximum amount of time the system should wait while trying to establish a new connection to the SQL directory server. If a connection cannot be established within this timeframe, the attempt will be aborted.

For example:

```toml
[directory."sql".pool]
max-connections = 10
min-connections = 0
max-lifetime = "30m"
idle-timeout = "10m"
connect-timeout = "30s"
```

## Lookup cache

In order to reduce the number of requests made to a directory, it is possible to enable caching for certain directory lookups. Stalwart Mail Server uses a Least Recently Used (LRU) caching strategy and maintains separate positive and negative caches for each query. Successful lookups are stored in the positive cache while failed or non-existent lookups are stored in the negative cache. The directory cache is configured through the following parameters located under the `directory.<name>.cache` key in the configuration file:

- `entries`: Specifies the maximum number of entries that the cache can hold. For example, a value of `500` means that the cache will store the results of the most recent `500` directory lookups.
- `ttl.positive`: Defines how long entries in the positive cache will be kept before they are considered stale and are refreshed. For example, a value of `1h` means that if a directory lookup returns a positive result (i.e., the requested user or account information is found), that result will be kept in the cache for 1 hour. 
- `ttl.negative`: Defines how long entries in the negative cache will be kept before they are considered stale and are refreshed. For example, a value of `10m` means that if a directory lookup returns a negative result (i.e., the requested user or account information is not found), that result will be kept in the cache for 10 minutes. These settings help balance cache efficiency with data freshness.

For example:

```toml
[directory."sql".cache]
entries = 500
ttl = {positive = '1h', negative = '10m'}
```
