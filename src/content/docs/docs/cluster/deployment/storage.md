---
sidebar_position: 3
title: "Storage"
description: "The storage backends a Stalwart cluster can share, the requirements of each store in a cluster, and the limits of each option."
---

All the nodes of a cluster read and write the same data. Every store must therefore be reachable from every node, and it must support concurrent access by all of them. This rules out some of the backends that a single server can use. The following table summarises the options, and the sections below explain the choice for each store:

| Store | Required in a cluster | Shared options | Not usable in a cluster |
|---|---|---|---|
| [Data store](/docs/storage/data) | Yes | PostgreSQL, MySQL or MariaDB, FoundationDB | RocksDB, SQLite |
| [Blob store](/docs/storage/blob) | Yes | S3-compatible, Azure, PostgreSQL, MySQL, FoundationDB, or the shared data store (`Default`) | FileSystem, unless on a shared file system |
| [Search store](/docs/storage/fts) | Yes | The shared data store (`Default`), PostgreSQL, MySQL, FoundationDB, ElasticSearch, Meilisearch | |
| [In-memory store](/docs/storage/in-memory) | Yes | Redis, Valkey, Redis Cluster, Redis Sentinel, Sharded (Enterprise) | The local default |
| [Cache swap tier](/docs/storage/cache-swap) | No | Redis, the blob store | LocalFile is per node |

One storage setting is not shared. Every node must carry the same DataStore definition in its own `config.json`, because that is the only storage setting kept per node. All the other settings are stored once, in the shared data store.

## Data store

The data store holds every structured record of the server and its configuration. When it is unavailable, the whole cluster is, so its availability is that of the cluster.

[PostgreSQL](/docs/storage/backends/postgresql) and [MySQL or MariaDB](/docs/storage/backends/mysql) are widely operated, and they suit most clusters. Their availability depends on the replication and failover arrangement chosen for the database, such as a PostgreSQL primary with a standby and a failover manager, or a Galera cluster. Read queries can also be distributed across [read replicas](/docs/storage/backends/composite#sql-read-replicas), which is an Enterprise feature.

[FoundationDB](/docs/storage/backends/foundationdb) takes a different approach. It is a distributed transactional database that replicates its data itself and scales by adding servers. It suits large clusters, at the cost of operating a FoundationDB cluster and of using the separate FoundationDB build of Stalwart.

RocksDB and SQLite are embedded databases that only one process can open, so they cannot be shared.

## Blob store

The blob store holds message contents, files and Sieve scripts, and it typically accounts for most of the stored data.

S3-compatible object storage is the common choice. It is available from [AWS S3](/docs/storage/backends/s3) and other cloud services, or from a self-hosted service such as MinIO, Ceph or Garage. [Azure Blob Storage](/docs/storage/backends/azure) is supported through its native API. The `Default` variant is also possible: blobs are then kept in the shared data store, which avoids a separate service at the cost of a larger database.

Redundancy for blobs comes from the storage service, not from Stalwart. Stalwart writes each blob to one store, and it does not write blobs to several stores at once. Replication across sites therefore has to be provided by the service, for example by bucket replication. A [sharded blob store](/docs/storage/backends/composite#sharded-blob-store) (Enterprise) distributes blobs across several stores, but it does so for capacity, not for redundancy.

## Search store

With the `Default` variant, the search index is kept in the shared data store. On PostgreSQL and MySQL it uses the database's own full-text search, and on FoundationDB it uses Stalwart's built-in index. Alternatively, [ElasticSearch](/docs/storage/backends/elasticsearch) and [Meilisearch](/docs/storage/backends/meilisearch) move the indexing and search load to a separate service. [Search store](/docs/storage/fts#choosing-a-search-store) compares the limitations of each option.

Indexing is performed by the nodes with the `searchIndexing` [role](/docs/cluster/configuration/roles) task, as described in [Search indexing](/docs/storage/indexing).

## In-memory store

The in-memory store holds rate-limit counters, greylisting entries, locks and short-lived tokens, and all the nodes must share them. A lock taken by one node must be visible to the others, and a rate limit must count the requests made to every node.

A cluster therefore requires a Redis-based in-memory store: [Redis or Valkey](/docs/storage/backends/redis), Redis Cluster, Redis Sentinel, or a [sharded](/docs/storage/backends/composite#sharded-in-memory-store) store of Redis deployments (Enterprise). The local in-process store that a single node uses cannot be shared, and the registry refuses it when a coordinator is configured. For the same reason, the in-memory store has to be configured before the coordinator, as described in [Coordination mechanism](/docs/cluster/configuration/coordination#order-of-configuration). [Redis](/docs/storage/backends/redis#memory-limit-and-eviction-policy) describes the memory limit and the eviction policy that Redis should use.

TLS client certificates are not supported for Redis connections. Authentication to Redis therefore uses a password, or an access control list user.

## Cache swap tier

[Cache swapping](/docs/storage/cache-swap) is optional, and in a cluster its value depends on where the snapshots are kept. A shared tier, in Redis or in the blob store, allows any node to load the snapshot of an account that another node served before. This avoids rebuilding the cache after a rolling restart or a change of node. The `LocalFile` tier, by contrast, is per node, and it helps only when a node serves the same accounts again.
