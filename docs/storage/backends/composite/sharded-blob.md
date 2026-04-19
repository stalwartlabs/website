---
sidebar_position: 3
---

# Sharded Blob Store

Sharding distributes data across multiple backends to improve scalability and balance load. In the sharded blob store, each blob's key is hashed and a modulus operation selects one of the configured backends to hold or retrieve it. Each backend therefore owns a deterministic portion of the blob namespace, and reads and writes for a given blob always resolve to the same backend.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

The sharded blob backend is selected by choosing the `Sharded` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><!-- /breadcrumb:BlobStore -->). The variant exposes a single field:

- [`stores`](/docs/ref/object/blob-store#stores): list of two or more backend blob stores that make up the shard. Each entry selects one of the base blob-store variants (S3, Azure, filesystem, FoundationDB, PostgreSQL, or MySQL).

**IMPORTANT**: the order and number of backends in [`stores`](/docs/ref/object/blob-store#stores) must remain stable once set. Reordering or adding or removing entries changes the hash-to-store mapping and leaves previously stored blobs unreachable. Plan capacity carefully before configuring a shard.
