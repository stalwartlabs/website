---
sidebar_position: 1
title: "Overview"
description: "How stalwart-migrate copies a Stalwart 0.16 deployment into a new 1.0 store, incrementally and with a short final downtime, and what it requires."
---

A Stalwart 0.16 deployment cannot be upgraded in place, because Stalwart 1.0 cannot open a 0.16 data store. A 1.0 server started on a 0.16 store stops with `The data store was created by a Stalwart version prior to 1.0 (schema version <N>) and cannot be opened by this version.`

`stalwart-migrate` bridges the two releases. It is a command-line tool that copies the whole deployment, settings and data, from the 0.16 store into a new, empty 1.0 store. The bulk of the copy runs while 0.16 keeps serving users, and repeated runs copy only what changed since the previous one. The deployment is down only for the final run, which copies the last changes with 0.16 stopped. After that run, 1.0 starts on the new store.

The tool suits small and medium deployments that can hold a second copy of their data store. Deployments that cannot, or that migrate from another release or another server, use the procedures listed in the [migration overview](/docs/migration/).

## Migration process

The migration is a copy. The tool opens the 0.16 data store read-only and never writes to it, so the original deployment stays intact, and keeps working both during the migration and after it. Everything the tool writes goes into the new 1.0 store, which must be empty when the first run starts.

The tool works through a small set of commands:

| Command | Purpose |
|---|---|
| `prepare` | Shows how the 0.16 settings convert to 1.0, asks about the conversions that need a decision, and records the answers. |
| `run` | Copies the data into the 1.0 store. It can be interrupted and repeated, and each run copies only what changed since the previous one. |
| `run --final` | With 0.16 stopped, copies the last changes, finalises the 1.0 store and verifies it. |
| `verify` | Compares the 0.16 and 1.0 stores, on a sample of accounts or in full. |
| `status` | Shows progress, accounts in error and recent runs. |
| `report` | Lists every object that was dropped, changed, truncated or could not be copied. |
| `rollback` | Copies a 1.0 store back into a new, empty 0.16 store. |

Users notice little of the switch, because the tool keeps the identifiers that clients cache. Account, document and thread identifiers, IMAP UIDs and UIDVALIDITY values, and the change history of every account all keep their 0.16 values. IMAP clients therefore do not download their mailboxes again, and JMAP clients continue their synchronisation where they stopped.

A few effects do remain visible:

- OAuth tokens issued by 0.16 are not migrated, so users sign in again in OAuth clients.
- CalDAV, CardDAV and WebDAV clients fetch their calendars, contacts and files once more, because the entity tags change. Their synchronisation tokens stay valid.
- The full-text search index is not copied. Stalwart 1.0 rebuilds it after it starts, and searches return incomplete results until the rebuild finishes.
- Every message carries one of the keywords `$hasattachment` and `$hasnoattachment`, which Stalwart 1.0 sets from the message's content. IMAP clients list them with the other keywords of a message and cannot set or remove them.

Settings are converted by name, from the 0.16 schema to the 1.0 schema. Most conversions are automatic. A few change behaviour, such as those for OpenID Connect directories, client address detection behind a reverse proxy and AI models. `prepare` presents each of these, explains the difference and records the decision. Every setting or object that cannot be represented in 1.0 is listed in the run report. The complete list of schema differences is kept in [SCHEMA_CHANGES.md](https://github.com/stalwartlabs/stalwart-migrate/blob/main/SCHEMA_CHANGES.md), in the tool's repository.

The tool's reach is limited. It does not upgrade earlier 0.16 releases, and it does not modify the external services that 0.16 uses: search engines, in-memory and lookup stores, directories, cluster coordinators and telemetry stores are never opened. The only change it makes outside the new store concerns the learned spam filter model in a shared blob store, as described in [Shared blob stores](/docs/migration/upgrade-0-16/prepare#shared-blob-stores).

## Supported stores

The tool reads and writes every data store backend that Stalwart supports: RocksDB, SQLite, PostgreSQL, MySQL and FoundationDB. Message bodies, attachments and files may live in the data store itself or in an external blob store. The external blob store can be S3 or an S3-compatible service, Azure Blob Storage, the file system, or a sharded combination of these.

The target is defined independently of the source, so the migration can also move the deployment to another data store backend at the same time.

The settings and data of every feature are migrated, including tenants, AI models, masked email addresses, alerts, sharded stores, archived items, and stored traces and metrics.

## Requirements

Before the migration starts, the deployment must meet these conditions:

- The source runs Stalwart 0.16.27. Earlier 0.16 releases are upgraded to 0.16.27 first.
- The target is a new, empty store: a new PostgreSQL or MySQL database, a new FoundationDB cluster, or a new RocksDB directory or SQLite file. A PostgreSQL database may contain extensions and the schemas of other applications, provided those schemas are not on the search path of the user the tool connects as.
- There is room for a second copy of the data store. With an external blob store that 1.0 reuses, only the data store is duplicated, because message bodies and files stay where they are.
- Every 0.16 node can be stopped for the final run. The runs before it read a live server.
- The tool runs on a Linux or macOS host that reaches both stores under the same paths and network names that the servers use, or the differences are bridged as described in [Paths and file ownership](/docs/migration/upgrade-0-16/installation#paths-and-file-ownership).

## Choosing between one window and incremental runs

The migration can run in either of two ways. The choice depends on how long a maintenance window the deployment can afford:

- **With downtime.** When a window long enough for a complete copy is available, 0.16 is stopped and the migration is a single final run.
- **With minimal downtime.** The first full copy, and any number of incremental runs, take place while 0.16 serves users. The window then covers only the final run, which copies the changes made since the last incremental run.

Both are described in [Running the migration](/docs/migration/upgrade-0-16/migrate).

## Steps

The [quick migration guide](/docs/migration/upgrade-0-16/quick-guide) lists every step with its commands on one page. Each step also has a page of its own with the full details:

1. [Installation](/docs/migration/upgrade-0-16/installation): install the tool on a host that reaches both stores.
2. [Preparing the migration](/docs/migration/upgrade-0-16/prepare): review the settings conversion, answer its questions and create the empty 1.0 store.
3. [Running the migration](/docs/migration/upgrade-0-16/migrate): copy the data, run the final copy and start 1.0.
4. [Verifying the migration](/docs/migration/upgrade-0-16/verify): compare the stores and review the report.

Three further pages cover special cases:

- [Rolling back](/docs/migration/upgrade-0-16/rollback) returns the deployment to 0.16.
- [Converting CLI plans](/docs/migration/upgrade-0-16/cli-plans) converts the plans of a deployment managed with `stalwart-cli`.
- [Troubleshooting](/docs/migration/upgrade-0-16/troubleshooting) lists the known limitations and the refusals that the tool reports.
