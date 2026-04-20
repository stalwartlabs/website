---
sidebar_position: 5
---

# SQLite

SQLite is a self-contained, serverless, zero-configuration database engine. Its simplicity and reliability make it well suited to small single-node installations. Data can be replicated for redundancy using external tools such as Litestream, which provides continuous replication of SQLite database files.

## Configuration

The SQLite backend is selected by choosing the `Sqlite` variant on the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The variant exposes the following fields:

- [`path`](/docs/ref/object/data-store#path): path to the SQLite database file (required). If the file does not exist, it is created automatically.
- [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections): maximum number of concurrent database connections. Default: `10`.
- [`poolWorkers`](/docs/ref/object/data-store#poolworkers): number of worker threads dedicated to blocking database operations. Defaults to the number of CPU cores available on the host.

