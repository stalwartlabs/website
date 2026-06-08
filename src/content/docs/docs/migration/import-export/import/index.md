---
sidebar_position: 1
title: "Overview"
---

Importing is the first half of a Vandelay migration: it reads a source account, over whichever protocol that source speaks, and records its contents in a local SQLite archive. The archive is a complete, self-contained description of one account that a later export reproduces on a JMAP target. Import and export never communicate directly; the archive is the only thing that passes between them, which is what lets a capture and a restore happen at different times, on different machines, and against different servers.

## Supported sources

Vandelay imports from a wide range of protocols so that an account can be migrated regardless of what the originating system exposes. Each source has its own page with detailed, validated examples:

- [JMAP](jmap) reads a full account from another JMAP server, the most faithful path because no intermediate representation is involved.
- [IMAP](imap) reads mail from any IMAP server, with folder filtering, role mapping and keyword translation.
- [CalDAV](caldav) reads calendars and events; [CardDAV](carddav) reads address books and contacts; [WebDAV](webdav) reads a plain file collection as a file-storage tree.
- [ManageSieve](managesieve) reads Sieve scripts.
- [Maildir](maildir) reads a local Maildir++ tree with no network access, and [Google Takeout](takeout) reads an exported directory tree of mbox, iCalendar and vCard files.
- [Microsoft Exchange via EWS](exchange-ews) and [Microsoft Exchange Online via Graph](exchange-graph) read Exchange mailboxes, producing mail, calendars and contacts in a single run.

Several of these importers carry only one kind of data, so a complete account migration often combines a few of them against the same archive: an IMAP import for mail, a CalDAV and CardDAV import for scheduling and contacts, and a ManageSieve import for filters, for example. The Exchange importers and the JMAP importer are the exceptions, each producing several data types at once.

## Reconciliation model

Every importer works by id-based reconciliation rather than by maintaining a running synchronisation cursor. For each data type Vandelay enumerates the identifiers the source currently holds, compares that set against the identifiers already stored in the archive, and then fetches and inserts the objects that are new while removing the records whose identifiers have disappeared from the source. Container types such as mailboxes, calendars and address books are always reconciled before the items that belong to them, so the structure an item depends on is present before the item itself.

This model has a useful consequence: an import is convergent. A run that is interrupted by a network failure or a signal can simply be started again, and it resumes by recomputing the difference between source and archive. A run repeated days later against the same account captures whatever has changed in the meantime. There is no bookkeeping flag to clear and no partial state to repair.

## Common behaviour across importers

Although the connection and selection flags differ from protocol to protocol, several behaviours are shared by every import path.

The destination archive is always the final positional argument and is created automatically if it does not yet exist. Credentials, where a source requires them, should be supplied through the `VANDELAY_PASSWORD`, `VANDELAY_TOKEN` or provider-specific environment variables, or through the interactive prompt, rather than written on the command line. Every importer records the identity of the source it was first run against and refuses to import from a different source into the same archive unless `--allow-source-change` is given, which prevents two unrelated accounts from being merged by accident. Items that cannot be parsed, such as a malformed calendar entry, are skipped with a warning and counted toward the partial-failure exit code rather than aborting the whole run. The global `--dry-run` flag computes and reports the full plan, including how many objects would be created or removed, without writing anything.

The flags common to every command, including verbosity, worker-pool sizing, retry policy and TLS handling, are described on the [Usage](../usage) page.
