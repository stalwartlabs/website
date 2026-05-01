---
sidebar_position: 1
title: "Overview"
---

Stalwart supports several database and object-storage backends. The choice of backend depends primarily on the scale and topology of the deployment.

The following table summarises which backend is available for each store type:

|                    | Data store         | Blob store         | Search store       | In-memory store       |
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
| Meilisearch        |                    |                    | :white_check_mark: |                    |
| Redis              |                    |                    |                    | :white_check_mark: |

Backend support is compiled into the Stalwart binary. Switching to backends such as FoundationDB therefore requires running a different binary built with the corresponding feature enabled.

Each store (data, blob, search, in-memory) is configured through its own singleton object: [DataStore](/docs/ref/object/data-store), [BlobStore](/docs/ref/object/blob-store), [SearchStore](/docs/ref/object/search-store), and [InMemoryStore](/docs/ref/object/in-memory-store). These objects are multi-variant: changing backend means selecting a different variant on the corresponding object, without restructuring the rest of the configuration.

:::tip[Note]

Changing the storage backend after initial setup requires data migration. All existing data on the previous backend must be transferred to the new backend, which can be time-consuming depending on the volume and type of data involved. It is therefore advisable to choose the appropriate backend at the start of the deployment.

:::
