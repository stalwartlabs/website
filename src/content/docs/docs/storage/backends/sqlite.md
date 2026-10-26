---
sidebar_position: 5
title: "SQLite"
description: "Use an SQLite database file as the data store of a small single-node installation."
---

[SQLite](https://www.sqlite.org/) is an embedded SQL database stored in a single file. Like RocksDB, it runs inside the Stalwart process and needs no separate service. Its particular advantage is the single file, which is easy to copy and to inspect with standard tools. The file can also be replicated continuously to object storage with external tools such as [Litestream](https://litestream.io/). SQLite suits small single-node installations.

Only one process at a time opens an SQLite database, so several Stalwart nodes cannot share an SQLite data store. A [cluster](/docs/cluster/) uses PostgreSQL, MySQL or FoundationDB instead.

## Configuration

The backend is selected with the `Sqlite` variant of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). [`path`](/docs/ref/object/data-store#path) is the location of the database file, which is created if it does not exist.

Database operations run on a pool of threads, whose size is set by [`poolWorkers`](/docs/ref/object/data-store#poolworkers). When the field is unset, the pool has as many threads as the host has processor cores, with a minimum of 4.

The number of open connections to the database is limited separately, by [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections). When it is unset, it equals `poolWorkers`, kept between 4 and 16. This setting also affects memory, because each connection keeps its own page cache of 32 MiB. The connection count therefore determines part of the memory used by the server, as discussed in [Tuning the data store](/docs/performance/data-store).

The following data store uses the file `/var/lib/stalwart/stalwart.db`:

```json
{
  "@type": "Sqlite",
  "path": "/var/lib/stalwart/stalwart.db"
}
```

## Disk space

When data is deleted, SQLite reuses the freed space for new data, but the database file itself does not shrink. To reduce its size, stop the server and run `VACUUM` on the file, as described in [Data retention and reclaiming disk space](/docs/storage/maintenance#disk-space-by-backend).
