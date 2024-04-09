---
sidebar_position: 1
---

# Getting started

**Stalwart Mail Server** is an open-source mail server solution with JMAP, IMAP4, and SMTP support and a wide range of modern features. It is written in Rust and aims to be secure, fast, robust and scalable.

## Choosing a storage backend

When installing Stalwart Mail server you will be asked to specify a backend for each one of the four store types:

- [Data store](/docs/storage/data): Where email metadata, folders, and various settings are stored. Essentially, it contains all the data except for large binary objects (blobs).
- [Blob store](/docs/storage/blob): Used for storing large binary objects such as emails, sieve scripts, and other files.
- [Full-text search store](/docs/storage/fts): Dedicated to indexing for full-text search, enhancing the speed and efficiency of text-based queries
- [Lookup store](/docs/storage/lookup): A key-value storage used primarily by the SMTP server and anti-spam components. It stores sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

The following table summarizes the supported backends available for each store type:

|                 | Data store         | Blob store         | Full-text store    | Lookup store       |
|-----------------|--------------------|--------------------|--------------------|--------------------|
| RocksDB         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| FoundationDB    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| PostgreSQL      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| MySQL / MariaDB | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| SQLite          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| S3/MinIO        |                    | :white_check_mark: |                    |                    |
| Filesystem      |                    | :white_check_mark: |                    |                    |
| ElasticSearch   |                    |                    | :white_check_mark: |                    |
| Redis           |                    |                    |                    | :white_check_mark: |
| In-memory       |                    |                    |                    | :white_check_mark: |

:::tip Note

Be aware that changing the database backend at a later time will require migrating your data.

:::

## Choosing an authentication backend

A database or directory server is required for authentication, validating local accounts, and obtaining account-related information such as names, group membership or disk quotas. Available options are:

- **Internal**: An internal directory that is automatically created and managed by Stalwart Mail server. It uses the same database backend as the data store.
- **LDAP**: LDAP servers, including OpenLDAP and Active Directory.
- **SQL**: SQL databases, including PostgreSQL, MySQL and SQLite.

:::tip Note

- When the internal directory is used, Stalwart Mail Server manages all user-related data within its own system. In this setup, all account management tasks, such as creating new user accounts, updating passwords, and setting quotas, are performed directly within Stalwart Mail Server.
- When an external LDAP or SQL directory is utilized, all user account management must be performed within that external system. Stalwart Mail Server will rely on this external directory for authentication and user information but will not have the ability to directly modify user details.

:::
