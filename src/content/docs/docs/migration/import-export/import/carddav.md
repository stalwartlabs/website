---
sidebar_position: 5
title: "CardDAV"
---

The CardDAV importer reads address books and contacts from any RFC 6352 CardDAV server into a local Vandelay archive (a SQLite file). It is the contacts counterpart of the [CalDAV](caldav) importer: identical command shape and flags, but it produces `AddressBook` and `ContactCard` objects rather than calendars and events. A single run reconciles every address book the server exposes for the account, together with all of their contacts, into the archive; the archive is later replayed into a target JMAP server by `vandelay export`.

Import is one-directional (source server into archive) and convergent: re-running the same command continues or finishes a partial run and pulls only the delta, so an interrupted migration is resumed simply by invoking it again.

## Command surface

```sh
vandelay import carddav \
  --url <http(s)://host[:port][/path]> \
  (--auth-basic <USER> | --auth-bearer [TOKEN]) \
  [--auth-password <PASS>] \
  [--allow-cleartext] \
  [--dav-connections <1..8>] \
  [--multiget-batch <N>] \
  [--allow-source-change] \
  <ARCHIVE>
```

The archive is the final positional argument and is created if it does not already exist. Exactly one authentication mechanism is required: `--auth-basic` or `--auth-bearer`.

The `import carddav` subcommand always imports both address books and the contact cards they contain in one run; there is no object-selection flag, because a contact references its containing address book and the container must be reconciled first.

## Address book and contact discovery

The operator supplies a single URL on `--url`. Vandelay does not require that URL to be of any particular kind: it may be a bare base URL, a CardDAV well-known URI, a principal URL, an addressbook-home-set URL, or the URL of one individual address book. The importer runs a fixed discovery fallback chain and uses the first form that yields at least one address book.

The chain proceeds in this order:

1. **The URL treated as a collection or home-set.** Vandelay issues a `PROPFIND` of depth 1 against `--url`. Any response that carries the CardDAV `addressbook` resourcetype is taken as an address book to import. This single step covers both the "URL is one address book" and the "URL is the addressbook-home-set" cases, since both present matching collections in the depth-1 listing. When this step succeeds, Vandelay additionally resolves the per-user principal so that the source identity recorded in the archive is specific to the account rather than to a shared DAV root.
2. **Current-user-principal resolution.** If step 1 finds nothing, Vandelay requests `current-user-principal` (RFC 5397), follows it to the principal, reads the `addressbook-home-set` property, and enumerates the address books under that home-set.
3. **The well-known URI.** If the principal path yields nothing, Vandelay issues a `PROPFIND` against `<base>/.well-known/carddav` (RFC 6764). Most servers answer with a redirect to their real CardDAV root; the redirect is followed on the same host, with the `Authorization` header preserved, and steps 2 and 1 are retried against the resolved root.

If no address book is found after the full chain, the run aborts with a clear error and a non-zero exit code. Pointing `--url` directly at an addressbook-home-set or at an individual address book bypasses the slower steps and is the most reliable form for self-hosted servers whose discovery is incomplete.

## Authentication and credentials

Two mechanisms are supported, both sent on the first request (Vandelay never issues an unauthenticated probe):

- **HTTP Basic** with `--auth-basic <USER>`. The password is resolved, in order, from the `--auth-password` flag, then the `VANDELAY_PASSWORD` environment variable, then a no-echo terminal prompt.
- **Bearer token** with `--auth-bearer [TOKEN]`. The token value is optional on the flag; when omitted it is resolved from the `VANDELAY_TOKEN` environment variable, then a no-echo prompt. Bearer is the realistic path for hosted providers that issue OAuth access tokens.

Passing a secret directly on the command line is discouraged, because it is visible in the process table and shell history. Supplying the password or token through `VANDELAY_PASSWORD` / `VANDELAY_TOKEN`, or letting Vandelay prompt for it, is preferred. Credentials are never written to the archive.

CardDAV must run over TLS. An `http://` URL is refused unless `--allow-cleartext` is given, and `--allow-invalid-certs` (from the global flags) disables certificate verification for servers presenting a self-signed certificate.

## vCard to JSContact conversion

CardDAV transfers contacts as vCard text. Vandelay parses each vCard with the `calcard` library into the JSContact representation (RFC 9553) that the archive and a JMAP target expect, storing the resulting `@type: "Card"` JSON. The original vCard bytes are not retained; the JSContact form is the archive's pivot representation.

Each contact's `UID` is extracted into a dedicated column so the contact round-trips with a stable identity. Although RFC 6352 requires every address object to carry a `UID`, some real-world exports omit it; for those, Vandelay synthesises a deterministic UID derived from the contact's normalised resource path, stable across re-runs, so the contact still exports cleanly to a JMAP target. Photos, logos and other inline media remain embedded in the JSContact object rather than being extracted to a separate blob store.

Address book metadata is mapped from the server's PROPFIND response: the display name comes from `displayname` (falling back to the final path component of the collection URL when absent) and the description from the CardDAV `addressbook-description` property.

## Malformed contact handling

A vCard that `calcard` cannot parse does not abort the run. The offending contact is skipped, a warning is logged, and the failure is recorded in the per-type summary. Such skips cause the process to finish with the partial-failure exit code (5), so an operator can detect that some contacts were not imported while the rest of the address book is still archived. This matches the importer's general stance: per-item problems are counted, and only whole-run conditions (connection, authentication, discovery, source-change) abort with an error.

## Reconciliation and convergence

Within each address book, Vandelay enumerates the current set of contact resources (their paths and ETags) and compares it against what the archive already records. New contacts are fetched and inserted, contacts whose ETag changed are re-fetched and updated in place (preserving their local identity), contacts that vanished from the server are removed from the archive, and unchanged contacts are skipped. This per-item ETag diff is what makes a re-run cheap and a partial run resumable, with no cursor or sync token to manage.

## Tuning

| Flag                  | Default | Effect                                                                                  |
|-----------------------|---------|-----------------------------------------------------------------------------------------|
| `--dav-connections`   | 4       | Parallel worker connections to the server (hard cap 8). Clamped down to `--threads`.    |
| `--multiget-batch`    | 50      | Number of contact hrefs requested per `addressbook-multiget` REPORT.                     |
| `--max-retries`       | 5       | Maximum retry attempts per request on transient failures (global flag).                  |

Larger `--multiget-batch` values reduce round-trip overhead on large address books but widen the worst-case recovery window if a transfer drops mid-batch. A 10000-contact address book at the default batch size is 200 REPORTs, distributed across the worker connections.

## Source-change protection

The archive records the source it was populated from. Pointing an existing archive at a different CardDAV account is refused by default, which guards against accidentally mixing two accounts into one archive. The refusal is overridden with `--allow-source-change` when the operator genuinely intends to re-target the archive. A CalDAV source and a CardDAV source against the same host do not conflict: they are distinguished by kind and may coexist in one archive.

## Examples

### Apple iCloud contacts

iCloud requires an app-specific password (generated from the Apple ID security settings) rather than the account password, and it serves CardDAV from its discovery endpoint:

```sh
export VANDELAY_PASSWORD='abcd-efgh-ijkl-mnop'
vandelay import carddav \
  --url https://contacts.icloud.com \
  --auth-basic "appleid@example.com" \
  icloud-contacts.db
```

### Fastmail

Fastmail serves CardDAV from its well-known endpoint and accepts an app password over HTTP Basic:

```sh
export VANDELAY_PASSWORD='fmapp-secret-token'
vandelay import carddav \
  --url https://carddav.fastmail.com \
  --auth-basic "user@fastmail.com" \
  fastmail-contacts.db
```

### Self-hosted Nextcloud, Baikal or Radicale

For self-hosted servers, pointing `--url` directly at the account's addressbook-home-set (or at one address book) is the most reliable form, since it does not depend on the server implementing well-known or principal discovery.

Nextcloud, addressbook-home-set for the user:

```sh
export VANDELAY_PASSWORD='nextcloud-app-password'
vandelay import carddav \
  --url https://cloud.example.com/remote.php/dav/addressbooks/users/alice/ \
  --auth-basic "alice" \
  nextcloud-contacts.db
```

Baikal, pointed at one address book:

```sh
export VANDELAY_PASSWORD='baikal-secret'
vandelay import carddav \
  --url https://dav.example.com/dav.php/addressbooks/alice/default/ \
  --auth-basic "alice" \
  baikal-contacts.db
```

Radicale, whose addressbook-home-set is the per-user collection root:

```sh
export VANDELAY_PASSWORD='radicale-secret'
vandelay import carddav \
  --url https://radicale.example.com/alice/ \
  --auth-basic "alice" \
  radicale-contacts.db
```

A Radicale instance reached over plain HTTP on a trusted local network additionally requires `--allow-cleartext`:

```sh
export VANDELAY_PASSWORD='radicale-secret'
vandelay import carddav \
  --url http://192.168.1.10:5232/alice/ \
  --auth-basic "alice" \
  --allow-cleartext \
  radicale-contacts.db
```
