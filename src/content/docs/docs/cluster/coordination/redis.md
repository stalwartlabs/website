---
sidebar_position: 5
title: "Redis"
---

Redis is an in-memory data structure store commonly used for caching, session storage, and ephemeral key-value data. Alongside its role as a high-speed cache, Redis provides native publish/subscribe (pub/sub) messaging, which can be used for lightweight inter-process or inter-node communication.

In a Stalwart cluster, Redis can serve as a coordination backend using pub/sub to propagate internal updates between nodes. These include mailbox changes, IMAP IDLE and push notification triggers, blocked IP alerts, and ACME certificate availability. Each node subscribes to the relevant Redis channels and publishes updates as needed, keeping the cluster synchronised in real time.

Redis is useful in small to medium deployments where Kafka or NATS may be too heavy, or where Redis is already in use for transient or ephemeral data. Using Redis for both coordination and ephemeral storage consolidates services and avoids an additional piece of infrastructure.

Redis pub/sub is designed for transient messaging and does not persist messages or guarantee delivery to offline subscribers. For most real-time coordination tasks in modestly sized mail infrastructures this is acceptable, but Redis is not suitable for high-throughput or high-reliability scenarios where message loss is unacceptable.

## Configuration

Redis coordination is configured through the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). Two variants are available:

- `Redis`: a standalone Redis server. The variant carries [`url`](/docs/ref/object/coordinator#url), [`timeout`](/docs/ref/object/coordinator#timeout), and connection-pool fields [`poolMaxConnections`](/docs/ref/object/coordinator#poolmaxconnections), [`poolTimeoutCreate`](/docs/ref/object/coordinator#pooltimeoutcreate), [`poolTimeoutWait`](/docs/ref/object/coordinator#pooltimeoutwait), and [`poolTimeoutRecycle`](/docs/ref/object/coordinator#pooltimeoutrecycle).
- `RedisCluster`: a Redis Cluster deployment. The variant carries [`urls`](/docs/ref/object/coordinator#urls), authentication through [`authUsername`](/docs/ref/object/coordinator#authusername) and [`authSecret`](/docs/ref/object/coordinator#authsecret), retry settings [`maxRetries`](/docs/ref/object/coordinator#maxretries), [`minRetryWait`](/docs/ref/object/coordinator#minretrywait), and [`maxRetryWait`](/docs/ref/object/coordinator#maxretrywait), [`readFromReplicas`](/docs/ref/object/coordinator#readfromreplicas), [`protocolVersion`](/docs/ref/object/coordinator#protocolversion) (`resp2` or `resp3`), and the same connection-pool fields as the standalone variant.

The `Default` variant of Coordinator reuses the Redis connection already configured on the [in-memory store](/docs/storage/in-memory), avoiding the need to maintain a second connection when Redis is already used for ephemeral data. For detailed connection parameters, authentication options, TLS support, and tuning, refer to the [Redis in-memory store](/docs/storage/backends/redis) page.

For example, a standalone Redis coordinator:

```json
{
  "@type": "Redis",
  "url": "redis://redis.example.com:6379",
  "timeout": "10s",
  "poolMaxConnections": 10
}
```

A Redis Cluster coordinator with authentication and retry tuning:

```json
{
  "@type": "RedisCluster",
  "urls": [
    "redis://redis-1.example.com:6379",
    "redis://redis-2.example.com:6379",
    "redis://redis-3.example.com:6379"
  ],
  "timeout": "10s",
  "authUsername": "stalwart",
  "authSecret": {
    "@type": "Value",
    "secret": "redis-password"
  },
  "readFromReplicas": true,
  "protocolVersion": "resp3"
}
```
