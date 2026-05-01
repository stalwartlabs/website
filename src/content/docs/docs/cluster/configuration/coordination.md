---
sidebar_position: 3
title: "Coordination mechanism"
---

Stalwart requires a coordination mechanism to enable communication between nodes in a cluster. Coordination allows nodes to exchange internal updates, detect failures, and remain synchronised during operation. For a full overview of how coordination works and the available options (peer-to-peer, Kafka, NATS, and Redis), refer to the [Coordination](/docs/cluster/coordination/) section of this documentation.

Coordination is configured on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The singleton is a multi-variant object: selecting a variant chooses the backend, and each variant carries its own fields. The supported variants are:

- `Disabled`: coordination is turned off. Suitable for single-node installations.
- `Default`: uses the configured [in-memory store](/docs/storage/in-memory) for coordination (Redis only).
- `Zenoh`: peer-to-peer coordination over Eclipse Zenoh.
- `Kafka`: Apache Kafka or a Kafka-compatible platform such as Redpanda.
- `Nats`: NATS messaging.
- `Redis`: a standalone Redis server.
- `RedisCluster`: a Redis Cluster deployment.

All nodes in the cluster must use the same coordination backend to function correctly. The backend-specific configuration fields are covered in the dedicated pages for [peer-to-peer](/docs/cluster/coordination/peer-to-peer), [Kafka](/docs/cluster/coordination/kafka), [NATS](/docs/cluster/coordination/nats), and [Redis](/docs/cluster/coordination/redis).
