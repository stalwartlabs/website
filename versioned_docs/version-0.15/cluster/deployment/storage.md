---
sidebar_position: 3
---

# Storage

In a clustered Stalwart deployment, choosing the right **storage backends** is critical to ensuring reliability, scalability, and performance. Since mail systems operate with a mix of structured metadata, large binary objects, and transient data, Stalwart separates storage responsibilities into **four core backend types**:

- [Data Store](/docs/storage/data): stores structured information such as user settings, folder hierarchies, message metadata, flags, access controls, and index references.
- [Blob Store](/docs/storage/blob): stores the actual contents of emails and other large objects, such as attachments or calendar data.
- [Search Store](/docs/storage/fts): provides indexing and search capabilities for email content, allowing users to quickly find messages based on keywords or phrases.
- [In-Memory Store](/docs/storage/in-memory): handles ephemeral, transient data used for real-time operations like rate limiting, session tracking, delivery state, and coordination.

Each of these backends serves a different purpose in the overall system architecture, and the choice of technology for each should reflect the scale and growth expectations of the organization.

When deploying Stalwart in a **distributed environment**, it’s essential to select backend solutions that can scale horizontally, support high availability, and perform well under concurrent access from multiple nodes. A well-architected storage layer ensures that Stalwart can grow along with your user base and service demands, while continuing to provide responsive and reliable mail operations.

The following subsections will provide recommendations and supported options for each backend type, along with guidance on how to choose the right solution for your deployment needs.

## Data Store

The [data store](/docs/storage/data) in Stalwart is responsible for managing structured data that defines and supports core functionality across the system. This includes **email metadata**, **mailbox structures**, **user settings**, **calendars**, and **contacts**. It does *not* store the actual content of emails or large files—those are handled separately by the [blob store](/docs/storage/blob).

Together with the blob store, the data store represents the **most critical component** of Stalwart’s storage architecture. It holds the organizational and user-level state of the entire system, and must therefore be reliable, consistent, and capable of scaling with demand.

### FoundationDB

The most highly recommended backend for distributed deployments is [FoundationDB](/docs/storage/backends/foundationdb). It is a distributed, transactional key-value store developed for high-performance environments that demand strict consistency and fault tolerance. FoundationDB supports **multi-node clustering**, **automatic sharding**, **multi-region deployments**, and can scale horizontally to support **thousands of nodes** with ease.

Its strong ACID guarantees, high throughput, and built-in fault tolerance make it exceptionally well-suited for clustered Stalwart environments, especially those anticipating significant growth or operating in mission-critical conditions. FoundationDB's design allows Stalwart to maintain consistency and durability even under heavy concurrent access across many nodes.

### PostgreSQL

For organizations that do not need the extreme scalability of FoundationDB or lack the operational expertise to manage it, [PostgreSQL](/docs/storage/backends/postgresql) is a strong and reliable alternative. PostgreSQL is a mature, feature-rich relational database with excellent performance, a large ecosystem, and strong data integrity features.

While PostgreSQL doesn’t scale as well horizontally as FoundationDB, it is still more than capable of handling **medium to large-scale deployments** when tuned correctly and paired with read replicas or partitioning strategies. It strikes a good balance between reliability, maintainability, and performance for many production environments.

### MySQL, MariaDB, or Galera Cluster

A third option for the data store is [MySQL](/docs/storage/backends/mysql), **MariaDB**, or a **Galera Cluster**. These systems are also widely used, well-documented, and stable. However, in the context of Stalwart, they tend to offer **lower performance and concurrency handling** compared to PostgreSQL and FoundationDB.

While MySQL-based systems can support distributed configurations using Galera or other clustering solutions, they typically involve more manual tuning and may not perform as efficiently under the high write loads typical in busy mail infrastructures.

## Blob Store

The [blob store](/docs/storage/blob) in Stalwart is responsible for storing **large binary objects** that are not well-suited to traditional structured databases. This includes the actual **email content**, **Sieve scripts** used for mail filtering, and **files uploaded via WebDAV**, such as documents or attachments.

Because of the volume and size of this data, the blob store must be highly durable, scalable, and capable of handling concurrent access from multiple nodes in a clustered environment. Alongside the data store, it is one of the **two most critical components** of Stalwart’s storage layer. If either is unavailable or unreliable, core functionality such as email delivery, retrieval, and filtering will be impacted.

Stalwart is designed to work seamlessly with **S3-compatible object stores**, which offer a robust and scalable solution for managing blobs in both self-hosted and cloud-native environments. These systems provide high availability, versioning, and replication capabilities that align well with the needs of a distributed mail platform.

### Self-Hosted Options

* [GarageHQ](https://garagehq.deuxfleurs.fr/documentation/quick-start/) : A distributed, lightweight S3-compatible object store built for self-hosting and resiliency. GarageHQ is designed to run on modest hardware and can replicate data across multiple nodes and sites, making it well-suited for decentralized or fault-tolerant deployments.
* [MinIO](https://min.io/): A high-performance, enterprise-grade object storage solution that is fully compatible with the S3 API. MinIO supports erasure coding, multi-tenant configurations, and horizontal scalability. It is widely adopted and well-documented, making it an excellent choice for administrators looking for a robust self-hosted option.

### Cloud-Hosted Options

For administrators who prefer to offload storage infrastructure to the cloud, Stalwart also supports integration with major cloud providers:

* **Amazon S3**: The original and most widely used S3 implementation, Amazon S3 offers virtually unlimited scalability, strong durability guarantees (11 nines), and integration with a vast range of services.
* **Azure Blob Storage**: Stalwart can also be configured to use Microsoft Azure's object storage platform via its S3-compatible interface or native APIs, providing flexibility for organizations already invested in the Azure ecosystem.

## In-Memory Store

The [in-memory store](/docs/storage/in-memory) in Stalwart is used for managing **ephemeral data**—temporary runtime information that does not need to be persisted long-term. This includes elements such as **rate limiting state**, **active sessions**, **temporary delivery status**, and **short-lived coordination data**. While this data is transient by nature, it plays a critical role in maintaining performance and real-time responsiveness within the cluster.

Although Stalwart can be configured to use the **primary data store** for ephemeral data, this approach is **not recommended** in high-traffic or clustered environments. Using the data store for this purpose adds unnecessary overhead and latency, placing additional load on systems that are better optimized for persistent, structured data.

For optimal performance and scalability, it is highly recommended to use a **dedicated in-memory store**, such as **Redis** or **Valkey**, both of which are well-suited for fast, low-latency access to transient state.

- **Redis**: A widely adopted, high-performance in-memory data store. Redis is easy to deploy, supports clustering and replication, and offers atomic operations ideal for rate limiting, counters, and session tracking.
- **Valkey**: A drop-in Redis alternative maintained by the open-source community. Valkey continues development where Redis’s open governance left off, maintaining full protocol compatibility and focusing on performance and scalability improvements.

Both Redis and Valkey are suitable for small to large deployments and integrate easily with Stalwart. By offloading ephemeral state to one of these systems, administrators can significantly improve the responsiveness and throughput of their clusters while reducing strain on the primary data store.

## Search Store

The [search store](/docs/storage/fts) is responsible for indexing the content of emails to support fast, accurate search capabilities across mailboxes. This includes indexing message bodies, subject lines, headers, and attachments where applicable. Efficient full-text search is essential for providing a responsive user experience, particularly in environments with large volumes of email data.

While Stalwart can be configured to use the **primary data store** for full-text indexing, this approach comes with trade-offs. Although there are **no direct performance penalties** in terms of search speed or responsiveness, using a general-purpose database for full-text indexing results in **increased write amplification**. Data stores like PostgreSQL or FoundationDB are optimized for structured records, not for the high-ingestion and text-tokenization workloads required by search engines.

To avoid unnecessary strain on the data store and improve indexing performance and scalability, it is **strongly recommended** to use a **dedicated full-text search engine** such as:

- **Elasticsearch**: A powerful, scalable, and mature search engine built on Apache Lucene. Elasticsearch is widely used in enterprise environments and offers robust query capabilities, full-text relevance scoring, and support for distributed indexing across large clusters.
- **Meilisearch**: A modern, lightweight full-text search engine designed for speed and simplicity. Meilisearch is particularly well-suited for smaller or mid-sized deployments, offering fast indexing, a user-friendly API, and minimal configuration overhead.

Both Elasticsearch and Meilisearch integrate easily with Stalwart and provide significant benefits over general-purpose databases when it comes to managing and querying large volumes of textual data.

