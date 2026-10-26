---
sidebar_position: 1
title: "Overview"
description: "What the cluster coordinator carries between nodes, how nodes behave when it is unavailable, and the available coordination services."
---

The nodes of a cluster share their stores, but each node also keeps part of the shared state in its own memory. It holds caches of account data and configuration, and the list of blocked IP addresses. It also holds the open IMAP IDLE sessions, event streams and push subscriptions of the clients connected to it. When something changes on one node, the other nodes must learn about it, or they keep working from outdated information.

The coordinator is the messaging service that carries these notifications. Every node publishes its own changes to the coordinator, and receives the changes published by the others.

An example shows how this works. A node that receives SMTP delivers a message to a mailbox, while the user's IMAP IDLE session is open on a different node. The delivering node publishes a state change for the account. The other node receives it, and sends the IDLE response to the client.

## Notifications

The coordinator carries the following kinds of notification:

- State changes of accounts, which drive IMAP IDLE responses, JMAP event streams and push notifications, and calendar alerts.
- Cache invalidations, sent when an account, a domain, a role, a DKIM key or another cached object changes, so that every node discards its stale copy.
- Configuration changes, including the reload requested by the `ReloadSettings` action, newly blocked IP addresses, renewed ACME certificates and retrained spam classifier models.
- Signals that wake the other nodes when new work is queued: outbound messages, tasks and items to index.
- Pause and resume of the outbound mail queue.

All messages are published under the topic `stwt.agora`, whatever the coordinator. The topic name is fixed, so other applications that share the coordinator must not use it.

## Coordinator outages

An unreachable coordinator does not stop the cluster: the nodes continue to serve clients. Notifications that cannot be published are kept in memory, and they are sent when the coordinator is reachable again.

The buffer is kept small while it waits. Repeated changes to the same object are merged. When many cache invalidations accumulate, they are replaced by a single instruction to discard all caches. When the buffer exceeds 65,536 notifications or 8 MiB, the pending state changes and other notifications are dropped, and the other nodes are told to discard all their caches instead, so that no node keeps serving stale data.

A node may also have missed notifications from the others during the outage. When it reconnects to the coordinator, it therefore discards its own caches, and checks its outbound mail queue and its task and index queues.

The cost of an outage is therefore limited. For a while, IDLE sessions and push subscribers on other nodes are not notified, and afterwards the caches are rebuilt, but no data is lost. The buffer is held in memory, so the notifications pending on a node that restarts are lost, with the same effect.

## Coordination services

[Coordination mechanism](/docs/cluster/configuration/coordination) describes how to configure the coordinator. It includes a comparison of the options, and the requirement for a Redis-based in-memory store. The following services are available:

- [Redis](/docs/cluster/coordination/redis), including Valkey, Redis Cluster and Redis Sentinel, either through the in-memory store's connection or through a separate one.
- [NATS](/docs/cluster/coordination/nats), a lightweight publish and subscribe messaging system.
- [Apache Kafka or Redpanda](/docs/cluster/coordination/kafka), event streaming platforms, available in custom builds.
- [Eclipse Zenoh](/docs/cluster/coordination/peer-to-peer), a peer-to-peer protocol in which nodes connect to each other directly, available in custom builds.

The coordinator carries only notifications, which are small and short-lived, so the choice rarely depends on throughput. A cluster that already runs Redis for its in-memory store needs no other service.
