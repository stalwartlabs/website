---
sidebar_position: 5
---

# Roles

In a clustered deployment, certain background and maintenance tasks must be performed regularly to keep the system healthy, efficient, and secure. To distribute this operational workload across the cluster, **Stalwart** allows administrators to assign **roles** to specific nodes using the `cluster.roles` settings.

These roles determine which node—or group of nodes—is responsible for executing specific maintenance operations, such as purging old data, renewing TLS certificates, or calculating and exporting metrics. By distributing these responsibilities, Stalwart ensures that no single node becomes a bottleneck and that tasks are handled reliably, even in large-scale environments.

Each role is configured as a list of [node identifiers](/docs/cluster/configuration/node-id), corresponding to one or more Stalwart instances in the cluster. This provides flexibility to assign tasks redundantly (for high availability), to distribute them in parallel (for scalability), or to isolate them to specific nodes (for performance optimization).

## Sharding Roles

Stalwart supports **role sharding**, which allows administrators to divide the workload of a given role across multiple independent shards. Each shard represents a subset of nodes that cooperatively handle a portion of the role’s total workload.

In the configuration, each array item defines the nodes belonging to a single shard. For instance:

```toml
[cluster.roles.purge]
stores = ["1,4", "2,3", "5,6"]
```

In this example, three shards are defined:

* Shard 1 consists of nodes **1** and **4**
* Shard 2 consists of nodes **2** and **3**
* Shard 3 consists of nodes **5** and **6**

Each shard operates independently to handle its assigned share of the role’s tasks, improving scalability and fault tolerance.

To disable sharding and have all nodes perform the same role collectively, administrators can specify a single shard:

```toml
[cluster.roles.purge]
stores = ["1,2"]
```

This configuration assigns the role to nodes **1** and **2**, which will handle **all shards** of the task without division.

:::tip Note

In the special case of **`cluster.roles.push-notifications`**, sharding **must** be used. This ensures that notifications are processed uniquely by each shard to prevent users from receiving duplicate push notifications.

:::

## Available Roles

The following role settings determine the operational responsibilities of nodes within the cluster:

* **`cluster.roles.purge.stores`**
  Defines the nodes responsible for purging expired data from the database. This role ensures that outdated or unnecessary records are removed, maintaining database performance and integrity.

* **`cluster.roles.purge.accounts`**
  Specifies the nodes tasked with purging deleted accounts, emails, and old changelogs from the system, freeing resources and preventing data accumulation.

* **`cluster.roles.acme.renew`**
  Identifies the nodes responsible for renewing **ACME** TLS certificates. This role ensures that all certificates remain valid and up to date, maintaining secure communications.

* **`cluster.roles.metrics.calculate`**
  Determines which nodes perform the calculation and aggregation of metrics and statistics for the cluster, providing the basis for performance analysis and operational insights.

* **`cluster.roles.metrics.push`**
  Specifies the nodes responsible for exporting metrics to external monitoring or visualization systems, ensuring that real-time observability data is consistently available.

* **`cluster.roles.push-notifications`**
  Assigns nodes to handle the delivery of **push notifications** to users. This role must be **sharded** to prevent duplicate notifications; each shard processes a distinct subset of the user base.

* **`cluster.roles.fts-indexing`**
  Defines the nodes responsible for performing **full-text search (FTS)** indexing operations. This role maintains search index consistency as messages and objects are created or modified.

* **`cluster.roles.spam-training`**
  Assigns the node that performs **Spam classifier training** and analysis for spam detection models, continuously refining the system’s ability to identify unsolicited messages. Only one node should be assigned this role to avoid conflicting updates to the spam models.

* **`cluster.roles.imip-processing`**
  Determines the nodes that handle **iMIP** (iCalendar Message-Based Interoperability Protocol) processing, managing calendar invitations and event responses exchanged via email.

* **`cluster.roles.calendar-alerts`**
  Specifies nodes that generate and dispatch **calendar alerts** and reminders to users, ensuring timely notifications for upcoming events.

## Best Practices

Effective role assignment is essential to ensure that a **Stalwart** cluster remains performant, resilient, and predictable under varying workloads. While Stalwart’s role system offers considerable flexibility, careful planning and adherence to a few guiding principles can greatly enhance stability and maintainability.

Administrators should begin by evaluating the **resource profile** of each role. Certain tasks, such as **FTS indexing** or **Spam classifier training**, tend to be CPU- and I/O-intensive, while others, like **metrics calculation** or **ACME certificate renewal**, are relatively lightweight but time-sensitive. Assigning resource-heavy roles to nodes with sufficient computational capacity and isolating them from latency-sensitive workloads ensures optimal cluster performance.

For **high-availability scenarios**, it is recommended to assign critical roles—such as **purge** operations, **calendar alerts**, and **iMIP processing**—to multiple nodes. This redundancy ensures continuity if one node becomes unavailable. However, when redundancy is applied, administrators should consider **sharding** where supported to avoid redundant work or duplication of user-visible effects, as is the case with **push notifications**.

When configuring **sharded roles**, aim for an even distribution of nodes across shards. Each shard should have similar computational resources to maintain balance and prevent uneven load distribution. In smaller deployments where load balancing is less of a concern, a single shard configuration may be sufficient, simplifying management without compromising functionality.

Finally, role assignments should be **reviewed periodically** as the cluster evolves. Changes in user population, message volume, or data growth may shift the optimal distribution of responsibilities. Regular audits of node health, performance metrics, and quota utilization can help administrators identify when roles should be reassigned, split, or consolidated.

## Example

```toml
[cluster.roles.purge]
stores = ["1,4", "2,3", "5,6"]
accounts = ["1,4"]

[cluster.roles.acme]
renew = ["5"]

[cluster.roles.metrics]
calculate = ["3,4"]
push = ["4"]

[cluster.roles.push-notifications]
push-notifications = ["1,2", "3,4"]

[cluster.roles.fts-indexing]
fts-indexing = ["2,3"]

[cluster.roles.spam-training]
spam-training = ["1"]

[cluster.roles.imip-processing]
imip-processing = ["4"]

[cluster.roles.calendar-alerts]
calendar-alerts = ["5"]
```

In this configuration, several roles are sharded to distribute processing across multiple groups of nodes, while others are centralized for simplicity or consistency.

