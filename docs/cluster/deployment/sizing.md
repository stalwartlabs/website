---
sidebar_position: 2
---

# Sizing

One of the most common questions when planning a Stalwart deployment is: **How many nodes do I need?** The answer depends on several key factors, including expected user load, availability requirements, and system performance targets. Fortunately, Stalwart’s flexible clustering architecture makes it easy to start small and scale horizontally as your needs grow.

## Load-Based Sizing

The starting point for cluster sizing should be your **expected number of concurrent users** and **daily email volume**. As a general rule, a single well-configured Stalwart node can handle between **10,000 and 50,000 active mailboxes**, depending on usage intensity, concurrent connections, and backend performance. In high-volume environments—such as large enterprises with heavy email activity—you should plan for approximately **one node per 5,000–10,000 active users**.

## High Availability Considerations

For deployments that require high availability, a **minimum of three nodes** is recommended. This allows the cluster to maintain quorum and continue functioning even if one node becomes unavailable. Clusters with **odd numbers of nodes (3, 5, 7)** are best suited for consensus algorithms and help prevent split-brain scenarios. Many organizations start with a **3-node cluster** and expand as demand increases.

## Performance Factors

The optimal number of nodes may also depend on protocol-specific demands and infrastructure limitations:

* **IMAP and POP3** traffic often introduces the most sustained connection load.
* **SMTP throughput** should be sized based on expected inbound/outbound messages per hour.
* **Storage I/O** performance is critical for mail delivery, indexing, and search operations.
* **Network bandwidth** between nodes must be sufficient to handle coordination traffic, replication, and distributed queues.

## Common Deployment Patterns

Here are some practical sizing recommendations based on organizational scale:

* **Small organizations (< 50,000 users):** Start with **2 to 3 nodes**. This provides redundancy while keeping the deployment footprint minimal.
* **Medium organizations (50,000–100,000 users):** Deploy **3 to 5 nodes**, depending on usage patterns and HA requirements.
* **Large organizations (100,000+ users):** Use **5 or more nodes**, often assigning **dedicated roles** (e.g., separate nodes for IMAP, SMTP, indexing, or metrics).

## A Practical Starting Approach

Stalwart makes it easy to start small and grow gradually. A proven strategy is to:

1. **Begin with a 3-node cluster** sized for your current workload.
2. **Monitor** CPU, memory, disk I/O, and network utilization during normal and peak usage.
3. **Scale out** when any critical resource consistently exceeds **70–80% utilization**.
4. **Plan for future growth**, ideally provisioning for **2–3× your initial load**.

Thanks to Stalwart’s dynamic cluster membership, nodes can be added without downtime, allowing your deployment to grow with your organization.

