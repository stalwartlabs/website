---
sidebar_position: 1
title: "Overview"
description: "Which backends each Stalwart store supports, which are included in the official binaries, and which can be shared by the nodes of a cluster."
---

Each of Stalwart's [stores](/docs/storage/) can use one of several backends, the database or storage service that actually holds the data. Two questions mainly decide the choice. The first is whether the deployment is a single node or a cluster, because some backends cannot be shared between nodes. The second is which services are already operated alongside the deployment. The following table shows the backends available for each store:

| Backend | Data store | Blob store | Search store | In-memory store | Official binary | Cluster |
|---|---|---|---|---|---|---|
| [RocksDB](/docs/storage/backends/rocksdb) | :white_check_mark: | `Default` | `Default` | | :white_check_mark: | No |
| [SQLite](/docs/storage/backends/sqlite) | :white_check_mark: | `Default` | `Default` | | :white_check_mark: | No |
| [PostgreSQL](/docs/storage/backends/postgresql) | :white_check_mark: | :white_check_mark: | :white_check_mark: | | :white_check_mark: | Yes |
| [MySQL, MariaDB](/docs/storage/backends/mysql) | :white_check_mark: | :white_check_mark: | :white_check_mark: | | :white_check_mark: | Yes |
| [FoundationDB](/docs/storage/backends/foundationdb) | :white_check_mark: | :white_check_mark: | :white_check_mark: | | Separate binary | Yes |
| [S3-compatible](/docs/storage/backends/s3) | | :white_check_mark: | | | :white_check_mark: | Yes |
| [Azure Blob Storage](/docs/storage/backends/azure) | | :white_check_mark: | | | :white_check_mark: | Yes |
| [Filesystem](/docs/storage/backends/filesystem) | | :white_check_mark: | | | :white_check_mark: | Shared file system only |
| [ElasticSearch](/docs/storage/backends/elasticsearch) | | | :white_check_mark: | | :white_check_mark: | Yes |
| [Meilisearch](/docs/storage/backends/meilisearch) | | | :white_check_mark: | | :white_check_mark: | Yes |
| [Redis, Valkey](/docs/storage/backends/redis) | | | | :white_check_mark: | :white_check_mark: | Yes |
| Local (in process) | | | | `Default` | :white_check_mark: | No |

The value `Default` in the blob and search columns needs a word of explanation. It means that the store's `Default` variant keeps its data in the data store. RocksDB and SQLite are therefore not offered as separate blob or search backends. When one of them is the data store, however, it holds the blobs and Stalwart's built-in search index. On a PostgreSQL or MySQL data store, the search store's `Default` variant uses the database's own full-text search instead, as described in [Search store](/docs/storage/fts).

The in-memory store's `Default` variant is different again: it is a local store inside the server process, suitable only for a single node. The Redis row covers standalone Redis or Valkey, Redis Cluster and Redis Sentinel. Several backends of the same kind can also be combined into [composite stores](/docs/storage/backends/composite) (Enterprise).

## Official binaries

The official binaries and Docker images include every backend in the table except FoundationDB. FoundationDB requires the separate FoundationDB build of Stalwart, and the FoundationDB client library on the host. Two cluster coordinators are also missing from the official builds: [Zenoh](/docs/cluster/coordination/peer-to-peer) and [Kafka](/docs/cluster/coordination/kafka) require [compiling Stalwart](/docs/development/compile) with the corresponding feature.

## Clusters

The Cluster column shows whether the nodes of a cluster can share the backend. A cluster needs a shared data store, blob store, search store and in-memory store. RocksDB, SQLite and the local in-memory store cannot be shared, so they are limited to single nodes. The [cluster overview](/docs/cluster/) gives the full list of requirements.

## Configuration objects

Each store is configured through its own object: [DataStore](/docs/ref/object/data-store), [BlobStore](/docs/ref/object/blob-store), [SearchStore](/docs/ref/object/search-store) and [InMemoryStore](/docs/ref/object/in-memory-store). The `@type` of each object selects the backend.

:::caution
Changing a store's backend after data has been written does not move the data, and the server no longer finds what was stored in the previous backend. To change the data store or the blob store of a server in use, export the data and import it into the new backend as described in [Database migration](/docs/management/maintenance/migration). The search index does not need to be migrated: after a change of search store, [rebuild the index](/docs/storage/indexing#rebuilding-the-index). The in-memory store holds only short-lived data and can be changed at any time, because its entries are rebuilt as traffic arrives.
:::
