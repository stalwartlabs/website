---
sidebar_position: 2
---

# Queues

Queues are essentially a holding area for outbound messages in an SMTP server. When a message arrives, it is placed in the queue until it can be delivered to its final destination. Stalwart supports an unlimited number of virtual queues, which means that a system administrator can create and configure multiple queues with different settings and behaviors. This allows for a high degree of flexibility and customization in managing incoming messages. For example, different queues can be created for different types of messages, such as messages from high-priority senders or messages with specific content, and these queues can be processed differently, such as by assigning more resources or prioritizing delivery.

Queues in Stalwart are distributed and fault-tolerant, meaning that they can be distributed across multiple servers and are designed to continue operating even if one or more servers fail.

## Virtual Queues

In Stalwart MTA, a **virtual queue** is a logical delivery queue used to isolate and manage groups of outbound messages according to defined criteria. While Stalwart supports an unlimited number of virtual queues, each queue must be **explicitly defined** in the configuration. This manual definition is required because each virtual queue allocates a fixed number of delivery threads per cluster node. Automatically creating queues at runtime could result in excessive thread allocation and memory exhaustion during periods of high message volume or delivery congestion.

Virtual queues provide a mechanism to control how messages are delivered based on attributes such as message type, source, or priority. This allows administrators to design delivery policies that optimize performance, reliability, and fairness across different workloads. For example, one queue can be configured with high concurrency for bulk transactional messages, while another can be reserved for latency-sensitive user messages.

Common use cases for virtual queues include:

- **Separating remote and local deliveries** to allow independent control over external and internal message flows.
- **Isolating messages by priority**, such as giving certain users or services preferential delivery scheduling.
- **Preventing control traffic** (e.g., Delivery Status Notifications, DMARC aggregate reports, or TLS failure reports) from interfering with the delivery of regular user messages by placing them in low-priority or throttled queues.
- **Implementing custom retry policies** for specific domains or types of content.

Each message recipient is assigned to a virtual queue based on the evaluation of the [scheduling strategy](/docs/mta/outbound/schedule), which can dynamically select a queue using message metadata and delivery context. This allows administrators to build powerful, context-aware queueing logic that adapts to system demands and operational policies.

Virtual queues are central to Stalwart’s approach to flexible and scalable message delivery, enabling high degrees of customization while maintaining predictable resource usage.

## Configuration

Virtual queues in Stalwart are defined by setting the number of delivery threads that should be allocated to each queue on a per-node basis. This is done using the `queue.virtual.<id>.threads-per-node` setting, where `<id>` is the name of the virtual queue.

Queue names can be any string up to a maximum of **8 bytes** in length. This limit ensures efficient internal representation and processing. Queue names must be unique and should follow a consistent naming convention for clarity and maintainability, especially in environments with many queues. Once defined, virtual queues can be selected dynamically through the [scheduling strategy](/docs/mta/outbound/schedule), allowing messages to be routed into the appropriate delivery path based on conditions such as sender, recipient, message size, or classification.

For example, to define a virtual queue named `fast` with 1000 delivery threads per cluster node:

```toml
[queue.virtual.fast]
threads-per-node = 1000
```

Each virtual queue must be explicitly defined in this way before it can be referenced in a scheduling strategy. Defining a queue allocates a delivery thread pool dedicated to that queue on every node in the cluster. The number of threads determines how many concurrent delivery attempts can be made from that queue per node.

