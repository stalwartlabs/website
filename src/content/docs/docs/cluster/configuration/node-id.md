---
sidebar_position: 2
title: "Node ID"
description: "How each cluster node obtains a unique node identifier from its hostname, how leases are renewed and reclaimed, and the ClusterNode object that lists them."
---

Nodes of a cluster create records independently, and two records created at the same moment on different nodes must never receive the same identifier. Stalwart prevents such collisions by giving every node a node identifier, a number from 0 to 511 that is unique within the cluster. Each node embeds its node identifier in the identifiers it generates for new records. Since there are 512 possible values, a cluster can have at most 512 nodes.

## Identifier assignment

Node identifiers are assigned automatically, through leases in the shared data store. When a node starts, it takes a lease on an identifier and records its hostname with the lease. The hostname comes from the [`STALWART_HOSTNAME`](/docs/configuration/environment-variables#clustering) environment variable when it is set, and from the operating system otherwise.

A node looks for an identifier in the following order:

1. An identifier already leased under its own hostname, so that a restarted node keeps its identifier.
2. An identifier whose lease is stale, that is, not renewed for more than one hour.
3. The lowest identifier that is not leased.

A running node renews its lease every 30 minutes. When all 512 identifiers are held by active nodes, a new node cannot obtain one, so it does not start and reports `Failed to obtain a node id: all 512 ids are leased by active nodes`.

The lease is tied to the hostname, and this has an important consequence: every node must have a unique hostname. Two nodes with the same hostname receive the same identifier, and they can then generate colliding record identifiers. In containers, several replicas may report the same hostname, or the hostname may be an IP address, which is treated as `localhost`. In these cases, set `STALWART_HOSTNAME` to a distinct value for each node. The hostname that clients see is a separate setting, described in [Load balancing](/docs/cluster/configuration/load-balancing).

The clocks of all nodes should be synchronised, for example with NTP, for two reasons. Record identifiers include the time. In addition, each node judges whether another node's lease is stale by comparing the renewal time with its own clock.

## Node status

The [ClusterNode](/docs/ref/object/cluster-node) object (found in the WebUI under <!-- breadcrumb:ClusterNode --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster<!-- /breadcrumb:ClusterNode -->) lists the leases. Each entry shows the [`nodeId`](/docs/ref/object/cluster-node#nodeid) and the [`hostname`](/docs/ref/object/cluster-node#hostname), the time of the last renewal in [`lastRenewal`](/docs/ref/object/cluster-node#lastrenewal), and the [`status`](/docs/ref/object/cluster-node#status) derived from it:

| Status | Meaning |
|---|---|
| `active` | The lease was renewed within the last hour. |
| `stale` | The lease has not been renewed for more than one hour. The node is down or cannot reach the data store, and its identifier can be taken by another node. |
| `inactive` | The lease has not been renewed for more than 24 hours. The entry is removed by the next store maintenance run or the next node start. |

The `stale` status needs interpreting. A node that has been stopped shows as `stale` an hour later, which is expected. A running node that shows as `stale`, on the other hand, is failing to renew its lease, typically because it cannot write to the data store. Its log then contains `Failed to renew node ID lease`.

The following entry describes an active node:

```json
{
  "nodeId": 1,
  "hostname": "mx1.example.org",
  "lastRenewal": "2026-01-01T00:00:00Z",
  "status": "active"
}
```

ClusterNode is read-only. The nodes create and update its entries themselves, and administrators cannot edit them. The entries can be queried with `stalwart-cli query ClusterNode`.

## Nodes that return after a long absence

A node that restarts with the same hostname reclaims its previous identifier, as long as its lease entry still exists. Once the entry has been taken by another node, or removed after 24 hours, the returning node receives a different identifier. This has no effect on stored data, since the identifier only distinguishes the records each node creates. A node whose hostname changes is treated as a new node, and it receives a new identifier.

One situation does need action. A node that loses contact with the data store for more than an hour can find, when contact returns, that another node has taken its stale identifier. Its lease renewal then fails with `Node id lease is held by another host`. The node keeps running with the same identifier, however, so both nodes can generate colliding record identifiers. Restart such a node, so that it obtains a new identifier.
