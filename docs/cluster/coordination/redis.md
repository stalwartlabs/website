---
sidebar_position: 5
---

# Redis

Redis is an in-memory data structure store commonly used for caching, session storage, and ephemeral key-value data. Alongside its role as a high-speed cache, Redis provides native publish/subscribe (pub/sub) messaging, which can be used for lightweight inter-process or inter-node communication.

In a Stalwart cluster, Redis can serve as a coordination backend using pub/sub to propagate internal updates between nodes. These include mailbox changes, IMAP IDLE and push notification triggers, blocked IP alerts, and ACME certificate availability. Each node subscribes to the relevant Redis channels and publishes updates as needed, keeping the cluster synchronised in real time.

Redis is useful in small to medium deployments where Kafka or NATS may be too heavy, or where Redis is already in use for transient or ephemeral data. Using Redis for both coordination and ephemeral storage consolidates services and avoids an additional piece of infrastructure.

Redis pub/sub is designed for transient messaging and does not persist messages or guarantee delivery to offline subscribers. For most real-time coordination tasks in modestly sized mail infrastructures this is acceptable, but Redis is not suitable for high-throughput or high-reliability scenarios where message loss is unacceptable.

## Configuration

Redis coordination is configured through the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><!-- /breadcrumb:Coordinator -->). Two variants are available:

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
