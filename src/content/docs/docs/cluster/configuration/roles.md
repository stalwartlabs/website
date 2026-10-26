---
sidebar_position: 5
title: "Roles"
description: "Assign listeners and background tasks to cluster nodes with cluster roles, shard push notification delivery, and plan the distribution of services across nodes."
---

Without a role, every node of a cluster opens every network listener and runs every background task. That is simple, but it places very different kinds of work on the same machines. Roles divide the work. A node can be limited to serving IMAP and JMAP clients, to receiving and delivering mail, or to running the indexing and maintenance tasks. This keeps resource-intensive background work away from the nodes that serve clients, and it allows each group of nodes to be sized and scaled for its own load.

## Defining roles

A role is a [ClusterRole](/docs/ref/object/cluster-role) object (found in the WebUI under <!-- breadcrumb:ClusterRole --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Roles<!-- /breadcrumb:ClusterRole -->). It has a [`name`](/docs/ref/object/cluster-role#name), set when the role is created, and an optional [`description`](/docs/ref/object/cluster-role#description). Its substance is two selections: [`tasks`](/docs/ref/object/cluster-role#tasks) selects the background tasks the node runs, and [`listeners`](/docs/ref/object/cluster-role#listeners) selects the [network listeners](/docs/server/listener) the node opens.

Each selection takes one of four forms. `EnableAll` and `DisableAll` select everything or nothing. `EnableSome` selects only the listed items, and `DisableSome` selects everything except the listed items. Tasks are listed in `taskTypes` by name, and listeners in `listenerIds` by the identifiers of their [NetworkListener](/docs/ref/object/network-listener) objects.

A node learns its role from the [`STALWART_ROLE`](/docs/configuration/environment-variables#clustering) environment variable, which contains the name of a ClusterRole, and it reads the variable at startup. A node without the variable runs every task and every listener. A node whose variable names a role that does not exist logs `Cluster role "<name>" not found in registry`, and it also runs everything.

## Tasks

Each background task covers one kind of work. The following table also shows what happens when no node runs it:

| Task | Work | When no node runs it |
|---|---|---|
| `outboundMta` | Delivers the outbound mail queue. Messages accepted by any node are delivered by the nodes with this task. | Outbound mail stays in the queue. |
| `searchIndexing` | Processes the [search index queue](/docs/storage/indexing). CPU-intensive during imports. | New items never become searchable. |
| `taskScheduler` | Creates the periodic tasks: the daily purges, auto-expunge and similar maintenance. Each node with this task creates its own copy of every periodic task. | No periodic maintenance is scheduled. |
| `taskQueueProcessing` | Runs the queue of background tasks. Calendar alarms and scheduling messages, DMARC and TLS reports, ACME certificate renewal, DKIM key rotation and DNS record management run on every node that processes the task queue, which is any node with this task or with `storeMaintenance`, `accountMaintenance` or `spamClassifierTraining`. | If no node has any of these four tasks, queued tasks wait. |
| `storeMaintenance` | Runs store-wide maintenance tasks, such as the data and blob purges and reindexing. | Deleted data is not purged. |
| `accountMaintenance` | Runs per-account tasks: purging expired data, reindexing an account, and deleting accounts. | Account deletions and per-account purges wait. |
| `spamClassifierTraining` | Trains the [spam classifier](/docs/spamfilter/classifier/) on new samples. CPU-intensive. | The classifier is not trained. |
| `pushNotifications` | Delivers notifications to JMAP and Web Push subscriptions. | Push subscribers receive nothing. |
| `metricsCalculate` | Calculates the metrics that require queries against the stores, every five minutes (Enterprise). | Those metrics are not updated. |
| `metricsPush` | Exports metrics to an [OpenTelemetry](/docs/telemetry/metrics/opentelemetry) collector. | No metrics are pushed. |

A task that no node runs is not reported as an error. The work simply waits, or never starts, so every task must be assigned to at least one node.

Several nodes can run the same task without duplicating work, because queued tasks and index partitions are locked so that each item is processed by one node. Two tasks are the exception: they are best assigned to a single node, although nothing enforces it. Each node with `taskScheduler` queues its own copy of every periodic task, so purges and training runs are performed once per scheduler node. `spamClassifierTraining` belongs on one node so that two nodes do not train concurrently.

Roles are read at startup. A change to a role, or to `STALWART_ROLE`, therefore takes effect when the node restarts.

## Push notification sharding

Push notifications to JMAP and Web Push subscribers are sent by the nodes with the `pushNotifications` task. In a large cluster, this delivery can be divided among groups of such nodes, called shards. Each shard handles a fixed part of the accounts, and accounts are assigned to shards by their account identifier modulo the number of shards.

Two settings are needed. The first is [`pushShardsTotal`](/docs/ref/object/jmap#pushshardstotal) on the [Jmap](/docs/ref/object/jmap) object, which sets the number of shards and is <!-- default:Jmap.pushShardsTotal -->1<!-- /default --> by default. With a single shard, every push node handles every account, and sharding is off. The second is the [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) environment variable, which assigns a node to a shard, numbered from 1 to the number of shards. When it is unset, or set to `0` or `1`, the node belongs to the first shard.

For example, with `pushShardsTotal` set to 2, the push nodes started with `STALWART_PUSH_SHARD=1` handle the accounts with even identifiers, and the push nodes started with `STALWART_PUSH_SHARD=2` handle those with odd identifiers. Each shard needs at least one node, and more than one for redundancy. A node whose shard number is greater than `pushShardsTotal` handles no accounts.

## Planning node roles

The basic cluster runs every service on every node, without roles. Each node is configured identically, any node can replace any other, and the load balancer treats them all alike. This suits clusters of a few nodes, and it is the usual starting point.

As a cluster grows, separating the client-facing services from mail transfer and from background work brings two benefits. Each kind of work can be scaled independently, and CPU-intensive tasks no longer slow down client sessions. A typical layout has three groups:

| Group | Listeners | Tasks |
|---|---|---|
| Client access | IMAP, JMAP and WebDAV (HTTPS), submission, HTTP | `pushNotifications` |
| Mail transfer | SMTP, HTTP | `outboundMta`, `taskQueueProcessing` |
| Background | HTTPS for administration, HTTP | `searchIndexing`, `storeMaintenance`, `accountMaintenance`, `taskScheduler`, `spamClassifierTraining`, `metricsCalculate`, `metricsPush` |

Every group keeps the plain HTTP listener (port 8080 in the default configuration). The [health checks](/docs/cluster/configuration/load-balancing#health-checks) of load balancers and orchestrators use it, so a role that omits it makes every health check fail.

The layout can be scaled down. For a cluster of three nodes, the background tasks can run on one of the client access nodes instead of a dedicated node. For redundancy, run the tasks on at least two nodes, except `taskScheduler` and `spamClassifierTraining`.

The following roles implement the three groups. The listener identifiers are those of the deployment's NetworkListener objects, which `stalwart-cli query NetworkListener` lists.

```json
{
  "name": "access",
  "description": "IMAP, JMAP, WebDAV and submission",
  "listeners": {
    "@type": "EnableSome",
    "listenerIds": {"<imaps-listener-id>": true, "<https-listener-id>": true, "<submissions-listener-id>": true, "<http-listener-id>": true}
  },
  "tasks": {
    "@type": "EnableSome",
    "taskTypes": {"pushNotifications": true}
  }
}
```

```json
{
  "name": "transfer",
  "description": "Inbound and outbound SMTP",
  "listeners": {
    "@type": "EnableSome",
    "listenerIds": {"<smtp-listener-id>": true, "<http-listener-id>": true}
  },
  "tasks": {
    "@type": "EnableSome",
    "taskTypes": {"outboundMta": true, "taskQueueProcessing": true}
  }
}
```

```json
{
  "name": "background",
  "description": "Indexing and maintenance",
  "listeners": {
    "@type": "EnableSome",
    "listenerIds": {"<https-listener-id>": true, "<http-listener-id>": true}
  },
  "tasks": {
    "@type": "DisableSome",
    "taskTypes": {"outboundMta": true, "pushNotifications": true, "taskQueueProcessing": true}
  }
}
```

Each node is then started with `STALWART_ROLE=access`, `STALWART_ROLE=transfer` or `STALWART_ROLE=background`. The load balancer sends client traffic to the access nodes and SMTP traffic to the transfer nodes. In a multi-site deployment, the same groups are typically repeated in each site, and the shared stores are replicated between sites by their own mechanisms.

[Tuning a cluster](/docs/performance/cluster) discusses resource planning for each group.
