---
sidebar_position: 10
title: "Redis"
description: "Use Redis, Valkey, Redis Cluster or Redis Sentinel as the in-memory store, the cluster coordinator or the cache swap tier, and configure its memory limit and eviction policy."
---

[Redis](https://redis.io/) and its open-source fork [Valkey](https://valkey.io/) are in-memory key-value servers. Stalwart uses them for three purposes:

- As the [in-memory store](/docs/storage/in-memory), which holds rate-limit counters, greylisting entries, locks and short-lived tokens. In a cluster, a Redis-based in-memory store is required.
- As the [cluster coordinator](/docs/cluster/coordination/redis), which carries cache invalidations and change notifications between nodes. The coordinator's `Default` variant reuses the in-memory store's Redis connection.
- As the tier of the [cache swap](/docs/storage/cache-swap) feature, which keeps snapshots of account caches.

Redis cannot serve as the data store, the blob store or the search store.

## Choosing a deployment

Redis can be deployed in three ways, which differ in how they scale and how they survive the failure of a server. Three variants of the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->) connect to them:

- `Redis` connects to a single server, or to a single address in front of a replicated deployment, such as a managed Redis service with automatic failover.
- `RedisCluster` connects to a [Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/), which partitions keys across several primaries. It is the choice when one server cannot hold the data or the load.
- `RedisSentinel` connects through [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/), which monitors a primary and its replicas and promotes a replica when the primary fails. Stalwart asks the Sentinels for the current primary, so a failover requires no configuration change.

A fourth variant, `Sharded` (Enterprise), distributes keys across several independent `Redis`, `RedisCluster` or `RedisSentinel` deployments. It is described in [Composite stores](/docs/storage/backends/composite#sharded-in-memory-store).

## Standalone configuration

The `Redis` variant takes the server address in [`url`](/docs/ref/object/in-memory-store#url). The URL can carry a user name, a password, a port and a database number, and the `rediss` scheme enables TLS:

```text
redis[s]://[<username>][:<password>@]<host>[:<port>][/<db>]
```

[`connectTimeout`](/docs/ref/object/in-memory-store#connecttimeout) limits the time allowed to establish a connection. On a `rediss` URL, [`allowInvalidCerts`](/docs/ref/object/in-memory-store#allowinvalidcerts) accepts a self-signed or otherwise invalid certificate, and the `#insecure` URL fragment has the same effect. TLS client certificates are not supported.

Connections are pooled. [`poolMaxConnections`](/docs/ref/object/in-memory-store#poolmaxconnections) limits the size of the pool. Three timeouts bound the time spent on pool operations: [`poolTimeoutCreate`](/docs/ref/object/in-memory-store#pooltimeoutcreate) for creating a connection, [`poolTimeoutWait`](/docs/ref/object/in-memory-store#pooltimeoutwait) for waiting for one, and [`poolTimeoutRecycle`](/docs/ref/object/in-memory-store#pooltimeoutrecycle) for recycling one.

The following in-memory store connects to a Redis server over TLS, with the password in the URL:

```json
{
  "@type": "Redis",
  "url": "rediss://:s3cr3t@redis.example.com:6380/0"
}
```

## Cluster configuration

The `RedisCluster` variant takes the addresses of one or more cluster nodes in [`urls`](/docs/ref/object/in-memory-store#urls). It does not need the full list, because it discovers the rest of the cluster from those nodes.

The credentials are given in [`authUsername`](/docs/ref/object/in-memory-store#authusername) and [`authSecret`](/docs/ref/object/in-memory-store#authsecret). `authUsername` is sent only when it is set, so a deployment that uses only a password (`requirepass`) needs only `authSecret`.

A few settings tune how Stalwart works with the cluster. [`readFromReplicas`](/docs/ref/object/in-memory-store#readfromreplicas) allows reads to be served by replicas, and [`protocolVersion`](/docs/ref/object/in-memory-store#protocolversion) selects `resp2` or `resp3`. While the cluster is reconfiguring, commands can fail temporarily, and [`maxRetries`](/docs/ref/object/in-memory-store#maxretries), [`minRetryWait`](/docs/ref/object/in-memory-store#minretrywait) and [`maxRetryWait`](/docs/ref/object/in-memory-store#maxretrywait) control how they are retried. `connectTimeout`, `allowInvalidCerts` and the pool settings work as for a standalone server.

## Sentinel configuration

The `RedisSentinel` variant takes the addresses of the Sentinel nodes in [`urls`](/docs/ref/object/in-memory-store#urls), and the name of the monitored primary in [`serviceName`](/docs/ref/object/in-memory-store#servicename).

A Sentinel deployment involves two kinds of server, and each can require its own credentials. [`authUsername`](/docs/ref/object/in-memory-store#authusername) and [`authSecret`](/docs/ref/object/in-memory-store#authsecret) apply to the Redis data nodes. [`sentinelUsername`](/docs/ref/object/in-memory-store#sentinelusername) and [`sentinelSecret`](/docs/ref/object/in-memory-store#sentinelsecret) apply to the Sentinels themselves. All Sentinel URLs must use the same scheme. As with the other variants, TLS client certificates are not supported.

The following in-memory store connects through three Sentinels, and reads both passwords from environment variables:

```json
{
  "@type": "RedisSentinel",
  "urls": {
    "redis://10.0.0.11:26379": true,
    "redis://10.0.0.12:26379": true,
    "redis://10.0.0.13:26379": true
  },
  "serviceName": "stalwart",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "REDIS_PASSWORD"},
  "sentinelSecret": {"@type": "EnvironmentVariable", "variableName": "SENTINEL_PASSWORD"}
}
```

## Memory limit and eviction policy

Redis keeps all its data in memory. When the `maxmemory` limit is reached, Redis either evicts keys according to its `maxmemory-policy`, or it rejects writes. Stalwart does not check these settings at startup, so they must be chosen when Redis is deployed.

Set `maxmemory`, and size it so that eviction is rare. The `evicted_keys` counter in the output of `INFO stats` shows whether keys are being evicted.

Set `maxmemory-policy` to `volatile-lru` or `volatile-lfu`. These policies evict only keys that carry an expiry, choosing the least recently or least frequently used. Every key that Stalwart writes for its own purposes carries an expiry, so under these policies all of them are candidates for eviction. The locks in active use are the most recently used keys, so they go last. Keys written by expressions and Sieve scripts without an expiry are never evicted.

The other policies have drawbacks for this workload:

- `noeviction` makes a full Redis reject writes. Delivery and background tasks stall because their locks cannot be taken, OAuth sign-ins fail, and greylisting and rate limits stop working. It is acceptable only if `maxmemory` is never reached.
- `volatile-ttl` evicts the keys closest to expiry first, which are the short-lived locks, and keeps the long-lived cache snapshots.
- `allkeys-lru` and `allkeys-lfu` can evict keys that expressions and scripts wrote without an expiry.

Even under the recommended policies, an eviction has a cost, and the cost depends on the key. A lost lock can let two nodes deliver the same message or run the same task. A lost greylisting entry defers the sender once more. A lost authorisation code fails that sign-in, while a lost cache snapshot is only rebuilt from the data store.

Cache swapping adds pressure on memory when it keeps its snapshots in Redis. Each snapshot can reach the size set in the cache's `maxAccountSize`, and the snapshots compete for memory with the locks and counters. A separate Redis deployment for the snapshots avoids this. It is configured as the swap tier's own `store`, with `allkeys-lru`. The in-memory store's Redis then keeps `volatile-lru`, or `noeviction` with generous memory.
