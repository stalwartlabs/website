---
sidebar_position: 2
title: "Sizing"
---

A common question when planning a Stalwart deployment is how many nodes are required. The answer depends on expected user load, availability requirements, and performance targets. The clustering architecture is designed to start small and scale horizontally as demand grows.

## Load-based sizing

Sizing should start from the expected number of concurrent users and the daily email volume. As a general rule, a single well-configured Stalwart node can handle between 10,000 and 50,000 active mailboxes, depending on usage intensity, concurrent connections, and backend performance. In high-volume environments, such as large enterprises with heavy email activity, plan for approximately one node per 5,000 to 10,000 active users.

## High availability considerations

For deployments that require high availability, a minimum of three nodes is recommended. This allows the cluster to maintain quorum and continue operating if one node becomes unavailable. Clusters with odd numbers of nodes (3, 5, 7) suit consensus algorithms and help avoid split-brain scenarios. Many organisations start with a three-node cluster and expand as demand grows.

## Performance factors

The optimal number of nodes also depends on protocol-specific demands and infrastructure limits:

- IMAP and POP3 traffic often introduces the most sustained connection load.
- SMTP throughput should be sized based on expected inbound and outbound messages per hour.
- Storage I/O performance is critical for mail delivery, indexing, and search operations.
- Network bandwidth between nodes must be sufficient to handle coordination traffic, replication, and distributed queues.

## Common deployment patterns

Practical sizing guidance by organisational scale:

- Small organisations (fewer than 50,000 users): start with 2 to 3 nodes. Provides redundancy while keeping the deployment footprint minimal.
- Medium organisations (50,000 to 100,000 users): deploy 3 to 5 nodes, depending on usage patterns and HA requirements.
- Large organisations (100,000 or more users): use 5 or more nodes, often assigning dedicated roles (for example, separate nodes for IMAP, SMTP, indexing, or metrics).

## A practical starting approach

Stalwart is designed to start small and grow. A proven strategy is to:

1. Begin with a three-node cluster sized for the current workload.
2. Monitor CPU, memory, disk I/O, and network utilisation during normal and peak usage.
3. Scale out when any critical resource consistently exceeds 70 to 80 percent utilisation.
4. Plan for future growth, ideally provisioning for two to three times the initial load.

Thanks to dynamic cluster membership, nodes can be added without downtime, so the deployment can grow alongside the organisation.
