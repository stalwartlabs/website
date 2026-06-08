---
sidebar_position: 9
title: "Google Takeout"
---

Vandelay can import a Google Takeout export, or any directory tree containing standard mail and calendar archive files, into a local SQLite archive. This source kind is fully offline: it reads files from disk, never contacts a server, and requires no URL and no credentials. The primary use case is a Google account export, but the importer applies the same rules to any tree that holds `.mbox`, `.ics`, or `.vcf` files, so a Thunderbird mbox dump, an Apple Calendar `.ics`, or a Contacts.app `.vcf` are accepted with no Takeout-specific assumption.

## Command surface

The Takeout importer takes two positional arguments, the directory path first and the archive second:

```sh
vandelay import takeout [OPTIONS] <PATH> <ARCHIVE>
```

- `<PATH>` is the directory under which the recursive scan runs. It is typically the unpacked Takeout root, but any directory containing the matching file types is accepted.
- `<ARCHIVE>` is the local SQLite archive file. It is created if absent and reused (continued) if it already exists.

The order is significant: the path to scan comes before the archive file. There is no `--url`, no authentication flag, and no object selector; whatever matching files the scan finds are imported in full.

## Obtaining and unpacking a Google Takeout archive

A Google Takeout export is requested from [takeout.google.com](https://takeout.google.com). For a migration into Vandelay, three product selections are relevant:

- **Mail**, exported as mbox. Gmail is delivered as one or more `.mbox` files (commonly a single `All Mail Including Spam and Trash.mbox`, sometimes per-label files such as `Inbox.mbox` and `Github.mbox`).
- **Calendar**, exported as iCalendar. Each calendar becomes one `.ics` file.
- **Contacts**, exported as vCard. Contacts are delivered as `.vcf` files, often grouped (`All Contacts.vcf`, `My Contacts.vcf`).

Takeout delivers the result as one or more `.zip` or `.tgz` downloads. Vandelay does not read compressed archives directly: the operator must extract the download to disk before running the importer. After extraction, a Takeout root typically looks like the following, with mail, calendars, and contacts all living under one tree:

```
Takeout/
  Mail/
    All Mail Including Spam and Trash.mbox
    Github.mbox
  Calendar/
    Personal.ics
    Work.ics
    meet_settings.json
  Contacts/
    All Contacts/
      All Contacts.vcf
```

## Recursive discovery

Vandelay walks the supplied directory recursively and selects every regular file whose lower-cased extension is `.mbox`, `.ics`, or `.vcf`. Mail, calendars, and contacts can therefore all come from the same tree in a single run; the importer produces JMAP `Mailbox`/`Email` rows from the mbox files, `Calendar`/`CalendarEvent` rows from the iCalendar files, and `AddressBook`/`ContactCard` rows from the vCard files. Files of any other type are skipped silently, including the sidecars a real Takeout ships alongside the data: `meet_settings.json`, `archive_browser.html`, per-contact `.jpg` portraits, `*-metadata.json`, and unrelated product directories (`Drive/`, `YouTube and YouTube Music/`, `Chrome/`, and so on). Directory names are never inspected, so a localised Takeout (`Courrier/`, `Kalender/`, `Kontakte/`) is matched by exactly the same rule.

Symbolic links are followed once; a symlink cycle is detected, logged, and broken so the walk continues. If the scan finds no matching files at all, or the path does not exist or is not a directory, the run aborts with a usage error.

## Gmail label mapping

Each Gmail message in an mbox carries an `X-Gmail-Labels` header: a comma-separated list of the labels applied to it. Vandelay maps these labels onto JMAP mailboxes, keywords, and roles. System labels become well-known mailboxes with the corresponding role, certain state labels become keywords with no mailbox, the Gmail auto-category labels are dropped, and everything else becomes a custom mailbox.

| `X-Gmail-Labels` token | JMAP destination |
|------------------------|------------------|
| `Inbox` | Mailbox `Inbox`, role `inbox` |
| `Sent` | Mailbox `Sent`, role `sent` |
| `Drafts` | Mailbox `Drafts`, role `drafts` |
| `Trash` | Mailbox `Trash`, role `trash` |
| `Spam` | Mailbox `Spam`, role `junk` |
| `Archived` | Mailbox `Archive`, role `archive` |
| `Chat` | Mailbox `Chat`, no role |
| `Starred` | Keyword `$flagged`, no mailbox |
| `Important` | Keyword `$important`, no mailbox |
| `Opened` | Keyword `$seen`, no mailbox |
| `Unread` | Read-state marker (absence of `$seen`) |
| `Category Personal`/`Promotions`/`Social`/`Updates`/`Forums` | Dropped silently |
| Any other label, including `Parent/Child` nesting | Mailbox with that name, no role |

Nested labels use the forward slash as the hierarchy separator, and the full parent chain is created automatically. A message that carries no `X-Gmail-Labels` header (common in non-Gmail mbox files) is placed in a mailbox named after the containing `.mbox` file with its extension stripped, so a `Thunderbird-Inbox.mbox` contributes its messages to a `Thunderbird-Inbox` mailbox.

### Disabling system-label roles

The `--noautomap` flag disables the role assignment in the table above. With `--noautomap`, the system-label mailboxes are still created with their names (`Inbox`, `Sent`, `Archive`, and so on), but none of them is tagged with a JMAP role; every such mailbox ends with no role. The flag is useful when the target server should assign roles itself, or when the operator wants the imported tree to stay free of role semantics.

## Idempotency and re-running

Each message is identified by the BLAKE3 hash of its raw bytes, so re-running the importer against the same (or a content-identical) tree converges without persisting any cursor: messages already present are recognised and skipped, and a message that appears byte-identical in two mbox files (for example the same conversation in `All Mail.mbox` and `Inbox.mbox`) is stored once, with its mailbox set being the union of the labels from each occurrence. Calendar events and contact cards are keyed by their iCalendar/vCard `UID` where present, with a stable synthetic identity derived from the file path otherwise. An interrupted run is resumed simply by running the same command again.

## Source-change protection

An archive records the canonical absolute path of the Takeout tree it was filled from. Pointing the same archive at a Takeout tree at a different path fails, to protect against accidentally mixing two exports into one archive. Re-extracting the same Takeout to the same directory is always permitted, because the canonical path is unchanged. To deliberately import from a different path into an existing archive, pass `--allow-source-change`.

## Examples

Import an unpacked Google Takeout folder, with mail, calendars, and contacts all drawn from the one tree, into a new archive (path first, archive second):

```sh
vandelay import takeout \
  /home/alice/Downloads/Takeout-2026-05-01 \
  alice.sqlite
```

Import an arbitrary directory of loose `.mbox`, `.ics`, and `.vcf` files (here a non-Gmail backup) into an archive, disabling system-label role assignment:

```sh
vandelay import takeout --noautomap \
  /srv/backups/mail-archive \
  archive.sqlite
```

Re-import from a relocated export into an existing archive, overriding source-change protection:

```sh
vandelay import takeout --allow-source-change \
  /mnt/external/Takeout \
  alice.sqlite
```

## Global flags

The Takeout importer accepts the global flags. `--dry-run` reports a light plan (the counts of matching files found and of existing rows in the archive) and writes nothing. The verbosity flags (`-v`, repeatable up to `-vvv`, and `-q`) control logging as elsewhere. Because the import is local and offline, the network-oriented globals are accepted but have no effect: `--threads` is ignored (the importer is single-threaded) and `--max-retries` is ignored (a file that cannot be read once will not become readable on retry).
