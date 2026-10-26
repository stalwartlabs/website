---
sidebar_position: 2
title: "Database Migration"
description: "Move a Stalwart server to another data store backend with the built-in export and import: procedure, data families, compatibility rules and the steps after an import."
---

A deployment sometimes outgrows the backend it started with. A single node on RocksDB or SQLite, for example, has to move to PostgreSQL, MySQL or FoundationDB before it can become a cluster. Moving to another backend is the main use of the built-in export and import.

The Stalwart binary can export the whole content of its stores to a set of dump files and import them into another store. The export reads the data store and the message bodies of the configured blob store. The import writes them into the stores configured at import time, which may be of different types from the original ones.

Export and import are not the routine backup of a running server. They take no consistent snapshot, and they are slow for large stores. [Backup and restore](/docs/management/maintenance/backup) describes the backup procedures.

## Before migrating

Stop the server before exporting, and do not start the new one until the import has finished. Nothing prevents an export on a running server, but the result is unreliable: an export of a running SQL store is not a point-in-time copy, and a running RocksDB or SQLite store cannot be opened by a second process.

In a cluster, stopping one node is not enough. The export does not register as a cluster node, so the other nodes must be stopped as well to keep the data from changing.

The dump contains every configuration object, including passwords, keys, DKIM private keys and TLS certificates, so store it where only administrators can read it. It does not contain `config.json` or the `STALWART_*` environment, which must be carried over separately.

## Export

Run the binary with two options: `--config`, naming the configuration of the current server, and `--export`, with the directory to write to. The directory is created if it does not exist:

```bash
$ /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.json --export /var/tmp/stalwart-export
```

The export writes one compressed file per part of the store. The store is divided into families of data, and the `EXPORT_TYPES` environment variable restricts the export to some of them, as a comma-separated list:

| Family | Contents |
|---|---|
| `data` | Message metadata, mailboxes, calendars, contacts, quotas and counters |
| `registry` | Accounts, domains and every other configuration object, deleted-item archive, spam training samples |
| `blob` | The links between objects and their blobs, and the blobs themselves: message bodies, attachments and other files, read from the configured blob store |
| `changelog` | Change logs used for client synchronisation |
| `queue` | The outbound message queue |
| `report` | Incoming and outgoing DMARC, TLS and ARF reports |
| `telemetry` | Stored traces and metrics |
| `tasks` | Scheduled tasks |

Without `EXPORT_TYPES`, every family is exported, which is the safe choice for a migration.

When a selection is made, always include `blob` along with `data` or `registry`. The links from messages and files to their contents belong to the `blob` family. A store imported without them loses every message body at the next blob purge, even when the blob store itself is kept.

An unknown value, including an empty string, stops the export with `Backup failed: Unknown family <value>.`. The following command exports only the blobs and their links:

```bash
$ EXPORT_TYPES="blob" /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.json --export /var/tmp/stalwart-blobs
```

## Import

The import needs a configuration that describes the new stores. Prepare a `config.json` that points to the new data store, and to the new blob store if it changes. Then run the binary with that configuration and `--import`, naming the dump directory or a single dump file:

```bash
$ /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config-new.json --import /var/tmp/stalwart-export
```

The import writes every file of the dump, so the only way to import less is to export less. It enforces two rules:

- The dump must have been written by a server with the same database schema version as the binary that imports it. Otherwise, the import stops with `Invalid database schema version in "<file>": Expected <N>, found <M>`. Export formats are compatible across 1.x releases.
- The target must be empty in every range being imported. Otherwise, the import stops with `Cannot import: the target database already contains data in the key ranges being imported.`, followed by the conflicting files. This happens most often when the new server was started before the import. Import into a freshly created database, and start the server only afterwards.

The `--config`, `--export` and `--import` options must be given on the command line. When the `CONFIG_PATH` environment variable is set, the binary ignores its command-line options and starts the server normally instead.

## After the import

Start the server with the new configuration. A few kinds of data are not part of the dump and must be rebuilt.

The search index is the first. Run a `StoreMaintenance` task of type `reindexAccounts` ([Tasks](/docs/management/tasks-actions/tasks#maintenance-tasks)) to rebuild it. Until the task completes, searches return incomplete results. An external search engine such as Elasticsearch or Meilisearch is not affected by the export or import.

Blobs that belong to no object are also not exported. These are the spam classifier model and its training data, and cache snapshots stored in the blob store. Cache snapshots are rebuilt automatically. The spam classifier must be trained again with a `SpamFilterMaintenance` task of type `retrain` ([Tasks](/docs/management/tasks-actions/tasks#maintenance-tasks)), unless the old blob store is kept and copied.
