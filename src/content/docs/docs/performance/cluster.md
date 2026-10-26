---
title: "Tuning a cluster"
description: "What changes for caching, in-memory data, node roles and applying settings when Stalwart runs on several nodes."
sidebar_position: 8
---

The tuning described in the rest of this section applies to each node of a cluster in the same way as to a single server. A few choices change once there is more than one node, though. Caches are duplicated across nodes, some data must move to shared stores so that every node sees it, background work can be assigned to specific nodes, and every setting has to reach every node. This page describes those differences.

Two related topics are covered elsewhere. How many nodes to deploy and how to lay them out is covered in [Cluster sizing](/docs/cluster/deployment/sizing), and the memory of each node is sized as described in [Sizing memory](/docs/performance/memory).

## Caches are per node

Each node has its own caches, and nodes do not share cached entries. An account used on several nodes is therefore cached on each of them, and it counts against each node's cache budget.

The cached copies stay consistent through two mechanisms. A change made on one node reaches the cached copies on the other nodes through the change log, within the five-second freshness window described in [How caching works](/docs/performance/caching). Directory changes, such as an updated account or role, travel a different way: the cluster [coordinator](/docs/cluster/configuration/coordination) sends them to the other nodes, which then remove the affected cache entries.

Because each node caches the accounts it serves, the way connections are distributed affects memory. Routing each user's connections to the same node, for example by account at the load balancer, keeps an account in one node's cache instead of several, and therefore lowers the memory needed per node. [Load balancing](/docs/cluster/configuration/load-balancing) describes how to configure it.

[Cache swapping](/docs/storage/cache-swap) needs a shared backend to help across nodes. With Redis or the blob store, which every node can read, any node can restore the snapshot of a large account written by another. A node-local file helps only the node that wrote it. The tuning of snapshots is described in [Tune cache swapping](/docs/performance/caches#tune-cache-swapping).

## Shared in-memory data

The in-memory store holds short-lived data such as rate limit counters, and in a cluster every node must see the same values. The `Default` in-memory store keeps its data inside one node, so it is refused when a coordinator is configured. A cluster therefore needs a Redis in-memory store, as described in [In-memory store](/docs/storage/in-memory).

Rate limit counters are kept in that store, and each node updates them in batches rather than on every request. This makes a limit shared by several nodes approximate: it can be exceeded briefly. The pool and memory settings for Redis are described in [Tuning the data store](/docs/performance/data-store#in-memory-store).

## Assign work to nodes

Background work does not have to run on every node. It can be assigned to specific nodes with [node roles](/docs/cluster/configuration/roles), which keeps heavy tasks away from the nodes that serve clients. Several nodes can run the same task, because each index partition and queued task is locked while one node works on it. The tasks that most affect the nodes serving clients are the following:

- `searchIndexing`: full-text indexing, which is CPU-intensive and adds data store writes. [Speeding up search indexing](/docs/performance/search-indexing#move-indexing-to-dedicated-nodes) describes how to place it.
- `outboundMta`: outbound delivery, whose threads are counted per node for each virtual queue, as described in [Tuning mail throughput](/docs/performance/mail-throughput).
- `spamClassifierTraining`: training of the spam classifier, which is CPU-intensive. Assign it to one node, although nothing prevents assigning it to more.

Push notifications are distributed differently. They are divided into shards, and each node is placed in a shard with the `STALWART_PUSH_SHARD` environment variable, as described in [Push notification sharding](/docs/cluster/configuration/roles#push-notification-sharding). The number of shards is [`pushShardsTotal`](/docs/ref/object/jmap#pushshardstotal), <!-- default:Jmap.pushShardsTotal -->1<!-- /default --> unless changed, and raising it spreads push delivery across more nodes.

## Applying changes on every node

A setting changed on a cluster has to reach every node, and how it gets there depends on whether it needs a restart. Settings that need a restart include every cache and store setting and the listener limits (see [Applying changes](/docs/configuration/#applying-changes)). Apply them by restarting the nodes one at a time, so that the cluster keeps serving clients throughout.

Settings applied by a reload travel through the coordinator, and so does the invalidation of cached accounts and roles. They reach the other nodes only that way, as described in [Applying configuration changes](/docs/cluster/configuration/#applying-configuration-changes).

When a reload or an invalidation is slow to reach a node, the `cluster.*` error events show the reason: either that node cannot reach the coordinator, or it has fallen behind on its messages.
