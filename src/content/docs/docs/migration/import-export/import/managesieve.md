---
sidebar_position: 7
title: "ManageSieve"
---

The `vandelay import managesieve` command reads the Sieve scripts of a single
account from a ManageSieve server (RFC 5804) into a local SQLite archive. It is
the narrowest of the import sources: a ManageSieve server exposes nothing but
Sieve scripts, so this importer produces exactly one JMAP object type
(`SieveScript`) and silently skips every other type. Because of that, a
ManageSieve import is almost always run alongside an IMAP import of the same
account, so that the archive holds the mailbox, the messages, and the filtering
rules together before being exported to a JMAP target.

## Invocation

```sh
vandelay import managesieve \
  --url sieves://host[:port] \
  (--auth-basic <USER> [--auth-password <PASS>] | --auth-bearer [<TOKEN>] --auth-user <USER>) \
  [--allow-cleartext] \
  [--allow-source-change] \
  <ARCHIVE>
```

The archive is the final positional argument and is created if it does not yet
exist. Exactly one authentication mode must be supplied: either `--auth-basic`
(SASL PLAIN or LOGIN) or `--auth-bearer` (SASL OAUTHBEARER). Re-running the
command against the same archive and the same account is safe and convergent: a
partial or interrupted run is continued by simply invoking it again, with no
cursor or resume token to manage.

## Transport and TLS

The transport is selected from the URL scheme. Both schemes default to the
IANA-registered ManageSieve port 4190 when no port is given in the URL.

| URL scheme | Default port | Transport behaviour |
|------------|--------------|---------------------|
| `sieves://host[:port]` | 4190 | TLS from the first byte (implicit TLS). |
| `sieve://host[:port]` | 4190 | Connect in cleartext, then upgrade to TLS with `STARTTLS` whenever the server advertises it. |

The `sieve://` scheme always attempts a `STARTTLS` upgrade when the server
advertises the capability, and `--allow-cleartext` does not override that: an
advertised STARTTLS is always taken. The flag is the escape hatch for the single
case of a server that does not advertise STARTTLS at all. Without
`--allow-cleartext`, such a server is refused (exit code 2) rather than sending
credentials over an unencrypted socket; with `--allow-cleartext`, the importer
proceeds on the cleartext connection and authenticates anyway. The `sieves://`
scheme is unaffected by the flag, since its socket is encrypted from byte one.

RFC 5804 discourages a dedicated implicit-TLS port, and most real deployments run
STARTTLS on port 4190, so `sieve://` is the common path. The `sieves://` scheme
is provided for the less common case of a server reachable on a TLS-from-byte-one
socket. Certificate verification can be disabled with the global
`--allow-invalid-certs` flag for self-signed or otherwise untrusted certificates.

## Authentication

The importer supports three SASL mechanisms, chosen by the authentication flags
and the mechanisms the server advertises. The actual mechanism in use is
negotiated against the server's advertised SASL list, with an automatic fallback
between candidates rather than a hard capability gate.

- `--auth-basic <USER>` selects password authentication. The importer prefers
  `AUTHENTICATE "PLAIN"` and falls back to `AUTHENTICATE "LOGIN"` when only LOGIN
  is advertised. The accompanying password is supplied separately (see below) and
  is never passed as part of the basic flag.
- `--auth-bearer [<TOKEN>] --auth-user <USER>` selects `AUTHENTICATE
  "OAUTHBEARER"` (RFC 7628) for OAuth-based servers. The bearer token alone is
  not sufficient: `--auth-user` is mandatory and names the ManageSieve identity
  the token authorises. Passing `--auth-user` together with `--auth-basic` is
  rejected, as is `--auth-password` together with `--auth-bearer`.

Mechanisms outside this set (CRAM-MD5, DIGEST-MD5, GSSAPI, NTLM, EXTERNAL,
XOAUTH2) are out of scope; a server advertising only those is refused with a
clear error.

### Credential resolution

Credentials are deliberately not taken from the command line as plain values, so
that they do not leak into shell history or the process table. The password for
`--auth-basic` and the token for `--auth-bearer` are resolved in this order:

1. The explicit flag value, when one is given (`--auth-password <PASS>` or
   `--auth-bearer <TOKEN>`).
2. The environment variable: `$VANDELAY_PASSWORD` for the basic password,
   `$VANDELAY_TOKEN` for the bearer token.
3. An interactive prompt, when neither of the above is present.

Supplying the secret through the environment variable or the prompt is the
recommended practice. Credentials are never written to the archive.

## Reconciliation and storage

Import is name-based reconciliation with content re-hashing. ManageSieve exposes
no per-script timestamp, ETag, or change feed, so on every run the importer
enumerates the account's scripts with `LISTSCRIPTS`, fetches each one with
`GETSCRIPT`, and reconciles by content. Sieve scripts are small and few, which
makes fetching every script on every run inexpensive.

Each script's bytes are stored verbatim (no line-ending or encoding
normalisation) and content-addressed by their BLAKE3 hash in the shared `blobs`
table, deduplicated on insert. Because the bytes are byte-exact across every
import source, a script imported via ManageSieve lands on the same blob row as
the identical script imported via JMAP. The reconciliation acts per script name:

- A name with no local row is inserted.
- A name whose local hash matches the freshly fetched bytes is left unchanged,
  except that the active flag is updated if it has flipped on the server.
- A name whose hash differs (the script was edited on the server) has its blob
  reference updated in place; the superseded blob is reclaimed by the end-of-run
  garbage-collection sweep.
- A local name no longer listed by the server is deleted from the archive.

The server's active script is recorded as well: ManageSieve marks at most one
script `ACTIVE`, and the archive tracks that flag so a later JMAP export can
re-activate the corresponding script on the target.

## Source-change protection

The archive records the source it was imported from (scheme, host, port, and the
authenticated identity). Pointing an existing archive at a different ManageSieve
account is refused to prevent accidentally mixing two accounts into one archive.
When changing the recorded source is intentional, pass `--allow-source-change` to
permit the import to proceed against the new source.

## Examples

Dovecot Pigeonhole over implicit TLS, with the password supplied through the
environment:

```sh
VANDELAY_PASSWORD='…' vandelay import managesieve \
  --url sieves://mail.example.com:4190 \
  --auth-basic alice@example.com \
  alice.sqlite
```

A generic provider (for example Fastmail) reached over `sieve://` with a STARTTLS
upgrade, prompting for the password interactively:

```sh
vandelay import managesieve \
  --url sieve://sieve.example.net \
  --auth-basic alice@example.net \
  alice.sqlite
```

An OAuth-capable server authenticated with a bearer token via OAUTHBEARER, the
token taken from the environment:

```sh
VANDELAY_TOKEN='…' vandelay import managesieve \
  --url sieves://imap.provider.example \
  --auth-bearer --auth-user alice@provider.example \
  alice.sqlite
```

Since this importer handles Sieve scripts only, the same account's mailbox and
messages are imported separately with `vandelay import imap` into the same
archive, so that the export step carries the filtering rules and the mail
together.
