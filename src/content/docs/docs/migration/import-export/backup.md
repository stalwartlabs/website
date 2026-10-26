---
sidebar_position: 6
title: "Backup"
description: "Use Vandelay archives as per-account backups: scheduled imports, retention, restore with an export, and what a backup does not contain."
---

An archive is a self-contained SQLite file that describes one account: its mailboxes and messages, identities, Sieve scripts, address books and contacts, calendars and events, and files. Vandelay can therefore make per-account backups. An import run on a schedule refreshes the archive, the archive file is the backup, and an export restores it.

This backs up the contents of individual accounts, not the server. A backup of a whole Stalwart server, including its configuration, is described in [Backup and restore](/docs/management/maintenance/backup).

## Archive as a backup

An archive is a single file, which is easy to copy, compress, encrypt or upload to object storage. Its integrity can be checked with SQLite's own tools. Message bodies, Sieve scripts and file contents are stored once, identified by a hash of their content, so an account with duplicated messages or attachments takes less space than the sum of its parts. [`vandelay inspect`](/docs/migration/import-export/usage#inspecting-an-archive) shows what an archive contains, without network access.

## Scheduled imports

A backup is taken by running the importer that fits the account's server. A repeated import into the same archive reads only what changed since the previous run, and removes from the archive what was deleted on the source. Running the same command on a schedule therefore maintains an incremental backup.

Two importers are exceptions. The Takeout importer does not remove what disappeared from the export. The Graph importer does not refresh items already in the archive, so a scheduled Graph backup misses later changes to them, such as read state or edited events.

The following command backs up a JMAP account, and suits a cron job or a systemd timer. The password comes from the environment, so it appears neither in the process list nor in the scheduler's logs:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import jmap \
  --url https://mail.example.com \
  --auth-basic alice@example.com \
  --account-name alice@example.com \
  /backups/alice.sqlite
```

Retention depends on how the archive is kept, and the choice is a tradeoff between storage and history:

- Refreshing one archive in place keeps a single current copy, which uses the least space.
- Copying the archive to a dated file after each run, or importing into a new dated file each time, keeps a history of copies, at the cost of more storage.

The right choice depends on whether the latest state matters more, or the ability to return to an earlier state.

## Sources with one data type

Several importers read one kind of data: IMAP reads mail, CalDAV reads calendars, CardDAV reads contacts, and ManageSieve reads Sieve scripts. An account reached only through these protocols is backed up by running each relevant importer into the same archive, so that the file holds the whole account. A backup of an account reached over IMAP and CalDAV, for example, runs an IMAP import and a CalDAV import one after the other, on each cycle.

## Restoring

Restoring is an export of the archive to a JMAP server. The export matches the archived objects with what the target holds, and creates only the missing ones. It can therefore be run against an account that still holds part of the data:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay export \
  --url https://mail.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  /backups/alice.sqlite
```

The export does not change objects that already exist on the target. A message present on the target keeps its folders and flags, and an event or contact present on the target keeps its content.

`--prune` goes further. It additionally deletes folders, calendars, address books, contacts, events, Sieve scripts and files on the target that the archive does not describe, but never messages, identities or participant identities, as described under [Pruning](/docs/migration/import-export/export#pruning).

The export also activates the archive's active Sieve script on the target. An interrupted restore is completed by running the same export again.

## Account properties and server settings

A backup contains the data of the account, not its surroundings. Access rights granted to other accounts, quotas, account properties such as aliases and credentials, and server settings are not in the archive.

Some data depends on the protocol used. A vacation response is in the archive only when the account was imported over JMAP from a server that advertises `urn:ietf:params:jmap:vacationresponse`. A backup taken over a protocol also contains only what that protocol exposes, and the [importer pages](/docs/migration/import-export/import/) describe what each importer reads.

An archive holds one account, so several accounts are backed up into one archive each.
