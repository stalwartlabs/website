---
sidebar_position: 1
---

# Overview

Directories are a critical component of the system, serving as the central repository for user account information. These directories contain essential details such as user accounts, passwords, email addresses, and other user-specific settings. The primary functions of directories include:

- **Authentication**: They are used to authenticate users, ensuring that only authorized individuals can access their email accounts.
- **Email Address and Domain Validation**: They check whether an email address or domain is valid and exists within the system.
- **Account Information**: They store account details such as account name, disk quotas and group memberships.

## Directory types

Stalwart Mail Server offers the possibility to use either an internal directory or connect to an external directory service. The choice between these options depends on the specific needs and existing infrastructure of the organization. 

### Internal Directory

When the internal directory is used, Stalwart Mail Server manages all user-related data within its own system. This option is suitable for environments where Stalwart is the primary system for email management and no external user management systems are in place. In this setup, all account management tasks, such as creating new user accounts, updating passwords, and setting quotas, are performed directly within Stalwart Mail Server. This offers a straightforward and integrated approach to user management.

### External Directory

Stalwart can also be configured to integrate with external directories, such as LDAP (Lightweight Directory Access Protocol) servers or SQL databases. This option is ideal for organizations that already have an established user management system and prefer to maintain a central directory for all services, including email. When an external directory is utilized, all user account management must be performed within that external system. Stalwart Mail Server will rely on this external directory for authentication and user information but will not have the ability to directly modify user details. It is important to ensure that the external directory is properly maintained and synchronized to prevent access issues or inconsistencies in user data.

## Configuration

Directory servers are configured under the `directory.<name>` section of the configuration file. Each directory requires the `type` attribute that specifies the type of directory server. Supported types are:

- `internal`: Internal directory
- `sql`: SQL database
- `ldap`: LDAP server
- `memory`: In-memory static directory (for small deployments or testing purposes)

Additionally, when running the standalone SMTP package, it is also possible to perform authentication against a remote SMTP, LMTP or IMAP server:

- `smtp`: Remote SMTP server
- `lmtp`: Remote LMTP server
- `imap`: Remote IMAP server

For example:

```toml
[directory."default"]
type = "internal"
store = "rocksdb"
```

### Connection pool

Some external directories such as LDAP, SMTP, LMTP and IMAP have their own connection pool. This connection pool is used to reduce the number of connections made to the directory server and to improve performance. The connection pool is configured through the following parameters located under the `directory.<name>.pool` key in the configuration file. It accepts the following parameters:

- `max-connections`: This setting defines the maximum number of connections that can be maintained simultaneously in the connection pool. 
- `timeout.create`: Defines the maximum amount of time that the connection pool will wait for a new connection to be created.
- `timeout.wait`: Defines the maximum amount of time that the connection pool will wait for a connection to become available.
- `timeout.recycle`: Defines the maximum amount of time that the connection pool manager will wait for a connection to be recycled.

For example:

```toml
[directory."imap".pool]
max-connections = 10

[directory."imap".pool.timeout]
create = "30s"
wait = "30s"
recycle = "30s"
```

### Lookup cache

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

### Default Directory

The default directory to authenticate [JMAP](/docs/jmap/overview), [IMAP](/docs/imap/overview), [ManageSieve](/docs/imap/managesieve) and HTTP API requests against can be configured using the `directory.default` configuration attribute.

For example, to use the `sql` directory as the default directory:

```toml
[storage]
directory = "sql"
```
