---
title: "Backup and restore"
description: "Back up and restore a Stalwart server: what to copy for each store, the order of data and blob store backups, backend-native tools, procedures per deployment type, and how to test a restore."
sidebar_position: 0.5
---

A backup protects a mail server against the loss of its storage, whether through hardware failure, operator error or a damaged database. A useful backup must capture all of the server's state, consistently, and in a form that can be restored to a working server.

A Stalwart server keeps its state in its stores. The [data store](/docs/storage/data) holds accounts, message metadata and every configuration object. The [blob store](/docs/storage/blob) holds message bodies and attachments. A backup must capture both, and the two copies must be consistent with each other, because the data store refers to blobs in the blob store.

The stores are databases and object stores that are in use while the server runs. The reliable way to back them up is therefore with the tools of each backend, in the order described below. Copying the files of a running data store is not a backup.

## Components to back up

Not everything the server keeps needs a backup. Some components hold the server's real state, and others hold data that the server rebuilds or that is short-lived:

| Component | Contents | Back up |
|---|---|---|
| Data store | Accounts, message metadata, mailboxes, calendars and contacts, every configuration object including TLS certificates and DKIM keys, the outbound queue, reports, telemetry, tasks | Yes |
| Blob store | Message bodies, attachments, Sieve scripts and other files; with the `Default` blob store, these are stored in the data store | Yes |
| `config.json` and the environment (`STALWART_*` variables or the environment file) | The data store connection and node settings | Yes, with the system configuration |
| Search index | The full-text index, in the data store or an external search engine | No; rebuilt with a `reindexAccounts` task |
| In-memory store | Rate limits, greylisting state and other short-lived data | No |
| Cache swap files | Cached data on local disk | No; rebuilt |

The Enterprise edition also keeps a deleted-item archive ([Recovering deleted items](/docs/management/maintenance/deleted-items)), which holds deleted messages for a time. It protects against users deleting mail by mistake. The archive lives on the same stores, however, so it is lost with them, which means that it is not a backup.

## Order of data and blob backups

The data store and the blob store are backed up separately, so the order of the two backups matters. Two facts about how Stalwart writes and deletes message bodies decide it.

First, message bodies are written to the blob store before the data store refers to them. Second, deleting a message removes only the reference. The bodies that no message refers to any longer are deleted later by the daily blob purge, which runs on the schedule set by [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule), <!-- default:DataRetention.blobCleanupSchedule -->daily at 04:00<!-- /default --> by default, with no grace period.

Two rules follow from these facts:

- Back up the data store first and the blob store afterwards. A blob store copied later contains every body that the data store backup refers to. It may also contain bodies of newer messages, which are harmless. The reverse order leaves the restored data store referring to bodies that the blob copy does not contain, and these messages cannot be repaired.
- Do not let the blob purge run between the end of the data store backup and the end of the blob store backup. The purge would delete bodies that the data store backup still refers to. Schedule the backup outside the purge time, or move `blobCleanupSchedule`.

Some setups avoid the problem. With a versioned S3 or Azure bucket, the second rule does not apply, because the bucket keeps old versions: restore the objects as they were when the data store backup finished. With the `Default` blob store, data and bodies are in one database, so neither rule applies.

## Backing up a running server

Each backend has its own way to take a consistent copy while it is in use:

- PostgreSQL: `pg_dump` produces a consistent export while the database is in use and suits small installations. For production, use a base backup with WAL archiving, which allows point-in-time recovery. Back up the whole database.
- MySQL and MariaDB: `mysqldump --single-transaction` takes a consistent snapshot of the InnoDB tables. Physical backup tools are the alternative for large databases.
- FoundationDB: `fdbbackup` with continuous backup, restored with `fdbrestore` to a point in time.
- SQLite: `sqlite3 <database> ".backup <file>"` or `VACUUM INTO` from a second process, or stop the server and copy the files. While the server runs, the `-wal` file is part of the database.
- RocksDB: see below.
- S3 and Azure blob stores: enable versioning on the bucket, with a lifecycle rule that expires old versions, and replicate the bucket to another region if required.
- File system blob store: copy or snapshot the directory after the data store backup.

RocksDB needs more care, because Stalwart offers no online backup of it. There are two options. Either stop the server and copy the directory, or take an atomic snapshot of the file system that holds the whole RocksDB directory, including its WAL files, with LVM, ZFS, btrfs or a cloud volume snapshot. Such a snapshot is equivalent to the state after a crash, from which RocksDB recovers when it is opened. The WAL and data files must be in the same snapshot. A file-by-file `cp` or `rsync` of a running RocksDB directory produces an inconsistent copy.

Wherever the backups are taken, store them in a different failure domain from the server, so that one failure cannot destroy both.

## Procedures

The procedure depends on how the stores are deployed. The three common deployments follow.

### Single node with RocksDB

With RocksDB and the `Default` blob store, the data and the message bodies are in one database, so a single copy captures everything. The preferred backup is a file system snapshot of the RocksDB directory while the server runs. Without snapshot support, stop the server, copy the directory and start it again.

Alternatively, export the store with the server stopped ([Offline export and import](#offline-export-and-import)). The export produces a dump that can also be imported into another backend.

The restore depends on the kind of backup. After restoring a copy of the directory, start the server. After importing a dump, also run a `StoreMaintenance` task of type `reindexAccounts` ([Tasks](/docs/management/tasks-actions/tasks#maintenance-tasks)).

### SQL data store with an object store

With PostgreSQL or MySQL as the data store and S3, Azure or a file system as the blob store, follow the order described above:

1. Back up the database with its native tool.
2. Immediately afterwards, back up the blob store. With bucket versioning enabled permanently, which is preferred, record the time at which step 1 finished. Otherwise, start a copy of the bucket after step 1 and complete it before the next blob purge.

Do not use the built-in export on the running database as the backup, because it is not a consistent snapshot.

### Cluster

In a [cluster](/docs/cluster/), all nodes share the data store and the blob store. These are therefore backed up once for the whole cluster, as in the SQL procedure. Every node's `config.json` points to the same data store.

The nodes hold no state of their own apart from `config.json`, the environment and rebuildable cache files. Redis, Kafka and NATS hold nothing that needs a backup.

To restore a cluster, follow these steps in order:

1. Stop all nodes.
2. Restore the data store and the blob store.
3. Start one node.
4. Run a `reindexAccounts` task if the search index was stored in the data store and was not restored.
5. Start the other nodes.

## Offline export and import

The Stalwart binary can write the contents of the data store, and the message bodies of the blob store, to a set of dump files, and read them back into an empty store. This suits single nodes that can be stopped.

Stop the server first. An export of a running SQL store is not a point-in-time copy, and a running RocksDB store cannot be opened by a second process. The following commands export the store and import it again:

```bash
$ stalwart --config /etc/stalwart/config.json --export /var/backups/stalwart/2026-10-15
$ stalwart --config /etc/stalwart/config.json --import /var/backups/stalwart/2026-10-15
```

For a backup, export every family of data, which is the default when `EXPORT_TYPES` is not set. The `blob` family matters most: without it, the restored store has no links to its message bodies, and the next blob purge deletes them.

The dump leaves out two things. It does not contain the search index, which is rebuilt after the import. It also does not contain `config.json` and the environment, which must be backed up separately. It does contain every configuration object, including passwords, keys, DKIM private keys and certificates, and must be protected accordingly. [Database migration](/docs/management/maintenance/migration) describes the data families, the rules the import enforces and the steps after an import.

## Configuration snapshots

`stalwart-cli snapshot` writes configuration objects as a plan that `stalwart-cli apply` can recreate on another server ([snapshot](/docs/management/cli/snapshot)). By default, secrets are left out of the plan. A plan that lacks a required secret, such as an account password or a DKIM private key, cannot be applied until the values are added.

A snapshot alone is therefore not a complete restore source. It complements a backup of the stores, and is useful for reviewing and versioning the configuration.

## Per-account archives

Individual accounts can be exported to and imported from archives with Vandelay. This serves, for example, to keep a copy of one mailbox or to move it to another server ([Backup with Vandelay](/docs/migration/import-export/backup)).

## Testing a restore

A backup that has never been restored is unproven, because only a restore shows that it is complete and usable. Restore regularly into a separate host:

1. Restore the stores.
2. Start the server with the same `config.json`, adjusted to the restored stores.
3. Sign in to an account, and open a mailbox and a few messages with attachments.
4. After a reindex, run a search.
