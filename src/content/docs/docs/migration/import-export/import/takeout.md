---
sidebar_position: 9
title: "Google Takeout"
description: "Import mail, calendars and contacts from an unpacked Google Takeout export or any directory of mbox, iCalendar and vCard files."
---

The Takeout importer reads a Google Takeout export, or any directory that contains mbox, iCalendar and vCard files, into an archive. It reads files from disk only, without a server URL and without credentials.

A Google account export is the main use. The importer applies the same rules to any directory of `.mbox`, `.ics` and `.vcf` files, though, such as an mbox export from Thunderbird or a calendar exported from another application.

```sh
vandelay import takeout [OPTIONS] <PATH> <ARCHIVE>
```

`<PATH>` is the directory to scan, usually the root of the unpacked export, and `<ARCHIVE>` is the archive. The directory comes first. There is no URL, no authentication and no type selection: every matching file is imported.

## Obtaining a Takeout export

A Takeout export is requested at [takeout.google.com](https://takeout.google.com). Three products are relevant:

- Mail, exported as mbox: one or more `.mbox` files, often a single `All Mail Including Spam and Trash.mbox`.
- Calendar, exported as iCalendar: one `.ics` file per calendar.
- Contacts, exported as vCard: `.vcf` files, such as `All Contacts.vcf`.

Takeout delivers the export as `.zip` or `.tgz` files. Extract them before the import, because Vandelay does not read compressed archives. An extracted export looks like this:

```text
Takeout/
  Mail/
    All Mail Including Spam and Trash.mbox
  Calendar/
    Personal.ics
    Work.ics
  Contacts/
    All Contacts/
      All Contacts.vcf
```

## Files read

Vandelay walks the directory and its subdirectories, and reads every file whose extension, in any case, is `.mbox`, `.ics` or `.vcf`. Other files, such as `*-metadata.json`, contact photos and the directories of other Google products, are skipped.

Only extensions matter. Directory names are not considered, so an export with translated directory names is read the same way. Symbolic links are followed, and a link loop is detected and broken. When no matching file is found, or the path is not a directory, the run stops with a usage error.

Each kind of file becomes a different kind of data:

| Source | Carried as |
| --- | --- |
| `.mbox` files | Messages, placed in mailboxes according to their Gmail labels |
| `.ics` files | One calendar per file, named after its `X-WR-CALNAME` property or the file name, with its events |
| `.vcf` files | Contacts, all in one address book named `Imported` |

## Gmail labels

Each message in a Gmail mbox has an `X-Gmail-Labels` header with its labels, separated by commas. Vandelay converts them as follows: system labels become mailboxes with a role, some state labels become keywords, category labels are dropped, and every other label becomes a mailbox:

| Label | Becomes |
| --- | --- |
| `Inbox` | Mailbox `Inbox`, role `inbox` |
| `Sent` | Mailbox `Sent`, role `sent` |
| `Drafts` | Mailbox `Drafts`, role `drafts` |
| `Trash` | Mailbox `Trash`, role `trash` |
| `Spam` | Mailbox `Spam`, role `junk` |
| `Archived` | Mailbox `Archive`, role `archive` |
| `Chat` | Mailbox `Chat`, no role |
| `Starred` | Keyword `$flagged` |
| `Important` | Keyword `$important` |
| `Opened` | Keyword `$seen` |
| `Unread` | No `$seen` keyword |
| `Category Personal`, `Promotions`, `Social`, `Updates`, `Forums` | Dropped |
| Any other label | Mailbox with that name, no role; `/` separates nesting levels |

Only the English label names are recognised, so an export from an account whose labels are in another language produces mailboxes without roles.

A message without an `X-Gmail-Labels` header, as in mbox files from other programs, is placed in a mailbox named after its file, without the extension: the messages of `Thunderbird-Inbox.mbox` go to `Thunderbird-Inbox`.

With `--noautomap`, the system label mailboxes are created with their names but without roles.

## Repeated runs

A message is identified by a hash of its content. A repeated run against the same, or an identical, tree therefore adds nothing twice, and a message that appears in two mbox files is stored once, in the mailboxes of both. Events and contacts are identified by their UID or, without one, by an identifier derived from the file path.

Repeated runs only add: a message, event or contact removed from the tree stays in the archive. A Takeout export is also a copy taken at one moment. A migration that needs a final pass after the cutover therefore reads mail over [IMAP](/docs/migration/import-export/import/imap), as described in [Migrating from hosted services](/docs/migration/guide/hosted).

The archive records the absolute path of the directory, so a run against another path is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection). Extracting the same export again into the same directory keeps the path, and is accepted.

The common options apply, but `--threads` and `--max-retries` have no effect. `--dry-run` counts the matching files and the objects already in the archive, without writing.

## Examples

The following command imports an unpacked Takeout export, with mail, calendars and contacts from the same tree:

```sh
vandelay import takeout \
  /home/alice/Downloads/Takeout-2026-05-01 \
  alice.sqlite
```

The next command imports a directory of mbox, iCalendar and vCard files from other programs, without roles:

```sh
vandelay import takeout --noautomap \
  /srv/backups/mail-archive \
  archive.sqlite
```

The last command imports an export that was moved to another path, into the existing archive:

```sh
vandelay import takeout --allow-source-change \
  /mnt/external/Takeout \
  alice.sqlite
```
