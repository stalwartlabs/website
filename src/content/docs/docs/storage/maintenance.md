---
title: "Data retention and reclaiming disk space"
description: "How deleted mail and expired data are purged, when the disk space is returned, what each storage backend requires from the operator, and how to run the clean-up manually."
sidebar_position: 6.5
---

Deleting a message in a mail client does not free disk space immediately, because deletion is not one action but a sequence of steps. The message first stays in the Trash folder. Then its record is removed from the data store. Its contents are removed from the blob store later, once nothing references them any more. Finally, the storage backend returns the space to the file system on its own schedule.

Each of these steps runs at a different time, and the last one depends on the backend. This page describes each step, the settings that control it, and what the operator has to do for each backend.

The schedules and retention periods are set on the [DataRetention](/docs/ref/object/data-retention) object (found in the WebUI under <!-- breadcrumb:DataRetention --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry<!-- /breadcrumb:DataRetention -->). A schedule is given as a `Daily`, `Weekly` or `Hourly` object, with the hour and minute at which the process runs. A retention period is a duration in milliseconds.

## Mail deletion

Messages in the Trash and Junk Mail folders do not stay there for ever. They are expunged once they have been in the folder for longer than [`expungeTrashAfter`](/docs/ref/object/data-retention#expungetrashafter), which is <!-- default:DataRetention.expungeTrashAfter -->30 days<!-- /default --> unless changed. The auto-expunge process that removes them runs at [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule), <!-- default:DataRetention.expungeSchedule -->daily at 00:00<!-- /default --> by default.

The same process expires a few other kinds of data, each after its own period. Sent email submissions are removed after [`expungeSubmissionsAfter`](/docs/ref/object/data-retention#expungesubmissionsafter), the JMAP share notification history after [`expungeShareNotifyAfter`](/docs/ref/object/data-retention#expungesharenotifyafter), and old messages in the calendar scheduling inbox after [`expungeSchedulingInboxAfter`](/docs/ref/object/data-retention#expungeschedulinginboxafter). Setting one of these fields to no value disables that expiry. The same run also trims each account's change history to [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) entries, and removes expired Sieve vacation and duplicate records.

Expunging a message, whether by this process or by the user, has two effects at different times. Its record is removed from the data store, and the space it used is credited to the account's [quota](/docs/auth/authorization/quotas) at once. Its contents, however, stay in the blob store until no message, in any account, references them.

The deleted-item archive adds a further delay, in exchange for the ability to undo a deletion. With the archive enabled through [`archiveDeletedItemsFor`](/docs/ref/object/data-retention#archivedeleteditemsfor), expunged messages, files, calendar events, contacts and Sieve scripts are kept for that period before they are deleted. During that time they can be restored as described in [Recovering deleted items](/docs/management/maintenance/deleted-items), and they keep using disk space until the period ends.

:::tip[Enterprise feature]
The deleted-item and deleted-account archives are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Purge schedules

Two purge processes delete the data that is no longer needed, each on its own schedule.

The data purge runs at [`dataCleanupSchedule`](/docs/ref/object/data-retention#datacleanupschedule), <!-- default:DataRetention.dataCleanupSchedule -->daily at 02:00<!-- /default --> by default. It removes expired records from the data store: incoming DMARC, TLS and abuse reports past their retention, delivery traces and metrics past their retention, counters that have dropped to zero, and the leases of cluster nodes that have been gone for more than a day. On RocksDB and SQLite it also performs the space reclamation described below.

The blob purge runs at [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule), <!-- default:DataRetention.blobCleanupSchedule -->daily at 04:00<!-- /default --> by default. It deletes the blobs that are no longer referenced, such as the contents of deleted messages and uploads that were never used. It also deletes the items whose deleted-item archive period has ended, and the spam classifier training samples past their retention.

Even after the purge, the space is not necessarily back on the disk, because the backend still has to release it. Embedded databases and SQL servers reuse freed pages for new data before they return any space to the operating system. The database files on disk therefore shrink later than the data is deleted, and in some cases not at all unless the operator acts. This is why the quota is credited at deletion, while the disk follows later.

## Disk space by backend

Each backend releases space in its own way, and some of them need the operator's help:

| Backend | What Stalwart does | What the operator does |
|---|---|---|
| RocksDB | Space is reclaimed by RocksDB compaction and, for message contents, by a garbage collection pass that runs at the end of the daily data purge once a substantial share of the stored contents has been deleted. | Nothing routine. A data purge can be started manually to run the collection pass earlier; there is no separate compaction command. |
| SQLite | The data purge truncates the write-ahead log. Free pages in the database file are reused. | The database file never shrinks on its own. To shrink it, stop the server and run `VACUUM`, which needs free disk space of up to twice the database size. |
| PostgreSQL | Rows are deleted; Stalwart issues no `VACUUM`, `ANALYZE` or `REINDEX`. | Rely on autovacuum, which makes the space reusable but does not return it to the operating system. To shrink the files, run `VACUUM FULL` (which takes an exclusive lock and needs a maintenance window) or `pg_repack` on the large tables. |
| MySQL, MariaDB | Rows are deleted; Stalwart issues no `OPTIMIZE TABLE`. | Run `OPTIMIZE TABLE` on the large tables. It returns space to the operating system only when `innodb_file_per_table` is enabled, which is the default. |
| FoundationDB | FoundationDB reclaims freed space itself. | Nothing. |
| S3, Azure | Objects are deleted by the blob purge. | With bucket versioning enabled, deleted objects remain as old versions until a lifecycle rule removes them. |

RocksDB adds a delay of its own. Contents removed by the blob purge are reclaimed by the next data purge, which on the default schedules runs the following day. Space can therefore lag deletions by a day or more. Small amounts of deleted data may not be reclaimed at all until more has been deleted, because the collection pass waits for a substantial share of the contents to be gone.

When message contents are kept in the database (the blob store set to `Default` on a PostgreSQL or MySQL data store), they are stored in the table named `t`, which is normally the one worth shrinking. The same applies to a PostgreSQL or MySQL blob store.

## Deleting accounts

An account is not removed in one step either. Deleting it schedules a `DestroyAccount` [task](/docs/management/tasks-actions/tasks), which removes the account's messages, calendars, contacts, files and settings in the background. The contents of the account's messages are then removed by the next blob purge, like any other unreferenced blob.

With [`archiveDeletedAccountsFor`](/docs/ref/object/data-retention#archivedeletedaccountsfor) set, the deletion of the account's data is postponed by that period. Until the task runs, deleting the task restores the account (Enterprise, see [Restore a deleted account](/docs/management/maintenance/deleted-items#restore-a-deleted-account)).

## Other data that grows

Mail is not the only data with a retention period, and the following data also accumulates over time:

- The change history used by IMAP, JMAP and DAV clients to synchronise, limited to [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) changes per account. Clients whose last synchronisation is older than the retained history perform a full resynchronisation.
- Incoming DMARC, TLS and abuse (ARF) reports, kept for [`holdMtaReportsFor`](/docs/ref/object/data-retention#holdmtareportsfor).
- Delivery history and metrics history, kept for [`holdTracesFor`](/docs/ref/object/data-retention#holdtracesfor) and [`holdMetricsFor`](/docs/ref/object/data-retention#holdmetricsfor), when [telemetry history](/docs/telemetry/history) is enabled. Metrics are collected at the interval set in [`metricsCollectionInterval`](/docs/ref/object/data-retention#metricscollectioninterval). These settings are part of the Enterprise edition.
- Spam classifier training samples, kept for [`holdSamplesFor`](/docs/ref/object/spam-classifier#holdsamplesfor) on the [spam classifier](/docs/spamfilter/classifier/).

## Running the clean-up manually

The purge processes do not have to wait for their schedule. They can be started at any time by creating a [Task](/docs/ref/object/task), in the WebUI under Management › Tasks or with the CLI. The `StoreMaintenance` variant acts on the whole server, and its [`maintenanceType`](/docs/ref/object/task#maintenancetype) selects the operation. The value `purgeData` runs the data purge, and `purgeBlob` runs the blob purge. The value `purgeAccounts` removes expired data from all accounts, as the auto-expunge process does. For a single account, the `AccountMaintenance` variant with `maintenanceType` set to `purge` does the same.

The following command starts a data purge:

```sh
stalwart-cli create Task/StoreMaintenance \
  --field maintenanceType=purgeData \
  --field 'status={"@type":"Pending","due":"2026-01-01T00:00:00Z"}'
```

A task runs once its `due` time has been reached. In a cluster, a task runs only on suitable nodes. Store tasks run on the nodes whose [cluster role](/docs/cluster/configuration/roles) includes the `storeMaintenance` task, and account tasks only on the nodes with the `accountMaintenance` task.

## Disk usage does not drop after deleting mail

When disk usage stays high after mail has been deleted, one of the steps above has not happened yet. Check them in the order in which they happen:

1. The messages were moved to Trash, not expunged. They are expunged after `expungeTrashAfter`, or when the user empties the folder.
2. The deleted-item archive is enabled. Archived items occupy space until `archiveDeletedItemsFor` has passed.
3. The blob purge has not run since the deletion. It runs at `blobCleanupSchedule`, and a `purgeBlob` task runs it at once.
4. Other messages still reference the same contents. Identical messages delivered to several accounts share one blob, which is deleted only with the last reference.
5. The backend has not returned the space. Follow the backend's row in the table above, since on SQLite, PostgreSQL and MySQL the files do not shrink without operator action.
