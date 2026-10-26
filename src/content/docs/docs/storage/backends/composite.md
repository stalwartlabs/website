---
sidebar_position: 20
title: "Composite stores"
description: "Distribute the in-memory store or the blob store across several backends, and send database reads to replicas."
---

A single backend has limits: one Redis server can hold only so many keys, and one database primary can answer only so many reads. Composite stores combine several backends of the same kind into one store, so that the load or the capacity can be spread beyond what a single backend provides. Three composites are available:

| Composite | Combines | Configured on |
|---|---|---|
| [Sharded in-memory store](#sharded-in-memory-store) | Several Redis, Redis Cluster or Redis Sentinel deployments | InMemoryStore, `Sharded` variant |
| [Sharded blob store](#sharded-blob-store) | Several blob stores | BlobStore, `Sharded` variant |
| [SQL read replicas](#sql-read-replicas) | A PostgreSQL or MySQL primary and its replicas | The `readReplicas` field of the SQL store |

:::tip[Enterprise feature]
Composite stores are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Sharding

Sharding splits the data among several members, each holding a part. In the sharded stores, each key is assigned to one member, computed from the key and the number of members. Every key therefore lives on exactly one member, and every node computes the same member for the same key. The members do not replicate data between them, and the store never rebalances data among them.

This design has two consequences. The first is that the list of members cannot change once data has been written. Adding, removing or reordering a member changes the member computed for most keys, and the data written before the change can then no longer be found. To change the members of a sharded blob store in use, migrate the data as described in [Database migration](/docs/management/maintenance/migration). A sharded in-memory store is less sensitive, because it holds only short-lived data. Changing its members loses the rate-limit counters, greylisting entries and locks, as a restart of the local in-memory store would.

The second consequence concerns failures. When a member is unavailable, the operations on the keys it holds fail, while the operations on the other members continue. The failure is not redirected to another member. Each member should therefore be highly available in its own right, for example a replicated Redis deployment or a replicated object store.

## Sharded in-memory store

The `Sharded` variant of the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->) lists two or more members in [`stores`](/docs/ref/object/in-memory-store#stores). Each member is a `Redis`, `RedisCluster` or `RedisSentinel` in-memory store, configured as described in [Redis](/docs/storage/backends/redis).

A sharded in-memory store satisfies the requirement of a [cluster](/docs/cluster/) for a shared in-memory store. It can also hold [cache swap](/docs/storage/cache-swap) snapshots, because all its members are Redis.

The cluster coordinator's `Default` variant reuses the in-memory store's Redis connection, and with a sharded store it sends its messages through the first member listed in `stores`. Every node therefore uses the same Redis deployment for coordination.

The following in-memory store distributes its keys across two Redis servers:

```json
{
  "@type": "Sharded",
  "stores": [
    {"@type": "Redis", "url": "redis://10.0.0.21"},
    {"@type": "Redis", "url": "redis://10.0.0.22"}
  ]
}
```

## Sharded blob store

The `Sharded` variant of the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->) lists two or more members in [`stores`](/docs/ref/object/blob-store#stores). Each member is an S3, Azure, FileSystem, FoundationDB, PostgreSQL or MySQL blob store, configured as on its own backend page. Blobs are assigned to members by their identifier, so the contents of a message are always read from the member that stored them.

## SQL read replicas

Replicas of a database can take over part of its reading load. A PostgreSQL or MySQL data store, blob store or search store can send its read queries to such replicas, while all writes go to the primary. Replicas are not a separate variant. They are listed in the `readReplicas` field of the SQL store, as described in [PostgreSQL read replicas](/docs/storage/backends/postgresql#read-replicas) and [MySQL read replicas](/docs/storage/backends/mysql#read-replicas).

Stalwart sends reads to the replicas in turn, and a read that fails on a replica is retried on the primary. Not every read goes to a replica, though. Writes, the reads made while writing, and all search queries go to the primary.

Replicas also bring a consistency question. Stalwart does not track replication lag, so a read issued right after a write can reach a replica that has not yet received the write, and return the previous state. Replicas should therefore use synchronous or low-lag replication.
