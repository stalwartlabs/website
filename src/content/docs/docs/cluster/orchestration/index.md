---
sidebar_position: 1
title: "Overview"
description: "Run Stalwart nodes under a container orchestrator such as Kubernetes or Docker Swarm."
---

Running a cluster by hand means starting each node, watching for failures and replacing nodes during upgrades. A container orchestrator automates this work. It starts the Stalwart nodes on a group of machines, restarts them when they fail, and replaces them during upgrades.

The orchestrator complements the [coordinator](/docs/cluster/coordination/) rather than replacing it, since the two work at different levels. The orchestrator manages the containers. The coordinator carries the notifications that the running nodes exchange, and so keeps their views of the shared data consistent.

Starting several replicas of Stalwart under an orchestrator does not by itself create a cluster. The replicas form one only when they share their stores. Each replica needs the same `config.json`, pointing to a shared data store. The deployment also needs a shared blob store and search store, a Redis-based in-memory store and a coordinator, as listed in the [cluster overview](/docs/cluster/#cluster-requirements). Without them, each replica is an independent server with its own data.

Two platforms are documented:

- [Kubernetes](/docs/cluster/orchestration/kubernetes), with a Helm chart whose complete source is on the [chart reference](/docs/cluster/orchestration/kubernetes-chart) page.
- [Docker Swarm](/docs/cluster/orchestration/docker-swarm), with a stack file.

Both use the official `stalwartlabs/stalwart` image and the [health check endpoints](/docs/cluster/configuration/load-balancing#health-checks) `/healthz/live` and `/healthz/ready`.
