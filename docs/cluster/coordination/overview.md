---
sidebar_position: 1
---

# Overview

Coordination is the process by which nodes in a distributed system exchange information, maintain consistency, and respond collectively to changes within the cluster. In Stalwart, coordination keeps every server instance aware of the state of the others, so the cluster behaves as a unified system even when composed of many independent nodes.

When running in a clustered environment, Stalwart nodes must communicate to share internal updates and detect failures in real time. This communication keeps service responsive regardless of which node a user is connected to. For example, when a user is connected to an IMAP session via node A and a change occurs in their mailbox on node B, the change must reach node A so the user can be notified via an IDLE response. The IMAP IDLE command allows clients to maintain a persistent connection and receive immediate updates about mailbox changes without polling.

Push notifications work in a similar way. If a user is subscribed to notifications on one node, but their mailbox activity is processed on another, coordination routes and delivers the notification correctly.

Coordination is also used for internal housekeeping across the cluster. When one server blocks an IP address because of suspicious activity, the update propagates to the rest of the cluster so security enforcement stays consistent. When a new ACME TLS certificate is issued, the cluster distributes it so every server reloads and applies the new certificate automatically.

These examples show why coordination matters for consistency, security, and real-time responsiveness in a distributed Stalwart deployment.

## Coordination mechanisms

Stalwart supports multiple coordination backends, so administrators can choose one that fits the environment and scale. The options are:

- [Peer-to-peer](/docs/cluster/coordination/peer-to-peer): no central coordinator; each node communicates directly with its peers using a decentralised protocol powered by Eclipse Zenoh. This removes external dependencies while still providing real-time coordination across nodes.
- [Apache Kafka / Redpanda](/docs/cluster/coordination/kafka): a distributed event streaming platform suited to large volumes of messages. In a Stalwart cluster, Kafka acts as the message bus for update propagation and event coordination.
- [NATS](/docs/cluster/coordination/nats): a lightweight and high-performance messaging system, well-suited to clusters that need real-time messaging without the complexity of Kafka. It provides publish/subscribe semantics with low latency and low overhead.
- [Redis](/docs/cluster/coordination/redis): commonly used as an in-memory key-value store, Redis also supports pub/sub messaging. Stalwart can use Redis for cluster coordination, especially in environments where Redis is already used to hold ephemeral state, avoiding an additional coordination service.

Each backend corresponds to a variant on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><!-- /breadcrumb:Coordinator -->). Configuration details for each variant are covered in the dedicated subsections.

## Choosing a coordination mechanism

The choice of coordination mechanism depends on the size and nature of the deployment and on operational preferences.

[Peer-to-peer coordination](/docs/cluster/coordination/peer-to-peer) suits small clusters or environments where simplicity is a priority. It removes the need to provision or manage an external coordination service. Because the coordination duties are handled inside the mail server process, this approach adds a modest amount of processing to each node.

For very large deployments, especially those processing millions of messages per second, [Apache Kafka or Redpanda](/docs/cluster/coordination/kafka) is preferred. These platforms are built for high-throughput, durable event streaming and offer strong delivery and partitioning guarantees across large clusters.

For medium-sized deployments, [NATS](/docs/cluster/coordination/nats) balances performance with operational simplicity. It has lower latency and simpler configuration than Kafka while still scaling to handle high messaging volumes.

[Redis](/docs/cluster/coordination/redis) is a viable coordination option for small to medium clusters, especially where Redis is already used by Stalwart for [in-memory ephemeral data](/docs/storage/in-memory). Redis does not scale as well as Kafka or NATS in high-throughput environments, but reusing an existing component can reduce complexity.

The choice of coordination mechanism should be guided by expected cluster size, message volume, operational overhead, and existing infrastructure.

## Topic name

Stalwart uses the `stwt.agora` topic name for all coordination messages. The same topic name applies to every coordination backend, including peer-to-peer, Kafka, NATS, and Redis. This topic name is not configurable, so it should not be reused by other services to prevent conflicts with Stalwart internal coordination messages.
