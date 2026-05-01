---
sidebar_position: 3
title: "Sharded Blob Store"
---

Sharding distributes data across multiple backends to improve scalability and balance load. In the sharded blob store, each blob's key is hashed and a modulus operation selects one of the configured backends to hold or retrieve it. Each backend therefore owns a deterministic portion of the blob namespace, and reads and writes for a given blob always resolve to the same backend.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

The sharded blob backend is selected by choosing the `Sharded` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->). The variant exposes a single field:

- [`stores`](/docs/ref/object/blob-store#stores): list of two or more backend blob stores that make up the shard. Each entry selects one of the base blob-store variants (S3, Azure, filesystem, FoundationDB, PostgreSQL, or MySQL).

**IMPORTANT**: the order and number of backends in [`stores`](/docs/ref/object/blob-store#stores) must remain stable once set. Reordering or adding or removing entries changes the hash-to-store mapping and leaves previously stored blobs unreachable. Plan capacity carefully before configuring a shard.
