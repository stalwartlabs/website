---
sidebar_position: 3
---

# Configuration

Configuring **Stalwart** to run in a clustered environment is designed to be straightforward and flexible. The system was built from the ground up to support distributed deployments, allowing administrators to scale horizontally and build highly available infrastructures with minimal overhead.

To get a Stalwart cluster up and running, only three key elements need to be configured:

- Assign a [unique ID to each node](#cluster-node-id) in the cluster. This ensures that each instance can be individually identified for coordination and logging purposes.
- Configure a [coordination mechanism](/docs/cluster/coordination/overview), which allows nodes to communicate, share internal state, and remain synchronized. Stalwart supports multiple coordination backends including peer-to-peer, Apache Kafka, NATS, and Redis.
- Determine the [roles of each node](#node-roles), defining which maintenance tasks each instance will be responsible for handling.

Each of these aspects will be explained in detail in the following subsections, with examples and guidance to help you tailor your cluster to your specific needs—whether you're deploying a lightweight three-node setup or a large-scale distributed system.

## Cluster Node ID

Each Stalwart instance in a cluster must be assigned a unique identifier to distinguish it from other nodes. This identifier is configured using the `cluster.node-id` setting and must be a **positive integer**. It plays a critical role in coordination, logging, and internal message routing, allowing each node to be uniquely addressed within the cluster.

The node ID must be **unique across the entire cluster**—no two nodes should share the same ID. Assigning duplicate IDs can lead to unpredictable behavior, coordination conflicts, and data inconsistencies.

For example:

```toml
[cluster]
node-id = 1
```

In this example, the current node is assigned the ID `1`. You would assign different values (e.g., `2`, `3`, `4`, etc.) to other nodes in the cluster, ensuring no overlap.

Care should be taken to maintain a consistent and documented mapping of node IDs, especially in larger clusters or automated deployment environments.

## Coordination Mechanism

Stalwart requires a coordination mechanism to enable communication between nodes in a cluster. Coordination allows nodes to exchange internal updates, detect failures, and remain synchronized during operation. For a full overview of how coordination works and the available options (such as peer-to-peer, Kafka, NATS, and Redis), refer to the [Coordination](/docs/cluster/coordination/overview) section of this documentation.

To configure coordination in a Stalwart cluster, each node must be assigned a coordinator using the `cluster.coordinator` setting. This value refers to the identifier of a configured coordination backend (defined in the `[store."..."]` section of the configuration). All nodes in the cluster must use the **same coordination mechanism** to function correctly.

Example:

```toml
[cluster]
coordinator = "peer-to-peer"
```

## Hostname and Load Balancing

By default, Stalwart automatically assigns the server hostname based on the underlying system's hostname during installation. This hostname is used in protocol responses, logging, and internal identification. However, when Stalwart is deployed behind a **load balancer**, it's important that all backend nodes use a **consistent hostname** that matches the public-facing identity of the service. This ensures uniformity in client communications and protocol-level interactions, particularly for protocols like SMTP, which expose the server’s hostname during the handshake.

For example, if you have three Stalwart nodes—`mx1.example.org`, `mx2.example.org`, and `mx3.example.org`—behind a load balancer that publicly serves mail as `mx.example.org`, then each node should override its hostname using the `server.hostname` setting:

```toml
[server]
hostname = "mx.example.org"
```

This ensures that all nodes respond with the same hostname (`mx.example.org`), maintaining consistency for clients and avoiding potential confusion or misidentification.

Failing to configure this correctly may result in inconsistencies in SMTP banners, TLS certificates, and protocol-level responses, especially when multiple backend nodes serve the same clients in a round-robin or failover configuration.


## Node Roles

In a clustered deployment, certain background and maintenance tasks must be performed regularly to keep the system healthy, efficient, and secure. To distribute this operational workload across the cluster, Stalwart allows administrators to assign **roles** to specific nodes using the `cluster.roles` settings.

These roles determine which node—or group of nodes—is responsible for executing specific maintenance operations, such as purging old data, renewing TLS certificates, or calculating and exporting metrics. By distributing these responsibilities, Stalwart ensures that no single node becomes a bottleneck, and that tasks are handled reliably even in large-scale environments.

Each role is configured as a list of **node IDs**, corresponding to one or more Stalwart instances in the cluster. This provides flexibility to assign tasks redundantly (for high availability) or isolate them to specific machines (for resource optimization). The following settings determine the roles that a node can perform within the cluster:

- `cluster.roles.purge.stores`: A list of one or more node ids responsible for purging expired data from the database. This role ensures that the database remains clean and optimized by removing outdated or unnecessary data.
- `cluster.roles.purge.accounts`: A list of one or more node ids responsible for purging accounts from the system. This role ensures that deleted emails and old changelogs are removed from the system to free up resources.
- `cluster.roles.acme.renew`: A list of one or more node ids responsible for renewing ACME certificates. This role ensures that TLS certificates are kept up-to-date and valid.
- `cluster.roles.metrics.calculate`: A list of one or more node ids responsible for calculating metrics and statistics for the cluster. This role involves processing and aggregating data to generate meaningful insights about the cluster's performance.
- `cluster.roles.metrics.push`: A list of one or more node ids responsible for pushing metrics and statistics to external monitoring systems. This role involves sending data to monitoring tools for analysis and visualization.

Example:

```toml
[cluster.roles.purge]
stores = [1, 2]
accounts = [1, 2]

[cluster.roles.acme]
renew = [5]

[cluster.roles.metrics]
calculate = [3, 4]
push = [4]
```
