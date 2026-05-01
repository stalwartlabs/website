---
sidebar_position: 3
title: "Apache Kafka / Redpanda"
---

Apache Kafka is a distributed event streaming platform for publishing, subscribing to, storing, and processing large volumes of real-time data. It is widely used in distributed systems to provide reliable communication between services, particularly where durability, scalability, and fault tolerance are critical.

Redpanda is a Kafka-compatible streaming data platform that acts as a drop-in replacement for Kafka, offering similar semantics and APIs with lower latency and simpler operations. It is written in C++ and removes Kafka's JVM-based dependencies such as ZooKeeper.

When used as a coordination backend in a Stalwart cluster, Kafka or Redpanda acts as the message bus for distributing internal updates between nodes. These updates include mailbox changes for IMAP IDLE, push notification events, IP blocking alerts, TLS certificate distribution, and more. By publishing and subscribing to coordination topics, each Stalwart node stays synchronised with the rest of the cluster.

Using Kafka or Redpanda provides a durable, centralised coordination layer. Messages are reliably delivered even when a node fails, and recovering nodes can catch up on missed updates by replaying messages from the log. Kafka and Redpanda are a good fit for very large Stalwart deployments that require strict delivery guarantees.

Kafka adds infrastructure requirements, but its ability to handle millions of events per second, support long-term message retention, and integrate with a wide ecosystem of tools makes it well-suited to enterprises with complex or high-traffic mail infrastructures.

:::tip Note

Apache Kafka is not included in the default Stalwart binary. To enable it, [build](/docs/development/compile) Stalwart with the `kafka` feature flag.

:::

## Configuration

Kafka coordination is configured by selecting the `Kafka` variant on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The variant carries the following fields:

- [`brokers`](/docs/ref/object/coordinator#brokers): list of Kafka broker addresses used to bootstrap the client connection. At least one broker is required; without it the Kafka coordinator fails to initialise.
- [`groupId`](/docs/ref/object/coordinator#groupid): Kafka consumer group identifier that each Stalwart node joins. It coordinates consumption of coordination events among cluster members.
- [`timeoutSession`](/docs/ref/object/coordinator#timeoutsession): session timeout for the Kafka consumer. If the broker receives no heartbeat from a consumer within this window, it treats the consumer as failed and rebalances the group. Default `"5s"`.
- [`timeoutMessage`](/docs/ref/object/coordinator#timeoutmessage): maximum time to wait for a message to be delivered to Kafka. Exceeding this returns an error. Default `"5s"`.

For example:

```json
{
  "@type": "Kafka",
  "brokers": ["kafka1:9092", "kafka2:9092"],
  "groupId": "stalwart-cluster",
  "timeoutSession": "5s",
  "timeoutMessage": "5s"
}
```
