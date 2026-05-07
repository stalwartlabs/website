---
sidebar_position: 1
title: "Overview"
---

Running Stalwart in a clustered environment is flexible. The server was built from the start for distributed deployments, so horizontal scaling and high availability require little extra configuration.

Three elements must be configured to bring a Stalwart cluster online:

- A unique [node identifier](/docs/cluster/configuration/node-id) per cluster member, so each instance can be individually addressed for coordination and logging.
- A [coordination mechanism](/docs/cluster/coordination/), allowing nodes to communicate, share internal state, and remain synchronised. Stalwart supports peer-to-peer, Apache Kafka, NATS, and Redis.
- The [roles of each node](/docs/cluster/configuration/roles), defining which maintenance tasks and listeners each instance runs.

Each of these topics is covered in the following subsections, with examples and guidance, whether the deployment is a lightweight three-node setup or a large-scale distributed system.
