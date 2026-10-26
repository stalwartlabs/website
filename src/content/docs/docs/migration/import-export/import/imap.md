---
sidebar_position: 3
title: "IMAP"
description: "Import mail from an IMAP server: connection and authentication, folder selection and roles, flags, change detection, throughput and examples."
---

The IMAP importer copies mail from an IMAP server into an archive. It is the importer for leaving servers that offer IMAP but not JMAP, whether self-hosted or hosted.

Messages keep their folders and flags. The importer converts them to the JMAP mail model, and a later export reproduces the same folder tree and flags on the target.

IMAP carries no calendars, contacts or Sieve scripts. A complete account is therefore copied by combining this importer with the CalDAV, CardDAV and ManageSieve importers, into the same archive.

## Connection

`--url` names the server, in one of two forms:

- `imaps://host[:port]` for a connection with implicit TLS (port 993 by default)
- `imap://host[:port]` for a connection upgraded with STARTTLS (port 143 by default)

The importer refuses to send credentials unencrypted. When the server does not offer STARTTLS, the run stops with `server does not advertise STARTTLS but cleartext credentials are forbidden` and exit code 2. `--allow-cleartext` allows credentials over an unencrypted connection, for trusted local networks and test servers. With it, an `imap://` connection is never upgraded, even when the server offers STARTTLS.

`--compress` turns on `COMPRESS=DEFLATE` after authentication. This reduces the transferred volume of large mailboxes, at some CPU cost.

## Authentication

One authentication method is required.

`--auth-basic <USER>` authenticates with SASL `PLAIN`, or with the IMAP `LOGIN` command when the server does not offer `AUTH=PLAIN`. The password comes from `--auth-password`, `VANDELAY_PASSWORD` or a prompt. A Dovecot master user login, such as `alice@example.org%vmadmin`, is given as the user name.

For OAuth, `--auth-bearer` supplies the token (inline, from `VANDELAY_TOKEN`, or from a prompt), and `--auth-user <USER>` the login identity, which is required with a token. The importer then uses `XOAUTH2`, or `OAUTHBEARER` when the server offers only that.

Two combinations are usage errors: `--auth-user` with `--auth-basic`, and `--auth-password` without `--auth-basic`.

## Folder selection and roles

Folder selection works on canonical names. The canonical name of a folder is its name as the server reports it, decoded, with the server's own hierarchy separator (`/` on most servers, `.` on some), and `INBOX` for the inbox. Regular expressions are written against that form, so a pattern such as `^Temp/` assumes a server that separates levels with `/`.

<!-- include:folder-selection -->
By default, every folder is imported. Two mutually exclusive forms narrow the selection. Both are compared with the folder's canonical name:

- `--include <REGEX>` and `--exclude <REGEX>`, each repeatable, select folders by regular expression. With `--include`, only matching folders are kept, and `--exclude` then drops matching folders from those.
- `--folder <NAME>`, repeatable, names folders exactly. It cannot be combined with `--include` or `--exclude`.

A folder that is excluded but has a selected subfolder is still created, without messages, so that the subfolder keeps its place in the tree.

Folders with a special purpose (inbox, sent, drafts, trash, junk, archive) receive the matching JMAP role, so that the export binds them to the target's existing folders. The inbox always has the `inbox` role. For other folders, the role is taken from the folder's special-use attribute where the source has one. Otherwise, it is guessed from common folder names, such as `Sent Items`, `Deleted Messages`, `Junk E-mail` or `[Gmail]/Sent Mail`.

`--noautomap` turns off the guessing, so that only special-use attributes assign roles. Each role is given to one folder per archive: the first that claims it.

Messages marked for deletion (with the IMAP `\Deleted` flag or the Maildir `T` flag) are skipped by default. With `--include-deleted`, they are imported with the `$deleted` keyword.
<!-- /include:folder-selection -->

The IMAP importer adds two options:

- `--subscribed-only` limits the import to the folders that the server lists as subscribed.
- `--exclude-special <ROLE>`, repeatable, drops the folders that have one of the given JMAP roles, after roles are assigned: `inbox`, `sent`, `drafts`, `trash`, `junk`, `archive`, `all`, `flagged` or `important`.

The values of `--exclude-special` are role names, compared without regard to case, not IMAP attributes. `--exclude-special trash` drops the trash folder, while `--exclude-special '\Trash'` matches nothing. Values that are not role names are ignored without a warning.

The selection is applied on every run. A folder that no longer matches the selection on a later run is removed from the archive, together with its messages. A folder whose `UIDVALIDITY` changed on the server is read again from the start.

## Flags

IMAP system flags become JMAP keywords: `\Seen` becomes `$seen`, `\Flagged` becomes `$flagged`, `\Answered` becomes `$answered`, and `\Draft` becomes `$draft`. `\Recent` is dropped, and other flags are kept as keywords, with their names unchanged. On each run, the flags of messages already in the archive are refreshed.

## Change detection

On each run, the importer compares the messages of each folder on the server with those in the archive, by UID. It reads the new ones, refreshes the flags of the others, and removes the messages and folders that disappeared. The archive records the server and the login, so a run against another account is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection).

## Throughput

Two options control the speed of the copy. Message metadata is read in batches of `--fetch-batch` UIDs per `FETCH`, 256 by default. Message bodies are read over several connections, set by `--imap-connections`, from 1 to 8, by default the smaller of `--threads` and 8. Higher values speed up large transfers on capable servers, while lower values suit servers that limit connections.

## Examples

The following command copies a Gmail mailbox over implicit TLS, with an app password. Gmail exposes its labels as folders, and the special-use attributes identify the system folders:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import imap \
  --url imaps://imap.gmail.com \
  --auth-basic alice@gmail.com \
  alice.sqlite
```

The same account can be copied with an OAuth access token, with the login identity named explicitly:

```sh
export VANDELAY_TOKEN='<access token>'
vandelay import imap \
  --url imaps://imap.gmail.com \
  --auth-bearer \
  --auth-user alice@gmail.com \
  alice.sqlite
```

The next command copies a Fastmail mailbox, keeping three named folders:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import imap \
  --url imaps://imap.fastmail.com \
  --auth-basic alice@fastmail.com \
  --folder INBOX --folder Archive --folder 'Sent Items' \
  alice.sqlite
```

The last command copies from a self-hosted Dovecot server, without the trash and junk folders, and without any folder under `Temp`:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import imap \
  --url imaps://mail.example.com \
  --auth-basic alice@example.com \
  --exclude-special trash --exclude-special junk \
  --exclude '^Temp/' \
  alice.sqlite
```

Each run can be repeated, to complete an interrupted transfer or to copy new mail. `--dry-run` reports the new, vanished and present mailboxes and messages, without writing.
