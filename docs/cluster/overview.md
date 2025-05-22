---
sidebar_position: 1
---

# Overview

Clustering and High Availability (HA) are fundamental components of any robust, scalable infrastructure. Clustering refers to the practice of connecting multiple servers to work together as a single system, enabling load distribution, redundancy, and scalability. High Availability ensures that the system continues to operate even when individual components fail, minimizing downtime and maintaining service continuity.

Stalwart is built from the ground up to support clustering and high availability natively. Whether you're running a lightweight mail setup on a single node or deploying across thousands of nodes in a high-demand environment, Stalwart is designed to scale seamlessly. It provides automatic fault recovery, tolerates hardware and software failures, and maintains operations with minimal impact and no manual intervention.

Unlike many traditional mail servers, Stalwart does not rely on external directors or proxy servers to route traffic or manage roles. Any node within a Stalwart cluster is capable of handling IMAP, SMTP, JMAP, or WebDAV requests independently. This design simplifies deployment, reduces single points of failure, and improves horizontal scalability.

In addition to its stateless protocol handling capabilities, Stalwart also supports distributed SMTP queues. This allows multiple instances to access and process the queue concurrently, increasing delivery throughput and ensuring resilience in case any individual node becomes unavailable.

## Coordination

Cluster [coordination](/docs/cluster/coordination/overview) in Stalwart refers to how nodes within the system share updates, replicate state, and stay informed about the state of the overall cluster. Coordination is essential for synchronizing data, ensuring consistency, and reacting to dynamic changes such as node joins, failures, or configuration changes.

Stalwart supports two coordination modes. By default, it operates in a lightweight peer-to-peer mode that requires no central coordinator or dedicated server. This mode is ideal for smaller or simpler environments where minimal infrastructure overhead is preferred. For more advanced deployments or when integration with existing infrastructure is needed, Stalwart can also utilize third-party systems for coordination, including Apache Kafka, NATS, or Redis. These systems can provide enhanced durability, message persistence, and higher throughput, making them well-suited for large-scale, mission-critical deployments.

## Orchestration

[Orchestration](/docs/cluster/orchestration/overview) refers to the automated management of containerized applications, including deployment, scaling, health monitoring, and recovery. In the context of a Stalwart cluster, orchestration tools manage the lifecycle of each node and ensure the infrastructure remains healthy and responsive under varying loads.

Stalwart is fully compatible with modern orchestration platforms such as Kubernetes, Apache Mesos, and Docker Swarm. These platforms can be used to automatically deploy and scale Stalwart nodes, monitor their health, and restart or replace them in the event of failure. When combined with Stalwart’s built-in clustering and coordination capabilities, orchestration ensures that nodes are always available and functioning as expected, even in highly dynamic or volatile environments.
