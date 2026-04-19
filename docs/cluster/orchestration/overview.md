---
sidebar_position: 1
---

# Overview

Orchestration refers to the automated management of service lifecycles in a distributed system: deploying, scaling, monitoring, and recovering application instances. In contrast to [coordination](/docs/cluster/coordination/overview), which concerns how nodes within a cluster communicate and stay in sync, orchestration handles the infrastructure-level automation that keeps those nodes running, healthy, and responsive under dynamic conditions.

While coordination allows Stalwart nodes to exchange internal updates and work together as a unified system, orchestration schedules them, restarts them when they fail, and scales them according to demand. It maintains operational continuity and elasticity in changing environments.

Stalwart runs on a variety of orchestration platforms, including Kubernetes, Apache Mesos, Docker Swarm, and Consul. These platforms each provide mechanisms for automating deployment, service discovery, health monitoring, and high availability across clusters.

- [Kubernetes](/docs/cluster/orchestration/kubernetes): a container orchestration system that automates the deployment and scaling of containerised applications across clusters of machines.
- [Apache Mesos](/docs/cluster/orchestration/apache-mesos): a distributed systems kernel that abstracts CPU, memory, storage, and other resources, allowing applications such as Stalwart to be run in an elastic environment.
- [Docker Swarm](/docs/cluster/orchestration/docker-swarm): native clustering for Docker containers, offering orchestration while preserving the Docker CLI experience.

Supporting these platforms gives administrators flexibility in how clusters are deployed and managed, so the orchestration tooling can match the operational model already in use.
