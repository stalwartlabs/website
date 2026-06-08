---
sidebar_position: 6
title: "Backup"
---

Although Vandelay is built for migration, the same machinery makes it a capable per-account backup tool. The archive that an import produces is a single self-contained SQLite file that completely describes one account: its mailboxes and messages, calendars and events, address books and contacts, Sieve scripts, identities and stored files. A backup strategy with Vandelay is therefore nothing more than running imports on a schedule to refresh that file, keeping the files as the backups, and running an export to restore one when needed.

## The archive as a backup artifact

Because an archive is an ordinary SQLite file, it inherits all the convenience that implies. It is a single object to copy, move, compress or encrypt; it can be stored on any medium or uploaded to any object store; and its integrity can be checked with ordinary tools. Message bodies, Sieve scripts and file payloads inside it are content-addressed by BLAKE3 hash and stored once, so an account with many duplicated attachments or repeated messages occupies far less space than the sum of its parts. The [`inspect`](usage) command reads an archive without any network access, which makes it straightforward to confirm that a backup contains what is expected before relying on it.

## Capturing snapshots on a schedule

A backup is captured by running the appropriate importer against the live account. Because import is convergent and reconciles by comparing the source's current identifiers against those already stored, repeating the same import against the same archive is both safe and efficient: a re-run captures whatever has been added since the previous snapshot and removes records for anything deleted on the source, without re-downloading what is already present. This is exactly the behaviour wanted from an incremental backup, and it is achieved simply by running the same command again on a timer.

The command below captures a JMAP account into a dated archive and is suitable for invocation from `cron`, a systemd timer or any other scheduler. Supplying the credential through the environment keeps it out of the process table and the scheduler's logs:

```sh
export VANDELAY_PASSWORD='account-app-password'
vandelay import jmap \
  --url https://jmap.example.com \
  --auth-basic alice@example.com \
  --account-name alice@example.com \
  /backups/alice.sqlite
```

Two retention styles are possible. Refreshing one archive in place keeps a single always-current snapshot, which is the most space-efficient option and the natural fit for the convergent import model. Alternatively, copying the refreshed archive to a timestamped filename after each run, or importing into a new dated file each time, retains a history of point-in-time snapshots at the cost of more storage. The choice depends on whether the priority is the latest recoverable state or the ability to roll back to an earlier one.

## Backing up sources that carry one data type

Several importers cover only a single kind of data: IMAP carries mail, CalDAV calendars, CardDAV contacts and ManageSieve Sieve scripts. Backing up an account reached only through these protocols means running each relevant importer against the same archive, so that the one file accumulates a complete picture of the account. A scheduled backup of an IMAP-and-CalDAV account, for instance, runs an IMAP import and a CalDAV import in sequence into a shared archive on each cycle.

## Restoring from a backup

Restoring is an export. Pointing `export` at a JMAP target reconciles the archived account onto that server, recreating the mailboxes, messages, calendars, contacts and other objects the archive holds. The additive default makes restoration safe to attempt against a server that may already hold some of the data, because matched objects are recognised and skipped while only missing objects are created:

```sh
export VANDELAY_PASSWORD='target-password'
vandelay export \
  --url https://jmap.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  /backups/alice.sqlite
```

When the intent is to reproduce the archive exactly, including removing anything on the target that the backup does not contain, `--prune` brings the target into precise correspondence with the archive; previewing such a restore with `--dry-run` beforehand is advisable. As with every Vandelay operation, an interrupted restore is completed by running the same export again.

## Considerations and limits

A backup taken with Vandelay captures the data types of the account, not the server's surrounding configuration: access controls, server settings and provisioning live outside the account model and are not part of the archive. The fidelity of a backup is also bounded by the source protocol, since an importer can only preserve what its protocol exposes; the [Import](import/) section documents what each path carries. Finally, an archive holds exactly one account, so backing up several accounts means maintaining one archive per account. Within those bounds, a scheduled import and an on-demand export provide a dependable, portable, self-contained backup of an account's contents.
