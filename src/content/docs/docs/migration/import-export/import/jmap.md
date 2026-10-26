---
sidebar_position: 2
title: "JMAP"
description: "Import an account from a JMAP server, including a Stalwart server: data types by capability, account selection, change detection and examples."
---

The JMAP importer reads an account from a JMAP server into an archive. It is the importer for moving an account between two JMAP servers, such as from Fastmail or from another Stalwart server, and for backing up a Stalwart account. Source and target then speak the same protocol, so every data type is copied without conversion.

## Data types and capabilities

The importer reads each data type whose capability the source advertises for the account:

| Capability | Data types (`--objects` tokens) |
| --- | --- |
| `urn:ietf:params:jmap:mail` | `mailbox`, `email` |
| `urn:ietf:params:jmap:submission` | `identity` |
| `urn:ietf:params:jmap:sieve` | `sievescript` |
| `urn:ietf:params:jmap:contacts` | `addressbook`, `contactcard` |
| `urn:ietf:params:jmap:calendars` | `calendar`, `calendarevent`, `participantidentity` |
| `urn:ietf:params:jmap:filenode` | `filenode` |

A type whose capability is missing is skipped with the warning `target account does not advertise <capability>; skipping type <type>`.

`--objects` restricts the import to a comma-separated list of the tokens above, in any case and order. A selection must include the containers of its objects. `email` without `mailbox`, `contactcard` without `addressbook`, or `calendarevent` without `calendar` fails for every object on a new archive, because the objects have no container to belong to.

## Stalwart as a source

Any Stalwart release that serves JMAP can be a source. Which data types come over JMAP depends on the capabilities in its session, and [Checking a Stalwart source](/docs/migration/guide/configure-source/#checking-a-stalwart-source) describes how to read them.

A data type whose capability is missing is read with the importer for its protocol, into the same archive: files with [WebDAV](/docs/migration/import-export/import/webdav), contacts with [CardDAV](/docs/migration/import-export/import/carddav), calendars with [CalDAV](/docs/migration/import-export/import/caldav), and Sieve scripts with [ManageSieve](/docs/migration/import-export/import/managesieve). The DAV path of an account contains the account's name as that server knows it. On a server with bare login names, that is the bare name.

An administrator's credentials read any account. The account is named with `--account-name`, which requires the `urn:ietf:params:jmap:principals` capability, or with `--account-id`.

## Connection and authentication

`--url` names the source, either as a base URL, from which Vandelay discovers the JMAP session, or as the URL of the session itself.

One authentication method is required: `--auth-basic <USER>` with a password, or `--auth-bearer` with a token, as described under [Credentials](/docs/migration/import-export/usage#credentials). `--auth-password` without `--auth-basic` is a usage error.

<!-- include:session-urls -->
The address given to `--url` is only where Vandelay fetches the JMAP session. After fetching it, Vandelay sends its requests to the API, upload and download URLs that the session advertises, as JMAP requires of a client.

Some servers serve their API and their blobs from different hosts, so an advertised URL with an origin (scheme, host and port) other than that of `--url` is not an error. Vandelay prints a warning such as the following, and continues with the advertised URL:

```text
warning: session advertises apiUrl, uploadUrl, downloadUrl on https://mail.example.org (connected to https://mail.example.org:10443); vandelay must use the advertised URL. If this is wrong, fix the server's advertised HTTP URL setting.
```

The usual cause of this warning is a server that is reachable on a port other than 443 but advertises URLs without that port. Requests then reach whatever else listens on port 443, and fail, often with `404 Not Found`. Vandelay stops with exit code 2 at the first data type.

The fix is on the server: its public URL must be the full address that clients use, including the port. On Stalwart, the public URL is set with the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables) environment variable.
<!-- /include:session-urls -->

## Account selection

A JMAP session can expose several accounts, so one account selector is required.

`--account-id` names the account by its JMAP account identifier, and is used as given. When the identifier is not in the session, Vandelay warns, and tries every type.

`--account-name` names the account by name. Vandelay first looks for an account of exactly that name in the session. Otherwise, it queries the server's principals, which requires `urn:ietf:params:jmap:principals`. Without that capability, the run ends with exit code 3, and a message that suggests `--account-id`, authenticating as the user, or an IMAP import.

## Change detection

On each run, the importer compares the identifiers on the source with those in the archive. It reads the new objects, and removes from the archive the objects that disappeared.

Objects already in the archive are refreshed through the JMAP changes of each type since the previous run. When the server cannot report changes since then, all of them are read again. Sieve scripts are always read again, because JMAP reports no changes for them. For messages, only their mailboxes and keywords change after the first import.

The archive records the source's URL and account, so a run against another account is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection). The URL is compared as given. The same server named once by its base URL and once by its session URL therefore counts as two sources.

## Examples

The following command imports a Stalwart account with Basic authentication, with the password in the environment:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import jmap \
  --url https://mail.example.com \
  --auth-basic alice@example.com \
  --account-name alice@example.com \
  alice.sqlite
```

The next command uses a bearer token from the environment, selects the account by its identifier, and limits the import to mail and calendars:

```sh
export VANDELAY_TOKEN='<bearer token>'
vandelay import jmap \
  --url https://api.fastmail.com/jmap/session \
  --auth-bearer \
  --account-id u1a2b3c4 \
  --objects mailbox,email,calendar,calendarevent \
  alice.sqlite
```

Both runs can be repeated, to complete an interrupted transfer or to copy later changes. With `--dry-run`, each reports per type the objects that are new on the source, those that disappeared, and those already in the archive, without writing.
