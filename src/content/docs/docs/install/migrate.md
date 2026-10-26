---
sidebar_position: 12
title: "Migrating from another system"
description: "Where to start when moving mailboxes to Stalwart from another server, a hosted service or another storage backend."
---

A new Stalwart server often replaces an existing system that already holds mail, calendars and contacts, and its users expect to find that data on the new server. Moving it is a separate task from the installation, and the right procedure depends on where the data comes from:

- From a Stalwart 0.16 deployment, [Upgrading from Stalwart 0.16](/docs/migration/upgrade-0-16/) copies the whole deployment into a new 1.0 store while 0.16 keeps running, with a short maintenance window at the end. It needs disk space for a second copy of the data store, and the [migration overview](/docs/migration/#upgrading-a-stalwart-016-deployment) compares it with the account-by-account procedure below.
- From another mail server, a hosted service, or another Stalwart server of any release, the [migration section](/docs/migration/) describes how accounts are moved while users keep working, using a migration proxy that routes each user to the server currently holding the account and a tool that copies mail, calendars, contacts, filters and files one account at a time. Hosted services such as Google Workspace and Microsoft 365 are covered in [Migrating from hosted services](/docs/migration/guide/hosted).
- Between storage backends of the same server, for example from RocksDB to PostgreSQL, [Database migration](/docs/management/maintenance/migration) exports the data store and imports it into the new backend.
- Between 1.x releases of the same server, no migration is needed, and [Upgrading](/docs/install/upgrade) describes the procedure.
