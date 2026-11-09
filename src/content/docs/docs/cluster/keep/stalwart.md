---
sidebar_position: 6
title: "Connecting Stalwart"
description: "Configure Stalwart to use Stalwart Keep as its in-memory store, cluster coordinator and cache swap store, and move a running cluster from Redis."
---

Once Keep is [running](/docs/cluster/keep/setup), the Stalwart cluster is pointed at it through its shared configuration. All Stalwart nodes use the same settings, so this is done once, through any node.

## In-memory store

The in-memory store is the first setting to change, because every coordinator requires a shared in-memory store. It is the `Keep` variant of the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->).

The following in-memory store connects to a three-member Keep cluster over TLS with raw public keys:

```json
{
  "@type": "Keep",
  "hosts": {
    "10.0.0.1:7000": true,
    "10.0.0.2:7000": true,
    "10.0.0.3:7000": true
  },
  "clusterDiscovery": true,
  "secret": {"@type": "EnvironmentVariable", "variableName": "KEEP_SECRET"},
  "tls": {
    "@type": "RawPublicKeys",
    "keyPath": "/etc/stalwart/keep/node.key",
    "serverKeysPath": "/etc/stalwart/keep/servers.pem"
  }
}
```

### Connection settings

Three decisions shape this object.

The first is how the node finds the members. With [`clusterDiscovery`](/docs/ref/object/in-memory-store#clusterdiscovery) enabled, `hosts` lists seeds: the node asks them for the member list, and then places each key on the member that owns it. This is the correct setting for any Keep cluster, and listing every member as a seed lets the node start while one of them is down. Without discovery, the node uses only the first entry in `hosts`, which suits a single Keep server.

The second is whether the node has the cluster secret. With a [`secret`](/docs/ref/object/in-memory-store#secret), the node computes which member and which shard own each key, and sends the request straight there, which avoids a hop inside the server. It holds [`shardConnections`](/docs/ref/object/in-memory-store#shardconnections) connections per shard. Discovery and plaintext mode both require the secret. Without a secret, the node holds [`connections`](/docs/ref/object/in-memory-store#connections) connections to the server, and the server forwards each request to the shard that owns its key.

The third is how the connection is protected, in [`tls`](/docs/ref/object/in-memory-store#tls). `RawPublicKeys` and `Authority` correspond to the server's `rpk` and `ca` modes, and `Disabled` to its `off` mode. [Security](/docs/cluster/keep/security) describes them. The paths point to files on the disk of each Stalwart node, read when the store is opened. The configuration is shared, so every node reads the same path, and each node can hold its own key there. The public key of each node must be listed in the `clients.pem` file of every member.

The timeouts rarely need to change. [`attemptTimeout`](/docs/ref/object/in-memory-store#attempttimeout) bounds a single attempt, and [`deadline`](/docs/ref/object/in-memory-store#deadline) bounds a request across its retries, so it must not be shorter than the attempt timeout.

### Requirements on Keep

Stalwart relies on two Keep settings, and their defaults are correct. `max-lock-ttl` must be at least 600 seconds, the longest lock Stalwart takes, or its lock requests fail with `BadRequest`. `max-value` must be at least 512 KiB plus a small header, the largest notification batch Stalwart publishes.

Stalwart's lock keys use the key classes that Keep never evicts, so a memory cap on Keep cannot remove a lock.

Keep's lack of persistence affects one kind of data. Keys written by expressions and Sieve scripts with the `key_set` and `key_incr` functions are lost if the member holding them stops without a handoff, and they are evictable under the memory cap. A deployment that needs such keys to survive should use [Redis](/docs/storage/backends/redis) with persistence for the in-memory store.

## Coordinator

With Keep as the in-memory store, the simplest coordinator is the `Default` variant of the [Coordinator](/docs/ref/object/coordinator) object, which reuses the same client for cluster events:

```json
{
  "@type": "Default"
}
```

An explicit `Keep` coordinator has the same fields as the in-memory store. It is the choice when cluster events should run on a different Keep deployment from the locks and counters, or when Keep is used only for coordination. The reverse also works: any explicit coordinator can run alongside a Keep in-memory store, as can a Keep coordinator alongside a Redis in-memory store.

The [`streamMode`](/docs/ref/object/in-memory-store#streammode) setting decides which members carry the events. In `everywhere` mode, each node subscribes on every member and publishes on one, so an event reaches all nodes whichever member a publisher uses. In `owner` mode, every node subscribes and publishes on one member chosen for the cluster. Delivery work grows with the number of subscribers, and members do not forward events to each other.

Each event batch is published with a confirmation. A batch that is not confirmed stays in the node's backlog and is retried, so a repeat can deliver a batch twice, which the notifications tolerate. A member failure or restart is reported to subscribers as possible loss, which makes the node [discard its caches and check its queues](/docs/cluster/coordination/#coordinator-outages).

## Cache swap

Keep can also hold the snapshots of the [cache swap](/docs/storage/cache-swap) feature, which is configured on the [Cache](/docs/ref/object/cache) object. Snapshots are only a shortcut that can always be rebuilt from the data store, which suits Keep's lack of persistence.

The swap tier is the `InMemory` variant of the `swap` field, whose `store` selects the deployment: `Default` reuses the Keep in-memory store, and `Keep` connects to a separate deployment. The following value uses the in-memory store:

```json
{
  "swap": {
    "@type": "InMemory",
    "store": {"@type": "Default"}
  }
}
```

Cache swap is optional. Snapshots occupy Keep's memory until they expire, and they can need far more memory than the in-memory store and the coordinator together. A member's `memory` setting has to allow for them. [Memory for in-memory snapshots](/docs/storage/cache-swap#memory-for-in-memory-snapshots) explains how much memory they take, and which backends to use instead when the Keep cluster cannot provide it.

## Order of configuration

The server refuses a coordinator while the in-memory store is the local default, so the two settings are changed in this order, as described in [Order of configuration](/docs/cluster/configuration/coordination#order-of-configuration):

1. Set the InMemoryStore to `Keep`.
2. Set the Coordinator.
3. Restart the node, so that both settings take effect.

## Startup order

Start Keep before Stalwart. When Stalwart opens the store, it connects at once and retries for up to 30 seconds while Keep refuses connections. A store that fails to open leaves the node without an in-memory store until the node restarts, and the node logs:

```text
Failed to connect to Stalwart Keep: <reason>
```

Only connection failures are retried. A configuration, TLS or authentication failure fails at once, and the reason names the problem:

- `handshake: server requires TLS`: `tls` is `Disabled`, and the members use TLS.
- `handshake: server proof does not match the secret`: the secret differs from the one on the members.
- `configuration: cluster=on needs secret=HEX`: `clusterDiscovery` is enabled with no `secret`.

Other messages from Stalwart point to the store settings themselves: `The Stalwart Keep cluster secret must be 32 hexadecimal digits`, `Invalid number of connections per Stalwart Keep shard` and `Invalid number of Stalwart Keep connections`.

While the cluster runs, errors from Keep appear as `store.keep-error` events.

## Behaviour during failures

Stalwart resends reads and lock operations automatically, within the request deadline. Writes without a lock token, such as setting a key or incrementing a counter, are not resent after an unknown outcome, because a resend could undo another node's write.

A member crash has the following effects, all of which are limited to the share of keys held by that member:

- Rate-limit windows and greylisting entries on that member start again. A rate limit can admit up to its limit again.
- Authorisation codes and other tokens in flight must be requested again.
- Roughly one member's share of queued messages and search index partitions wait up to about ten minutes longer for their lock, because of the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine).
- Nodes [discard their caches and check their queues](/docs/cluster/coordination/#coordinator-outages).

No mail is lost. The queue and the mailboxes are in the data store, and a queued message whose lock is refused waits and is tried again.

## Move from Redis

The in-memory store holds only short-lived data, so moving from Redis to Keep needs no data migration. Entries are rebuilt as traffic arrives, and a change to the in-memory store takes effect after a restart.

During the change, nodes must not run with different stores, because a node on Redis and a node on Keep do not see each other's locks. The procedure is therefore a restart of the whole Stalwart cluster:

1. Start Keep, and confirm that it is settled. This is a first start, so the `bootstrap` mode described in [First start](/docs/cluster/keep/setup#first-start) applies, and it avoids a wait for the quarantine.
2. Install the keys on each Stalwart node, and set the `KEEP_SECRET` environment variable if the store reads its secret from there, as the example above does.
3. Set the InMemoryStore to `Keep`, and the Coordinator to `Default` if it is not set already.
4. Stop all the Stalwart nodes, then start them again.

Keys written by expressions and Sieve scripts are not carried over. A few behaviours also differ from Redis:

- A counter's expiry is set only when the counter is created, while Redis refreshes it on each increment.
- An expression that reads a counter with `key_get` receives a 64-bit integer encoding, not decimal text.
- A delete by prefix returns once every member has accepted it, and the purge completes shortly afterwards.
- A brief loss of a member makes each node run its catch-up twice, against once with Redis.
