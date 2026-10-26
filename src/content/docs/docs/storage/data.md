---
sidebar_position: 2
title: "Data store"
description: "The data store holds every structured record of the server. Choosing its backend, where its setting is kept, and what changing it involves."
---

The data store is the database at the centre of Stalwart. It holds every structured record the server uses, and the rest of the server is built on top of it. The choice of its backend also decides whether the server can run as a cluster.

The records in the data store fall into a few groups. Accounts, domains and roles describe who uses the server. Mailboxes, message metadata, flags and threads describe the mail, and calendars, events, address books and contacts describe the collaboration data. The change history lets clients synchronise only what has changed since their last visit. The mail queue and the server's configuration objects complete the list.

Message contents, attachments, Sieve scripts and file contents are not structured records. They are written to the [blob store](/docs/storage/blob) instead, unless the blob store is set to keep them in the data store.

Because the configuration itself lives in the data store, the server must know where the data store is before it can read any other setting. Every other part of the server depends on it, so its availability and performance determine those of the whole server.

## Backends

The backend is selected by the `@type` of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->):

| `@type` | Backend | Suited to |
|---|---|---|
| `RocksDb` | [RocksDB](/docs/storage/backends/rocksdb), an embedded key-value database | Single nodes; the default |
| `Sqlite` | [SQLite](/docs/storage/backends/sqlite), an embedded SQL database in one file | Small single nodes |
| `PostgreSql` | [PostgreSQL](/docs/storage/backends/postgresql) | Single nodes and clusters |
| `MySql` | [MySQL or MariaDB](/docs/storage/backends/mysql) | Single nodes and clusters |
| `FoundationDb` | [FoundationDB](/docs/storage/backends/foundationdb), a distributed transactional key-value store | Large clusters |

The first decision is between an embedded database and a database server. RocksDB and SQLite are embedded: the Stalwart process opens the database files itself, on the local disk, and needs no other service. For the same reason, several nodes cannot share them. A [cluster](/docs/cluster/) therefore requires PostgreSQL, MySQL or FoundationDB, whose data every node can reach over the network.

Each variant carries its own fields. The embedded databases need a `path` to their files, while the SQL servers need a `host`, a `database`, an `authUsername` and an `authSecret`. The backend pages describe these fields, and the [DataStore reference](/docs/ref/object/data-store) lists every one of them.

## DataStore and config.json

The DataStore object is the only configuration object that is not kept in the data store, since the server needs it to find the data store in the first place. It is written instead to the node's `config.json` file, which the server reads at startup ([Configuration](/docs/configuration/)).

The object can be edited in the WebUI, the CLI or the JMAP API like any other object, but a change to it behaves differently in three ways. The first concerns clusters. A change is written only to the `config.json` of the node that served the request, and every node of a cluster must carry the same DataStore definition, so the change has to be made on each node.

The second concerns timing: a change takes effect only when the node restarts.

The third concerns the data. A change selects where the server looks for its data, and it does not copy any data. A node pointed at an empty database therefore starts without any of the existing accounts, messages or settings. Moving existing data to another backend is a separate task, described in [Database migration](/docs/management/maintenance/migration).

## Maintenance and tuning

Expired records are purged from the data store every day, according to the schedules of the [DataRetention](/docs/ref/object/data-retention) object. [Data retention and reclaiming disk space](/docs/storage/maintenance) describes the purge, together with the tasks that each backend requires of the operator. Connection pools, cache sizes and the other performance settings of each backend are discussed in [Tuning the data store](/docs/performance/data-store).
