---
sidebar_position: 8
title: "Maildir"
---

The Maildir importer reads a local Maildir++ tree directly from the
filesystem into a Vandelay archive. It is a fully offline operation: there
is no server URL, no authentication, and no network access of any kind. The
source is identified solely by the on-disk path of the Maildir root, which
makes this importer the natural choice for migrating from a filesystem
backup or from a Dovecot, Courier, or qmail Maildir that has been copied
onto the machine running Vandelay.

## Invocation and positional order

The subcommand takes two positional arguments, and the order matters: the
Maildir path comes first, the archive second.

```sh
vandelay import maildir <MAILDIR> <ARCHIVE>
```

`<MAILDIR>` is the path to the Maildir root (the directory that contains the
`cur/`, `new/`, and `tmp/` subdirectories). `<ARCHIVE>` is the local SQLite
archive, which is created if it does not already exist. This positional
shape is a deliberate departure from the JMAP, IMAP, and DAV importers,
which take the archive as their single positional argument and the source on
`--url`. A Maildir has no URL; its location is the local path, so the path
is expressed positionally rather than behind a flag.

The path may be given in any surface form: a relative path, a path
containing `..` segments, or a symlink. Vandelay canonicalises it (following
symlinks and resolving `..` to an absolute path) before recording it, so two
different surface forms that resolve to the same directory are treated as the
same source.

## The Maildir++ layout

A Maildir root is a directory containing exactly the three subdirectories
`cur/`, `new/`, and `tmp/`. The root itself holds the INBOX messages.
Vandelay reads messages out of `cur/` and `new/` only; `tmp/` is the staging
area for delivery agents and is never read.

Subfolders follow the Maildir++ convention: they are siblings of the root,
named with a leading `.`, and the hierarchy is encoded by additional `.`
separators inside the directory name. A directory named `.Archive.2025` is
therefore the folder `2025` nested under `Archive`.

```
<root>/
├── cur/                  (INBOX, read messages)
├── new/                  (INBOX, unread messages)
├── tmp/                  (delivery staging; never read)
├── .Sent/               (folder "Sent")
│   ├── cur/
│   ├── new/
│   └── tmp/
├── .Archive/            (folder "Archive")
│   ├── cur/
│   └── new/
└── .Archive.2025/       (folder "2025" under "Archive")
    ├── cur/
    └── new/
```

The canonical folder name (used for the mailbox name, for parent/child
reconstruction, and for filter matching) is the literal string `INBOX` for
the root, and the Maildir++ name with the leading `.` stripped for every
subfolder: `.Sent` becomes `Sent`, `.Archive.2025` becomes `Archive.2025`.
The parent/child structure for nested mailboxes is recovered by splitting the
canonical name on `.`, so `Archive.2025` is parented under `Archive`.

Only the Maildir++ layout is supported. Dovecot's alternative `LAYOUT=fs`
(subfolders nested as real subdirectories) is rejected at the discovery step
with a clear error.

## Folder selection

Folder selection mirrors the IMAP importer. The same three flags apply,
matched against the canonical folder name:

- `--include <REGEX>` (repeatable): keep only folders whose canonical name
  matches at least one of the supplied patterns. When omitted, every folder
  is kept.
- `--exclude <REGEX>` (repeatable): drop folders whose canonical name matches
  any of the supplied patterns. Exclusion is applied after inclusion.
- `--folder <NAME>` (repeatable): an exact-match include list. This is
  mutually exclusive with `--include` and `--exclude`; combining them is a
  usage error.

There is no subscription-only filter (Maildir has no IMAP-style subscription
set) and no special-use exclusion. To skip a folder such as the trash, write
an explicit pattern, for example `--exclude '^Trash$'`.

## Role assignment and the name heuristic

Because Maildir carries no SPECIAL-USE metadata, the folder name is the only
signal available for assigning a JMAP role. By default Vandelay applies a
case-insensitive name heuristic to the leaf component of each canonical
folder name:

| Canonical folder name (leaf, case-insensitive)              | Role      |
|-------------------------------------------------------------|-----------|
| `INBOX`                                                     | `inbox`   |
| `Sent`, `Sent Items`, `Sent Messages`, `Sent Mail`         | `sent`    |
| `Drafts`, `Draft`                                          | `drafts`  |
| `Trash`, `Deleted`, `Deleted Items`, `Deleted Messages`    | `trash`   |
| `Junk`, `Spam`, `Junk E-mail`                              | `junk`    |
| `Archive`, `Archives`                                      | `archive` |

The heuristic judges each folder on its own leaf name, so an intermediate
Maildir++ level does not inherit a role from its parent. Passing
`--noautomap` disables the heuristic entirely; every folder is then imported
with no role, except INBOX, which is always the inbox by virtue of being the
Maildir root.

## Deleted messages

Maildir marks a message for deletion with the `T` (Trashed) flag in its
filename, the local analogue of IMAP's `\Deleted`. By default Vandelay drops
`T`-flagged messages: a freshly trashed message is skipped on import, and a
previously imported message that has since gained the `T` flag is removed
from the archive on the next run, so the archive converges to "gone" when a
message is trashed at the source.

Passing `--include-deleted` overrides this behaviour. Trashed messages are
then imported and tagged with the `$deleted` keyword, and the rows remain
stable across re-runs. The remaining Maildir flags map to JMAP keywords
directly: `S` to `$seen`, `R` to `$answered`, `P` to `$forwarded`, `D` to
`$draft`, and `F` to `$flagged`.

## Source-change protection

The archive records the canonical Maildir path of the source it was imported
from. If a subsequent `vandelay import maildir` against the same archive
supplies a different Maildir path, Vandelay refuses the run, on the
assumption that pointing one archive at two distinct Maildirs is almost
certainly a mistake. This protection is keyed on the canonical path, so
re-running through a different surface form (a symlink, a relative path) of
the same directory does not trip it.

When the path genuinely needs to change, pass `--allow-source-change` to
permit the import.

## Examples

A straightforward import of an entire Maildir tree into a new archive. The
Maildir path comes first, the archive second:

```sh
vandelay import maildir /home/alice/Maildir alice.sqlite
```

A filtered import that keeps only the archive hierarchy and the sent folder,
excludes the trash, and disables role assignment:

```sh
vandelay import maildir \
  --include '^Archive' \
  --include '^Sent$' \
  --exclude '^Trash$' \
  --noautomap \
  /home/alice/Maildir \
  alice.sqlite
```

An import of two named folders only, using the exact-match form (which cannot
be combined with `--include` or `--exclude`), and including trashed messages:

```sh
vandelay import maildir \
  --folder INBOX \
  --folder Sent \
  --include-deleted \
  /backup/restore/Maildir \
  alice.sqlite
```

## Behaviour and convergence

Vandelay always imports both mailboxes and messages together; there is no way
to import only one of the two. The importer is convergent: re-running it
against the same Maildir reconciles the archive with the current on-disk
state. New messages are inserted, vanished messages are removed, and
flag-only changes (for example a message gaining the `S` flag when it is
read) update the stored keywords in place without re-reading the message
body. Message bytes are stored verbatim and content-addressed, so the same
message imported from a Maildir, an IMAP server, and a JMAP server lands on a
single shared blob.

The global flags behave as they do elsewhere. `--dry-run` computes and prints
the per-folder plan (new, vanished, and present message counts, plus new and
vanished folder counts) without writing to the archive. Verbosity (`-v`,
`-q`) follows the common convention. The remaining global flags that pertain
to networked sources have no effect on a local import: `-j` / `--threads` is
accepted but ignored (the Maildir importer is single-threaded),
`--max-retries` is accepted but ignored (a filesystem read that fails once
will not succeed on retry), and `--allow-invalid-certs` is accepted but
ignored (there is no TLS).
