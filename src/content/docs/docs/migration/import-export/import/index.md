---
sidebar_position: 1
title: "Overview"
description: "The Vandelay importers, which importers to use for each kind of source system, and the behaviour shared by all of them, including source-change protection."
---

An import reads an account from a source, over the protocol that the source offers, and records its contents in a local archive. A later [export](/docs/migration/import-export/export) writes the archive to a JMAP server. The import and the export never communicate directly: the archive is all that passes between them.

## Importers

| Importer | Reads | Data types |
| --- | --- | --- |
| [JMAP](/docs/migration/import-export/import/jmap) | A JMAP server | Every type the server advertises |
| [IMAP](/docs/migration/import-export/import/imap) | An IMAP server | Mail |
| [CalDAV](/docs/migration/import-export/import/caldav) | A CalDAV server | Calendars, events, tasks and notes |
| [CardDAV](/docs/migration/import-export/import/carddav) | A CardDAV server | Address books and contacts |
| [WebDAV](/docs/migration/import-export/import/webdav) | A WebDAV file collection | Files |
| [ManageSieve](/docs/migration/import-export/import/managesieve) | A ManageSieve server | Sieve scripts |
| [Maildir](/docs/migration/import-export/import/maildir) | A local Maildir++ tree | Mail |
| [Google Takeout](/docs/migration/import-export/import/takeout) | A local directory of mbox, iCalendar and vCard files | Mail, calendars and contacts |
| [Exchange (EWS)](/docs/migration/import-export/import/exchange-ews) | Exchange Server or Exchange Online over EWS | Mail, calendars and contacts |
| [Exchange (Graph)](/docs/migration/import-export/import/exchange-graph) | Microsoft 365 over Microsoft Graph | Mail, calendars, contacts and OneDrive files |

To copy a whole account, the importers that read one data type are combined into the same archive. A typical combination is IMAP for mail, CalDAV and CardDAV for calendars and contacts, and ManageSieve for filters.

## Choosing importers for a source system

| Source system | Importers |
| --- | --- |
| Stalwart | JMAP. When the source does not advertise the capability for files, contacts or calendars, WebDAV, CardDAV or CalDAV for that data type, as described under [Checking a Stalwart source](/docs/migration/guide/configure-source/#checking-a-stalwart-source). |
| Another JMAP server, such as Fastmail | JMAP |
| Dovecot | IMAP with a master user, and ManageSieve; CalDAV and CardDAV when the deployment runs a calendar and contacts server such as SOGo, Radicale or Baikal |
| Cyrus IMAP, Courier and other IMAP servers | IMAP, plus ManageSieve where the server offers it |
| Google Workspace and Gmail | IMAP, CalDAV and CardDAV, or Google Takeout for a one-time copy |
| Microsoft 365 | Exchange (Graph), or Exchange (EWS) while Microsoft allows it |
| Exchange Server on premises | Exchange (EWS) |
| A Maildir tree on disk | Maildir |

The migration as a whole is described in [Migrating from hosted services](/docs/migration/guide/hosted) for a hosted service, and in the [migration guide](/docs/migration/guide/) for a self-hosted server.

## Reconciliation

An import does not copy blindly. It compares the objects that the source currently holds with those already in the archive, and acts on the difference:

- It reads and stores the objects that are new.
- It refreshes the objects that changed, where the source protocol shows changes.
- It removes from the archive the objects that disappeared from the source.

Containers (mailboxes, calendars, address books, file folders) are processed before the objects they contain. The importer pages describe how each importer detects changes, and the exceptions: the Takeout importer never removes objects, and the Graph importer does not refresh objects already in the archive.

An import can therefore be interrupted and started again: the repeated run compares again, and continues. A run repeated later against the same account copies what changed in the meantime.

## Behaviour shared by all importers

The archive is the last positional argument, and is created when it does not exist. Credentials are given through environment variables or a prompt, as described under [Credentials](/docs/migration/import-export/usage#credentials).

An object that cannot be parsed, such as a malformed calendar entry, is skipped with a warning and counted towards the partial failure exit code. The rest of the run continues. `--dry-run` reports what the import would do without writing to the archive, as described under [Dry runs](/docs/migration/import-export/usage#dry-runs).

## Source-change protection

An archive records the identity of each source it was filled from, such as the URL and the account for a JMAP source, the server and the login for IMAP, or the path for Maildir and Takeout.

A later import of the same kind from a different source into the same archive is refused with exit code 4, which keeps two unrelated accounts from being mixed in one file. The message names the recorded source, for example `archive already records JMAP source (<url>, account <id>); pass --allow-source-change to import a different account`. Sources of different kinds do not conflict, so an IMAP and a CalDAV import of the same account fill one archive.

`--allow-source-change` lets the import proceed, and records the new source next to the old one. The objects read from the old source stay in the archive.

The identity is compared as given. For JMAP, for example, switching `--url` between a base URL and the session URL of the same server counts as a different source.
