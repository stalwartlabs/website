---
sidebar_position: 8
title: "Maildir"
description: "Import mail from a local Maildir++ tree: the folder layout, folder selection and roles, flags, change detection and examples."
---

The Maildir importer reads a local Maildir++ tree into an archive, without network access and without credentials. It suits migrations from a file system backup, or from a Dovecot, Courier or qmail Maildir copied to the host that runs Vandelay. The source is identified by the path of the Maildir root.

## Invocation

The command takes two positional arguments, the Maildir root first and the archive second:

```sh
vandelay import maildir <MAILDIR> <ARCHIVE>
```

`<MAILDIR>` is the directory that contains `cur/`, `new/` and `tmp/`. The path may be relative, contain `..`, or be a symbolic link. Vandelay resolves it to an absolute path before recording it, so different spellings of the same directory count as the same source.

## Layout

The Maildir root holds the inbox. Messages are read from `cur/` and `new/`. `tmp/`, where delivery agents stage messages, is never read.

Subfolders follow the Maildir++ convention. They are directories next to `cur/`, `new/` and `tmp/` whose names start with a dot, with further dots separating hierarchy levels. `.Archive.2025` is therefore the folder `2025` inside `Archive`:

```text
<root>/
├── cur/                 inbox, read messages
├── new/                 inbox, unread messages
├── tmp/                 delivery staging, not read
├── .Sent/               folder "Sent"
├── .Archive/            folder "Archive"
└── .Archive.2025/       folder "2025" inside "Archive"
```

Each folder has a canonical name, which is used as its name, for its position in the tree, and for folder selection. It is `INBOX` for the root, and the directory name without its leading dot for every subfolder: `.Sent` becomes `Sent`, and `.Archive.2025` becomes `Archive.2025`.

Only the Maildir++ layout is supported. Dovecot's `LAYOUT=fs`, which nests subfolders as real directories, is rejected with an error.

## Folder selection and roles

<!-- include:folder-selection -->
By default, every folder is imported. Two mutually exclusive forms narrow the selection. Both are compared with the folder's canonical name:

- `--include <REGEX>` and `--exclude <REGEX>`, each repeatable, select folders by regular expression. With `--include`, only matching folders are kept, and `--exclude` then drops matching folders from those.
- `--folder <NAME>`, repeatable, names folders exactly. It cannot be combined with `--include` or `--exclude`.

A folder that is excluded but has a selected subfolder is still created, without messages, so that the subfolder keeps its place in the tree.

Folders with a special purpose (inbox, sent, drafts, trash, junk, archive) receive the matching JMAP role, so that the export binds them to the target's existing folders. The inbox always has the `inbox` role. For other folders, the role is taken from the folder's special-use attribute where the source has one. Otherwise, it is guessed from common folder names, such as `Sent Items`, `Deleted Messages`, `Junk E-mail` or `[Gmail]/Sent Mail`.

`--noautomap` turns off the guessing, so that only special-use attributes assign roles. Each role is given to one folder per archive: the first that claims it.

Messages marked for deletion (with the IMAP `\Deleted` flag or the Maildir `T` flag) are skipped by default. With `--include-deleted`, they are imported with the `$deleted` keyword.
<!-- /include:folder-selection -->

A Maildir has no special-use attributes and no subscriptions, which affects roles and options. Roles are assigned only from folder names, by the last level of each name, and there are no `--subscribed-only` and `--exclude-special` options. With `--noautomap`, no folder except the inbox has a role. To skip a folder such as the trash, name it in an expression, for example `--exclude '^Trash$'`.

## Flags

The flags in a message's file name become JMAP keywords: `S` becomes `$seen`, `R` becomes `$answered`, `P` becomes `$forwarded`, `D` becomes `$draft`, and `F` becomes `$flagged`. Maildir has no other keywords.

`T` marks a message for deletion. Such a message is skipped, and a message already in the archive that gains `T` is removed on the next run, unless `--include-deleted` is given.

The time a message was received is taken from the delivery time in its file name, else from its `Date` header, else from the file's modification time.

## Change detection

On each run, the importer compares the messages on disk with the archive. New messages are read, messages that disappeared are removed, and messages whose flags changed have their keywords updated, without being read again. The archive records the canonical path, so a run against another Maildir is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection).

The common options apply, but those that concern network sources have no effect: `--threads` and `--max-retries` are accepted and ignored, and so is `--allow-invalid-certs`. `--dry-run` prints, per folder, the new, vanished and present messages, and the new and vanished folders, without writing.

## Examples

The following command reads a whole Maildir tree into a new archive:

```sh
vandelay import maildir /home/alice/Maildir alice.sqlite
```

The next command reads only the archive hierarchy and the sent folder, without the trash, and without roles guessed from names:

```sh
vandelay import maildir \
  --include '^Archive' \
  --include '^Sent$' \
  --exclude '^Trash$' \
  --noautomap \
  /home/alice/Maildir \
  alice.sqlite
```

The last command reads two named folders, including messages marked for deletion:

```sh
vandelay import maildir \
  --folder INBOX \
  --folder Sent \
  --include-deleted \
  /backup/restore/Maildir \
  alice.sqlite
```
