---
sidebar_position: 5
title: "Roles"
---

In a clustered deployment, background and maintenance tasks must run regularly to keep the system healthy and secure. To distribute this operational workload across the cluster, Stalwart models each role as a named profile applied to one or more nodes.

Roles are defined through [ClusterRole](/docs/ref/object/cluster-role) objects (found in the WebUI under <!-- breadcrumb:ClusterRole --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Roles<!-- /breadcrumb:ClusterRole -->). Each role selects a set of tasks and network listeners, and nodes that start up with a given role name run only the tasks and listeners enabled for that role. This distributes work evenly and lets administrators keep resource-intensive tasks on dedicated hardware.

Each ClusterRole carries the following fields:

- [`name`](/docs/ref/object/cluster-role#name): a unique identifier for the role (read-only).
- [`description`](/docs/ref/object/cluster-role#description): a human-readable description.
- [`tasks`](/docs/ref/object/cluster-role#tasks): a [ClusterTaskGroup](/docs/ref/object/cluster-role#clustertaskgroup) selecting which cluster tasks the role enables. The variants are `EnableAll`, `DisableAll`, `EnableSome`, and `DisableSome`; the `EnableSome` and `DisableSome` variants carry a list of task types via `taskTypes`.
- [`listeners`](/docs/ref/object/cluster-role#listeners): a [ClusterListenerGroup](/docs/ref/object/cluster-role#clusterlistenergroup) selecting which network listeners the role enables. The variants mirror those of `tasks`, with a `listenerIds` field referencing [NetworkListener](/docs/ref/object/network-listener) ids.

A node is assigned to a role through the [`STALWART_ROLE`](/docs/configuration/environment-variables#clustering) environment variable, which names the ClusterRole whose tasks and listeners the node should run.

## Available tasks

The tasks that a role can enable or disable are drawn from the `ClusterTaskType` enumeration on the [ClusterRole](/docs/ref/object/cluster-role#clustertasktype) object:

- `storeMaintenance`: purges expired data from the data store, keeping it compact and performant.
- `accountMaintenance`: cleans up deleted accounts, old changelog entries, and related records.
- `metricsCalculate`: calculates and aggregates metrics and statistics for the cluster.
- `metricsPush`: exports metrics to external monitoring or visualisation systems.
- `pushNotifications`: delivers push notifications to subscribed clients.
- `searchIndexing`: performs full-text search indexing on new or modified content.
- `spamClassifierTraining`: runs spam classifier training. Only one node should run this task at a time to avoid conflicting model updates.
- `outboundMta`: processes outbound mail through the MTA queue.
- `taskQueueProcessing`: executes queued background tasks.
- `taskScheduler`: schedules recurring and deferred tasks. ACME renewal, iMIP processing, calendar-alert dispatch, and similar time-driven jobs are dispatched by the task scheduler.

Task assignment is driven entirely by the [ClusterRole](/docs/ref/object/cluster-role) object and the `STALWART_ROLE` environment variable. The role named in `STALWART_ROLE` selects both which [`tasks`](/docs/ref/object/cluster-role#tasks) the node runs and which [`listeners`](/docs/ref/object/cluster-role#listeners) it exposes, so a single role definition captures the full workload of a given node.

## Push notification sharding

Push notification delivery must be sharded so that each subscriber receives exactly one notification across the cluster. A node is placed in a specific shard by setting the [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) environment variable. Nodes in the same shard cooperate to deliver the subset of notifications assigned to that shard. Sharding is configured exclusively through this environment variable; ClusterRole does not carry shard groupings.

## Example

A simple two-role deployment might define a `frontend` role that serves client-facing listeners but runs no background tasks, and a `maintenance` role that runs every background task but exposes no client listeners:

```json
{
  "name": "frontend",
  "description": "Serves IMAP, JMAP, SMTP and WebDAV traffic",
  "tasks": {
    "@type": "DisableAll"
  },
  "listeners": {
    "@type": "EnableAll"
  }
}
```

```json
{
  "name": "maintenance",
  "description": "Runs store maintenance, indexing, and metrics",
  "tasks": {
    "@type": "EnableSome",
    "taskTypes": [
      "storeMaintenance",
      "accountMaintenance",
      "searchIndexing",
      "metricsCalculate",
      "metricsPush"
    ]
  },
  "listeners": {
    "@type": "DisableAll"
  }
}
```

Nodes that start with `STALWART_ROLE=frontend` run only the network listeners, while nodes started with `STALWART_ROLE=maintenance` run only the selected background tasks.

## Best practices

Role planning should start from the resource profile of each task. Tasks such as `searchIndexing` and `spamClassifierTraining` tend to be CPU- and I/O-intensive; `metricsCalculate` and scheduled maintenance are lighter but time-sensitive. Assigning resource-heavy roles to nodes with sufficient computational capacity and isolating them from latency-sensitive workloads helps keep the cluster responsive.

In high-availability deployments, critical tasks should run on multiple nodes so that the failure of one does not stop routine maintenance. Where duplicate work is a concern, for example push notifications, sharding through `STALWART_PUSH_SHARD` prevents the same work from being done twice.

When sharding, aim for an even distribution of nodes across shards. Each shard should have similar computational resources to prevent uneven load. In smaller deployments a single shard may be sufficient.

Role assignments should be reviewed as the cluster evolves. Changes in user population, message volume, or data growth may shift the optimal distribution of responsibilities. Regular audits of node health, performance metrics, and quota utilisation help identify when roles should be reassigned, split, or consolidated.
