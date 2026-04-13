---
sidebar_position: 3
---

# Coordination Mechanism

Stalwart requires a coordination mechanism to enable communication between nodes in a cluster. Coordination allows nodes to exchange internal updates, detect failures, and remain synchronized during operation. For a full overview of how coordination works and the available options (such as peer-to-peer, Kafka, NATS, and Redis), refer to the [Coordination](/docs/cluster/coordination/overview) section of this documentation.

To configure coordination in a Stalwart cluster, each node must be assigned a coordinator using the `cluster.coordinator` setting. This value refers to the identifier of a configured coordination backend (defined in the `[store."..."]` section of the configuration). All nodes in the cluster must use the **same coordination mechanism** to function correctly.

Example:

```toml
[cluster]
coordinator = "peer-to-peer"
```
