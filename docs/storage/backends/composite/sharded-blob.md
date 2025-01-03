---
sidebar_position: 3
---

# Sharded Blob Store

Sharding is a method used to distribute data across multiple storage backends, enhancing scalability and performance by balancing the load among them. For Stalwart Mail Server's sharded blob store, sharding operates by hashing the key associated with a blob and using a modulus operation to determine which storage backend will store or retrieve the blob. This ensures that each backend manages a specific portion of the data, optimizing resource utilization and access speed.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart Mail Server and not included in the Community Edition.

:::

## Configuration

Configuring a sharded blob store in Stalwart Mail Server is simple and requires specifying a list of two or more blob store identifiers in the configuration. These identifiers correspond to the individual blob stores participating in the shard. 

The following configuration settings are available for Sharded Blob Stores, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `"shared-blob"` for sharded blob store.
- `stores`: A list of blob store identifiers that make up the shard. Each identifier corresponds to an blob store backend, such as Redis or Memcached.

**IMPORTANT**: It is vital to maintain consistency in the order and number of blob stores in the configuration. Changing the sequence or modifying the number of stores will disrupt the hash-to-store mapping, leading to misplaced or inaccessible blobs. For this reason, careful planning and stability in the shard configuration are essential to ensure data integrity and reliable access to stored blobs.

## Example

```toml
[store."shared-blob"]
type = "shared-blob"
stores = ["s3-1", "s3-2", "s3-3"]
```

