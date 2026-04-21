---
sidebar_position: 2
---

# Node ID

Each Stalwart instance in a cluster must have a unique identifier that distinguishes it from other nodes. The identifier drives coordination, logging, and internal message routing.

Node identifiers are assigned automatically through a lease mechanism. When a node starts, it reads its operating-system hostname and uses that value to acquire a node-id lease from the cluster. The node then renews the lease periodically while it remains online. As long as each node in the cluster has a unique hostname, a distinct node id is assigned to each node without any manual configuration.

If two nodes share the same hostname they will compete for the same lease, which causes coordination conflicts and data inconsistencies. Ensuring that every node runs with a unique hostname is therefore a prerequisite for joining a cluster.

When the operating-system hostname cannot be changed or is not unique across the cluster, the value used to acquire the lease can be overridden by setting the [`STALWART_HOSTNAME`](/docs/configuration/environment-variables#clustering) environment variable before the server starts. The override replaces the system hostname only for the purposes of node identification; the operating system itself is left untouched.

## ClusterNode

The [ClusterNode](/docs/ref/object/cluster-node) object (found in the WebUI under <!-- breadcrumb:ClusterNode --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster<!-- /breadcrumb:ClusterNode -->) is a read-only view over the cluster's node registry. Querying it returns one entry per registered node with the following fields:

- [`nodeId`](/docs/ref/object/cluster-node#nodeid): the integer identifier assigned to the node.
- [`hostname`](/docs/ref/object/cluster-node#hostname): the operating-system hostname of the node.
- [`lastRenewal`](/docs/ref/object/cluster-node#lastrenewal): the timestamp of the node's most recent lease renewal.
- [`status`](/docs/ref/object/cluster-node#status): the current status of the node (`active`, `stale`, or `inactive`).

A typical entry returned by the registry looks like:

```json
{
  "nodeId": 1,
  "hostname": "mx1.example.org",
  "lastRenewal": "2026-01-01T00:00:00Z",
  "status": "active"
}
```

Because ClusterNode is read-only, node registration cannot be edited directly: nodes appear in the registry as they acquire leases and their status is updated as they renew or fail to renew. Administrators use the registry to inspect cluster membership, confirm that each host has obtained an identifier, and detect stale or inactive nodes.
