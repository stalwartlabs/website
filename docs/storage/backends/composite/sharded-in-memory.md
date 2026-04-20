---
sidebar_position: 2
---

# Sharded In-Memory Store

Sharding distributes data across multiple backends to improve throughput and balance load. In the sharded in-memory store, each key is hashed and a modulus operation selects one of the configured backends to hold or serve the associated value. Each backend owns a deterministic subset of keys, which avoids hotspots and allows capacity to scale horizontally.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

The sharded in-memory backend is selected by choosing the `Sharded` variant on the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->). The variant exposes a single field:

- [`stores`](/docs/ref/object/in-memory-store#stores): list of two or more backend in-memory stores that make up the shard. Each entry selects one of the base in-memory variants (Redis or Redis Cluster).

**IMPORTANT**: the order and number of backends in [`stores`](/docs/ref/object/in-memory-store#stores) must remain stable once set. Reordering or adding or removing entries changes the hash-to-store mapping and leaves previously written data unreachable. Plan capacity carefully before configuring a shard.
