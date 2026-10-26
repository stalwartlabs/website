---
sidebar_position: 3
title: "Coordination mechanism"
description: "Select the coordinator that connects the nodes of a cluster, and configure it in the right order with the in-memory store."
---

The nodes of a cluster each keep their own caches and their own copy of the loaded configuration, so they need a way to tell each other when something changes. The coordinator is the messaging service that carries these notifications. [Coordination](/docs/cluster/coordination/) describes what it carries, and how the nodes behave when it is unavailable. This page covers choosing a coordinator and configuring it.

The coordinator is selected by the `@type` of the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The setting is part of the shared configuration, so all nodes of a cluster use the same coordinator. A single node uses `Disabled`.

## Choosing a coordinator

The available coordinators differ in the service they need and in whether the official binaries include them:

| `@type` | Service | In the official binaries | Notes |
|---|---|---|---|
| `Disabled` | None | Yes | Single node only. |
| `Default` | The Redis server of the in-memory store | Yes | No additional service. Requires the in-memory store to be `Redis`, `RedisCluster`, `RedisSentinel` or `Sharded`. A sharded store uses its first member. |
| `Redis` | A standalone [Redis](/docs/cluster/coordination/redis) or Valkey server | Yes | A separate connection, for example to a different Redis deployment. |
| `RedisCluster` | A Redis Cluster | Yes | |
| `RedisSentinel` | Redis managed by Sentinel | Yes | |
| `Nats` | [NATS](/docs/cluster/coordination/nats) | Yes | A dedicated messaging service. |
| `Kafka` | [Apache Kafka or Redpanda](/docs/cluster/coordination/kafka) | No | Requires a custom build. |
| `Zenoh` | [Eclipse Zenoh](/docs/cluster/coordination/peer-to-peer), peer to peer | No | Requires a custom build. |

A cluster always needs a Redis-based in-memory store, which makes `Default` the simplest choice. It reuses that Redis server, so it adds no service and needs no further settings.

A separate Redis connection or NATS is chosen in two situations. The first is when the coordination traffic should not share the Redis deployment that holds the locks and counters. The second is when NATS is already operated.

Kafka and Zenoh are not part of the official binaries. They are available only in binaries [compiled](/docs/development/compile) with the `kafka` or `zenoh` feature. When either is selected, an official binary logs `Binary was not compiled with the selected coordinator backend` and runs without coordination.

## Order of configuration

Every coordinator other than `Disabled` requires the [in-memory store](/docs/storage/in-memory) to be Redis-based: `Redis`, `RedisCluster`, `RedisSentinel`, or the Enterprise `Sharded` store. The reason is that the local in-process store cannot be shared by the nodes. The server enforces this rule in both directions, so the two settings must be changed in a specific order.

To turn a single node into the first node of a cluster:

1. Set the [InMemoryStore](/docs/ref/object/in-memory-store) to a Redis variant.
2. Set the Coordinator.
3. Restart the node, so that both settings take effect.

Setting a coordinator while the in-memory store is still `Default` is refused with:

```text
A cluster coordinator requires a Redis in-memory store, configure one first.
```

To return to a single node, the order is reversed:

1. Set the Coordinator to `Disabled`.
2. Set the InMemoryStore to `Default`.
3. Restart the node.

Setting the in-memory store to `Default` while a coordinator is configured is refused with:

```text
The local in-memory store cannot be used while a cluster coordinator is configured, disable the coordinator first.
```

These checks apply to changes made through the server. A node can nevertheless start with both settings, for example because another tool wrote them. It then logs a `registry.build-error` event with the message `The local in-memory store cannot be used when a cluster coordinator is configured, use a Redis in-memory store or disable the coordinator`, and it runs without a usable in-memory store.

The coordinator's `Default` variant reuses the in-memory store's connection. With a `Sharded` in-memory store, it uses the first member of the store, so all nodes exchange their messages through the same Redis deployment. A node whose in-memory store is not Redis-based logs `Default coordinator requires a Redis, Redis Cluster, Redis Sentinel or sharded Redis in-memory store`, and runs without coordination.

## Running several nodes without a coordinator

Nodes that share a data store but have no coordinator still serve mail. Each of them, however, sees only its own changes immediately. Configuration reloads, cache invalidations, blocked IP addresses and the notifications for IMAP IDLE and push subscriptions are not passed between them.

In practice, this has two visible effects. A client connected to one node is not told about a message delivered by another. Settings changed through one node apply on the other nodes only after those nodes are reloaded or restarted. [Applying configuration changes](/docs/cluster/configuration/#applying-configuration-changes) describes the effects in detail. A cluster must therefore have a coordinator.
