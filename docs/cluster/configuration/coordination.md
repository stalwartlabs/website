---
sidebar_position: 3
---

# Coordination mechanism

Stalwart requires a coordination mechanism to enable communication between nodes in a cluster. Coordination allows nodes to exchange internal updates, detect failures, and remain synchronised during operation. For a full overview of how coordination works and the available options (peer-to-peer, Kafka, NATS, and Redis), refer to the [Coordination](/docs/cluster/coordination/overview) section of this documentation.

Coordination is configured on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><!-- /breadcrumb:Coordinator -->). The singleton is a multi-variant object: selecting a variant chooses the backend, and each variant carries its own fields. The supported variants are:

- `Disabled`: coordination is turned off. Suitable for single-node installations.
- `Default`: uses the configured [in-memory store](/docs/storage/in-memory) for coordination (Redis only).
- `Zenoh`: peer-to-peer coordination over Eclipse Zenoh.
- `Kafka`: Apache Kafka or a Kafka-compatible platform such as Redpanda.
- `Nats`: NATS messaging.
- `Redis`: a standalone Redis server.
- `RedisCluster`: a Redis Cluster deployment.

All nodes in the cluster must use the same coordination backend to function correctly. The backend-specific configuration fields are covered in the dedicated pages for [peer-to-peer](/docs/cluster/coordination/peer-to-peer), [Kafka](/docs/cluster/coordination/kafka), [NATS](/docs/cluster/coordination/nats), and [Redis](/docs/cluster/coordination/redis).
