---
sidebar_position: 5
---

# Redis

Redis is an in-memory data structure store commonly used for caching, session storage, and ephemeral key-value data. While it is best known for its performance as a high-speed cache, Redis also includes native support for **publish/subscribe (pub/sub)** messaging, which can be used for lightweight inter-process or inter-node communication.

In a Stalwart cluster, Redis can serve as a coordination backend by leveraging its pub/sub capabilities to propagate internal updates between nodes. This includes events such as mailbox changes, IMAP IDLE and push notification triggers, blocked IP alerts, and ACME certificate availability. Each node subscribes to relevant Redis channels and publishes updates as necessary, ensuring the cluster remains synchronized in real time.

Redis is especially useful in small to medium-sized deployments where Kafka or NATS might be considered too heavy, or where Redis is already in use for storing transient or ephemeral data within Stalwart. Using Redis for both coordination and ephemeral storage can help reduce system complexity by consolidating services and avoiding the need to introduce additional infrastructure.

However, it's important to note that Redis’s pub/sub model is designed for transient messaging and does not include message persistence or delivery guarantees if a subscriber is offline. For most real-time coordination tasks in modestly sized mail infrastructures, this is acceptable—but it may not be suitable for high-throughput or high-reliability scenarios where message loss is unacceptable.

Still, for organizations seeking a simple, unified solution that performs well under moderate load and integrates cleanly with existing components, Redis provides a practical and efficient coordination mechanism for Stalwart clusters.

## Configuration

Since Redis can also be used by Stalwart as an in-memory store for ephemeral data, its configuration is shared between these two roles. As a result, the Redis coordination setup does not require a separate configuration block beyond what is already used for the in-memory store.

For detailed configuration instructions—including connection parameters, authentication, TLS support, and tuning options—please refer to the [Redis In-Memory Store](/docs/storage/backends/redis) section of this documentation.

