---
sidebar_position: 1
title: "Overview"
---

Composite backends combine several underlying stores so that load can be distributed or redundancy increased for critical data. They improve throughput and resilience in environments with high availability or scalability requirements.

Stalwart supports three composite backends:

- [Sharded In-Memory Store](/docs/storage/backends/composite/sharded-in-memory): distributes key-value pairs across multiple in-memory backends (typically Redis or compatible). Keys are hashed and mapped to a specific backend via a modulus operation, which evenly distributes data and queries across the configured stores.
- [Sharded Blob Store](/docs/storage/backends/composite/sharded-blob): distributes large binary objects across multiple blob backends, using the same hash-and-modulus scheme. Each backend holds a portion of the overall blob namespace.
- [SQL Read Replicas](/docs/storage/backends/composite/sql-replica): directs write operations to a primary SQL database and distributes read operations across one or more replicas, reducing load on the primary and improving throughput for read-heavy workloads.

:::tip[Enterprise feature]

Composite backends are available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and are not included in the Community Edition.

:::
