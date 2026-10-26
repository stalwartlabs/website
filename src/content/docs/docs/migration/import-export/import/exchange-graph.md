---
sidebar_position: 11
title: "Microsoft Exchange (Graph)"
description: "Import a Microsoft 365 mailbox and OneDrive over Microsoft Graph: authentication, mailbox and surface selection, what is carried, change detection and examples."
---

The Graph importer reads a Microsoft 365 (Exchange Online) mailbox into an archive, over the Microsoft Graph v1.0 REST API. It is the importer to use for Exchange Online, because Graph is the interface that Microsoft develops further, and EWS is being retired there. Exchange Server installed on premises offers no Graph, and is read with the [EWS importer](/docs/migration/import-export/import/exchange-ews) instead.

A single run produces mail, calendars, contacts and OneDrive files. Vandelay lists folders and items through Graph, reads messages as MIME, and converts events and contacts to JSCalendar and JSContact.

## Authentication

Graph is always accessed with a Microsoft Entra OAuth token. One of `--client-id` and `--access-token` is required, and they correspond to two ways of obtaining the token:

- `--access-token` supplies a token obtained by other tooling, inline, from `VANDELAY_GRAPH_TOKEN`, or from a prompt. Such a token is not renewed during the run.
- Otherwise, Vandelay runs the interactive device code flow, which requires the Entra application identifier in `--client-id`. It also accepts `--tenant`, by default the multi-tenant `common` authority. Vandelay prints a URL and a code to complete in a browser, and renews the token during the run.

The device code flow requests the delegated permissions `User.Read`, `Mail.Read`, `MailboxSettings.Read`, `Calendars.Read`, `Contacts.Read` and `Files.Read`, with `offline_access`. Vandelay 1.0.12 and earlier did not request `Files.Read`, so an account that consented with one of those releases is asked to consent again at its next device code sign-in.

The flow does not request access to other users' mailboxes. Importing a mailbox other than the signed-in user's therefore requires a token with those permissions, supplied with `--access-token`. When the token does not allow reading the account's OneDrive, the `files` surface is skipped with `warning: graph drive unavailable for this account; file import skipped`, and the run still ends with exit code 0.

## Mailbox and surfaces

By default, the importer reads the mailbox of the signed-in identity. `--user` names another mailbox that the token may read, by user principal name or object identifier. `--mailbox-kind` selects `primary`, the main mailbox (the default), or `archive`, the In-Place Archive. Public folders are not available over Graph, and a request for them is rejected with a pointer to the EWS importer.

`--objects` restricts the import to a comma-separated list of surfaces:

| Surface | Contents |
| --- | --- |
| `mail` | Mail folders and messages |
| `calendar` | Calendars and events |
| `contacts` | Contact folders and contacts |
| `files` | OneDrive files and folders |

All four are imported by default. Surfaces are imported whole, and JMAP type names such as `mailbox` or `contactcard` are rejected, with a message that lists the valid surfaces. With `--mailbox-kind archive`, only `mail` is imported, because the In-Place Archive holds no calendars, contacts or files.

## Carried data

The importer carries the following data:

| Carried | Notes |
| --- | --- |
| Messages | As MIME, with their read state, flag and categories |
| Events | Converted to JSCalendar. Modified occurrences of recurring events are found within a window of `--exception-window-years` years before and after the day of the import, 5 by default and at most 5. Event attachments are included unless `--skip-event-attachments` is given. |
| Contacts | Converted to JSContact, with categories and instant messaging addresses. Photos are included unless `--skip-contact-photos` is given, which saves one request per contact. |
| Files | OneDrive files and folders |

`--event-body-format` selects the body format requested for events: `text` (the default) or `html`.

## Change detection

Vandelay requests immutable identifiers in every Graph call. An item therefore keeps its identifier when it moves between folders, and a moved message is not recorded as deleted and new.

A repeated run reads the items that are new since the previous run, and removes from the archive the items that disappeared. When a folder of a surface cannot be listed, nothing of that surface is removed.

Repeated runs have one limit. Items already in the archive are not read again, so later changes to them, such as a message marked as read or an edited event, are not copied by a repeated run.

The archive records the tenant's session and the mailbox, with the store, so a run against another mailbox is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection).

## Throughput

Items are read over several connections, set by `--graph-connections`: 4 by default, from 1 to 16, and at most `--threads`. `--top` sets the page size of each listing request: 100 by default, from 1 to 1000. Larger pages need fewer requests, while smaller pages ease the load on a tenant that Microsoft throttles. `--dry-run` lists the folders, calendars and address books that would be read, without reading items.

## Examples

The following command imports a mailbox interactively, with the device code flow:

```sh
vandelay import exchange-graph \
  --client-id 11111111-2222-3333-4444-555555555555 \
  --tenant contoso.onmicrosoft.com \
  alice.sqlite
```

The next command imports mail and calendars only, with a token obtained by other tooling. `--access-token` takes an optional value, so another option follows it, and the archive is not read as the token:

```sh
export VANDELAY_GRAPH_TOKEN='<access token>'
vandelay import exchange-graph \
  --access-token \
  --objects mail,calendar \
  alice.sqlite
```

The last command imports the In-Place Archive of another user's mailbox, with a token that may read it:

```sh
export VANDELAY_GRAPH_TOKEN='<access token>'
vandelay import exchange-graph \
  --access-token \
  --user alice@contoso.com \
  --mailbox-kind archive \
  alice-archive.sqlite
```
