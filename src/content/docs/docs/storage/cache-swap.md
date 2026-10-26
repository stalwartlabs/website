---
title: "Cache swapping"
description: "Cache swapping persists snapshots of account caches so that an account evicted from memory, served by another node or loaded after a restart does not have to be rebuilt from the data store."
sidebar_position: 6
---

Stalwart keeps a cache in memory for each active account. The cache holds the index of the account's messages and mailboxes, and the corresponding indexes of its calendars, contacts, files and event notifications. With it, the server answers most IMAP, JMAP and DAV requests without a query to the data store.

An account is not always in memory, though. The server may have restarted, the cache may have been evicted to make room for other accounts, or another cluster node may have served the account last. In each case the cache has to be rebuilt by reading the account's records from the data store. For a large mailbox, the rebuild reads every message record, and it is the main cost of the first request after a restart.

Cache swapping avoids most of that cost by persisting a snapshot of each account cache outside the process. On a cache miss, Stalwart loads the snapshot and applies the changes recorded in the account's change log since the snapshot was written, instead of reading every record of the account. The feature is off until `swap` is set on the Cache object, as described in [Enabling cache swapping](#enabling-cache-swapping).

## Snapshot lifecycle

A snapshot is only a shortcut, and correctness never depends on it. A snapshot that is missing, cannot be read or is older than the change history kept for the account is discarded, and the cache is rebuilt from the data store exactly as it would be without swapping. Errors in cache swapping therefore affect performance, not data.

Snapshots are written in the background, and two settings decide how often. An account's snapshot is rewritten after at least [`flushChanges`](/docs/ref/object/cache#flushchanges) changes have accumulated against its cache, and at most once every [`flushInterval`](/docs/ref/object/cache#flushinterval). Large accounts need proportionally more changes before a rewrite: one sixteenth of the messages or resources in the cache.

Snapshots are also written at two other moments. The first is when a cache with at least `flushChanges` pending changes is evicted from memory. The second is when the server shuts down gracefully. A shutdown waits for the pending writes only for a limited time. Snapshots that cannot be written in that time are logged with a `cache.swap-error` event, and those accounts are rebuilt on their next use.

Not every account is worth a snapshot, and two size limits decide which accounts are swapped. Accounts whose snapshot is smaller than [`minAccountSize`](/docs/ref/object/cache#minaccountsize), <!-- default:Cache.LocalFileSwap.minAccountSize -->1 MiB<!-- /default --> by default, are skipped, because rebuilding them costs less than writing the snapshot. Accounts whose snapshot would exceed [`maxAccountSize`](/docs/ref/object/cache#maxaccountsize), <!-- default:Cache.LocalFileSwap.maxAccountSize -->1 GiB<!-- /default --> by default, are skipped as well, and a `cache.swap-error` event reports `Cache snapshot exceeds the configured maximum size`. Both limits refer to the uncompressed snapshot, which is close to the size of the account's cache in memory. Deleting an account removes its snapshots.

A snapshot is caught up from the account's change log, which keeps [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) changes per account ([Data retention](/docs/storage/maintenance)). This interacts with the rewrite rule for large accounts. A large account rewrites its snapshot only after one sixteenth of its items have changed, so an account with more than sixteen times the history length in items can accumulate more changes than the log retains. With the default history of <!-- default:DataRetention.maxChangesHistory -->10000<!-- /default --> changes, that threshold is about 160,000 items. After a crash, or on another node, such a snapshot is loaded, found to be too old and discarded, and the cache is rebuilt. The result is still correct, and only the loading work is wasted. [Sizing the caches](/docs/performance/caches) explains how to adjust the history for such accounts.

## Suitable workloads

Cache swapping reduces load when full rebuilds are frequent and expensive. That is the case in the following situations:

- Accounts with large mailboxes, whose rebuild reads many records.
- Nodes whose message cache is smaller than the set of active accounts, so that caches are evicted and rebuilt repeatedly.
- Clusters, where an account served by a different node after a rolling restart or a load balancer decision would otherwise be rebuilt on that node.
- Data stores reached over the network, such as PostgreSQL or MySQL, where each record read during a rebuild is a round trip.

The opposite case is a single node with small accounts and a cache large enough for all of them. There a snapshot is rarely read, and the background writes add load without benefit.

## Choosing a backend

The [`swap`](/docs/ref/object/cache#swap) field of the [Cache](/docs/ref/object/cache) object (found in the WebUI under <!-- breadcrumb:Cache --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Cache<!-- /breadcrumb:Cache -->) selects where snapshots are kept. The main decision in a cluster is whether the nodes share them. A node uses only the snapshots it can reach, so with a node-local backend it restores only the accounts that the same node served before.

| `@type` | Where snapshots are kept | Shared by cluster nodes | Expiry of unused snapshots |
|---|---|---|---|
| `Disabled` | Not kept | | |
| `LocalFile` | A directory on this node | No | Replaced on rewrite |
| `Redis` | The Redis in-memory store, or a separate Redis deployment | Yes | [`retention`](/docs/ref/object/cache#retention) |
| `BlobStore` | The blob store, or a separate blob store | Yes | `retention`, removed by the blob purge |

`LocalFile` writes snapshots to the directory named in `path`, which is created with permissions restricted to the server's user. It needs no other service, which makes it suit a single node.

`Redis` stores each snapshot in chunks of [`chunkSize`](/docs/ref/object/cache#chunksize) bytes. Its `store` field decides which Redis holds them. Set to `Default`, it reuses the [in-memory store](/docs/storage/in-memory), which is accepted only when the in-memory store is Redis, or a sharded store whose members are all Redis. The store can instead be a separate `Redis`, `RedisCluster` or `RedisSentinel` deployment. That keeps the snapshots, which can each reach `maxAccountSize`, out of the Redis instance used for locks and rate limits. [Redis](/docs/storage/backends/redis#memory-limit-and-eviction-policy) describes the eviction policy for each case.

`BlobStore` stores snapshots as blobs. Its `store` field set to `Default` reuses the [blob store](/docs/storage/blob), and it can also name a separate S3, Azure, FoundationDB, PostgreSQL or MySQL store.

Two combinations are refused when the configuration is loaded. The first is any attempt to keep snapshots in a filesystem blob store, whether through `BlobStore` with `Default` on a server whose blob store is `FileSystem`, or as an explicit `FileSystem` store. It fails with `The filesystem blob store cannot back the cache swap tier ...`, and `LocalFile` is the backend to use for snapshots on a local disk. The second is `Redis` with `Default` on a server whose in-memory store is the local in-process store, which fails with `The default cache swap store requires a Redis in-memory backend, either directly or as every shard of a sharded store`.

## Enabling cache swapping

Cache swapping is configured in the `swap` field of the Cache object, and the setting takes effect after a restart.

The following value stores snapshots in a local directory:

```json
{
  "swap": {
    "@type": "LocalFile",
    "path": "/var/lib/stalwart/cache-swap"
  }
}
```

The following value stores snapshots in the Redis in-memory store and keeps unused snapshots for three days:

```json
{
  "swap": {
    "@type": "Redis",
    "store": {"@type": "Default"},
    "retention": 259200000
  }
}
```

The following value stores snapshots in the blob store and rewrites a snapshot after 5000 changes at the earliest:

```json
{
  "swap": {
    "@type": "BlobStore",
    "store": {"@type": "Default"},
    "flushChanges": 5000
  }
}
```

The same change can be made with the CLI, for example `stalwart-cli update Cache --field swap='{"@type":"LocalFile","path":"/var/lib/stalwart/cache-swap"}'`.

## Checking that it works

Cache swapping reports its activity through the following events, each with a counter of the same name:

- `cache.swap-hit`: a snapshot was loaded and caught up, avoiding a rebuild.
- `cache.swap-miss`: no usable snapshot was found and the cache was rebuilt.
- `cache.swap-write`: a snapshot was written.
- `cache.swap-error`: a snapshot could not be read or written. This event is logged at `warn`, and the others at `debug`.

The gauge `cache.swap-pending` counts the snapshots with changes that have not been written yet. Every five minutes, the `cache.swap-metrics` event summarises the writer's activity, including the number of bytes written per hour, and `cache.swap-flush` reports the snapshots written on shutdown.

After a restart, a high ratio of `cache.swap-hit` to `cache.swap-miss` shows that snapshots are being used. To compare the cost of the two paths, enable the `cache` events at `debug` level on a [tracer](/docs/telemetry/tracing/), and compare the elapsed time of the `cache.swap-hit` events with that of the `cache.miss` events. [Sizing the caches](/docs/performance/caches) describes how to adjust `flushChanges`, `flushInterval` and the size limits to the measured load.
