---
sidebar_position: 1
title: "Overview"
description: "The settings that turn a group of Stalwart servers into a cluster, and how configuration changes reach every node."
---

A group of Stalwart servers becomes a cluster when two conditions hold: the servers share their stores, and a coordinator connects them. The [cluster overview](/docs/cluster/#cluster-requirements) lists the components involved. This section describes the settings that bring them together:

- [Node identifiers](/docs/cluster/configuration/node-id), which each node obtains automatically from its hostname.
- The [coordination mechanism](/docs/cluster/configuration/coordination), which requires a Redis-based in-memory store to be configured first.
- [Load balancing](/docs/cluster/configuration/load-balancing): the hostname presented by every node, health checks and the client address behind a proxy.
- [Roles](/docs/cluster/configuration/roles), which select the listeners and background tasks of each node.

## Applying configuration changes

Apart from the data store, which is set in each node's `config.json`, the configuration is kept in the shared data store. A change made through any node is therefore stored once, for the whole cluster. Each node, however, works from the configuration it has loaded into memory, so a stored change still has to reach the running nodes. How it does so depends on the setting.

Most settings are applied by a reload. These include SMTP rules, spam filter settings and most limits. They are reloaded on every node when the `ReloadSettings` [action](/docs/management/tasks-actions/actions) runs, because the action reaches the other nodes through the coordinator. Without a coordinator, only the node that served the action reloads. The other nodes keep the previous settings until they are reloaded or restarted.

Other settings require a restart. These include every store, the caches, the listeners and the search indexing concurrency, and they take effect when each node restarts. In a cluster, restart the nodes one at a time, so that the service remains available throughout.

The caches that each node keeps follow the same logic. Without a coordinator, a change to an account, a domain or a role made through one node is not seen by the other nodes until the entry leaves their cache. Some changes are unaffected. A change to a password or an app password, for example, takes effect everywhere, because each node checks the account when a password is presented. Other changes linger, however. A changed permission inside a role, a revoked OAuth access token or a changed API key remains in effect on the other nodes until their cached entries are evicted or the nodes restart. Because a revoked credential could stay usable in this way, a cluster needs a coordinator.
