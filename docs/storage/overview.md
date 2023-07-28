---
sidebar_position: 1
---

# Overview

This section covers the configuration and management of the storage system. Stalwart Mail Server utilizes a two-pronged approach to storage, which involves a database and a blob store: 

The [database](/docs/storage/database/overview) is used for storing settings, indexes, and other pieces of metadata. Depending on your specific setup, you can choose to use either SQLite (ideal for single node installations) or FoundationDB (suited for distributed installations). The database selection is precompiled into the binary and it can be changed by installing the corresponding binary for the chosen database. It's worth noting that email contents are not stored in the database. 

For storing emails, sieve scripts, and other large binary objects, we use what we refer to as the "[blob store](/docs/storage/blob/overview)". Stalwart supports two types of blob stores. The first type is "Local", where blobs are stored directly on the local disk with messages being stored in the Maildir format. The second type of blob store is "S3-compatible storage", which could be Amazon S3, Google Cloud Storage (GCS), MinIO, or any other S3-compatible service.

:::tip Note

You're not required to set up storage when using the stand-alone SMTP server. The configuration of storage becomes a requirement when you're running the JMAP and/or IMAP servers. So, if you're only using the SMTP server, feel free to skip this section. 

:::

