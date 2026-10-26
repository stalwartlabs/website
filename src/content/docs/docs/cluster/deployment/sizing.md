---
sidebar_position: 2
title: "Sizing"
description: "What determines the number and size of the nodes in a Stalwart cluster, and how to grow a cluster from measured load."
---

Two requirements decide how many nodes a cluster needs: the load it serves, and the availability it must provide. Neither has to be settled for good at the start. Stalwart nodes hold no data of their own, so capacity is added by starting more nodes with the same configuration, and nodes can be added while the cluster is running.

## Availability

A cluster continues serving clients through a node failure only when another node can take over. It therefore needs at least two nodes behind a load balancer, with enough spare capacity for the remaining nodes to carry the full load. Three nodes go a step further: one can be taken down for maintenance while the cluster still tolerates a further failure.

Stalwart nodes do not vote or form a quorum, so the number of nodes does not need to be odd. Quorum requirements apply to the shared services instead. A FoundationDB cluster, a Redis Sentinel or Redis Cluster deployment, a Kafka cluster and similar systems have their own rules for the number of servers needed to survive a failure, and the availability of the Stalwart cluster depends on them.

## Node resources

:::note[Estimates]
Figures marked as estimates on this page are calculated from the defaults or measured in benchmarks on x86_64 virtual machines with 16 vCPUs and 64 GB of memory, loaded with synthetic mail. Hosts with less memory were not benchmarked, so the figures for small hosts are calculated only.
:::

The resources a node needs depend on what it runs. Connections are the first factor. IMAP IDLE sessions, JMAP event streams and WebDAV clients hold a connection, and memory, for as long as the client stays connected. As an estimate, with thousands of connections open, an IMAP session in IDLE uses about 65 to 75 KB of resident memory, and a JMAP EventSource subscriber about 28 KB.

Caches are the second factor. Each node caches the data of the accounts it serves, and the cache sizes set the memory needed beyond the connections. As an estimate, the message cache needs about 51 to 59 bytes per cached message.

Processor time goes mainly to three kinds of work. Password verification is deliberately CPU-intensive, to slow down password guessing. As an estimate, one login with an Argon2 password hash takes about 26 to 34 ms of CPU time, so a 16 vCPU server verifies about 500 to 600 passwords per second with every core busy. Search indexing and spam classifier training are CPU-intensive during imports and training runs, which is one reason to assign them to separate nodes with [roles](/docs/cluster/configuration/roles). Finally, inbound mail is parsed, filtered and scanned for spam, and outbound mail holds connections to remote servers while it is delivered.

A benchmark gives an idea of the overall scale. Three nodes with 8 vCPUs each shared a PostgreSQL data store and a Redis in-memory store. A mixed working-day load of about 1,360 operations per second, including about 445 inbound deliveries per second, used about two cores across the three nodes. Doubling the load doubled the CPU used by the nodes, which still stayed below a fifth of their capacity, while the database server became the limit. The benchmark compresses many hours of user activity into one, so it measures throughput, and it does not give a number of users per node.

Overload is contained by a [memory budget](/docs/performance/memory), which limits the memory a node uses for requests in progress. A node under excessive load therefore slows down instead of running out of memory.

## Growing a cluster

Rather than estimating the final size in advance, start with the smallest cluster that meets the availability requirement, measure the load, and add nodes as it grows:

1. Run the cluster under normal and peak load and observe processor, memory, disk and network usage on the nodes and on the shared services, together with the [metrics](/docs/telemetry/metrics/) that Stalwart exports.
2. Add nodes to the group whose resources are exhausted, for example client access nodes when connection counts rise, or indexing nodes when the index queue grows.
3. Check the shared services as well: the data store, the blob store and Redis can limit a cluster before the Stalwart nodes do.

New nodes join by starting with the same `config.json` and a unique hostname, as described in the [cluster overview](/docs/cluster/#cluster-requirements). [Sizing memory](/docs/performance/memory) and [Tuning a cluster](/docs/performance/cluster) describe the sizing method in more detail, with a memory worksheet.
