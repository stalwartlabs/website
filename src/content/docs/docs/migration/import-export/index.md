---
sidebar_position: 1
title: "Overview"
description: "What Vandelay copies, how its import and export work through a local archive, and how repeated runs behave."
---

[Vandelay](https://github.com/stalwartlabs/vandelay) is a command-line tool that copies one account at a time from a source system to a JMAP server such as Stalwart.

Vandelay carries the data types that a JMAP account holds: mailboxes and messages, identities, Sieve scripts, address books and contacts, calendars and events, and files. Participant identities (the addresses under which a user takes part in scheduling) are the exception. They are read into the archive but not exported, because Stalwart creates them from the account's addresses.

Vandelay reads the source over the protocol that the source system offers: JMAP, IMAP, CalDAV, CardDAV, WebDAV or ManageSieve, a local Maildir tree, a Google Takeout export, or Microsoft Exchange over EWS or Microsoft Graph. It writes to the target over JMAP. The [migration overview](/docs/migration/) describes how Vandelay is combined with the migration proxy to move a whole mail system.

## Archive

Vandelay copies an account in two steps, joined by a local SQLite file called the archive. The import reads an account from the source and records its contents in the archive. The export reads the archive and writes its contents to a target JMAP server. The import and the export never communicate with each other, only with the archive.

An archive holds one account. Several importers can fill the same archive, for example IMAP for mail and CalDAV for calendars of the same account.

The archive describes the account on its own, which decouples the two steps. The import and the export need not run at the same time, on the same machine, or with both servers reachable at once. An account can be imported in one network and exported in another, or imported once and exported several times while a target is being prepared.

The archive is also compact. Message bodies, Sieve scripts and file contents are stored in it once, identified by a hash of their content, so duplicated messages and attachments take space only once.

## Repeated runs

The import and the export can be run again against the same archive. This is how an interrupted run is completed, and how later changes are copied. The two commands behave differently when repeated:

- A repeated import compares what the source holds with what the archive holds, reads only what changed, and removes from the archive what was deleted on the source. How changes are detected depends on the importer, and the [importer pages](/docs/migration/import-export/import/) describe the exceptions.
- A repeated export compares the archive with what the target holds, matches each archived object with an existing object on the target, and creates only the objects that match nothing. It does not change objects that already exist on the target, and by default it deletes nothing.

A migration of an active account therefore consists of an initial import and export, followed by a short final import and export that copy what arrived in the meantime, as the [migration guide](/docs/migration/guide/migrate-accounts/) describes.

## Sources and target

Whatever the source, the data is converted to the JMAP data model as it enters the archive, so the export has a single job.

The target is always a JMAP server. Vandelay uses the standard JMAP mail, contacts, calendars, file storage and Sieve capabilities, so it works with any server that implements them. Stalwart is the target it is tested against. The [importer pages](/docs/migration/import-export/import/) describe each source.

## Backups

An archive is a self-contained file that describes one account, so Vandelay can also make per-account backups. A scheduled import refreshes the archive, and an export restores it. The [backup](/docs/migration/import-export/backup) page describes this use.
