---
sidebar_position: 5
title: "CardDAV"
description: "Import address books and contacts from a CardDAV server: discovery, authentication, what is carried, change detection, throughput and examples."
---

The CardDAV importer copies address books and their contacts from a CardDAV server ([RFC 6352](https://www.rfc-editor.org/rfc/rfc6352)) into an archive. It is the contacts counterpart of the [CalDAV](/docs/migration/import-export/import/caldav) importer, with the same options.

A run imports every address book of the account, with all its contacts. There is no type selection, because a contact needs its address book.

```sh
vandelay import carddav \
  --url <http(s)://host[:port][/path]> \
  (--auth-basic <USER> | --auth-bearer [TOKEN]) \
  [--auth-password <PASS>] \
  [--allow-cleartext] \
  [--dav-connections <N>] \
  [--multiget-batch <N>] \
  [--allow-source-change] \
  <ARCHIVE>
```

## Discovery

`--url` can name the server, a principal, the address book home or a single address book. Vandelay finds the address books in the same way as the CalDAV importer finds calendars:

1. It lists `--url` as an address book home or an address book.
2. It reads the current user's principal ([RFC 5397](https://www.rfc-editor.org/rfc/rfc5397)), and lists its address book home.
3. It queries `/.well-known/carddav` ([RFC 6764](https://www.rfc-editor.org/rfc/rfc6764)).

Redirects are followed, at most five times, and credentials are not sent to another host. When no address book is found, the run stops with `no DAV collections found under --url "<url>"` and exit code 1. Naming the address book home or one address book is the most reliable form for self-hosted servers whose discovery is incomplete.

## Authentication and transport

One authentication method is required: `--auth-basic <USER>` with a password, or `--auth-bearer` with a token, which suits hosted providers that issue OAuth tokens. Both are described under [Credentials](/docs/migration/import-export/usage#credentials). The credentials are sent with the first request.

An `http://` URL is refused unless `--allow-cleartext` is given, and `--allow-invalid-certs` accepts a self-signed certificate.

## Carried data

The importer carries the following data:

| Carried | Notes |
| --- | --- |
| Address books | Name (from `displayname`, else the last path segment) and description |
| Contacts | Converted from vCard to JSContact ([RFC 9553](https://www.rfc-editor.org/rfc/rfc9553)), with their UID |

The archive keeps the JSContact form, not the original vCard text. A contact without a UID receives one derived from its path on the server. That UID stays the same across runs, so that the contact can be matched on later exports.

A vCard that cannot be parsed is skipped with a warning, and counted towards the partial failure exit code. The rest of the address book is still imported.

## Change detection

On each run, the importer compares each address book's resources and their ETags with the archive. New contacts are read, contacts whose ETag changed are read again, unchanged contacts are skipped, and contacts that disappeared are removed.

The archive records the server and the principal, so a run against another account is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection). CalDAV, CardDAV and WebDAV sources do not conflict with each other.

## Throughput

<!-- include:dav-tuning -->
| Option | Default | Effect |
| --- | --- | --- |
| `--dav-connections <N>` | `4` | Parallel connections to the server, from 1 to 8, and at most `--threads`. |
| `--multiget-batch <N>` | `50` | Number of resources requested per `calendar-multiget` or `addressbook-multiget` REPORT. Has no effect on WebDAV, which reads each file with its own request. |

More connections shorten the copy of a large collection, and increase the load on the server. Larger batches reduce the number of requests on servers that handle them well, while smaller batches suit servers with strict request limits.
<!-- /include:dav-tuning -->

## Examples

Apple iCloud requires an app-specific password, created in the Apple ID security settings:

```sh
export VANDELAY_PASSWORD='<app-specific password>'
vandelay import carddav \
  --url https://contacts.icloud.com \
  --auth-basic appleid@example.com \
  icloud-contacts.sqlite
```

Fastmail accepts an app password:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import carddav \
  --url https://carddav.fastmail.com \
  --auth-basic user@fastmail.com \
  fastmail-contacts.sqlite
```

Nextcloud is reached by the user's address book home:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import carddav \
  --url https://cloud.example.com/remote.php/dav/addressbooks/users/alice/ \
  --auth-basic alice \
  nextcloud-contacts.sqlite
```

Baikal is reached here by one address book:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import carddav \
  --url https://dav.example.com/dav.php/addressbooks/alice/default/ \
  --auth-basic alice \
  baikal-contacts.sqlite
```

Radicale's address book home is the user's collection. The following command reaches it over plain HTTP, on a trusted local network:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import carddav \
  --url http://192.168.1.10:5232/alice/ \
  --auth-basic alice \
  --allow-cleartext \
  radicale-contacts.sqlite
```
