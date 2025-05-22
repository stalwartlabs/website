---
sidebar_position: 3
---

# Apache Kafka / Redpanda

Apache Kafka is a high-throughput, distributed event streaming platform designed for publishing, subscribing to, storing, and processing large volumes of real-time data. It is widely used in distributed systems to enable reliable communication between services, particularly in environments where durability, scalability, and fault tolerance are critical.

Redpanda is a Kafka-compatible streaming data platform that serves as a drop-in replacement for Kafka, offering similar semantics and APIs while improving performance and simplifying deployment. It is written in C++ and designed to eliminate Kafka’s reliance on JVM-based components like ZooKeeper, providing lower latency and operational overhead.

When used as a coordination backend in a Stalwart cluster, Kafka or Redpanda acts as the message bus for distributing internal updates between nodes. These updates can include mailbox changes for IMAP IDLE, push notification events, IP blocking alerts, TLS certificate distribution, and more. By publishing and subscribing to coordination topics, each Stalwart node remains synchronized with the rest of the cluster.

Using Kafka or Redpanda provides a durable, centralized coordination layer that excels in high-volume environments. It ensures that messages are reliably delivered—even in the event of node failure—and that new or recovering nodes can catch up on missed updates by replaying messages from the log. This makes Kafka and Redpanda ideal choices for very large-scale Stalwart deployments that demand robust coordination with strict delivery guarantees.

While Kafka introduces additional infrastructure requirements, its ability to handle millions of events per second, support long-term message retention, and integrate with a wide ecosystem of tools makes it well-suited for enterprises with complex or high-traffic mail infrastructures.

## Configuration

To use **Apache Kafka** (or a Kafka-compatible platform such as **Redpanda**) as the coordination backend in Stalwart, you need to configure the required Kafka connection parameters under the appropriate store section. These settings define how Stalwart connects to Kafka, handles messaging, and manages coordination events across the cluster.

The following configuration settings are available for Kafka, which are specified under the `store.<name>` section of the configuration file:

- `brokers`: This is a required field that specifies the list of Kafka broker addresses used to bootstrap the client connection. If no brokers are defined, Stalwart will fail to initialize the Kafka coordinator.
- `group-id`: This required setting defines the **Kafka consumer group** ID that each Stalwart node will join. It is used to coordinate consumption of coordination events among the nodes in the cluster.
- `timeout.session`: This defines the session timeout for the Kafka consumer. If the broker does not receive a heartbeat from a consumer within this time window, it will consider the consumer to have failed and rebalance the group (default: `5s`).
- `timeout.message`: This defines the maximum time to wait for a message to be successfully delivered to Kafka. If a message cannot be sent within this time, it will result in an error (default: `5s`).

Example:

```toml
[store."kafka-cluster"]
type = "kafka"
brokers = ["kafka1:9092", "kafka2:9092"]
group-id = "stalwart-cluster"

[store."kafka-cluster".timeout]
session = "5s"
message = "5s"

[cluster]
coordinator = "kafka-cluster"
```
