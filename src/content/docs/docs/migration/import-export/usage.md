---
sidebar_position: 3
title: "Usage"
description: "Vandelay's commands, credentials, common options, dry runs, archive inspection, output and exit codes."
---

[Vandelay](https://github.com/stalwartlabs/vandelay) has three commands:

- `import` reads an account from a source into a local archive.
- `export` writes an archive to a target JMAP server.
- `inspect` shows the contents of an archive, without network access.

The archive is a single SQLite file, and it is the last positional argument of every command:

```sh
vandelay import <source> [options...] <ARCHIVE>
vandelay export [options...] <ARCHIVE>
vandelay inspect <ARCHIVE> [TYPE] [--limit <N>] [--offset <N>]
```

`import`, `export` and `inspect` all create the archive when it does not exist. A mistyped path therefore produces a new, empty archive, and no error.

## Repeating a run

There is no separate command to resume, update or synchronise. Running the same import or export again against the same archive completes an interrupted run, and a later run copies what changed since the previous one. Repeating the command is therefore the response to almost any interruption. The [overview](/docs/migration/import-export/#repeated-runs) describes what a repeated import and a repeated export do.

## Credentials

Vandelay authenticates once per run, with the credentials given on the command line.

When the target or the source is a JMAP server, the credentials may belong to an administrator. The account to read or write is then selected with `--account-name` or `--account-id`, and Vandelay acts on that account through the administrator's session, so the users' own passwords are never needed. Whether an administrator may act on another account is decided by the server. On Stalwart, it requires the `impersonate` [permission](/docs/ref/permissions). For an IMAP or ManageSieve source, the equivalent is a master user login, such as Dovecot's `user%master`, passed as the user name.

Secrets are taken from a flag, an environment variable or a prompt, in that order:

| Secret | Flag | Environment variable |
| --- | --- | --- |
| Password for `--auth-basic` | `--auth-password <PASS>` | `VANDELAY_PASSWORD` |
| Token for `--auth-bearer` | `--auth-bearer <TOKEN>` | `VANDELAY_TOKEN` |
| Microsoft Graph token | `--access-token <TOKEN>` | `VANDELAY_GRAPH_TOKEN` |
| Exchange EWS client secret | `--ews-client-secret <SECRET>` | `VANDELAY_EWS_CLIENT_SECRET` |

When neither the flag nor the variable is set, Vandelay prompts for the secret without echoing it, provided standard input is a terminal. Otherwise, it stops with a usage error, for example `no password provided: pass the flag, set $VANDELAY_PASSWORD, or run on a TTY for an interactive prompt`. The Exchange EWS client secret is the exception. Vandelay never prompts for it, and without it uses the next authentication method described in [Exchange EWS](/docs/migration/import-export/import/exchange-ews#authentication).

A secret given as a flag value is visible in the process list and the shell history, so the environment variable or the prompt is preferred. Credentials are never written to the archive.

`--auth-bearer` needs care on the command line. It takes an optional value, so a positional argument that directly follows it is read as the token. When the token comes from the environment, place another option between `--auth-bearer` and the archive, or put `--auth-bearer` before other options.

## Common options

`import` and `export` accept the following options, none of which applies to `inspect`:

| Option | Default | Meaning |
| --- | --- | --- |
| `-j, --threads <N>` | number of CPUs | Size of the worker pool. |
| `--dry-run` | off | Read and compare, and report what would change, without writing. |
| `-v, --verbose` | off | More output; repeatable up to `-vvv`. Cannot be combined with `--quiet`. |
| `-q, --quiet` | off | Only warnings and errors. |
| `--max-retries <N>` | `5` | Maximum attempts per request after transient failures. |
| `--allow-invalid-certs` | off | Accept self-signed and otherwise invalid TLS certificates. |

`--threads` is an upper bound rather than an exact count. For JMAP imports and exports, the worker pool is also limited by the concurrency that the server advertises. The DAV, EWS and Graph importers have their own connection options, which `--threads` also caps. The ManageSieve, Maildir and Takeout importers run with one worker. `--allow-invalid-certs` is intended for test servers.

At the default verbosity, Vandelay writes progress lines per data type to standard error. Each `-v` adds more:

- `-v` adds progress per batch, and retry notices.
- `-vv` adds a line for every protocol call.
- `-vvv` adds request and response bodies, truncated to 8 KiB each. Bodies include message content, but authentication headers are not printed, and IMAP login commands are masked.

At the end of a run, Vandelay prints one summary line per data type to standard output, even with `-q`:

```text
email: created=1250 fetched=1250 updated=0 deleted=0 skipped=3 failed=0
```

## Dry runs

`--dry-run` connects and reads, but writes nothing: neither to the archive on import, nor to the target on export. What it reports depends on the command:

- A JMAP, IMAP or Maildir import reports, per data type, the objects that are new on the source, the objects that disappeared from it, and the objects already in the archive.
- A CalDAV, CardDAV or WebDAV import has nothing to compare with and counts everything on the source as new.
- An EWS or Graph import lists the folders, calendars and address books it would read.
- A Takeout import counts the matching files.
- An export prints a table of the archived objects per data type that are already on the target and those that would be created, and with `--prune` the objects that would be deleted.

A dry run does not apply source-change protection, so it does not reveal an import that would be refused with exit code 4.

Before any export with `--prune`, a dry run of the same export is the recommended preview, because it lists the deletions without making them.

## Inspecting an archive

`inspect` shows the contents of an archive without network access:

```sh
vandelay inspect <ARCHIVE> [TYPE] [--limit <N>] [--offset <N>]
```

Without a type, it prints the number of objects of each type, and statistics about the stored content. With a type, it lists the objects of that type, which is one of `mailbox`, `email`, `identity`, `sievescript`, `addressbook`, `contactcard`, `calendar`, `calendarevent`, `participantidentity` and `filenode`.

Mailboxes and files are shown as a tree, and ignore `--limit` and `--offset`. The other types are listed in pages, selected with `--limit` and `--offset`.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Success. Every selected type was processed; warnings may have been printed. |
| 1 | Usage error, such as an unknown option or a missing argument. |
| 2 | Connection, authentication, HTTP or session discovery failure. |
| 3 | The account was not found or was ambiguous. |
| 4 | Source-change protection refused the run (see the [importers](/docs/migration/import-export/import/#source-change-protection)). |
| 5 | Partial failure: some objects or types failed. The archive is consistent and the run can be repeated. |
| 6 | The operator declined the `--prune` confirmation. |
| 7 | The archive could not be opened, created, read or written. |

The codes fall into two groups. Code 5 is reserved for failures that concern one object or one type: a message that could not be converted, a type the server does not implement, or an object larger than the server accepts. Such failures are counted and reported, and the run continues, ending with `error: some objects failed; the archive is consistent and resumable`. Repeating the run is always safe.

Every other failure stops the run where it occurs, because no further type could succeed. A refused connection, rejected credentials, and an HTTP error from the URLs that the session advertises end with code 2. An unknown account ends with code 3. Code 7 indicates a local problem, such as a wrong path, a lock held by another run or a full disk, never a problem on the server.

## Preparing a Stalwart target

An export to Stalwart makes many requests in a short time, from one host, as one account. The rate limit for authenticated requests, the automatic ban of addresses with failed sign-ins, and the JMAP size and concurrency limits all apply to it. [Preparing for bulk import](/docs/migration/guide/configure-new/#preparing-for-bulk-import) lists the settings to adjust.

Vandelay copies an account's data, not its account properties. Aliases, quotas, access rights granted to other accounts, vacation responses and app passwords are recreated separately, as listed in [Items not carried over](/docs/migration/guide/#items-not-carried-over).
