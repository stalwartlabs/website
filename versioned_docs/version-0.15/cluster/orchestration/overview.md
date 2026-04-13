---
sidebar_position: 1
---

# Overview

**Orchestration** refers to the automated management of service lifecycles in a distributed system—such as deploying, scaling, monitoring, and recovering application instances. In contrast to [coordination](/docs/cluster/coordination/overview), which focuses on how nodes within a cluster communicate and stay in sync, orchestration handles the *infrastructure-level automation* that ensures those nodes are running, healthy, and responsive under dynamic conditions.

While coordination enables Stalwart nodes to exchange internal updates and work together as a unified system, orchestration ensures that these nodes are correctly scheduled, restarted when they fail, and scaled up or down according to demand. It’s about maintaining operational continuity and elasticity in changing environments.

Stalwart is designed to run seamlessly in a variety of modern orchestration platforms, including **Kubernetes**, **Apache Mesos**, **Docker Swarm**, and **Consul**. These platforms each provide mechanisms for automating deployment, managing service discovery, monitoring health, and maintaining high availability across clusters.

- [Kubernetes](/docs/cluster/orchestration/kubernetes): is a widely adopted container orchestration system that automates the deployment and scaling of containerized applications across clusters of machines.
- [Apache Mesos](/docs/cluster/orchestration/apache-mesos): is a distributed systems kernel that abstracts CPU, memory, storage, and other resources, allowing applications like Stalwart to be run in a highly elastic environment.
- [Docker Swarm](/docs/cluster/orchestration/docker-swarm): offers native clustering for Docker containers, simplifying orchestration while maintaining the Docker CLI experience.

By supporting these platforms, Stalwart provides flexibility in how clusters are deployed and managed, allowing administrators to choose the orchestration tooling that best fits their operational model.

