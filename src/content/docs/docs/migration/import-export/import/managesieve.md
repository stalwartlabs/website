---
sidebar_position: 7
title: "ManageSieve"
description: "Import an account's Sieve scripts and its active script from a ManageSieve server: transport, authentication, change detection and examples."
---

The ManageSieve importer copies the Sieve scripts of one account from a ManageSieve server ([RFC 5804](https://www.rfc-editor.org/rfc/rfc5804)) into an archive.

A ManageSieve server offers nothing but Sieve scripts, so this importer produces one data type. It is usually run together with an IMAP import of the same account, into the same archive, so that the export carries the mail and the filters together.

```sh
vandelay import managesieve \
  --url sieves://host[:port] \
  (--auth-basic <USER> [--auth-password <PASS>] | --auth-bearer [<TOKEN>] --auth-user <USER>) \
  [--allow-cleartext] \
  [--allow-source-change] \
  <ARCHIVE>
```

## Transport

The URL scheme selects the transport. Both schemes use port 4190 when the URL gives none:

| Scheme | Transport |
| --- | --- |
| `sieve://host[:port]` | Connects without TLS and upgrades with `STARTTLS` whenever the server offers it. |
| `sieves://host[:port]` | TLS from the first byte. |

RFC 5804 requires servers to implement STARTTLS, so most servers offer it on port 4190, and `sieve://` is the usual scheme. With `sieve://`, an offered STARTTLS is always used. A server that offers no STARTTLS is refused with exit code 2, so that credentials are not sent unencrypted, unless `--allow-cleartext` is given. `--allow-invalid-certs` accepts a self-signed certificate.

## Authentication

Two authentication methods are supported. The [Credentials](/docs/migration/import-export/usage#credentials) section describes how secrets are supplied.

`--auth-basic <USER>` authenticates with `PLAIN`, or with `LOGIN` when the server offers only that. The password comes from `--auth-password`, `VANDELAY_PASSWORD` or a prompt. A Dovecot master user login, such as `alice@example.org%vmadmin`, is given as the user name.

`--auth-bearer` authenticates with `OAUTHBEARER` ([RFC 7628](https://www.rfc-editor.org/rfc/rfc7628)), with the token inline, from `VANDELAY_TOKEN`, or from a prompt. `--auth-user <USER>` is then required, and names the identity that the token is for.

Other mechanisms, such as `CRAM-MD5`, `GSSAPI` or `XOAUTH2`, are not supported, and a server that offers only those is refused.

## Carried data

Each script is stored byte for byte, with its name. The server's active script is also recorded, so that the export activates the same script on the target. A server marks at most one script as active.

## Change detection

ManageSieve reports no change information, so every run lists the account's scripts and reads each of them. Sieve scripts are small and few, so reading all of them on each run costs little.

The comparison with the archive then decides what changes. A script with a new name is added, a script whose content or active state changed is updated, and a script that disappeared is removed. The archive records the server and the authenticated identity, so a run against another account is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection).

## Examples

The following command reads from Dovecot Pigeonhole with STARTTLS, with the password in the environment:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import managesieve \
  --url sieve://mail.example.com \
  --auth-basic alice@example.com \
  alice.sqlite
```

The next command reads from a server with TLS from the first byte, and prompts for the password:

```sh
vandelay import managesieve \
  --url sieves://sieve.example.net:4190 \
  --auth-basic alice@example.net \
  alice.sqlite
```

The last command reads from a server that accepts OAuth tokens, with the token in the environment:

```sh
export VANDELAY_TOKEN='<access token>'
vandelay import managesieve \
  --url sieve://imap.provider.example \
  --auth-bearer --auth-user alice@provider.example \
  alice.sqlite
```
