---
sidebar_position: 3
title: "IMAP"
---

The IMAP importer copies mail, and only mail, from any IMAP server into a local archive. It is the workhorse path for migrating away from legacy mail systems and from hosted providers that expose IMAP but not JMAP. Messages are read with their flags and folder placement intact, translated into the JMAP mail model, and stored so that a later export reproduces the same mailbox tree and keyword state on the target. Because IMAP carries no calendar, contact or Sieve data, an account migration that also includes those types combines this importer with the CalDAV, CardDAV or ManageSieve paths against the same archive.

## Transport and encryption

The source server is given with `--url` as either `imaps://host[:port]` for an implicitly encrypted connection or `imap://host[:port]` for a connection that begins in cleartext and upgrades to TLS with STARTTLS. When a server offers no encryption at all, presenting credentials over the plain connection is refused unless `--allow-cleartext` is given, which should be reserved for trusted local networks and test servers. The optional `--compress` flag enables COMPRESS=DEFLATE after authentication, which can reduce transfer volume on large mailboxes at the cost of some CPU.

## Authentication

Exactly one authentication method is required. The common case is `--auth-basic <USER>`, which uses SASL PLAIN where the server supports it and falls back to LOGIN otherwise; the password accompanies it through `--auth-password` or, preferably, the `VANDELAY_PASSWORD` environment variable or an interactive prompt. Providers that require OAuth use bearer authentication: `--auth-bearer` supplies the token (optionally inline, otherwise from `VANDELAY_TOKEN` or a prompt) and the XOAUTH2 mechanism additionally needs the login identity, so `--auth-user <USER>` is mandatory alongside it. Combining `--auth-user` with `--auth-basic` is rejected, as is `--auth-password` without `--auth-basic`.

## Folder selection

By default every selectable folder on the server is imported. The selection can be narrowed in two mutually exclusive ways. Regular-expression filtering uses `--include` and `--exclude`, each repeatable, applied against the canonical folder name; an include set keeps only matching folders, and an exclude set drops matching ones. Exact selection uses `--folder <NAME>`, repeatable, naming specific folders verbatim; it cannot be combined with the regex filters. In addition, `--exclude-special <ROLE>` drops folders by their SPECIAL-USE role (for example `\Trash` or `\Junk`), and `--subscribed-only` restricts the run to the folders returned by the server's subscription list.

## Folder roles and keywords

Vandelay maps well-known folders onto JMAP roles so that the Inbox, Sent, Drafts, Trash, Junk and Archive folders are recognised as such on the target rather than recreated as ordinary folders. The mapping prefers the server's advertised SPECIAL-USE attributes and falls back to a name heuristic when those are absent; the heuristic fallback can be disabled with `--noautomap`. IMAP system flags are translated to JMAP keywords, so `\Seen` becomes `$seen` and `\Flagged` becomes `$flagged`. Messages marked `\Deleted` are skipped by default, since they are pending expunge; `--include-deleted` imports them instead and tags them with the `$deleted` keyword.

## Throughput tuning

Metadata is fetched in batches whose size is set by `--fetch-batch`, defaulting to 256 UIDs per FETCH. Message bodies are fetched over several parallel IMAP connections; `--imap-connections` sets how many, within a hard range of one to eight, defaulting to the smaller of the worker pool size and eight. Raising these values speeds up large transfers on capable servers, while lowering them is appropriate for servers that throttle aggressively.

## Source-change protection

The archive remembers which IMAP account first populated it, and a later run against a different account is refused unless `--allow-source-change` is supplied.

## Examples

Importing a Gmail mailbox over implicit TLS using an app-specific password. Gmail exposes its labels as IMAP folders, and the special-use mapping recognises the system folders automatically:

```sh
export VANDELAY_PASSWORD='google-app-password'
vandelay import imap \
  --url imaps://imap.gmail.com \
  --auth-basic alice@gmail.com \
  alice.sqlite
```

The same account can instead be reached with an OAuth bearer token through XOAUTH2, in which case the login identity is named explicitly:

```sh
export VANDELAY_TOKEN='google-oauth-access-token'
vandelay import imap \
  --url imaps://imap.gmail.com \
  --auth-bearer \
  --auth-user alice@gmail.com \
  alice.sqlite
```

Importing a Fastmail mailbox while keeping only a few named folders:

```sh
export VANDELAY_PASSWORD='fastmail-app-password'
vandelay import imap \
  --url imaps://imap.fastmail.com \
  --auth-basic alice@fastmail.com \
  --folder INBOX --folder Archive --folder 'Sent Items' \
  alice.sqlite
```

Importing from a self-hosted Dovecot server, excluding the trash and junk folders and any folder under a `Temp` hierarchy:

```sh
export VANDELAY_PASSWORD='mailbox-password'
vandelay import imap \
  --url imaps://mail.example.com \
  --auth-basic alice@example.com \
  --exclude-special '\\Trash' --exclude-special '\\Junk' \
  --exclude '^Temp/' \
  alice.sqlite
```

Any of these runs may be repeated to resume after an interruption or to capture new mail; `--dry-run` reports the folder and message plan without writing.
