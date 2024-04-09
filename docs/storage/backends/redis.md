---
sidebar_position: 9
---

# Redis

Redis (Remote Dictionary Server) is an in-memory data structure store, used as a database, cache, and message broker. It supports various data structures such as strings, hashes, lists, sets, and sorted sets with range queries, bitmaps, hyperloglogs, geospatial indexes, and streams. Redis has built-in replication, Lua scripting, LRU eviction, transactions, and different levels of on-disk persistence. It's known for its high performance, flexibility, and a wide array of features.

:::tip Note

Redis can only be used as a [lookup store](/docs/storage/lookup) but not for storing the actual data or blobs (binary large objects) within the mail server system.

:::

### Standalone Configuration

The following configuration settings are available for single-node Redis setups, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store, set to `"redis"`.
- `redis-type`: Specifies the type of Redis setup, set to `"single"`.
- `urls`: Configures the connection URL for a single-node Redis setup. It typically includes the Redis scheme, followed by the hostname and port number.
- `timeout`: The maximum amount of time to wait for a response from the Redis server. Specified as a duration, such as `"10s"` for 10 seconds.

In a standalone Redis setup, the `url` parameter is used to specify the connection URL to the Redis server. The URL should include the Redis scheme, followed by the hostname. Optionally, the port, username and password can be included in the URL:

```redis[s]://[<username>][:<password>@]<hostname>[:port][/<db>]#insecure```

The `#insecure` flag can be used to disable TLS verification when connecting to the Redis server using the `rediss` scheme. This is useful when using self-signed certificates or when connecting to a Redis server that uses a certificate signed by an unknown CA.

### Cluster Configuration

The following configuration settings are available for Redis Cluster, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store, set to `"redis"`.
- `redis-type`: Specifies the type of Redis setup, set to `"cluster"`.
- `urls`: Used to configure a Redis cluster by providing an array of connection URLs to different Redis nodes.
- `user`: The username used for authenticating with the Redis server.
- `password`: The password associated with the specified username.
- `timeout`: The maximum amount of time to wait for a response from the Redis server. Specified as a duration, such as `"10s"` for 10 seconds.
- `retry.total`: The number of attempts to retry a command before giving up.
- `retry.max-wait`: The maximum duration to wait between retries. Specified as a duration, such as `"1s"` for 1 second.
- `retry.min-wait`: The minimum duration to wait between retries. Specified as a duration, such as `"500ms"` for 500 milliseconds.
- `read-from-replicas`: A boolean setting that determines whether the client is allowed to read from replica nodes. Set to `false` to restrict read operations to the primary node only.

### Example

Standalone Redis setup:

```toml
[store."redis"]
type = "redis"
redis-type = "single"
url = "redis://my_username:secretpassword@127.0.0.1#insecure"
timeout = "10s"
```

Redis cluster setup:

```toml
[store."redis"]
type = "redis"
redis-type = "cluster"
urls = ["redis://192.168.1.1", "redis://192.168.1.1"] 
user = "my_username"
password = "secretpassword"
timeout = "10s"
read-from-replicas = false

[store."redis".retry]
total = 3
max-wait = "1s"
min-wait = "500ms"
```
