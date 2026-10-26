---
title: "Tuning the data store"
description: "Size connection pools, worker threads and RocksDB memory for the data store, blob store and in-memory store."
sidebar_position: 4
---

The data store holds every account's index data, the change log and the configuration. The caches answer many requests from memory, but most requests that miss a cache end up at the data store, so its responsiveness matters whenever the caches cannot help.

The tuning settings of the data store make two decisions. The first is how many requests reach the backend in parallel, through connection pools and worker threads. The second applies to the embedded backends only: how much memory the backend itself uses. This page covers the settings that matter for each backend, followed by those of the blob store and the in-memory store. Connection setup is described on the backend pages under [Storage backends](/docs/storage/backends/).

Every change on this page takes effect only after a restart, because of where the store configuration lives. The [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->) is stored in the node's `config.json` file and read at startup. The same applies to the [BlobStore](/docs/ref/object/blob-store), [SearchStore](/docs/ref/object/search-store) and [InMemoryStore](/docs/ref/object/in-memory-store) objects. In the WebUI, the blob store is found under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->, and the in-memory store under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->.

The load on the stores shows in their latency histograms. Watch `store.data-read-time` and `store.data-write-time` for the data store, and `store.blob-read-time` and `store.blob-write-time` for the blob store. [Measuring performance](/docs/performance/measuring) describes how to read them.

## RocksDB

[RocksDB](/docs/storage/backends/rocksdb) keeps recently read data blocks in memory, in a block cache, so that repeated reads of the same blocks do not go to disk. The block cache is sized by [`cacheSize`](/docs/ref/object/data-store#cachesize).

When `cacheSize` is not set, the block cache is sized from the memory available to the server: about one eighth of it, within the bounds that the [`cacheSize` reference](/docs/ref/object/data-store#cachesize) gives. On Linux the available memory follows the container memory limit, as described in [Sizing memory](/docs/performance/memory#memory-use-of-a-node).

Because this value is derived from the whole host, set `cacheSize` explicitly in two situations: when other software shares the host, or when the derived value, added to the caches and the memory budget, exceeds what the host can spare. The opposite problem, a block cache that is too small, shows up once the working set no longer fits in it. `store.data-read-time`, the histogram that measures range reads, then rises.

Writes take a different path. RocksDB collects them in memory buffers before it flushes them to disk, and [`bufferSize`](/docs/ref/object/data-store#buffersize) sets the size of those buffers, <!-- default:DataStore.bufferSize -->128 MiB<!-- /default --> unless changed. Larger buffers absorb longer bursts of writes, such as a large import, at the cost of the same amount of memory.

RocksDB operations run on a pool of threads whose size is [`poolWorkers`](/docs/ref/object/data-store#poolworkers). When it is not set, the pool has one thread per CPU core. In either case the pool has at least four threads, so a setting from 1 to 3, or a host with fewer than four cores, still runs four.

The last setting, [`blobSize`](/docs/ref/object/data-store#blobsize), is the value size above which RocksDB stores values in separate blob files. For most installations it has no noticeable effect on performance.

## PostgreSQL and MySQL

With [PostgreSQL](/docs/storage/backends/postgresql) or [MySQL](/docs/storage/backends/mysql), the main decision is how many connections each node opens to the database server. The limit is `poolMaxConnections`. When it is not set, the limit is four connections per CPU core, but at least 16 and at most 32, or 16 when the number of cores cannot be determined. The same default applies to every store that uses PostgreSQL or MySQL: the data store, and also the blob and search stores when they use these backends.

The database server must accept the connections of every node and every store at the same time. Add up `poolMaxConnections` over all nodes and all stores that point to the same database server, and keep the total below the server's `max_connections`. When the pool cannot provide a connection, requests fail with a connection pool error, and the `store.pool-error` counter increases.

MySQL has a second server limit to plan for. Each MySQL connection caches up to 64 prepared statements, so `max_prepared_stmt_count` on the MySQL server must allow 64 statements per connection, counted over all nodes. When it does not, the server logs a warning, which is described in [MySQL connection pool](/docs/storage/backends/mysql#connection-pool).

The remaining pool settings differ between the two backends:

- MySQL keeps [`poolMinConnections`](/docs/ref/object/data-store#poolminconnections) connections open while the server is idle. Its [`idleTimeout`](/docs/ref/object/data-store#idletimeout) is also set as the session `wait_timeout`, so the MySQL server closes connections that stay unused for longer.
- For PostgreSQL, [`connectTimeout`](/docs/ref/object/data-store#connecttimeout) limits the time allowed to establish a connection.

:::tip[Enterprise feature]
Read replicas are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Read replicas spread the reads of the data store across several database servers. With replicas configured in `readReplicas`, writes go to the primary server and reads are spread across the replicas. Each replica has its own connection pool, so count the replicas too when adding up connections against `max_connections`.

## SQLite

[SQLite](/docs/storage/backends/sqlite) is suited to single-node installations only. Its memory use is decided by the connection pool, because each connection has its own page cache of 32 MiB.

When [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections) is not set, the pool opens as many connections as there are workers, at most 16. The number of workers, `poolWorkers`, defaults to the number of CPU cores with a minimum of 4. The default pool of a host with 16 or more cores can therefore use 512 MiB for page caches alone, so on small hosts lower `poolMaxConnections` to bound it.

## FoundationDB

The [FoundationDB](/docs/storage/backends/foundationdb) transaction settings `transactionTimeout`, `transactionRetryDelay` and `transactionRetryLimit` have no Stalwart defaults. When they are not set, the defaults of the FoundationDB client apply, and their ranges are listed on the [DataStore](/docs/ref/object/data-store) reference page. Errors from the cluster increase the `store.foundationdb-error` counter.

## Blob store

The S3 and Azure blob stores have two settings that decide how the server handles failed or slow requests. A failed request is retried up to `maxRetries` times, and a value of 0 disables retries. A request that has not completed within `timeout` is abandoned.

Some S3-compatible services acknowledge writes they have not stored. To protect against them, the S3 blob store reads each object back after writing it, which costs one extra request per write. This check is controlled by `verifyAfterWrite` and is <!-- default:BlobStore.verifyAfterWrite as=enabled -->enabled<!-- /default --> by default.

Blob store load shows in the `store.blob-read-time` and `store.blob-write-time` histograms, and errors in the `store.s3-error` and `store.azure-error` counters.

## In-memory store

The in-memory store holds rate limit counters, greylisting state, short-lived tokens and similar data. The `Default` in-memory store keeps this data inside the server process and holds at most 1048576 entries. When it is full, it removes expired entries first and then other entries, so an operation fails only when nothing can be removed. The failure is logged as a `store.unexpected-error` event with the reason `In-memory store is full`.

The `Default` store cannot be used when a cluster coordinator is configured. A cluster needs Redis instead, as described in [In-memory store](/docs/storage/in-memory).

A Redis in-memory store opens at most `poolMaxConnections` connections, and its connection and pool timeouts are listed on the [InMemoryStore](/docs/ref/object/in-memory-store) reference page. The Redis server itself also needs a memory limit and an eviction policy. Set a `maxmemory` limit and the `volatile-lru` or `volatile-lfu` eviction policy, so that only entries with an expiry are evicted when it is full. When [cache swapping](/docs/storage/cache-swap) also uses Redis, give the snapshots a separate Redis instance with the `allkeys-lru` policy. The [Redis](/docs/storage/backends/redis) backend page explains the eviction policies.
