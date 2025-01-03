---
sidebar_position: 1
---

# Overview

Composite backends in Stalwart Mail Server provide a flexible way to combine multiple storage backends, allowing administrators to distribute load effectively or increase redundancy for critical data. By leveraging composite backends, Stalwart Mail Server can optimize performance and ensure resilience in environments with high availability and scalability requirements.

There are three types of composite backends supported by Stalwart Mail Server:

- [Sharded In-Memory Store](/docs/storage/backends/composite/sharded-in-memory) The sharded in-memory store distributes data across multiple in-memory backends, such as Redis or Memcached. When a key-value pair is stored or retrieved, the server hashes the key and uses a modulus operation to determine which of the defined in-memory backends to contact. This approach evenly distributes data and queries across the available in-memory stores, improving performance and reducing bottlenecks in high-load scenarios.

- [Sharded Blob Store](/docs/storage/backends/composite/sharded-blob) Similar to the sharded in-memory store, the sharded blob store is designed to distribute large binary objects (blobs) across multiple storage backends. The same hashing and modulus operation is used to determine the target backend for storing or retrieving blobs. This ensures efficient utilization of storage resources while maintaining consistent access to blob data.

- [SQL Read Replicas](/docs/storage/backends/composite/sql-replica) SQL read replicas allow administrators to define a primary data store for write operations and one or more read replicas to handle read operations. This configuration distributes the read workload among multiple replicas, reducing the load on the primary database and enhancing overall system performance. Read replicas provide redundancy for data retrieval, ensuring continued availability even if the primary database experiences high traffic or temporary issues.

Composite backends are a powerful feature for administrators seeking to scale their infrastructure efficiently. By enabling the distribution of load across multiple backends and ensuring redundancy, Stalwart Mail Server delivers high performance and resilience for even the most demanding environments.

:::tip Enterprise feature

Composite backends are available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart Mail Server and not included in the Community Edition.

:::
