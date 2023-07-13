---
sidebar_position: 1
---

# Getting started

**Stalwart Mail Server** is an open-source mail server solution with JMAP, IMAP4, and SMTP support and a wide range of modern features. It is written in Rust and aims to be secure, fast, robust and scalable.

## Choosing a package

Stalwart Mail server is distributed as a single binary that includes JMAP, IMAP, and SMTP servers and also as standalone packages for those who need only one of these servers:

- **All-in-one Mail Server**: A single binary that bundles JMAP, IMAP, and SMTP servers. This version is for those who need a complete, out-of-the-box solution.
- **JMAP Server**: Standalone package containing only the JMAP server.
- **IMAP Server**: Standalone package containing IMAP and JMAP server.
- **SMTP Server**: Standalone package for those needing only an SMTP server.

## Choosing a database backend

With the exception of the SMTP server-only version, when installing Stalwart Mail server you will be asked to select a database backend. This database serves as the storage for indexes and metadata, but it does not store any email messages. The available options are:

- **SQLite**: Ideal for small to medium-sized installations. Designed for single-node setups, you can still ensure data redundancy using solutions like Litestream. 
- **FoundationDB**: Suitable for distributed, multi-server installations. It can support millions of users, making it an excellent choice for larger organizations.

:::tip Note

Be aware that changing the database backend at a later time will require migrating your data.

:::

## Supported blob stores

The blob store is where email messages and other data such as Sieve scripts are stored. Unless you opt for the SMTP-only version, a blob storage backend has to be selected. Available options are:

- **Local Storage**: Store blobs and messages locally. Email messages are stored using the Maildir format.
- **S3-Compatible Distributed Storage**: Store blobs and messages on an S3-compatible server, including Amazon S3, Google Cloud, or MinIO.

## Supported authentication backends

A database or directory server is required for authentication, validating local accounts, and obtaining account-related information such as names or disk quotas. Available options are:

- **LDAP**: LDAP servers, including OpenLDAP and Active Directory.
- **SQL**: SQL databases, including MySQL, PostgreSQL and SQLite.

:::tip Tip

In the event that you don't have an existing directory server or authentication database, the installation script can automatically create an SQLite authentication database for you.

:::


