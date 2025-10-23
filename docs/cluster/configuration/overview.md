---
sidebar_position: 1
---

# Overview

Configuring **Stalwart** to run in a clustered environment is designed to be straightforward and flexible. The system was built from the ground up to support distributed deployments, allowing administrators to scale horizontally and build highly available infrastructures with minimal overhead.

To get a Stalwart cluster up and running, only three key elements need to be configured:

- Assign a [unique ID to each node](/docs/cluster/configuration/node-id) in the cluster. This ensures that each instance can be individually identified for coordination and logging purposes.
- Configure a [coordination mechanism](/docs/cluster/coordination/overview), which allows nodes to communicate, share internal state, and remain synchronized. Stalwart supports multiple coordination backends including peer-to-peer, Apache Kafka, NATS, and Redis.
- Determine the [roles of each node](/docs/cluster/configuration/roles), defining which maintenance tasks each instance will be responsible for handling.

Each of these aspects will be explained in detail in the following subsections, with examples and guidance to help you tailor your cluster to your specific needs—whether you're deploying a lightweight three-node setup or a large-scale distributed system.
