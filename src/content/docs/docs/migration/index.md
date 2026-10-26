---
sidebar_position: 0
title: "Overview"
description: "How the migration proxy and Vandelay move a populated mail system onto Stalwart, and which procedure applies to each kind of source."
---

Moving a mail system that people already use onto Stalwart is more than copying files. Two separate problems have to be solved at the same time.

The first is the data. Every account holds mail, mailboxes, Sieve scripts, calendars, contacts and files, and all of it has to be copied from the existing system to the new one without loss.

The second is continuity. The copying takes time, and while it is in progress some accounts still live on the existing system and others have already moved. Users continue to send and receive mail throughout, so their clients must keep reaching whichever server holds their account at that moment.

Stalwart provides one tool for each problem. The migration proxy keeps clients connected to the right server, and Vandelay copies the data. A Stalwart 0.16 deployment has a third option: it can be copied as a whole into a new 1.0 store, as described in [Upgrading a Stalwart 0.16 deployment](#upgrading-a-stalwart-016-deployment).

## Migration proxy

The [migration proxy](/docs/migration/proxy/) is a multi-protocol mail proxy that sits in front of both the existing server and the new Stalwart deployment. It accepts IMAP, POP3, ManageSieve, SMTP submission and HTTP connections on the public hostname, so users keep the same hostname and ports during the migration.

For each connection, the proxy identifies the account from the credentials the client presents, then forwards the session to the server that currently holds that account. Inbound SMTP on port 25 carries no login, so the proxy cannot tell which account it belongs to; that traffic is passed to one server.

The proxy decides where each account lives from a mapping table, which records one server per account. Moving an account between servers is therefore a change to a single mapping entry.

## Vandelay

[Vandelay](/docs/migration/import-export/) is a command-line tool that copies one account at a time, in two steps that meet at a local archive file.

Its import command reads an account from a source into the archive. The source can be a server reached over JMAP, IMAP, CalDAV, CardDAV, WebDAV or ManageSieve, a local Maildir tree, a Google Takeout export or Microsoft Exchange. Its export command then writes the archive to a JMAP server such as Stalwart.

Both commands can be run again against the same archive. A repeated import picks up only what changed on the source since the previous run. A repeated export adds what is missing on the target, without creating duplicates.

## Migrating account by account

For a self-hosted source, the two tools work together. The proxy is placed in front of both servers, and at first every account resolves to the existing server, so nothing changes for users.

Each account is then moved in turn, in three steps:

1. Vandelay copies the account's data to the new server, while the account remains in use on the existing one.
2. The account's mapping is switched to the new server. The switch disconnects the account's open sessions, and they reconnect to the new server.
3. A final incremental pass copies what changed on the existing server during the first copy.

The existing server keeps a full copy of every account until it is decommissioned. Until then, a moved account can be routed back to it.

A hosted service such as Google Workspace or Microsoft 365 cannot be placed behind the proxy, so this account-by-account switch is not available. For these sources, Vandelay copies the data, and the whole domain moves to Stalwart at once when its MX records and client settings change.

## Choosing a procedure

The procedure, and the tools it needs, depend on the source system:

| Source | Procedure | Tools |
| --- | --- | --- |
| Stalwart 0.16 | [Upgrading from Stalwart 0.16](/docs/migration/upgrade-0-16/), or the [migration guide](/docs/migration/guide/) with the [Previous Stalwart versions](/docs/migration/guide/configure-source/previous-stalwart) source page, as described below; both require 0.16.27 | `stalwart-migrate`, or proxy and Vandelay |
| Stalwart 0.15 | [Migration guide](/docs/migration/guide/), with the [Previous Stalwart versions](/docs/migration/guide/configure-source/previous-stalwart) source page | Proxy and Vandelay |
| Stalwart 0.14 or earlier | [Migration guide](/docs/migration/guide/), meeting the [requirements for any source](/docs/migration/guide/configure-source/) as for another self-hosted server | Proxy and Vandelay |
| Dovecot and Postfix, including Mail-in-a-Box and mailcow | [Migration guide](/docs/migration/guide/), with the [Dovecot and Postfix](/docs/migration/guide/configure-source/dovecot-postfix/) source page | Proxy and Vandelay |
| Another self-hosted IMAP, POP3 and SMTP server, such as Cyrus or Courier | [Migration guide](/docs/migration/guide/), using the Dovecot and Postfix source page as the template | Proxy and Vandelay |
| Google Workspace or Gmail | [Migrating from hosted services](/docs/migration/guide/hosted) | Vandelay |
| Microsoft 365 or Exchange | [Migrating from hosted services](/docs/migration/guide/hosted) | Vandelay |
| A Google Takeout export, mbox files or a Maildir tree | The [Takeout](/docs/migration/import-export/import/takeout) or [Maildir](/docs/migration/import-export/import/maildir) importer, followed by an [export](/docs/migration/import-export/export) | Vandelay |
| A single account on another JMAP server | The [JMAP](/docs/migration/import-export/import/jmap) importer, followed by an [export](/docs/migration/import-export/export) | Vandelay |

## Upgrading a Stalwart 0.16 deployment

A Stalwart 0.16 deployment can be moved to 1.0 in two ways. The first is the account-by-account migration of the [migration guide](/docs/migration/guide/), which applies to every earlier release. The second applies only to 0.16.27: [`stalwart-migrate`](/docs/migration/upgrade-0-16/) copies the whole deployment into a new 1.0 store.

The two procedures differ in what they require and in what users notice. The first difference is downtime. With the proxy, accounts move one at a time while both servers run, and users keep working throughout; moving an account only makes its clients reconnect. `stalwart-migrate` copies the bulk of the data while 0.16 serves users, but every 0.16 node is stopped for the final run, which copies the last changes. The downtime therefore lasts as long as that final run.

The second difference is disk space. `stalwart-migrate` writes a complete second copy of the data store next to the original one. With an external blob store, 1.0 reuses the blobs, so only the data store is duplicated. The proxy procedure instead runs the new deployment on its own host and storage, and Vandelay needs disk space for the archives of the accounts being moved.

The third difference is infrastructure. `stalwart-migrate` runs on a host that reaches both stores, and 1.0 then starts in place of 0.16. The proxy procedure needs a host for the new deployment, a host for the proxy, and access to the DNS records of the public hostname.

The last difference is what each procedure carries over. `stalwart-migrate` converts the settings and copies every account with its credentials. It also keeps the identifiers that clients cache, so IMAP and JMAP clients continue without downloading their data again. The proxy procedure copies each account's data with Vandelay, while settings, accounts and their properties are recreated on the new deployment, as listed in [Items not carried over](/docs/migration/guide/#items-not-carried-over). The new deployment assigns new identifiers to the copied data, so clients download the data of a moved account again.

In short, `stalwart-migrate` suits small and medium deployments that can hold a second copy of their data store and accept a short maintenance window. Large deployments, deployments that cannot hold a second copy, and deployments that must remain available throughout use the migration guide.

## Other operations

Moving a Stalwart server from one storage backend to another, for example from RocksDB to PostgreSQL, is a different operation that uses neither tool. It is described under [Database migration](/docs/management/maintenance/migration).
