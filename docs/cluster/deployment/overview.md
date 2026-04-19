---
sidebar_position: 1
---

# Overview

This section covers deploying Stalwart in a clustered environment, with guidance on [cluster size](/docs/cluster/deployment/sizing), [topology options](/docs/cluster/deployment/topology), and [storage backend recommendations](/docs/cluster/deployment/storage) for distributed setups.

The right deployment model matters for scalability, performance, and fault tolerance. Depending on the size, traffic volume, and goals of the organisation, Stalwart can be deployed in a variety of topologies, from simple homogeneous clusters where each node handles all roles, to more specialised configurations where nodes are dedicated to specific protocols or tasks.

In addition to topology planning, this section covers the selection of storage backends that support distributed access, data durability, and performance across multiple nodes. Since storage plays a central role in mail delivery, retrieval, and indexing, the chosen backend has a direct impact on the reliability and efficiency of a clustered deployment.

Pairing the available deployment options with an appropriate storage strategy allows administrators to design a resilient, high-performance Stalwart cluster tailored to the environment.
