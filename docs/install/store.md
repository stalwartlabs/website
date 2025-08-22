---
sidebar_position: 3
---

# Choosing a database

Stalwart employs a modular storage architecture that separates different types of data into four distinct stores. This design provides flexibility and allows each storage component to be optimized independently, depending on the scale and needs of the deployment.

- The [Data Store](/docs/storage/data) is responsible for storing structured metadata such as email headers, folder hierarchies, calendar, contacts, user settings, and other non-binary information. Essentially, it holds everything except large binary objects.
- The [Blob Store](/docs/storage/blob) is where large binary files—such as the actual email content, sieve scripts, and attachments—are stored. 
- To support efficient search operations, Stalwart also utilizes a [Full-text Search Store](/docs/storage/fts), which maintains indexes to speed up text-based queries across message content. 
- Finally, the [In-memory Store](/docs/storage/in-memory) handles ephemeral key-value data used by security, clustering, and anti-spam components, including rate limiting, distributed locks, Bayesian models, sender reputation scores, and message interaction tracking.

In simple or single-node setups, it is entirely feasible to consolidate these roles into a single storage backend. For example, databases such as **RocksDB** or **PostgreSQL** can be configured to serve as the data store, blob store, full-text search store, and even in-memory store. It is common to see lightweight deployments where RocksDB is used exclusively for all four functions, simplifying management and reducing infrastructure complexity. If you decide to use PostrgreSQL instead of the default RocksDB, you'll need to add a user and a [database into PostgreSQL](/docs/auth/backend/sql/#postgresql) before Stalwart can add data to it.  

However, for larger deployments—particularly those running in [distributed environments](/docs/cluster/overview)—it is advisable to assign each storage role to a backend that is specifically designed for that purpose. A more scalable and robust configuration might involve **FoundationDB** as the data store, an **S3-compatible service** for blob storage, **Redis** for handling volatile in-memory data, and a dedicated search engine such as **Elasticsearch** or **Meilisearch** for full-text indexing.

Selecting the right combination of databases will depend on the performance requirements, fault tolerance expectations, and operational constraints of the deployment. Stalwart’s flexible architecture ensures that it can scale from compact single-server setups to complex multi-node clusters with specialized infrastructure for each storage layer.

The following table summarizes the supported backends available for each store type:

|                    | Data store         | Blob store         | Full-text store    | In-memory store    |
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
| Redis / Valkey     |                    |                    |                    | :white_check_mark: |

:::tip Note

Be aware that changing the database backend at a later time will require migrating your data.

:::

