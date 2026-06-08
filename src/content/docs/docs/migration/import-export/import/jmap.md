---
sidebar_position: 2
title: "JMAP"
---

The JMAP importer reads a complete account from a source JMAP server into a local archive. It is the most faithful of all the import paths, because both the source and the eventual export target speak the same protocol: every object type that JMAP defines is carried across without an intermediate representation. A JMAP import is the natural choice when migrating between two JMAP servers, for example moving an account from a hosted provider such as Fastmail onto a self-hosted Stalwart deployment, or capturing a periodic snapshot of a Stalwart account for backup.

## Object coverage

A single invocation imports one JMAP account in full. By default Vandelay imports every object type that the source server advertises through its session capabilities. The set can be narrowed with `--objects`, which accepts a comma-separated list drawn from the following tokens: `mailbox`, `email`, `identity`, `sievescript`, `addressbook`, `contactcard`, `calendar`, `calendarevent`, `participantidentity` and `filenode`. The list is case-insensitive and order-independent, and any duplicates are collapsed. Container types are always reconciled before the items that reference them, so a selection that includes `email` will pull in the mailbox structure it depends on regardless of the order written on the command line.

## Reconciliation model

Import is driven by id-based reconciliation. For each type Vandelay enumerates the ids the server currently holds, compares that set against the ids already recorded in the archive, and then fetches and stores only the objects that are new while removing the records whose ids have vanished from the source. There is no cursor or sync-state token to manage: a run that is interrupted, or a later run against an account that has since received new mail, simply re-computes the difference and continues from wherever the archive left off. This makes the importer convergent and safe to re-run at any time.

## Connection and authentication

The source server is selected with `--url`, which accepts either a base URL (Vandelay will locate the JMAP session resource through autodiscovery) or a full session URL pointing directly at the session endpoint. Exactly one authentication method is required. HTTP Basic authentication is selected with `--auth-basic <USER>`, optionally paired with `--auth-password`; bearer-token authentication is selected with `--auth-bearer`, whose token value is optional on the command line.

Secrets should never be written on the command line, where they would be visible in the process table and shell history. For Basic authentication the password is resolved from the `VANDELAY_PASSWORD` environment variable, or from an interactive prompt when neither the flag nor the variable is set. For bearer authentication the token is resolved in the same way from `VANDELAY_TOKEN`. Passing `--auth-password` without `--auth-basic` is rejected as a usage error.

## Account selection

A JMAP session can expose more than one account, so the importer requires exactly one account selector. The account may be named directly by its server-assigned identifier with `--account-id`, or resolved by its human-readable name with `--account-name`. Providing both, or neither, is a usage error. When an administrator credential is used, name-based resolution also covers accounts that the credential can administer on behalf of other principals.

## Source-change protection

An archive records the identity of the JMAP source it was first filled from. Pointing an existing archive at a different account is refused, which prevents two unrelated accounts from being silently merged into one file. When repurposing an archive deliberately is the intent, `--allow-source-change` overrides the guard.

## Examples

A first import of a Stalwart account using Basic authentication, with the password supplied through the environment:

```sh
export VANDELAY_PASSWORD='source-app-password'
vandelay import jmap \
  --url https://jmap.example.com \
  --auth-basic alice@example.com \
  --account-name alice@example.com \
  alice.sqlite
```

A bearer-token import that selects an account by its identifier and restricts the run to mail and calendar data only:

```sh
export VANDELAY_TOKEN='source-bearer-token'
vandelay import jmap \
  --url https://api.fastmail.com/jmap/session \
  --auth-bearer \
  --account-id u1a2b3c4 \
  --objects mailbox,email,calendar,calendarevent \
  alice.sqlite
```

Both runs can be repeated to resume an interrupted transfer or to pick up changes made on the source since the previous snapshot. Adding `--dry-run` to either reports the full plan, including the counts of objects that would be created or removed, without writing anything to the archive.
