---
sidebar_position: 3
title: "Storage"
---

In a clustered Stalwart deployment, the choice of storage backends affects reliability, scalability, and performance. Mail systems combine structured metadata, large binary objects, and transient data, so Stalwart separates storage into four backend singletons:

- [Data store](/docs/storage/data): stores structured information such as user settings, folder hierarchies, message metadata, flags, access controls, and index references.
- [Blob store](/docs/storage/blob): stores the actual contents of emails and other large objects, such as attachments or calendar data.
- [Search store](/docs/storage/fts): provides indexing and search capabilities for email content, so users can find messages by keyword or phrase.
- [In-memory store](/docs/storage/in-memory): handles ephemeral data used for real-time operations like rate limiting, session tracking, delivery state, and coordination.

Each backend serves a different purpose in the overall architecture, and the technology behind each should reflect the scale and growth expectations of the organisation.

In a distributed environment, it is important to select backend solutions that scale horizontally, support high availability, and perform well under concurrent access from multiple nodes. A well-architected storage layer allows Stalwart to grow with the user base and service demands while continuing to provide reliable mail operations.

The following subsections cover recommendations and supported options for each backend type, along with guidance on how to choose the right solution for the deployment.

## Data store

The [data store](/docs/storage/data) manages structured data that defines and supports core functionality across the system, including email metadata, mailbox structures, user settings, calendars, and contacts. It does not hold the contents of emails or large files; those are handled by the [blob store](/docs/storage/blob).

Together with the blob store, the data store is one of the most critical components of the storage architecture. It holds the organisational and user-level state of the entire system and must therefore be reliable, consistent, and able to scale with demand.

### FoundationDB

The recommended backend for distributed deployments is [FoundationDB](/docs/storage/backends/foundationdb), a distributed, transactional key-value store built for high-performance environments that require strict consistency and fault tolerance. FoundationDB supports multi-node clustering, automatic sharding, multi-region deployments, and horizontal scaling to thousands of nodes.

Its ACID guarantees, high throughput, and built-in fault tolerance fit clustered Stalwart environments, especially those expecting significant growth or operating under mission-critical conditions. FoundationDB keeps data consistent and durable under heavy concurrent access across many nodes.

### PostgreSQL

For organisations that do not need the extreme scalability of FoundationDB, or that lack the operational expertise to run it, [PostgreSQL](/docs/storage/backends/postgresql) is a reliable alternative. PostgreSQL is a mature relational database with good performance, a large ecosystem, and strong data integrity features.

PostgreSQL does not scale horizontally as easily as FoundationDB, but it handles medium to large deployments when tuned correctly and paired with read replicas or partitioning strategies. It balances reliability, maintainability, and performance for many production environments.

### MySQL, MariaDB, or Galera Cluster

A third option for the data store is [MySQL](/docs/storage/backends/mysql), MariaDB, or a Galera Cluster. These systems are widely used, well documented, and stable. In the context of Stalwart, they tend to offer lower performance and concurrency than PostgreSQL and FoundationDB.

MySQL-based systems can be deployed in distributed configurations through Galera or other clustering solutions, but typically require more manual tuning and may not perform as well under the high write loads typical in busy mail infrastructures.

## Blob store

The [blob store](/docs/storage/blob) holds large binary objects that do not belong in a structured database, including the actual email content, Sieve scripts used for mail filtering, and files uploaded via WebDAV (documents and attachments).

Because of the volume and size of this data, the blob store must be durable, scalable, and able to handle concurrent access from multiple nodes. Alongside the data store, it is one of the two most critical components of the storage layer. If either becomes unavailable or unreliable, core functionality such as email delivery, retrieval, and filtering is affected.

Stalwart integrates with S3-compatible object stores, which scale for both self-hosted and cloud-native environments. These systems provide high availability, versioning, and replication, aligning with the needs of a distributed mail platform.

### Self-hosted options

- [GarageHQ](https://garagehq.deuxfleurs.fr/documentation/quick-start/): a distributed, lightweight S3-compatible object store built for self-hosting and resiliency. GarageHQ runs on modest hardware and can replicate data across multiple nodes and sites, making it a fit for decentralised or fault-tolerant deployments.
- [MinIO](https://min.io/): an object storage solution compatible with the S3 API. MinIO supports erasure coding, multi-tenant configurations, and horizontal scalability. It is widely adopted and well documented.

### Cloud-hosted options

For deployments that offload storage infrastructure to the cloud, Stalwart supports major providers:

- Amazon S3: the original S3 implementation, offering virtually unlimited scalability, strong durability guarantees (11 nines), and integration with a wide range of services.
- Azure Blob Storage: Stalwart can use Microsoft Azure object storage via its S3-compatible interface or native APIs, providing flexibility for organisations invested in the Azure ecosystem.

## In-memory store

The [in-memory store](/docs/storage/in-memory) manages ephemeral data: temporary runtime information that does not need long-term persistence. This includes rate-limiting state, active sessions, temporary delivery status, and short-lived coordination data. Although transient, this data is important for performance and real-time responsiveness across the cluster.

Stalwart can be configured to use the primary data store for ephemeral data, but that is not recommended in high-traffic or clustered environments. Using the data store for ephemeral values adds overhead and latency, placing extra load on a system that is optimised for persistent, structured data.

For performance and scalability, a dedicated in-memory store such as Redis or Valkey is recommended; both are well suited to fast, low-latency access to transient state.

- Redis: a widely adopted in-memory data store. Redis is straightforward to deploy, supports clustering and replication, and offers atomic operations suited to rate limiting, counters, and session tracking.
- Valkey: a Redis-compatible alternative maintained by the open-source community. Valkey continues development with the same wire protocol and focuses on performance and scalability improvements.

Both Redis and Valkey are suitable for small to large deployments. Offloading ephemeral state to one of these systems improves cluster responsiveness and throughput while reducing load on the primary data store.

## Search store

The [search store](/docs/storage/fts) indexes the content of emails to support fast, accurate search across mailboxes. This includes indexing message bodies, subject lines, headers, and attachments where applicable. Full-text search is important for a responsive user experience, particularly in environments with large volumes of mail.

Stalwart can be configured to use the primary data store for full-text indexing, with trade-offs. There is no direct penalty in search speed or responsiveness, but using a general-purpose database for full-text indexing results in increased write amplification. Data stores such as PostgreSQL or FoundationDB are optimised for structured records, not for the high-ingestion, text-tokenisation workloads that search engines are built for.

To avoid unnecessary load on the data store and improve indexing performance, a dedicated full-text search engine is recommended:

- Elasticsearch: a scalable, mature search engine built on Apache Lucene. Elasticsearch is widely used in enterprise environments and offers rich query capabilities, full-text relevance scoring, and support for distributed indexing across large clusters.
- Meilisearch: a modern, lightweight full-text search engine designed for speed and simplicity. Meilisearch suits smaller or mid-sized deployments, with fast indexing, a friendly API, and minimal configuration overhead.

Both Elasticsearch and Meilisearch integrate with Stalwart and provide benefits over general-purpose databases when managing and querying large volumes of textual data.
