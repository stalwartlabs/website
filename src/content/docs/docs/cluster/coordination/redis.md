---
sidebar_position: 5
title: "Redis"
description: "Use Redis, Valkey, Redis Cluster or Redis Sentinel publish and subscribe messaging as the cluster coordinator."
---

Besides key-value storage, Redis provides publish and subscribe messaging, in which a client publishes a message on a channel and every subscribed client receives it. Stalwart can use this messaging as the [coordinator](/docs/cluster/coordination/) of a cluster. A cluster already requires a Redis-based [in-memory store](/docs/storage/in-memory), so Redis coordination adds no service to operate. Valkey is supported in the same way.

Redis publish and subscribe does not store messages. A node that is not connected when a notification is published therefore never receives it. Stalwart compensates for this as described in [Coordinator outages](/docs/cluster/coordination/#coordinator-outages): a node that reconnects discards its caches and checks its queues.

## Configuration

Redis coordination is selected on the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The main decision is whether coordination shares the Redis deployment of the in-memory store or uses one of its own, and four variants cover the cases.

`Default` reuses the connection of the in-memory store. It has no fields, and it is used when coordination and the in-memory store share one Redis deployment. The in-memory store must then be `Redis`, `RedisCluster`, `RedisSentinel` or, in the Enterprise edition, `Sharded`. With a sharded store, the first member of the store carries the coordination messages.

The other three variants open a separate connection. `Redis` connects to a standalone server given in [`url`](/docs/ref/object/coordinator#url). `RedisCluster` connects to a Redis Cluster given in [`urls`](/docs/ref/object/coordinator#urls), with the credentials in [`authUsername`](/docs/ref/object/coordinator#authusername) and [`authSecret`](/docs/ref/object/coordinator#authsecret). `RedisSentinel` connects through the Sentinels given in [`urls`](/docs/ref/object/coordinator#urls) to the primary named in [`serviceName`](/docs/ref/object/coordinator#servicename).

These explicit variants are used when coordination should run on a different Redis deployment from the in-memory store. They have the same fields as the corresponding in-memory store variants, including [`connectTimeout`](/docs/ref/object/coordinator#connecttimeout), [`allowInvalidCerts`](/docs/ref/object/coordinator#allowinvalidcerts) and the connection pool settings, which are described in [Redis](/docs/storage/backends/redis).

A separate coordinator does not remove the requirement on the in-memory store. Even with an explicit Redis coordinator, the in-memory store must be Redis-based, because the registry refuses a coordinator while the in-memory store is the local default.

The following coordinator reuses the in-memory store's Redis connection:

```json
{
  "@type": "Default"
}
```

The following coordinator connects to a separate Redis Cluster:

```json
{
  "@type": "RedisCluster",
  "urls": {
    "redis://redis-1.example.com:6379": true,
    "redis://redis-2.example.com:6379": true,
    "redis://redis-3.example.com:6379": true
  },
  "authUsername": "stalwart",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "REDIS_PASSWORD"}
}
```
