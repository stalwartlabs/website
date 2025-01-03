---
sidebar_position: 1
---

# Overview

Stalwart Mail Server offers support for multiple database and storage backends. The choice of backend depends primarily on the scale and distribution of your mail server setup. 

The following table summarizes the backend options available for each store type:

|                    | Data store         | Blob store         | Full-text store    | In-memory store       |
|--------------------|--------------------|--------------------|--------------------|--------------------|
| RocksDB            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| FoundationDB       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| PostgreSQL         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| MySQL / MariaDB    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| SQLite             | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| S3/MinIO           |                    | :white_check_mark: |                    |                    |
| Azure Blob Storage |                    | :white_check_mark: |                    |                    |
| Filesystem         |                    | :white_check_mark: |                    |                    |
| ElasticSearch      |                    |                    | :white_check_mark: |                    |
| Redis              |                    |                    |                    | :white_check_mark: |
| In-memory          |                    |                    |                    | :white_check_mark: |


It's important to note that the support for each of these databases is compiled directly into the Stalwart Mail Server binary. Therefore, to switch to certain backends such as FoundationDB, you'll need to utilize a different binary, corresponding to the desired backend(s).

:::tip Note

Be aware that a change in storage backend after initial setup implies a requirement for data migration. This means that all user data existing on the initial database backend would need to be transferred to the new backend. This could be a complex and time-consuming process, depending on the amount and type of data involved. Hence, it is advisable to carefully consider the most suitable database backend for your needs right at the start of your setup. 

:::