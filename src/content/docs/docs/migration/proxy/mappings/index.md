---
sidebar_position: 1
title: "Overview"
description: "Reference for proxy mappings: the mapping table, identifier normalisation, the lookup cache, master users, and the file, Redis and SQL mapping stores."
---

A mapping associates an account identifier with the destination that holds the account. Mappings are how the proxy knows where each account lives. When a client authenticates, the proxy derives an identifier from its credentials, looks it up in the mapping store, and sends the session to the destination that the lookup returns. An account without a mapping goes to the default destination.

In a migration, this gives a simple progression. Every account starts on the default destination, the existing server, and an account receives a mapping to the new destination when it moves.

The store is selected with the `source` key of `[mapping]`. It is a [file](#file-source), a [Redis](#redis-source) database or a [SQL](#sql-source) database. The first sections of this page apply to all three.

## Mapping table

The general settings are in `[mapping]`, and the connection details of the selected store are in a table of its own:

```toml
[mapping]
source = "file"
normalize = "lowercase"
negative_ttl = "30s"
positive_ttl = "10m"

[mapping.file]
path = "/etc/proxy/mappings.tsv"
```

| Key | Default | Description |
| --- | --- | --- |
| `source` | required | `file`, `redis` or `sql`. |
| `normalize` | `none` | Normalisation of identifiers before lookup: `none` or `lowercase`. |
| `positive_ttl` | `600s` | How long a lookup that found a mapping is cached. |
| `negative_ttl` | `30s` | How long a lookup that found no mapping is cached. |
| `cache_max_entries` | `1000000` | Maximum number of cached lookups. |
| `lookup_timeout` | `5s` | Time limit for one lookup in the store. |

The destination for accounts without a mapping is `routing.default_destination`, set in `[routing]`:

```toml
[routing]
default_destination = "legacy"
```

The store may return a destination that is not declared in the configuration. The proxy then logs a warning and uses the default destination, so that a stale or mistyped entry cannot send traffic to a backend that does not exist.

## Identifier normalisation

Clients present addresses and login names with varying case. With `normalize = "lowercase"`, every identifier is lowercased before it is looked up, and before it is written through the management API. `Alice@Example.com` and `alice@example.com` then resolve to the same entry. With the default, `none`, identifiers are compared exactly as presented. Lowercase normalisation is recommended for accounts identified by address.

The stores treat their own contents differently. The file store lowercases the identifiers in the file as it reads them. The Redis and SQL stores, however, are queried with the normalised identifier, so entries written to them directly must already be lowercase. The user name of HTTP Basic authentication is always lowercased.

The comparison is exact after normalisation. The proxy relates no bare name to an address, so `alice` and `alice@example.org` are separate entries.

## Caching

Lookups are served from an in-memory cache. The store is consulted for an account only on its first connection, and then at most once per cache lifetime. Three kinds of result are cached, each for a different time:

- A lookup that found a mapping is cached for `positive_ttl`, 10 minutes by default.
- A lookup that found no mapping, and therefore uses the default destination, is cached for `negative_ttl`, 30 seconds by default, so that a newly added mapping takes effect quickly.
- A lookup that failed, because the store was unreachable or did not answer within `lookup_timeout`, uses the default destination and is cached for 5 seconds or `negative_ttl`, whichever is shorter, so that the store is asked again soon after it recovers.

`cache_max_entries` bounds the memory used, and the cache evicts entries when the limit is reached.

Caching means that a change in the store is not seen at once. The [management API](/docs/migration/proxy/management/api#mappings) changes mappings and invalidates their cache entries, and the [cache invalidation](/docs/migration/proxy/management/cache) page describes when to clear the cache.

## Master users

Some servers let an administrator open another user's mailbox by appending a separator and the administrator's name to the login. This is known as a master user login. The proxy recognises this form, so that the session is routed by the mailbox being opened rather than by the administrator. `master_user_separators` in `[routing]` lists the separators, by default `["%"]`:

```toml
[routing]
default_destination = "legacy"
master_user_separators = ["%", "*"]
```

For the login `alice@example.com%admin`, the proxy cuts the identifier at the first occurrence of any listed separator, and routes by `alice@example.com`. The full login, including the suffix, is still passed to the backend for authentication. The suffix is also removed from identifiers extracted from HTTP requests.

## File source

The file source reads mappings from a text file. It has no external dependency, and suits deployments where the mappings are maintained by configuration management or generated by a migration script. The file is read into memory at startup and when it is reloaded, so lookups never read the disk.

```toml
[mapping]
source = "file"
normalize = "lowercase"

[mapping.file]
path = "/etc/proxy/mappings.tsv"
```

The only key of `[mapping.file]` is `path`.

### File format

Each line holds an identifier and a destination, separated by white space. Further fields on the line are ignored, and so are empty lines and lines that start with `#`.

Two kinds of line stop the proxy from starting. A line with a single field fails with `mapping file <path>:<line> is not <identifier> <destination>`. A line naming a destination that is not declared fails with `mapping file <path>:<line> references undeclared destination "<name>"`.

```text
# identifier                destination
alice@legacy.example.com    legacy
carol@new.example.com       stalwart
dave@new.example.com        stalwart
```

### Updates

The file can be changed in two ways: through the API, or by editing it.

The file source can be written through the [management API](/docs/migration/proxy/management/api#mappings). When a mapping changes through the API, the proxy writes the whole table to `<path>.tmp` and renames it over the file, so the file on disk is always complete. The rewritten file holds one sorted entry per line, with a tab between identifier and destination. Comments, empty lines and further fields are not kept. The proxy's user needs write access to the file's directory.

The file can also be edited directly, and reloaded without a restart, with `POST /mappings/reload`. A reload reads the file, checks that every destination is declared, and replaces the table in memory only when the file is valid. A file with an undeclared destination is therefore rejected, and the previous table stays in use. When an identifier appears twice, the later line wins.

Mixing the two methods needs care. A change made through the API rewrites the file from the table in memory, so edits made to the file and not yet reloaded are lost. After editing the file, reload it before using the API. A reload does not clear the lookup cache either, so a changed entry takes effect when its cache entry expires or is invalidated with `POST /cache/invalidate`.

## Redis source

The Redis source reads mappings from a Redis database. It suits deployments where mappings change often, or are shared by several proxies. Every proxy reads the same store, and a change made by one is seen by all once their cache entries expire. Each proxy still caches lookups, so Redis is read only on cache misses.

```toml
[mapping]
source = "redis"
normalize = "lowercase"

[mapping.redis]
url = "redis://10.0.3.1:6379"
key_prefix = "route:"
pool_size = 16
```

| Key | Default | Description |
| --- | --- | --- |
| `url` | required | Connection URL of the Redis server. |
| `key_prefix` | `route:` | Prefix added to each identifier to form the key. |
| `pool_size` | `16` | Number of connections kept open to the server. |

The `url` follows the Redis URL syntax, with an optional password and database number. The proxy connects without TLS: a `rediss://` URL is rejected at startup with `invalid redis url`. A Redis server on another host is therefore reached over a protected network.

### Key layout

Each mapping is a string value, under the key formed by `key_prefix` and the normalised identifier. With the default prefix, for example, the destination of `alice@example.com` is read from `route:alice@example.com`. A lookup is a `GET`, and a missing key or an empty value means that the account has no mapping:

```text
GET route:alice@example.com   ->  "legacy"
GET route:carol@example.com   ->  "stalwart"
```

Mappings can be maintained with ordinary Redis commands:

```bash
redis-cli SET route:carol@example.com stalwart
redis-cli DEL route:alice@example.com
```

### Updates

The Redis source can be written through the management API, which uses `SET` and `DEL` on the prefixed keys. A change made in Redis by another tool is seen by a proxy when the cache entry expires, or at once when the entry is invalidated through the management API.

## SQL source

The SQL source reads mappings with a query against a relational database. It suits deployments where the record of which account lives on which backend already exists in a database, such as a provisioning system or a migration tracking table. The proxy then reads that record directly. PostgreSQL, MySQL and SQLite are supported, selected by the URL scheme.

```toml
[mapping]
source = "sql"
normalize = "lowercase"

[mapping.sql]
url = "postgres://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = $1"
pool_size = 16
```

| Key | Default | Description |
| --- | --- | --- |
| `url` | required | Connection URL. The scheme selects the driver: `postgres://`, `mysql://` or `sqlite://`. |
| `query` | required | Lookup query, with the identifier as its only parameter, returning the destination. |
| `pool_size` | `16` | Maximum number of pooled connections. |
| `upsert_query` | unset | Statement that creates or replaces a mapping. Required for writes. |
| `delete_query` | unset | Statement that removes a mapping. Required for writes. |

### Lookup query

The `query` runs with the normalised identifier as its first parameter, and the first column of the first row is the destination. A query that returns no row, or an empty or null value, means that the account has no mapping. The placeholder depends on the database: `$1` for PostgreSQL, and `?` for MySQL and SQLite:

```toml
[mapping.sql]
url = "mysql://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = ?"
```

The query may join tables, or apply any logic that the database supports, as long as it takes one identifier and returns one destination. Its result is cached, so it runs only on cache misses.

### Writable stores

A SQL store is read-only unless both `upsert_query` and `delete_query` are set. The management API refuses writes to a read-only store with `501 Not Implemented` and `mapping store is read-only`.

The upsert statement receives the identifier and the destination as its first and second parameters, and creates or replaces the mapping. The delete statement receives the identifier:

```toml
[mapping.sql]
url = "postgres://proxy:secret@10.0.3.2/maildb"
query = "SELECT destination FROM mailbox_routes WHERE identifier = $1"
upsert_query = "INSERT INTO mailbox_routes (identifier, destination) VALUES ($1, $2) ON CONFLICT (identifier) DO UPDATE SET destination = excluded.destination"
delete_query = "DELETE FROM mailbox_routes WHERE identifier = $1"
```

Leaving the write statements unset is appropriate when the table belongs to another system and the proxy only reads it.

### Destination checks

At startup, the proxy stops when the mapping file cannot be read, or when the Redis or SQL store cannot be reached.

How far the destinations are checked depends on the store. For the file source, every destination in the file is checked against the configuration at startup and on a configuration reload, while `POST /mappings/reload` and `PUT /mappings` check only that the destination is declared. The destinations of the Redis and SQL stores are not known in advance. For them, the check that a destination offers the protocol of a connection happens when the connection resolves to it. A mapping that sends an account to a destination without that protocol therefore fails at connection time for that account, not at startup.
