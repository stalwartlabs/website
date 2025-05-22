---
sidebar_position: 1
---

# Overview

Coordination is the process by which nodes in a distributed system exchange information, maintain consistency, and respond collectively to changes within the cluster. In the context of Stalwart, coordination ensures that each server instance remains aware of the state of the others, allowing the cluster to behave as a unified system even when composed of many independent nodes.

When running in a clustered environment, Stalwart nodes must be able to communicate with one another to share internal updates and detect failures in real time. This communication plays a vital role in ensuring that users experience a seamless and responsive service, regardless of which node they are connected to. For example, when a user is connected to an IMAP session via node A and a change occurs in their mailbox on node B, the change must be communicated back to node A so the user can be notified via an IDLE response. The IMAP IDLE command allows clients to maintain a persistent connection and receive immediate updates about changes to mailboxes without polling.

Push notifications function in a similar way. If a user is subscribed to receive notifications on one node, but their mailbox activity is processed on another, coordination ensures that the notification is correctly routed and delivered.

Coordination is also used for internal housekeeping tasks across the cluster. For instance, if one server blocks an IP address due to suspicious activity, it can propagate this update to all other nodes, ensuring consistent security enforcement. Likewise, when a new ACME TLS certificate is issued, the cluster must distribute this update so that all servers can reload and apply the new certificate without manual intervention.

These examples highlight the critical role coordination plays in maintaining consistency, security, and real-time responsiveness within a distributed Stalwart deployment.

## Coordination Mechanisms

Stalwart supports multiple coordination backends, allowing organizations to choose the solution that best fits their environment and scale. The following options are available:

- [Peer-to-Peer](/docs/cluster/coordination/peer-to-peer): This mode operates without a central coordinator. Instead, each node communicates directly with its peers using a decentralized protocol powered by Eclipse Zenoh. This approach simplifies deployment by removing external dependencies, while still enabling real-time coordination across nodes.
- [Apache Kafka / Redpanda](/docs/cluster/coordination/kafka): A high-throughput distributed event streaming platform, Kafka is ideal for handling large volumes of messages. In a Stalwart cluster, Kafka can act as the message bus for update propagation and event coordination.
- [NATS](/docs/cluster/coordination/nats): A lightweight and high-performance messaging system, NATS is well-suited for clusters that require real-time messaging without the complexity of heavier systems like Kafka. It provides publish-subscribe semantics with minimal latency and overhead.
- [Redis](/docs/cluster/coordination/redis.md): While Redis is typically used as an in-memory key-value store, it also supports pub/sub messaging. Stalwart can leverage Redis for cluster coordination, especially in environments where Redis is already used to store ephemeral state, thereby reducing the need to introduce an additional coordination service.

## Choosing a Coordination Mechanism

The best coordination mechanism depends on the size and nature of the deployment, as well as the organization’s operational preferences.

[Peer-to-peer coordination](/docs/cluster/coordination/peer-to-peer) is recommended for **small clusters** or environments where simplicity is a priority. It eliminates the need to provision or manage an external coordination service. However, it's important to note that this approach introduces a modest processing overhead to each Stalwart node, as the coordination duties are handled internally by the mail server process itself.

For **very large-scale deployments**—especially those processing **millions of messages per second**— [Apache Kafka or Redpanda](/docs/cluster/coordination/kafka) is the preferred choice. These platforms are designed for high-throughput, durable event streaming and provide strong guarantees around message delivery and partitioning across large clusters.

For **medium-sized deployments**, [NATS](/docs/cluster/coordination/nats) strikes a good balance between performance and operational complexity. It offers lower latency and simpler configuration compared to Kafka, while still scaling to handle high messaging volumes reliably.

[Redis](/docs/cluster/coordination/redis) is a viable coordination option for **small to medium-sized clusters**, especially in scenarios where Redis is already being used by Stalwart for [in-memory ephemeral data](/docs/storage/in-memory). While Redis does not scale as well as Kafka or NATS in high-throughput environments, its inclusion in an existing stack can reduce system complexity by avoiding the need for additional services.

Ultimately, the choice of coordination mechanism should be guided by the expected cluster size, message volume, operational overhead, and existing infrastructure within the organization.

