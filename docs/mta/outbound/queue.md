---
sidebar_position: 2
---

# Queues

Queues are the holding area for outbound messages. When a message arrives, it is placed in a queue until it can be delivered to its final destination. Stalwart supports an unlimited number of virtual queues, so administrators can create and configure multiple queues with different settings and behaviours. This allows separate queues for different classes of traffic, each processed with its own concurrency and retry characteristics.

Queues in Stalwart are distributed and fault-tolerant, meaning they can be spread across multiple cluster nodes and continue operating even if one or more nodes fail.

## Virtual queues

A virtual queue is a logical delivery queue used to isolate and manage groups of outbound messages. Each virtual queue must be explicitly defined because each allocates a fixed number of delivery threads per cluster node; creating queues at runtime could exhaust memory or threads during peak load.

Virtual queues control how messages are delivered based on attributes such as message type, source, or priority. An operator might configure one queue with high concurrency for bulk transactional mail and another for latency-sensitive user mail. Common uses include:

- Separating remote and local deliveries so that internal and external flows can be tuned independently.
- Isolating messages by priority, for example giving certain users or services preferential delivery scheduling.
- Preventing control traffic (DSNs, DMARC aggregate reports, TLS failure reports) from interfering with the delivery of regular user messages by placing them in low-priority or throttled queues.
- Applying custom retry policies for specific domains or types of content.

Each message recipient is assigned to a virtual queue through the [scheduling strategy](/docs/mta/outbound/schedule), which can dynamically select a queue using message metadata and delivery context. This allows context-aware queueing logic that adapts to system demand and operational policy.

## Configuration

A virtual queue is defined as an [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) object (found in the WebUI under <!-- breadcrumb:MtaVirtualQueue --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Virtual Queues<!-- /breadcrumb:MtaVirtualQueue -->). The relevant fields are:

- [`name`](/docs/ref/object/mta-virtual-queue#name): unique identifier for the queue. Maximum 8 characters, to keep the internal representation compact.
- [`threadsPerNode`](/docs/ref/object/mta-virtual-queue#threadspernode): maximum number of concurrent delivery threads allocated to this queue on each cluster node. Default 25.
- [`description`](/docs/ref/object/mta-virtual-queue#description): short description used to identify the queue in the UI.

Queue names must be unique and should follow a consistent naming convention. Once defined, virtual queues are selected by [scheduling strategies](/docs/mta/outbound/schedule), which route messages into the appropriate delivery path based on conditions such as sender, recipient, message size, or classification.

For example, a virtual queue named `fast` with 1000 delivery threads per cluster node:

```json
{
  "name": "fast",
  "threadsPerNode": 1000,
  "description": "High-throughput queue for transactional mail"
}
```

A virtual queue must exist before any scheduling strategy can reference it. Defining a queue allocates a dedicated delivery thread pool on every node in the cluster; [`threadsPerNode`](/docs/ref/object/mta-virtual-queue#threadspernode) determines the maximum number of concurrent delivery attempts from that queue per node.
