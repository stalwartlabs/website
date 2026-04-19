---
sidebar_position: 4
---

# SQL Read Replicas

SQL read replicas are a well-known database architecture pattern for separating read and write traffic. A primary database handles all write operations, ensuring consistent updates; one or more read replicas, synchronised from the primary, handle read traffic. This separation reduces load on the primary and allows the read path to scale horizontally.

Stalwart supports this pattern for any SQL backend that itself supports read replicas (PostgreSQL, MySQL, MariaDB, Galera, AlloyDB, and similar). Using read replicas improves throughput in read-heavy environments while preserving write consistency.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

Read replicas are configured on the primary SQL variant itself. On the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><!-- /breadcrumb:DataStore -->), when the `PostgreSql` or `MySql` variant is selected, the [`readReplicas`](/docs/ref/object/data-store#readreplicas) field accepts a list of replica connection settings. Each replica entry defines a full set of connection parameters: [`host`](/docs/ref/object/data-store#host), [`port`](/docs/ref/object/data-store#port), [`database`](/docs/ref/object/data-store#database), [`authUsername`](/docs/ref/object/data-store#authusername), and [`authSecret`](/docs/ref/object/data-store#authsecret).

Write operations always target the primary connection, while read operations are distributed across the replicas. The same pattern is available on the [BlobStore](/docs/ref/object/blob-store) and [SearchStore](/docs/ref/object/search-store) objects when their PostgreSQL or MySQL variants are selected.

<!-- review: The previous configuration exposed a dedicated `sql-read-replica` composite store with `primary` and `replicas` fields. The current schema instead appears to attach `readReplicas` directly to the primary SQL variant. Confirm that no standalone SQL-read-replica variant exists at the top level of DataStore/BlobStore/SearchStore. -->
