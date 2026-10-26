---
sidebar_position: 1
title: "Database Internals"
description: "How Stalwart lays out its data in the data store: the subspaces, what each holds, and how they map to tables, column families and keys in each backend."
---

This page describes how Stalwart organises its data inside the data store. It is meant for contributors, and for administrators who inspect a database directly and need to know what they are looking at.

Stalwart divides its data into subspaces. A subspace is a logical partition that holds one category of data, such as the directory, the outbound queue or the change log. Each subspace is identified by a single ASCII letter. The same layout is used with every [data store backend](/docs/storage/data), so the letters mean the same thing whichever database holds them.

## Backend mapping

Each backend represents a subspace with its own native structure. With an SQL database (PostgreSQL, MySQL or SQLite), each subspace is a separate table, named after its letter. PostgreSQL and MySQL have no `z` and `m` tables, because they provide their own full-text search. On those two databases the search index lives instead in the `s_email`, `s_cal`, `s_card`, `s_file` and `s_trace` tables, one for each kind of indexed data.

With RocksDB, each subspace is a separate column family, again named after its letter. FoundationDB has a single ordered key space, so there the subspace letter is the first byte of every key.

## Subspace structure

The following table lists every subspace and the data it holds:

| Subspace | Name | Contents |
|---|---|---|
| `a` | ACL | Access control lists that grant other accounts access to shared resources. |
| `b` | Registry index | Indexes over configuration and directory objects, used to look objects up by field value. |
| `c` | Immutable | Values written once and never modified, such as the parsed metadata and sort keys of each email message. |
| `d` | Directory | Accounts, domains, roles, mailing lists, OAuth clients and grants, public keys, tenants and masked email addresses. |
| `e` | Queue messages | Messages in the outbound mail queue. |
| `f` | Task queue | Background tasks, including tasks waiting for a retry and failed tasks kept until an administrator acts on them. |
| `g` | Registry primary keys | Unique keys and references between configuration and directory objects. |
| `h` | Outgoing reports | DMARC and TLS reports waiting to be sent. |
| `i` | Indexes | Indexes over account data, such as message and mailbox properties used for sorting and filtering. |
| `j` | Deleted items | Deleted items kept for recovery during the retention period (Enterprise edition). |
| `k` | Blob links | Links between blobs and the documents that reference them. |
| `l` | Logs | The change log used for incremental cache updates and client synchronisation (IMAP CONDSTORE, JMAP changes, WebDAV sync), and share notifications. |
| `n` | Counters | Every counter: per-account document identifiers, change identifiers, mailbox UIDs, object counts and quota usage, as well as tenant quota usage, identifier sequences for configuration and directory objects, outbound queue quota usage, and the rows of aggregate reports being collected. |
| `o` | Telemetry spans | Stored traces. |
| `p` | Properties | Properties of account data objects, and object metadata. |
| `q` | Queue events | Delivery schedule entries for messages in the outbound queue, and the index of queued messages by tenant (Enterprise edition). |
| `r` | Incoming reports | DMARC, TLS and ARF reports received from other servers. |
| `s` | Registry | Configuration objects. |
| `t` | Blobs | Blob data, when the data store also serves as the blob store. |
| `u` | System | Server-wide values such as the schema version and node identifier assignments. |
| `v` | Index properties | Indexed values of individual properties, used to look up objects by value. |
| `w` | Spam samples | Messages kept for training the spam classifier. |
| `x` | Telemetry metrics | Stored metrics history. |
| `y` | Search queue | Documents waiting to be added to the search index, and the status of each index partition. |
| `z` | Search terms | Terms of the internal full-text search index. |
| `m` | Search documents | Documents of the internal full-text search index. |

The in-memory store is not part of this layout, because it does not live in the data store. The `Default` in-memory store keeps its data in the server process, and the Redis variants keep it in Redis.
