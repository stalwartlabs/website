---
sidebar_position: 7
title: "Choosing a database"
description: "How to choose the storage backends in the setup wizard: the default for a single server, what a future cluster needs, and what changing a backend later involves."
---

A mail server stores several kinds of data with different needs. Account records, mailbox structure and settings are small and change constantly, message contents and attachments are large and never change once written, the full-text index is derived from the messages, and counters such as rate limits matter only briefly. Stalwart therefore keeps them in four stores, each of which can use the backend that suits it: the data store for all structured data and the configuration, the blob store for messages and attachments, the search store for the full-text index, and the in-memory store for short-lived data such as rate-limit counters. [Storage](/docs/storage/) describes each store.

The administrator chooses the backends on the storage screen of the [setup wizard](/docs/install/setup-wizard#step-2-storage). Most of these choices are easy to revisit, but the data store is expensive to change later, because moving to another data store requires a data migration. This page explains how to choose it, and when the other stores are worth separating.

## Single server

For a single server, RocksDB as the data store with every other store left at its default is the simplest configuration, and the one the installation tutorials use: all data lives in one directory, one backup covers everything, and no external service is needed. SQLite is the alternative for an administrator who prefers a single database file. PostgreSQL or MySQL are appropriate when the organisation already operates such a database and its backup and replication procedures should apply to mail as well.

With the default in-memory store, which keeps its data in the memory of the server process, rate limits and greylisting start over after each restart. This is acceptable for a single server.

## A server that may become a cluster

Several nodes can serve the same accounts only when every node reaches the same stores. RocksDB and SQLite are local files that only one process can open, so a server that may later be extended into a [cluster](/docs/cluster/) should start with PostgreSQL, MySQL or FoundationDB as its data store. The other stores can be moved later. [Cluster requirements](/docs/cluster/#cluster-requirements) lists every component a cluster needs, and [Storage backends](/docs/storage/backends/) shows which backend can serve which store.

## Separate blob and search stores

Messages and attachments account for most of the stored bytes. Keeping them in the data store means a single backup and no additional service. Moving them to object storage such as S3 lets capacity grow independently of the database, at the price of a second system to operate and back up consistently with the first. A dedicated search engine (Elasticsearch or Meilisearch) takes indexing and query load off the data store, and adds a service that has to be sized, secured and kept available. Both can be added after installation.

## Changing a backend later

`config.json` holds the data store settings, while the other three stores are configuration objects inside the data store, which the administrator edits in the WebUI. All four can be changed after installation, but a change does not move existing data: the new backend starts empty. [Database migration](/docs/management/maintenance/migration) describes how to move the data of an existing installation.

## FoundationDB

FoundationDB is not included in the standard build. [FoundationDB](/docs/storage/backends/foundationdb) describes the separate build, installed with the installation script's `--fdb` option, and the client library it needs.
