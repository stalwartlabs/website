---
sidebar_position: 6
title: "WebDAV"
---

The `vandelay import webdav` subcommand reads a plain WebDAV file collection (RFC 4918) into a local SQLite archive, mapping the remote directory tree onto a JMAP `FileNode` hierarchy. This is the file-storage importer: it handles ordinary files and directories only. Calendars and address books are served by the separate [CalDAV](caldav) and [CardDAV](carddav) importers, which speak the same transport but produce entirely different JMAP object types. A WebDAV import never produces calendars, events, address books, or contacts; conversely, pointing `import webdav` at a CalDAV or CardDAV collection yields nothing useful, because vandelay treats every non-directory resource it finds as an opaque file blob rather than parsing it as iCalendar or vCard.

## Scope and target shape

Each WebDAV import targets exactly one file tree rooted at the URL supplied on `--url`. Vandelay enumerates that root and every directory beneath it, recording each directory as a `FileNode` of type `directory` and each file as a `FileNode` of type `file`. The resulting archive holds the complete tree shape, the file metadata (name, media type, creation and modification timestamps), and the file payloads, ready for a later `vandelay export` into a JMAP server that advertises file-storage support.

The importer is convergent: re-running it against the same archive reconciles the current server state against what was previously stored, fetching only new or changed files and removing nodes that have vanished from the server. There is no resume cursor; resumption is a property of re-running.

## Pointing `--url` at a collection root

The single input that determines what gets imported is `--url`. For plain WebDAV there is no registered discovery mechanism (no well-known URI, no principal property that servers reliably honour), so the operator must point `--url` directly at the collection that should be archived, typically the user's home directory or a specific shared folder. Vandelay issues a `PROPFIND` with `Depth: 1` against that URL and requires the root resource to report a `<resourcetype>` containing `<collection/>`; if the URL does not resolve to a collection, the import aborts with a clear error rather than guessing.

The URL takes the form `http://host[:port][/path]` or `https://host[:port][/path]`. A cleartext `http://` URL is refused unless `--allow-cleartext` is also supplied (see below).

### Nextcloud and ownCloud

Nextcloud and ownCloud expose per-user file storage under the `remote.php/dav/files/<user>/` path. Point `--url` at that path (or at any sub-directory within it) to archive the user's files:

```sh
export VANDELAY_PASSWORD='app-password'
vandelay import webdav \
  --url https://cloud.example.com/remote.php/dav/files/alice/ \
  --auth-basic alice \
  alice-files.sqlite
```

Both servers accept a dedicated app password in place of the account password for `--auth-basic`, which is the recommended credential for an unattended import.

### Apache mod_dav

An Apache server with `mod_dav` enabled exposes a configured filesystem location directly as a WebDAV collection. Point `--url` at that location:

```sh
export VANDELAY_PASSWORD='secret'
vandelay import webdav \
  --url https://files.example.org/dav/ \
  --auth-basic webuser \
  apache-files.sqlite
```

If the `mod_dav` location is served without TLS on an internal network, see the cleartext note below.

### Generic WebDAV share

Any RFC 4918 compliant server is supported. Supply the collection URL and credentials:

```sh
export VANDELAY_TOKEN='ya29.bearer-token-value'
vandelay import webdav \
  --url https://dav.example.net/share/projects/ \
  --auth-bearer \
  share.sqlite
```

## Directory tree to FileNode hierarchy

Vandelay walks the WebDAV tree breadth-first. The root URL becomes the top-level `FileNode` directory. For each `PROPFIND Depth: 1` response, every sub-resource whose resourcetype is `<collection/>` is recorded as a child directory and queued for its own `PROPFIND`; every resource without a collection resourcetype is treated as a file. Because the walk is breadth-first and a parent directory is always committed before its children, each node's `parent_id` foreign key resolves at insert time, reconstructing the exact server-side path structure inside the archive.

Each directory issues exactly one `PROPFIND` at a time, so memory usage peaks at a single directory's multi-status response rather than the whole tree, which lets the importer scale to deep trees with thousands of files per directory. A node's `name` is the terminal path component of its href (percent-decoded). On a re-run, a directory renamed or moved on the server is reflected in the archive: the stored `name` and `parent_id` are rewritten from the fresh `PROPFIND` response. Directories deleted on the server are removed from the archive leaf-first, so no orphaned `FileNode` rows are left behind.

WebDAV exposes no equivalent of a POSIX symlink and no role concept, so imported file nodes never carry a `symlink` type and their `role` is always left unset.

## Content-addressed blob storage of file payloads

Every file's body is fetched with a plain `GET` and stored verbatim in the archive's content-addressed blob table. The bytes are streamed in a single pass into a BLAKE3 hasher and the blob buffer, so a large file is hashed and stored without a separate read. The BLAKE3 hash is the blob's identity: two identical files, whether they appear twice in the same tree or once here and once in a different source archive, share a single blob row. No charset conversion or transformation is applied; the stored bytes are byte-exact with the server's response. On a re-run, an unchanged file (detected by an unchanged ETag) is not re-downloaded; a changed file is re-fetched and its new bytes interned, with the superseded blob reclaimed by the garbage-collection sweep that runs only after a fully successful import.

File metadata is captured alongside the blob: the `media_type` from the response `Content-Type` header (or the `getcontenttype` property), the creation timestamp from `creationdate` (falling back to the run start time when absent), and the modification timestamp from `getlastmodified`, normalised from its HTTP-date wire format to RFC 3339.

## Authentication

The importer requires exactly one authentication mechanism, supplied as a mutually exclusive choice between Basic and Bearer. The choice is mandatory; omitting both is a usage error.

- `--auth-basic <USER>` selects HTTP Basic authentication. The username is given on the command line; the password is resolved separately (see below).
- `--auth-bearer [<TOKEN>]` selects bearer-token authentication, sending `Authorization: Bearer <token>`. This is the appropriate choice for hosted services that issue OAuth access tokens. The token value is optional on the flag and is normally resolved from the environment or a prompt.

Vandelay always sends the chosen credential on the first request and never issues an unauthenticated probe. A `401` response after a credentialed request is therefore treated as a hard authentication failure rather than a challenge to retry.

### Credential resolution

Credentials are never taken from the command line as the recommended path, and passing them there is discouraged because they become visible in the process list and shell history. The resolution order is:

1. For Basic, an explicit `--auth-password <PASS>` value; for Bearer, an explicit token argument to `--auth-bearer`.
2. The `VANDELAY_PASSWORD` environment variable (Basic) or `VANDELAY_TOKEN` environment variable (Bearer).
3. An interactive, no-echo terminal prompt when neither of the above is set.

The resolved secret is used only for the live connection and is never written to the archive.

## Transport security and cleartext

Transport defaults to TLS. A `https://` URL is verified against the system trust store. An `http://` URL carrying credentials is refused unless `--allow-cleartext` is passed, which permits sending the `Authorization` header over an unencrypted connection. This is intended only for trusted internal networks (for example an internal `mod_dav` host without a certificate):

```sh
export VANDELAY_PASSWORD='secret'
vandelay import webdav \
  --url http://intranet.example.lan/dav/ \
  --auth-basic webuser \
  --allow-cleartext \
  intranet-files.sqlite
```

Invalid or self-signed TLS certificates can be accepted with the global `--allow-invalid-certs` flag, which is independent of `--allow-cleartext`.

## Tuning flags

Two flags control fetch concurrency and batching:

| Flag | Default | Effect |
| --- | --- | --- |
| `--dav-connections <N>` | 4 | Number of parallel worker connections used to fetch files. Clamped to the range 1 to 8, and further capped by the global `--threads` value. |
| `--multiget-batch <N>` | 50 | Number of resource hrefs per multiget REPORT batch. |

`--dav-connections` is the lever that matters for WebDAV throughput: file payloads are fetched one `GET` per file, fanned out across the worker pool, so raising the connection count shortens the wall time of a large directory at the cost of more concurrent load on the server. The worker pool pulls the next free job per worker, so a single slow file becomes tail latency rather than a head-of-line block.

`--multiget-batch` is accepted on every DAV import for a uniform command surface, but it governs the `calendar-multiget` and `addressbook-multiget` REPORT batches used by the [CalDAV](caldav) and [CardDAV](carddav) importers. Plain WebDAV has no multiget REPORT; files are fetched individually, so this flag has no effect on a `webdav` import.

## Source-change protection

An archive records the identity of the source it was filled from (the normalised base URL and the resolved home-set URL for the WebDAV kind). Re-pointing an existing archive at a different WebDAV source is refused by default, guarding against accidentally mixing two accounts into one archive. To override the guard intentionally, pass `--allow-source-change`:

```sh
export VANDELAY_PASSWORD='app-password'
vandelay import webdav \
  --url https://cloud.example.com/remote.php/dav/files/bob/ \
  --auth-basic bob \
  --allow-source-change \
  shared.sqlite
```

A WebDAV source does not conflict with a CalDAV or CardDAV source in the same archive against the same host; the source kind distinguishes them, so the three DAV importers can populate one archive without tripping the guard.
