---
sidebar_position: 1
title: "RocksDB"
description: "Use the embedded RocksDB database as the data store of a single-node installation: settings and memory use."
---

[RocksDB](https://rocksdb.org/) is an embedded key-value database designed for fast local storage such as SSDs. Embedded means that it runs inside the Stalwart process, as a library, rather than as a separate service. There is therefore nothing else to install, start or secure, which makes RocksDB the default and recommended data store for single-node installations. With the blob and search stores set to `Default`, a single RocksDB directory holds all of the server's data.

The same design sets its limit. Only one process at a time can open the database directory, so several Stalwart nodes cannot share a RocksDB data store. A [cluster](/docs/cluster/) uses PostgreSQL, MySQL or FoundationDB instead.

## Configuring RocksDB

The backend is selected with the `RocksDb` variant of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). Most installations need only one setting, [`path`](/docs/ref/object/data-store#path), the directory that holds the database, for example `/var/lib/stalwart/data`. The remaining settings control memory and threads, and their defaults suit most installations.

Most of the memory that RocksDB uses goes to two places: the block caches and the write buffers. The block caches keep recently read data, indexes and filters in memory, so that repeated reads do not go to disk. They share the amount set in [`cacheSize`](/docs/ref/object/data-store#cachesize). When the field is unset, the caches receive about one eighth of the memory available to the server, within the bounds listed in the field reference. The memory available is the lower of the physical memory and the container memory limit.

The write buffers work in the other direction. Writes are collected there before they are flushed to disk, and [`bufferSize`](/docs/ref/object/data-store#buffersize) sets the total memory of these buffers.

Database operations run on a pool of threads, whose size is set by [`poolWorkers`](/docs/ref/object/data-store#poolworkers). When the field is unset, the pool has as many threads as the host has processor cores, with a minimum of 4.

[`blobSize`](/docs/ref/object/data-store#blobsize) matters only when RocksDB also holds the blobs, that is, when the blob store is `Default`. Blobs of at least this size are written to separate RocksDB blob files, which keeps the main database compact. Smaller blobs are stored with the other data. The field decides only where inside RocksDB a blob goes; it does not decide whether a blob is kept in the blob store.

The following data store keeps its data in `/var/lib/stalwart/data` and limits the block cache to 2 GiB:

```json
{
  "@type": "RocksDb",
  "path": "/var/lib/stalwart/data",
  "cacheSize": 2147483648
}
```

Changes take effect after a restart. [Tuning the data store](/docs/performance/data-store) describes how to size the caches against the memory of the host.

## Disk space

RocksDB reclaims the space of deleted data during compaction, a process it runs in the background that rewrites its files without the deleted entries. In addition, Stalwart runs its own reclamation pass for deleted message contents during the daily data purge. No routine maintenance is required. Disk usage does fall some time after data is deleted, rather than at once, and [Data retention and reclaiming disk space](/docs/storage/maintenance#disk-space-by-backend) explains why.
