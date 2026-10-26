---
title: "Storage, backup, logs and clusters"
description: "Frequently asked questions about backups, reclaiming disk space, moving between backends, database permissions, memory and caches, search indexing, logs, alerts, and running a cluster."
sidebar_position: 7
---

## Backup and disk space

### How do I back up Stalwart?

Back up each store with the tools of its backend, such as a filesystem snapshot for RocksDB or `pg_dump` for PostgreSQL. The order and timing matter:

1. Back up the data store first and the blob store after it.
2. Keep the daily blob purge out of the interval between the two backups.
3. Back up `config.json` and the environment as well.

Two stores need no backup. The search index can be rebuilt, and the in-memory store holds only short-lived data. The built-in export is not a substitute: it is an offline dump of a stopped server, intended for moving to another backend, and not a backup of a running one. See [Backup and restore](/docs/management/maintenance/backup).

### I deleted mail but disk usage did not drop. Why?

Deleted mail goes through three stages before the disk space returns, and each takes time:

1. Messages moved to Trash or Junk Mail are expunged <!-- default:DataRetention.expungeTrashAfter -->30 days<!-- /default --> after they were moved there, as set by `expungeTrashAfter`.
2. The blob purge, which runs <!-- default:DataRetention.blobCleanupSchedule -->daily at 04:00<!-- /default -->, then releases the space of the expunged messages.
3. The database files shrink according to the backend: RocksDB after its compaction, which can lag a day or more, PostgreSQL after `VACUUM FULL` or `pg_repack`, MySQL after `OPTIMIZE TABLE`, and SQLite after `VACUUM` with the server stopped.

See [Disk usage does not drop after deleting mail](/docs/storage/maintenance#disk-usage-does-not-drop-after-deleting-mail).

### How do I move from RocksDB to PostgreSQL?

Export the data from the old store and import it into the new one, with the server stopped:

1. Stop the server and export the data with `--export`.
2. Point a configuration at the new data store.
3. Import the export with `--import` into an empty database.

The import refuses a target that already contains data, and an export written with another database schema version. Export formats are compatible across 1.x releases. The search index is not part of the export, so run a `StoreMaintenance` task of type `reindexAccounts` afterwards to rebuild it. See [Database migration](/docs/management/maintenance/migration).

### Which PostgreSQL permissions does Stalwart need?

Stalwart creates and checks its tables itself at every start. It must therefore connect as the role that owns them, with `CONNECT` on the database and `CREATE` on the schema.

Since PostgreSQL 15, ordinary roles no longer have `CREATE` on the `public` schema, which is the usual cause of a startup failure. A database owned by the Stalwart role avoids the problem. No extensions, sequences or superuser rights are needed. See [Database permissions](/docs/storage/backends/postgresql#database-permissions).

### What happens when the S3 blob store is unreachable?

Incoming mail is deferred rather than lost. Stalwart has no local spool for blobs, so it cannot hold a message until the store returns. A request that fails with an HTTP 5xx status is retried, up to `maxRetries` times, while connection errors and timeouts fail at once.

An incoming SMTP message whose blob cannot be written is then refused with `451 4.3.5 Unable to accept message at this time.` This is a temporary error, so the sender retries later. See [Failures and retries](/docs/storage/backends/s3#failures-and-retries).

## Performance

### How much memory does Stalwart use, and how do I size the caches?

Memory is shared by four consumers:

- The server's caches.
- The data store's own cache, which for RocksDB is about one eighth of the memory unless [`cacheSize`](/docs/ref/object/data-store#cachesize) sets it.
- The memory budget for messages in transit, one quarter of the memory.
- The connections. An IMAP session in IDLE takes about 70 KB, an estimate.

The message cache, which all accounts share, holds <!-- default:Cache.messages -->320 MiB<!-- /default --> by default, and at about 55 bytes per cached message, that default size is about 6 million messages. Accounts too large for it use a separate tier of <!-- default:Cache.messagesLarge -->512 MiB<!-- /default -->. In the same way, accounts whose calendars, address books or files are too large for their caches use a second large-account tier of <!-- default:Cache.groupwareLarge -->512 MiB<!-- /default -->.

On a host with 2 GiB, the default limits add up to more than the physical memory. The large-account tiers, though, stay empty unless an account holds more than about 5.6 million messages, the limit at the default cache size, or a calendar of about 270000 events. See [Sizing the caches](/docs/performance/caches) and [Sizing memory](/docs/performance/memory).

### Why are search results incomplete right after an import?

The cause depends on the kind of import. Messages are indexed for search from a queue, after they are stored. Right after a large import, the queue may not have been processed yet, and the queue's status entries ([IndexQueueStatus](/docs/ref/object/index-queue-status)) show how far it has got.

After an import from a database export, however, nothing was queued, because the search index is not exported. In that case, waiting does not help: run a `StoreMaintenance` task of type `reindexAccounts`. See [Search results are incomplete after an import](/docs/storage/indexing#search-results-are-incomplete-after-an-import).

### Why do rate limits and greylisting reset after a restart?

On a single server, the default in-memory store keeps its data inside the server process, so it is empty after every restart. Rate-limit windows and counters start again, and senders are greylisted once more. To keep this state across restarts, use a Redis in-memory store. See [Local store](/docs/storage/in-memory#local-store).

### Which Redis eviction policy should I use?

Set `maxmemory` and use `volatile-lru` or `volatile-lfu`. These policies evict only keys that have an expiry. Every key Stalwart writes has one, while keys written by expressions and Sieve scripts may have none, and those keys are then never evicted.

The other policies each cause a problem:

- `volatile-ttl` evicts short-lived locks first.
- The `allkeys` policies can evict expression keys.
- Under `noeviction`, a full Redis stalls delivery and tasks.

See [Memory limit and eviction policy](/docs/storage/backends/redis#memory-limit-and-eviction-policy).

## Logs and monitoring

### Why is no log file written?

Usually the log directory is missing or not writable. The `path` of a Log tracer is a directory, and the server does not create it, so it must exist and be writable by the server. When the directory cannot be written, events are discarded. The files in it are named after the `prefix` and the date, for example `stalwart.log.2026-01-14` with the default prefix and daily rotation. See [Log file](/docs/telemetry/tracing/tracers#log-file).

### How do I follow one message through the logs?

Follow its identifiers. Events about a message in the outbound queue carry its `queueId`, from queueing to final delivery or bounce. The events of one session share a `spanId`, which the journal, OpenTelemetry and webhooks include but the text log format omits.

Many of the events that explain a failure are logged at the `debug` level, so a trail that seems to stop short may continue at that level. See [Reading the logs](/docs/telemetry/tracing/#reading-the-logs).

### Why are logs not shown in the WebUI?

The WebUI's log view reads the files of the first enabled Log tracer, so it needs one to exist. Without one, the request fails with `No log tracers configured on the server`. See [Logs](/docs/telemetry/management#logs).

### Why does my alert email arrive every five minutes?

Alert conditions are evaluated every five minutes, and earlier evaluations are not remembered. A notification is therefore produced at every evaluation for as long as the condition holds. Write conditions on rates or thresholds that clear once the problem is gone. Alerts are an Enterprise feature. See [Evaluation schedule](/docs/telemetry/alerts#evaluation-schedule).

### Why is the dashboard history empty?

The dashboard reads its history from the metrics store, so when the MetricsStore is set to `Disabled`, the dashboard has nothing to show. Storing metrics is an Enterprise feature. See [WebUI dashboard](/docs/telemetry/metrics/#webui-dashboard).

## Clusters

### Can I run a cluster on RocksDB or SQLite? Do I need Redis?

No to the first, yes to the second. All nodes need a shared data store, PostgreSQL, MySQL or FoundationDB, and RocksDB and SQLite cannot be shared because they are local files.

A cluster also needs a Redis-based in-memory store. The local in-memory store cannot be shared between nodes either, and the server refuses it when a coordinator is configured. See [Storage](/docs/cluster/deployment/storage).

### Which coordinator should I use?

The coordinator distributes setting reloads and cache invalidations between the nodes of a cluster. Redis, Redis Cluster, Redis Sentinel and NATS are included in the official binaries, and the `Default` coordinator reuses the Redis of the in-memory store, so a cluster that already runs Redis needs no further service. Kafka and Zenoh require a custom build. See [Choosing a coordinator](/docs/cluster/configuration/coordination#choosing-a-coordinator).

### How many nodes can a cluster have?

At most 512. Each node holds a node identifier from 0 to 511, and a node that cannot obtain one does not start. It reports `Failed to obtain a node id: all 512 ids are leased by active nodes`. See [Node ID](/docs/cluster/configuration/node-id).

### Why does a cluster node show as stale?

The node has stopped renewing its identifier. A node renews the lease on its node identifier every 30 minutes. A node that has not renewed it for more than an hour is shown as stale, and another node can then take its identifier. After 24 hours, the node is inactive and its entry is removed. See [Node status](/docs/cluster/configuration/node-id#node-status).

### Which health check URL should my orchestrator use?

There are two, for the two usual kinds of probe. `/healthz/live` returns `200` whenever the process serves HTTP. `/healthz/ready` returns `200` when the data store is open and `503` otherwise. Other paths, such as `/health`, return `404`. See [Health checks](/docs/cluster/configuration/load-balancing#health-checks).

### I changed a setting but the other nodes still use the old value. Why?

Without a coordinator, a `ReloadSettings` action reloads only the node that served it, and cache invalidations do not reach the other nodes either. Reload or restart the other nodes, or configure a coordinator so that reloads reach them all.

A reload also changes nothing when it finds an error in the configuration. The errors are returned with the action. See [Applying configuration changes](/docs/cluster/configuration/#applying-configuration-changes).
