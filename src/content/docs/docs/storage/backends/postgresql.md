---
sidebar_position: 3
title: "PostgreSQL"
description: "Use PostgreSQL as the data store, blob store or search store: connection settings, database permissions, read replicas and full-text search limitations."
---

[PostgreSQL](https://www.postgresql.org/) is a database server, so unlike the embedded databases it can be shared by several Stalwart nodes. It can serve as the data store of a single node, or of a cluster in which all nodes connect to the same database. The same database can also hold the blob store and the search store.

A single PostgreSQL database can be enough for the whole server. When the blob store and the search store are set to `Default`, the PostgreSQL data store takes over both roles: it holds the message contents as well, and it builds the search index with PostgreSQL's own full-text search.

## Configuration

A PostgreSQL store is configured with the `PostgreSql` variant of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The [BlobStore](/docs/ref/object/blob-store) and [SearchStore](/docs/ref/object/search-store) objects have `PostgreSql` variants with the same fields, so the settings below apply to all three.

To connect, Stalwart needs the address of the database server, the name of the database and the credentials of a role. The defaults expect a database named <!-- default:DataStore.PostgreSql.database -->`stalwart`<!-- /default --> on port <!-- default:DataStore.PostgreSql.port -->5432<!-- /default -->, reached as the role <!-- default:DataStore.PostgreSql.authUsername -->`stalwart`<!-- /default -->. A server prepared that way requires only [`host`](/docs/ref/object/data-store#host) and the password in [`authSecret`](/docs/ref/object/data-store#authsecret). When the database is set up differently, [`port`](/docs/ref/object/data-store#port), [`database`](/docs/ref/object/data-store#database) and [`authUsername`](/docs/ref/object/data-store#authusername) override these defaults. The password can be given as a value, read from an environment variable or read from a file.

Connections are unencrypted unless [`useTls`](/docs/ref/object/data-store#usetls) is enabled. With TLS, the server certificate must be valid, unless [`allowInvalidCerts`](/docs/ref/object/data-store#allowinvalidcerts) is enabled to accept an invalid one. A connection attempt fails when it does not complete within [`connectTimeout`](/docs/ref/object/data-store#connecttimeout). Any additional connection options for the server are passed in [`options`](/docs/ref/object/data-store#options).

The following data store connects to a PostgreSQL server over TLS, with the password read from a file:

```json
{
  "@type": "PostgreSql",
  "host": "db.example.com",
  "database": "stalwart",
  "authUsername": "stalwart",
  "authSecret": {"@type": "File", "filePath": "/run/secrets/pg-password"},
  "useTls": true
}
```

### Connection pool

Each node keeps a pool of connections to the database, and [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections) limits its size. When the field is unset, the limit is 4 connections per processor core, at least 16 and at most 32.

In a cluster, every node opens its own pool. The limits of all nodes added together, plus the connections of any other clients, must stay below the server's `max_connections`. [Tuning the data store](/docs/performance/data-store) describes how to size the pool against the load.

Stalwart can check a connection from the pool before reusing it. [`poolRecyclingMethod`](/docs/ref/object/data-store#poolrecyclingmethod) selects one of three behaviours. With `fast`, no check is made. With `verified`, Stalwart runs a test query, and with `clean`, it also resets the session state. Unless the field is changed, the method is <!-- default:DataStore.PostgreSql.poolRecyclingMethod -->`fast`<!-- /default -->, so connections are reused without a check.

## Database permissions

Stalwart creates its tables itself, so the role it connects as must be allowed to create them. At every start, Stalwart runs `CREATE TABLE IF NOT EXISTS` for each table of the data store. If these statements fail, the server does not start, and it reports `Failed to create tables: <error>`.

The search store adds indexes. When PostgreSQL is also the search store, which includes a search store set to `Default`, Stalwart runs `CREATE TABLE IF NOT EXISTS` for the search tables and `CREATE INDEX IF NOT EXISTS` for their indexes each time the configuration is loaded. Stalwart does not create extensions or sequences. The role therefore needs the following privileges:

- `CONNECT` on the database.
- `CREATE` on the schema in which the tables are created, which is the first schema of the role's search path, usually `public`.
- Ownership of the search tables, when PostgreSQL is the search store.

The `CREATE` privilege needs attention on recent PostgreSQL versions. Since PostgreSQL 15, ordinary roles no longer have `CREATE` on the `public` schema by default. On these versions the privilege has to be granted, or the role made the owner of the database or schema.

The ownership requirement comes from the indexes. PostgreSQL allows only the owner of a table to create an index on it, even an index that already exists. The data store tables have no indexes besides their primary keys, so for the data store alone, a role that holds only `SELECT`, `INSERT`, `UPDATE` and `DELETE` on data tables created by another role is sufficient. When PostgreSQL is the search store, however, the same role cannot create the search indexes, and the configuration loads with the warning `Failed to create search indexes: <error>`.

A role acquires ownership of the tables by creating them. The simplest arrangement is therefore a database owned by the Stalwart role, so that the role creates and owns every table:

```sql
CREATE ROLE stalwart LOGIN PASSWORD '<password>';
CREATE DATABASE stalwart OWNER stalwart;
```

## Read replicas

:::tip[Enterprise feature]
Read replicas are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A PostgreSQL store can distribute its read queries across one or more replicas of the database, while writes go to the primary. Replication itself is configured in PostgreSQL. In Stalwart, each entry of [`readReplicas`](/docs/ref/object/data-store#readreplicas) describes how to reach one replica, with its own `host`, `port`, `database`, `authUsername`, `authSecret` and `options`. Every other setting, including the pool size, is taken from the primary.

Stalwart sends reads to the replicas in turn, and sends writes and search queries to the primary. It does not track replication lag, so replicas should use synchronous or low-lag replication, as explained in [SQL read replicas](/docs/storage/backends/composite#sql-read-replicas).

## Full-text search limitations

When PostgreSQL is the search store, the index uses PostgreSQL's full-text search, with `tsvector` columns and GIN indexes. This brings two limitations.

The first concerns size. PostgreSQL limits a `tsvector` to 1 MB, including the word positions. Stalwart therefore indexes at most 250,000 characters of each field, such as the body or the attachments of a message. In a long body or a large attachment, the text beyond that point is not searchable.

The second concerns languages. Words are reduced to their stem with PostgreSQL's text search configurations, one for each language. Stalwart maps 26 languages to PostgreSQL configurations, and uses the one for the language it detects, provided that configuration is installed in PostgreSQL. Text in any other language, or in a language whose configuration is missing, is indexed with the `simple` configuration, which does not stem words.

When these limits matter, for example where large attachments must be fully searchable, the [search store](/docs/storage/fts) can be ElasticSearch or Meilisearch, while the data store stays on PostgreSQL.

## Authentication directory

A PostgreSQL database can also hold the accounts that Stalwart authenticates, through an SQL [directory](/docs/ref/object/directory). That use is separate from the data store, and it is described in [SQL directory](/docs/auth/backend/sql).
