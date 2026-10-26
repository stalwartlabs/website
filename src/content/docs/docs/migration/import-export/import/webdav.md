---
sidebar_position: 6
title: "WebDAV"
description: "Import a WebDAV file collection as a file tree: the collection URL, authentication, what is carried, change detection, throughput and examples."
---

The WebDAV importer copies a WebDAV file collection ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)) into an archive, as a tree of JMAP files and folders. The archive is later exported to a JMAP server that advertises file storage.

The importer handles files and directories only. Calendars and address books are read by the [CalDAV](/docs/migration/import-export/import/caldav) and [CardDAV](/docs/migration/import-export/import/carddav) importers. Pointed at a calendar or address book collection, the WebDAV importer would store its entries as plain files.

## Collection URL

WebDAV has no discovery mechanism for file collections, so `--url` names the collection to import, usually the user's home folder or a shared folder. The importer reads that collection and every folder below it. When `--url` is not a collection, the run stops with `no DAV collections found under --url "<url>"` and exit code 1.

The URL depends on the server.

For Nextcloud and ownCloud, a user's files are under `remote.php/dav/files/<user>/`. Both accept an app password, which suits unattended imports:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import webdav \
  --url https://cloud.example.com/remote.php/dav/files/alice/ \
  --auth-basic alice \
  alice-files.sqlite
```

For Apache with `mod_dav`, the URL is the location configured for WebDAV:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import webdav \
  --url https://files.example.org/dav/ \
  --auth-basic webuser \
  apache-files.sqlite
```

For a Stalwart server, a user's files are under `/dav/file/<account>/`, with the account's name as that server knows it, percent-encoded when it is an address.

A share reached with an OAuth token takes the token from the environment. The URL follows `--auth-bearer`, so that the archive is not read as the token:

```sh
export VANDELAY_TOKEN='<access token>'
vandelay import webdav \
  --auth-bearer \
  --url https://dav.example.net/share/projects/ \
  share.sqlite
```

## Authentication and transport

One authentication method is required: `--auth-basic <USER>` with a password, or `--auth-bearer` with a token, as described under [Credentials](/docs/migration/import-export/usage#credentials). The credentials are sent with the first request, and a `401` response ends the run as an authentication failure.

An `http://` URL is refused unless `--allow-cleartext` is given. The option is intended for trusted internal networks:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import webdav \
  --url http://intranet.example.lan/dav/ \
  --auth-basic webuser \
  --allow-cleartext \
  intranet-files.sqlite
```

`--allow-invalid-certs` accepts a self-signed certificate, independently of `--allow-cleartext`.

## Carried data

The importer carries the following data:

| Carried | Notes |
| --- | --- |
| Folders | Name and position in the tree |
| Files | Content exactly as served, name, media type (from `Content-Type` or `getcontenttype`), creation date (`creationdate`, else the time of the run) and modification date (`getlastmodified`) |

WebDAV has no symbolic links and no folder roles, so neither is carried. The export creates files and folders with their names and contents, but it does not set their creation and modification dates on the target.

## Change detection

On each run, the importer reads the tree again. ETags decide what is downloaded: a file whose ETag changed is downloaded again, and a file whose ETag is unchanged is not. Renamed and moved folders are updated, and files and folders that disappeared are removed from the archive. A server that sends no ETags causes every file to be downloaded on every run.

The archive identifies a WebDAV source by the server (scheme, host and port) and the collection URL given in `--url`. A run against another server or collection is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection), even when the server and the account are the same. CalDAV and CardDAV sources, by contrast, do not conflict with it.

A share that moved to a new URL therefore needs `--allow-source-change`, which records the new URL as a second source. The following command continues the import of alice's files after the Nextcloud server moved from `cloud.example.com` to `files.example.com`:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import webdav \
  --url https://files.example.com/remote.php/dav/files/alice/ \
  --auth-basic alice \
  --allow-source-change \
  alice-files.sqlite
```

Change detection applies to each source separately. The files read from the old URL therefore stay in the archive, next to those read from the new one, and later runs against the new URL do not remove them. When only the share at its new URL is wanted, importing it into a new archive avoids carrying both trees.

## Throughput

<!-- include:dav-tuning -->
| Option | Default | Effect |
| --- | --- | --- |
| `--dav-connections <N>` | `4` | Parallel connections to the server, from 1 to 8, and at most `--threads`. |
| `--multiget-batch <N>` | `50` | Number of resources requested per `calendar-multiget` or `addressbook-multiget` REPORT. Has no effect on WebDAV, which reads each file with its own request. |

More connections shorten the copy of a large collection, and increase the load on the server. Larger batches reduce the number of requests on servers that handle them well, while smaller batches suit servers with strict request limits.
<!-- /include:dav-tuning -->

For WebDAV, `--dav-connections` is the option that matters. Each file is downloaded with its own request, spread over the connections, so more connections shorten the copy of a large tree.
