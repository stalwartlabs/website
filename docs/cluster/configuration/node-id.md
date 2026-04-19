---
sidebar_position: 2
---

# Node ID

Each Stalwart instance in a cluster must have a unique identifier that distinguishes it from other nodes. The identifier is carried on the [ClusterNode](/docs/ref/object/cluster-node) object (found in the WebUI under <!-- breadcrumb:ClusterNode --><!-- /breadcrumb:ClusterNode -->) through the [`nodeId`](/docs/ref/object/cluster-node#nodeid) field, and must be a positive integer. It drives coordination, logging, and internal message routing, allowing each node to be uniquely addressed within the cluster.

The node identifier must be unique across the entire cluster; no two nodes may share the same value. Duplicate identifiers cause unpredictable behaviour, coordination conflicts, and data inconsistencies.

Each ClusterNode instance records the assigned [`nodeId`](/docs/ref/object/cluster-node#nodeid), along with the node [`hostname`](/docs/ref/object/cluster-node#hostname), the timestamp of its last lease renewal [`lastRenewal`](/docs/ref/object/cluster-node#lastrenewal), and its current [`status`](/docs/ref/object/cluster-node#status) (`active`, `stale`, or `inactive`).

For example, the first node in a cluster might be registered as:

```json
{
  "nodeId": 1,
  "hostname": "mx1.example.org",
  "lastRenewal": "2026-01-01T00:00:00Z",
  "status": "active"
}
```

Subsequent nodes are registered with different `nodeId` values (`2`, `3`, `4`, and so on), ensuring no overlap. A consistent, documented mapping of node identifiers is important, particularly in larger clusters or automated deployments.

<!-- review: The previous docs configured the node identifier per-instance via a local `cluster.node-id` TOML setting, implying a bootstrap-time value. The current ClusterNode object is cluster-scoped and carries renewal timestamps, suggesting registration happens at runtime (likely through a bootstrap environment variable or the first-start flow). Confirm how a freshly provisioned node is told which nodeId it should register under, and whether that mapping is provided via an environment variable, the bootstrap wizard, or is auto-assigned. -->
