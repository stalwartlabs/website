---
sidebar_position: 2
---

# Node ID

Each Stalwart instance in a cluster must be assigned a unique identifier to distinguish it from other nodes. This identifier is configured using the `cluster.node-id` setting and must be a **positive integer**. It plays a critical role in coordination, logging, and internal message routing, allowing each node to be uniquely addressed within the cluster.

The node ID must be **unique across the entire cluster**—no two nodes should share the same ID. Assigning duplicate IDs can lead to unpredictable behavior, coordination conflicts, and data inconsistencies.

For example:

```toml
[cluster]
node-id = 1
```

In this example, the current node is assigned the ID `1`. You would assign different values (e.g., `2`, `3`, `4`, etc.) to other nodes in the cluster, ensuring no overlap.

Care should be taken to maintain a consistent and documented mapping of node IDs, especially in larger clusters or automated deployment environments.
