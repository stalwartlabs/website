---
sidebar_position: 4
title: "MySQL / MariaDB"
description: "Use MySQL or MariaDB as the data store, blob store or search store: connection settings, connection pool sizing, read replicas and full-text search limitations."
---

[MySQL](https://www.mysql.com/) and [MariaDB](https://mariadb.org/) are database servers, so unlike the embedded databases they can be shared by several Stalwart nodes. They can serve as the data store of a single node, or of a cluster in which all nodes connect to the same database. They can also hold the blob store and the search store. Both databases are supported by the same variant.

A single MySQL database can be enough for the whole server. With the blob and search stores set to `Default`, a MySQL data store holds the message contents as well, and uses MySQL's own full-text indexes for search.

## Configuration

The backend is selected with the `MySql` variant of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The same fields apply to the `MySql` variants of the [BlobStore](/docs/ref/object/blob-store) and [SearchStore](/docs/ref/object/search-store) objects.

Stalwart creates its tables and indexes itself, at startup. The database user therefore needs privileges to create tables and indexes in the database, in addition to reading and writing them.

To connect, Stalwart needs three things. The address of the database server goes in [`host`](/docs/ref/object/data-store#host) and [`port`](/docs/ref/object/data-store#port), the name of the database in [`database`](/docs/ref/object/data-store#database), and the credentials in [`authUsername`](/docs/ref/object/data-store#authusername) and [`authSecret`](/docs/ref/object/data-store#authsecret). The defaults expect a database named <!-- default:DataStore.MySql.database -->`stalwart`<!-- /default -->, reached as the user <!-- default:DataStore.MySql.authUsername -->`stalwart`<!-- /default -->. Connections are unencrypted unless [`useTls`](/docs/ref/object/data-store#usetls) is enabled, and [`allowInvalidCerts`](/docs/ref/object/data-store#allowinvalidcerts) accepts an invalid server certificate.

Two further fields adapt the session to the MySQL server. [`idleTimeout`](/docs/ref/object/data-store#idletimeout) is the time an idle connection may stay open before the server closes it, and Stalwart sets the session's `wait_timeout` to this value. [`maxAllowedPacket`](/docs/ref/object/data-store#maxallowedpacket) is the largest packet sent to or received from the server, in bytes. When message contents are stored in the database, this value must be large enough for the largest message.

The following data store connects to a MariaDB server, with the password read from an environment variable:

```json
{
  "@type": "MySql",
  "host": "db.example.com",
  "database": "stalwart",
  "authUsername": "stalwart",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "MYSQL_PASSWORD"}
}
```

### Connection pool

Each node keeps a pool of open connections to the database. [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections) limits the connections each node opens, and when it is unset the limit is 4 per processor core, between 16 and 32. [`poolMinConnections`](/docs/ref/object/data-store#poolminconnections) is the number of connections kept open while the node is idle.

The pool size interacts with a MySQL limit on prepared statements. Each connection caches up to 64 prepared statements, and MySQL limits the prepared statements of all its clients together through the global `max_prepared_stmt_count` variable. At startup, Stalwart multiplies `poolMaxConnections` by 64 and compares the result with this variable. When the result is higher, it logs a `registry.build-warning` event with the reason `Prepared statements cached by this node can exceed the server's max_prepared_stmt_count`.

The warning has two remedies: raise `max_prepared_stmt_count` on the MySQL server, or lower `poolMaxConnections`. In a cluster, every node adds its own pool, so `max_prepared_stmt_count` has to cover the pools of all nodes together, plus the connections of any other clients. [Tuning the data store](/docs/performance/data-store) discusses pool sizing.

## Read replicas

:::tip[Enterprise feature]
Read replicas are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Read queries can be distributed across one or more replicas of the database, while writes go to the primary. Replication itself is configured in MySQL or MariaDB, for example with asynchronous replication or Galera. In Stalwart, the replicas are listed in [`readReplicas`](/docs/ref/object/data-store#readreplicas), each with its own `host`, `port`, `database`, `authUsername` and `authSecret`. Every other setting, including the pool size, is taken from the primary.

Stalwart sends reads to the replicas in turn, and sends writes and search queries to the primary. It does not track replication lag, so replicas should use synchronous or low-lag replication, as explained in [SQL read replicas](/docs/storage/backends/composite#sql-read-replicas).

## Full-text search limitations

When MySQL is the search store, the index uses InnoDB `FULLTEXT` indexes. These have three limitations that affect mail search.

The first is that there is no stemming. Words are matched only in the form in which they appear, so a search for "report" does not find "reports".

The second is that there is no language handling. A `FULLTEXT` index applies one parser to all text. Messages in languages that do not separate words with spaces, such as Chinese and Japanese, are therefore not tokenised correctly.

The third is that short words are not indexed. With the default `innodb_ft_min_token_size` of 3, words of one or two characters cannot be found, and many abbreviations and codes are that short.

When these limitations matter, the [search store](/docs/storage/fts) can be ElasticSearch or Meilisearch, while the data store stays on MySQL.

## Authentication directory

A MySQL database can also hold the accounts that Stalwart authenticates, through an SQL [directory](/docs/ref/object/directory). That use is separate from the data store, and it is described in [SQL directory](/docs/auth/backend/sql).
