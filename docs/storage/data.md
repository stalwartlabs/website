---
sidebar_position: 2
---

# Data store

The data store holds email metadata, mailbox state, account settings, folders, and most configuration objects. It does not hold raw message bodies, Sieve scripts, or other large binary files; those are managed separately by the [blob store](/docs/storage/blob) so that each layer can be tuned independently.

Backend selection is made on the [DataStore](/docs/ref/object/data-store) singleton (found in the WebUI under <!-- breadcrumb:DataStore --><!-- /breadcrumb:DataStore -->). The object is a multi-variant type: each instance selects one of several database backends, and the chosen variant determines which fields apply. The supported variants are:

- [RocksDB](/docs/storage/backends/rocksdb): a high-performance embedded key-value database, recommended for single-node installations.
- [FoundationDB](/docs/storage/backends/foundationdb): a distributed ACID database for clustered deployments, recommended for multi-node installations.
- [PostgreSQL](/docs/storage/backends/postgresql): an object-relational database.
- [MySQL / MariaDB](/docs/storage/backends/mysql): a relational database management system.
- [SQLite](/docs/storage/backends/sqlite): a self-contained, serverless, file-based database.

## Configuration

To change the data store backend, update the DataStore singleton and select the variant for the desired backend. Each variant carries its own fields (for example, the RocksDB variant requires [`path`](/docs/ref/object/data-store#path), while the PostgreSQL variant requires [`host`](/docs/ref/object/data-store#host), [`database`](/docs/ref/object/data-store#database), [`authUsername`](/docs/ref/object/data-store#authusername), and [`authSecret`](/docs/ref/object/data-store#authsecret)). See the [DataStore reference](/docs/ref/object/data-store) for the full field list per variant.

## Maintenance

Scheduled clean-up of the data store is managed centrally through the [DataRetention](/docs/ref/object/data-retention) object (found in the WebUI under <!-- breadcrumb:DataRetention --><!-- /breadcrumb:DataRetention -->). The [`dataCleanupSchedule`](/docs/ref/object/data-retention#datacleanupschedule) field sets how often the data store clean-up task runs, using a cron expression. The default runs daily at 02:00. Related schedules include [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule) for auto-expunge and [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule) for blob store clean-up.

<!-- review: Per-backend purge frequency was previously expressed as `store.<id>.purge.frequency`. The current DataRetention object only exposes global schedules (`dataCleanupSchedule`, `blobCleanupSchedule`, `expungeSchedule`). Confirm that no per-backend override exists in the new model. -->
