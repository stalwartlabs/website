---
sidebar_position: 1
---

# Database Internals

Stalwart uses a modular storage architecture based on *subspaces*. Subspaces are logical partitions of the database, each responsible for storing a specific category of data. This approach allows the system to efficiently organize, access, and maintain information across a wide variety of backend databases.

Each subspace in Stalwart is represented by a single ASCII alphabetic character. These subspaces are integral to the internal design of the system and define how different types of information are separated within the underlying database.

## Backend Mapping

The way subspaces are represented and stored depends on the type of [data store backend](/docs/storage/data) used:

-  When Stalwart is configured to use an SQL database such as PostgreSQL, MySQL, or SQLite, each subspace is mapped to a separate SQL table. This ensures that different categories of data are logically and physically isolated, improving performance and maintainability.
- For setups using FoundationDB, subspaces are represented by the first byte of the key. This allows for efficient key-space partitioning and lookup operations. 
- In RocksDB, subspaces are implemented as distinct column families, allowing different data types to be stored with optimized compaction and caching strategies.

## Subspace Structure

The following table provides a detailed description of each subspace used in Stalwart. Each entry includes the subspace letter and the type of data it is intended to store:

| Subspace | Description                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------- |
| `a`      | Access Control Lists (ACL): Stores permissions and access rules governing resource access.           |
| `b`      | Document Ids: Holds a list of assigned document ids for each collection.                             |
| `c`      | Tags: Contains tags such message flags.                                                              |
| `v`      | Text index: Maps tokens to document ids.                                                             |
| `d`      | Directory: Stores the internal directory using for authentication.                                   |
| `f`      | Task Queue: Keeps a list of scheduled or pending tasks awaiting background processing.               |
| `i`      | Indexes: Contains general-purpose indexes used throughout various modules in the system.             |
| `j`      | Blob Reserve: Reserved blobs that haven't been committed yet                                         |
| `k`      | Blob Links: Links blob ids to document ids.                                                          |
| `t`      | Blobs: Used to store binary large objects, such as attachments and file content.                     |
| `l`      | Logs: Contains the system't changelog used for incremental caching and the IMAP CONDSTORE extension. |
| `n`      | Counters: Persistent numerical counters used to track metrics or system state.                       |
| `m`      | In-Memory Values: Temporarily stores volatile key-value pairs kept in memory.                        |
| `y`      | In-Memory Counters: In-memory numeric counters with ephemeral lifespan.                              |
| `p`      | Properties: Used to store properties or metadata for different entities.                             |
| `s`      | Settings: Stores system configuration and operational settings.                                      |
| `e`      | Queue Messages: Holds individual messages that are part of mail or event queues.                     |
| `q`      | Queue Events: Captures events and changes occurring within queues.                                   |
| `u`      | Quota: Tracks usage limits and enforces resource quotas.                                             |
| `h`      | Outgoing Reports: Stores generated reports such as pending outgoing DMARC or TLS reports             |
| `r`      | Incoming Reports: Contains data received from external reports or analytics.                         |
| `g`      | Full-Text Search Index (FTS): Maintains indexes used for efficient text-based search capabilities.   |
| `o`      | Telemetry Span: Records spans used for distributed tracing and observability.                        |
| `w`      | Telemetry Index: Stores indexed entries for quick access to telemetry data.                          |
| `x`      | Telemetry Metrics: Captures raw metric data collected for system performance monitoring.             |

