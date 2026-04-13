---
sidebar_position: 2
---

# Sharded In-Memory Store

Sharding is a technique used to distribute data across multiple storage backends, improving performance and scalability by evenly spreading the load. In the context of Stalwart's sharded in-memory store, sharding works by hashing the key of the data to be stored or retrieved and using a modulus operation to determine which in-memory store should handle the request. This ensures that each backend is responsible for a specific subset of the keys, enabling efficient use of resources and preventing bottlenecks.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

## Configuration

Configuring a sharded in-memory store in Stalwart is straightforward. It requires defining a list of two or more in-memory store identifiers in the configuration. These identifiers correspond to the individual in-memory stores that make up the shard.

The following configuration settings are available for Sharded In-Memory Stores, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `"sharded-in-memory"` for sharded in-memory store.
- `stores`: A list of in-memory store identifiers that make up the shard. Each identifier corresponds to an in-memory store backend, such as Redis or Memcached.

**IMPORTANT**: It is crucial to note that the order and number of in-memory stores in the configuration must remain consistent once set. Changing the order or adding/removing stores will alter the hash-to-store mapping, resulting in misplaced or inaccessible data. To maintain data integrity, careful planning and stability in the shard configuration are essential.

## Example

```toml
[store."sharded-in-memory"]
type = "sharded-in-memory"
stores = ["redis1", "redis2", "redis3"]
```
