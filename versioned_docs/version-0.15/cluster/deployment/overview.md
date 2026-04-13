---
sidebar_position: 1
---

# Overview

This section covers how to effectively deploy Stalwart in a clustered environment, focusing on [cluster size](/docs/cluster/deployment/sizing), [topology options](/docs/cluster/deployment/topology) and [storage backend recommendations](/docs/cluster/deployment/storage) for distributed setups.

Choosing the right deployment model is essential to ensure scalability, performance, and fault tolerance. Depending on the size, traffic volume, and goals of your organization, Stalwart can be deployed in a variety of topologies—from simple homogeneous clusters where each node handles all roles, to more advanced configurations where nodes are specialized for specific protocols or tasks.

In addition to topology planning, this section also provides guidance on selecting appropriate **storage backends** that support distributed access, data durability, and performance across multiple nodes. Since storage plays a central role in mail delivery, retrieval, and indexing, using the correct backend is crucial for achieving reliable and efficient operation in a cluster.

By understanding the available deployment options and pairing them with the right storage strategy, administrators can design a resilient, high-performance Stalwart cluster tailored to their environment.

