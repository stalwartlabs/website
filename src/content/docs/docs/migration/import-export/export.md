---
sidebar_position: 5
title: "Export"
description: "Write a Vandelay archive to a JMAP server: matching rules, type selection, batching, pruning and the session URLs the export follows."
---

The export writes the contents of a local archive to an account on a target JMAP server, such as Stalwart. It is the only way Vandelay writes to a server, and JMAP is its only target protocol. The importers convert every source to the JMAP data model, so the export works the same way whatever the source was.

A migration of an account is therefore an import that fills an archive, followed by an export that writes it.

```sh
vandelay export \
  --url <URL> \
  (--auth-basic <USER> [--auth-password <PASS>] | --auth-bearer [TOKEN]) \
  (--account-id <ID> | --account-name <NAME>) \
  [--objects <list>] [--prune [--yes]] \
  <ARCHIVE>
```

## Connection, authentication and account

`--url` names the target, either as a base URL or as the URL of its JMAP session.

One authentication method is required, as described under [Credentials](/docs/migration/import-export/usage#credentials):

- `--auth-basic <USER>`, with the password from `--auth-password`, `VANDELAY_PASSWORD` or a prompt
- `--auth-bearer`, with the token given inline, from `VANDELAY_TOKEN`, or from a prompt

One account selector is also required. `--account-id` names the target account by its JMAP account identifier, which is used as given. `--account-name` names it by name. Vandelay looks for an account of that name in the session and, when the credentials belong to an administrator, through the `urn:ietf:params:jmap:principals` capability. A server without that capability requires `--account-id`.

Combining the two lets an administrator write to another user's account: an administrator's credentials with `--account-name` write to that account. This is how the [migration guide](/docs/migration/guide/migrate-accounts/) writes each account.

<!-- include:session-urls -->
The address given to `--url` is only where Vandelay fetches the JMAP session. After fetching it, Vandelay sends its requests to the API, upload and download URLs that the session advertises, as JMAP requires of a client.

Some servers serve their API and their blobs from different hosts, so an advertised URL with an origin (scheme, host and port) other than that of `--url` is not an error. Vandelay prints a warning such as the following, and continues with the advertised URL:

```text
warning: session advertises apiUrl, uploadUrl, downloadUrl on https://mail.example.org (connected to https://mail.example.org:10443); vandelay must use the advertised URL. If this is wrong, fix the server's advertised HTTP URL setting.
```

The usual cause of this warning is a server that is reachable on a port other than 443 but advertises URLs without that port. Requests then reach whatever else listens on port 443, and fail, often with `404 Not Found`. Vandelay stops with exit code 2 at the first data type.

The fix is on the server: its public URL must be the full address that clients use, including the port. On Stalwart, the public URL is set with the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables) environment variable.
<!-- /include:session-urls -->

## Matching

The export keeps no state about the target. Each run reads, for each data type, what the target account holds, matches every archived object with an existing object, and creates the archived objects that match nothing. Matched objects are skipped, and are not changed.

Matching does not depend on server identifiers. A repeated export therefore gives the same result, and an interrupted export is completed by running it again, without creating duplicates.

The vacation response is not matched. When three conditions hold (the archive holds one, the target advertises `urn:ietf:params:jmap:vacationresponse`, and Sieve scripts are selected), every run writes the archived vacation response over the target's. A Sieve script named `vacation` is then not exported, because Stalwart reserves that name for the vacation response.

The objects are matched as follows:

| Type | Matched by |
| --- | --- |
| Mailbox | Its role (inbox, sent, drafts, junk, trash, archive), else its parent and name |
| Email | Its `Message-ID` header fields, or, without them, its sender, subject, date and recipients |
| Calendar, address book | Name |
| Event, contact | UID |
| Identity | Name and address |
| Sieve script | Name |
| File | Its parent folder and name |

Containers (mailboxes, calendars, address books, file folders) are processed before the objects they contain, and the containers matched or created in a run are used to place their contents. Role mailboxes bind to the target's existing folders, and are not created again.

Matching messages has one consequence worth knowing. A message that already exists on the target, in any mailbox, counts as matched. Changes in the archive to the folders or keywords of a message already on the target are therefore not applied.

The export also sets the active Sieve script on the target to the script that is active in the archive. When no archived script is active, it deactivates the target's active script.

## Type selection

By default, the export processes every data type that has objects in the archive. `--objects` restricts it to a comma-separated list of types (`mailbox`, `email`, `identity`, `sievescript`, `addressbook`, `contactcard`, `calendar`, `calendarevent`, `filenode`). A type whose capability the target does not advertise is skipped with a warning, and the other types continue.

A selection must keep objects together with their containers, because objects depend on their containers within the same run. An export of `email` alone places no message, because no mailbox is matched in that run. A selection therefore always includes `mailbox` with `email`, `addressbook` with `contactcard`, and `calendar` with `calendarevent`.

Participant identities recorded in the archive are never exported, because Stalwart creates them from the account's addresses. When the archive holds some, the export prints `export: ParticipantIdentity not exported; the target creates participant identities from the account's addresses`.

## Batching and limits

The export adapts to the limits that the target advertises. Messages are uploaded in parallel, by at most as many workers as `--threads` and the target's `maxConcurrentUpload` allow. They are imported in batches no larger than the target's `maxObjectsInSet` limit. When the target refuses a request as too large, Vandelay splits it and tries again.

An object larger than the target's upload limit is skipped, with a warning that it exceeds the target server size limit, and a repeated run does not copy it either. On Stalwart, the limit is the `maxUploadSize` field of [Jmap](/docs/ref/object/jmap). The limits of a Stalwart target, and the settings to raise for a migration, are listed in [Preparing for bulk import](/docs/migration/guide/configure-new/#preparing-for-bulk-import).

## Pruning

By default, the export only adds. Matched objects are left as they are, archived objects without a match are created, and objects on the target that the archive does not describe are kept. `--prune` also deletes those objects of the target, within limits:

- Mailboxes, calendars, address books, contacts, events, Sieve scripts and files that match nothing in the archive are deleted. Role mailboxes and their parents, and the default calendar and address book, are kept.
- Messages and identities are never deleted.
- Only the selected types that have objects in the archive and that the target supports are considered, and objects the account may not delete are skipped. A calendar, address book or folder that still contains objects is not deleted.

The prune runs after the additions. When standard input is a terminal and `--yes` is not given, Vandelay prints the planned deletions and asks `destroy all <n> objects across all types? [y/N]`. Any answer other than `y` or `yes` ends the run with exit code 6, after the additions have already been made.

Without a terminal, for example under cron, the deletions are made without a question. Preview a prune with `--dry-run --prune`, which lists the deletions without asking.

## Examples

A first export of an archive to a Stalwart account, with Basic authentication:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay export \
  --url https://mail.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  alice.sqlite
```

An export of mail and calendars only, during a migration staged by data type:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay export \
  --url https://mail.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  --objects mailbox,email,calendar,calendarevent \
  alice.sqlite
```

A preview of a prune, followed by the prune without a question:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay export --dry-run --prune \
  --url https://mail.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  alice.sqlite

vandelay export --prune --yes \
  --url https://mail.example.org \
  --auth-basic alice@example.org \
  --account-name alice@example.org \
  alice.sqlite
```

Each of these runs can be repeated, to complete an interrupted export or to write an updated archive.
