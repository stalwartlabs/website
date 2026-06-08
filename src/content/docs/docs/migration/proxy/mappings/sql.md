---
sidebar_position: 4
title: "SQL source"
---

The SQL source resolves mappings by running a query against a relational database. It is the right choice when the authoritative record of which account lives on which backend already exists in a database, for example a provisioning system or a migration-tracking table, since the proxy can read that table directly rather than maintaining a separate copy. PostgreSQL, MySQL and SQLite are supported, selected by the connection URL scheme.

```toml
[mapping]
source = "sql"
normalize = "lowercase"

[mapping.sql]
url = "postgres://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = $1"
pool_size = 16
```

The keys under `[mapping.sql]` are:

| Key | Default | Description |
| --- | --- | --- |
| `url` | required | Database connection URL. The scheme selects the driver: `postgres://`, `mysql://` or `sqlite://`. |
| `query` | required | Lookup query returning a single destination, with the identifier supplied as the first bind parameter. |
| `pool_size` | `16` | Maximum number of pooled database connections. |
| `upsert_query` | unset | Statement used to create or replace a mapping. Required for writes. |
| `delete_query` | unset | Statement used to remove a mapping. Required for writes. |

## Lookup query

The `query` is executed with the normalized identifier bound as the first parameter and must return a single column holding the destination name. The proxy reads the first row's first column; a query that returns no rows, or an empty value, is treated as the absence of a mapping and routes to the default destination. The exact parameter placeholder depends on the database (`$1` for PostgreSQL, `?` for MySQL and SQLite):

```toml
[mapping.sql]
url = "mysql://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = ?"
```

The query may join across tables or apply any logic the database supports, as long as it accepts a single identifier parameter and returns a single destination value. Because the result is cached, the query runs only on cache misses, so a moderately expensive lookup is acceptable.

## Writable stores

A SQL store is read-only unless both `upsert_query` and `delete_query` are configured; when either is missing, the [management API](/docs/migration/proxy/management/api) reports the store as read-only and refuses write operations. The upsert statement receives the identifier as its first bind parameter and the destination as its second, and should insert a new mapping or replace an existing one. The delete statement receives the identifier as its only parameter.

```toml
[mapping.sql]
url = "postgres://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = $1"
upsert_query = "INSERT INTO mailbox_routes (identifier, destination) VALUES ($1, $2) ON CONFLICT (identifier) DO UPDATE SET destination = excluded.destination"
delete_query = "DELETE FROM mailbox_routes WHERE identifier = $1"
```

Leaving the write statements unset is appropriate when the routing table is owned by an external system and the proxy should only read from it.

## Validation timing

For the file source, every mapped destination is validated against the configuration at startup. For the dynamic stores, including SQL, the set of mapped destinations is not known in advance, so the check that a mapped destination actually supports the protocol a listener serves is performed when a connection resolves to that destination rather than at boot. A mapping that points an account at a destination missing the required protocol therefore surfaces as a connection-time error for that account, not as a startup failure.
