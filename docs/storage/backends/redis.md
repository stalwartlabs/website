---
sidebar_position: 10
---

# Redis

Redis (Remote Dictionary Server) is an in-memory data-structure store used as a database, cache, and message broker. It supports a range of data structures (strings, hashes, lists, sets, sorted sets, bitmaps, hyperloglogs, geospatial indexes, streams), replication, Lua scripting, LRU eviction, transactions, and several levels of on-disk persistence. Valkey, the open-source Redis-compatible fork, is also supported through the same variant.

:::tip Note

Redis is supported only as an [in-memory store](/docs/storage/in-memory). It cannot be used as the primary data store or as a blob store.

:::

## Standalone configuration

The standalone Redis backend is selected by choosing the `Redis` variant on the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><!-- /breadcrumb:InMemoryStore -->). The variant exposes the following fields:

- [`url`](/docs/ref/object/in-memory-store#url): connection URL for the Redis server. Default: `"redis://127.0.0.1"`. The URL may embed a username, password, port, and database index: `redis[s]://[<username>][:<password>@]<hostname>[:port][/<db>]#insecure`. The `#insecure` fragment disables TLS verification when using the `rediss` scheme, which is useful with self-signed certificates.
- [`timeout`](/docs/ref/object/in-memory-store#timeout): maximum time to wait for a response from the Redis server. Default: `"10s"`.
- [`poolMaxConnections`](/docs/ref/object/in-memory-store#poolmaxconnections): maximum number of pooled connections. Default: `10`.
- [`poolTimeoutCreate`](/docs/ref/object/in-memory-store#pooltimeoutcreate), [`poolTimeoutWait`](/docs/ref/object/in-memory-store#pooltimeoutwait), [`poolTimeoutRecycle`](/docs/ref/object/in-memory-store#pooltimeoutrecycle): connection-pool lifecycle timeouts. Default: `"30s"` each.

## Cluster configuration

The Redis Cluster backend is selected by choosing the `RedisCluster` variant on the [InMemoryStore](/docs/ref/object/in-memory-store) object. The variant exposes the following fields:

- [`urls`](/docs/ref/object/in-memory-store#urls): list of connection URLs for the cluster nodes.
- [`authUsername`](/docs/ref/object/in-memory-store#authusername): username used to authenticate. Default: `"stalwart"`.
- [`authSecret`](/docs/ref/object/in-memory-store#authsecret): password or other secret reference used to authenticate (required).
- [`timeout`](/docs/ref/object/in-memory-store#timeout): maximum time to wait for a response from the Redis server. Default: `"10s"`.
- [`maxRetries`](/docs/ref/object/in-memory-store#maxretries), [`minRetryWait`](/docs/ref/object/in-memory-store#minretrywait), [`maxRetryWait`](/docs/ref/object/in-memory-store#maxretrywait): command retry policy controlling the total number of retries and the backoff between attempts.
- [`readFromReplicas`](/docs/ref/object/in-memory-store#readfromreplicas): when `true`, allows reads to be served by replica nodes; when `false`, reads are restricted to the primary. Default: `true`.
- [`protocolVersion`](/docs/ref/object/in-memory-store#protocolversion): Redis protocol version. Supported values are `resp2` and `resp3`. Default: `resp2`.
- The pool lifecycle fields ([`poolMaxConnections`](/docs/ref/object/in-memory-store#poolmaxconnections), [`poolTimeoutCreate`](/docs/ref/object/in-memory-store#pooltimeoutcreate), [`poolTimeoutWait`](/docs/ref/object/in-memory-store#pooltimeoutwait), [`poolTimeoutRecycle`](/docs/ref/object/in-memory-store#pooltimeoutrecycle)) mirror those of the standalone variant.

To distribute load across several independent Redis deployments, combine multiple Redis or Redis Cluster backends through the [Sharded in-memory store](/docs/storage/backends/composite/sharded-in-memory).
