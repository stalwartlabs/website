---
title: "InMemoryStore"
description: "Configures the in-memory cache and lookup store."
custom_edit_url: null
---

Configures the in-memory cache and lookup store.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="InMemoryStore"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store</span>

## Fields

InMemoryStore is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Default"`

Local in-process store (single node only)



### `@type: "Sharded"`

Sharded Store


##### `stores`

> Type: <code>List&lt;</code>[<code>InMemoryStoreBase</code>](#inmemorystorebase)<code>&gt;</code> · min items: 2
>
> Stores to use for sharding



### `@type: "Redis"`

Redis/Valkey


##### `url`

> Type: <code>Uri</code> · default: `"redis://127.0.0.1"`
>
> URL of the Redis server


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection



### `@type: "RedisCluster"`

Redis Cluster


##### `urls`

> Type: <code>Set&lt;Uri&gt;</code> · default: `{"redis://127.0.0.1":true}`
>
> URL(s) of the Redis server(s)


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `authUsername`

> Type: <code>String?</code>
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `maxRetryWait`

> Type: <code>Duration?</code> · max: 1024 · min: 1
>
> Maximum time to wait between retries


##### `minRetryWait`

> Type: <code>Duration?</code> · max: 1024 · min: 1
>
> Minimum time to wait between retries


##### `maxRetries`

> Type: <code>UnsignedInt?</code> · max: 1024 · min: 1
>
> Number of retries to connect to the Redis cluster


##### `readFromReplicas`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to read from replicas


##### `protocolVersion`

> Type: [<code>RedisProtocol</code>](#redisprotocol) · default: `"resp2"`
>
> Protocol Version


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection



### `@type: "RedisSentinel"`

Redis Sentinel


##### `urls`

> Type: <code>Set&lt;Uri&gt;</code> · default: `{"redis://127.0.0.1:26379":true}`
>
> Address(es) of the Sentinel node(s)


##### `serviceName`

> Type: <code>String</code> · default: `"mymaster"`
>
> Name of the monitored master (service) to query via the Sentinels


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `authUsername`

> Type: <code>String?</code>
>
> Username to connect to the data nodes


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the data nodes


##### `sentinelUsername`

> Type: <code>String?</code>
>
> Username to connect to the Sentinel nodes


##### `sentinelSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the Sentinel nodes


##### `protocolVersion`

> Type: [<code>RedisProtocol</code>](#redisprotocol) · default: `"resp2"`
>
> Protocol Version


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection



### `@type: "Keep"`

Stalwart Keep


##### `hosts`

> Type: <code>Set&lt;String&gt;</code> · default: `{"127.0.0.1:7000":true}` · min items: 1
>
> Stalwart Keep servers to connect to, as host:port pairs. With cluster discovery these are the seeds from which the members are learned; without it only the first one is used


##### `clusterDiscovery`

> Type: <code>Boolean</code> · default: `false`
>
> Learn the members of a Stalwart Keep cluster from the servers listed and place each key on the member that owns it. Requires the cluster secret


##### `secret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Cluster secret, as 32 hexadecimal digits. Required for cluster discovery and for connections without TLS. When set, each request is sent directly to the shard that owns its key


##### `tls`

> Type: [<code>KeepTls</code>](#keeptls) · default: `{"@type":"Disabled"}`
>
> How connections to Stalwart Keep are protected and authenticated


##### `connections`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 1024
>
> Number of connections per server when no cluster secret is set


##### `shardConnections`

> Type: <code>UnsignedInt</code> · default: `2` · min: 1 · max: 8
>
> Number of connections per server shard when the cluster secret is set


##### `streamMode`

> Type: [<code>KeepStreamMode</code>](#keepstreammode) · default: `"everywhere"`
>
> Which servers carry cluster events when this store is the cluster coordinator


##### `connectTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Maximum time to wait for the servers when the store is opened, and for a connection to be established


##### `attemptTimeout`

> Type: <code>Duration</code> · default: `1000`
>
> Maximum time to wait for the reply to one attempt of a request


##### `deadline`

> Type: <code>Duration</code> · default: `5000`
>
> Maximum time a request may take over all its attempts. Must not be shorter than the attempt timeout




## JMAP API

The InMemoryStore singleton is available via the `urn:stalwart:jmap` capability.


### `x:InMemoryStore/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysInMemoryStoreGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:InMemoryStore/get",
          {
            "ids": [
              "singleton"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:InMemoryStore/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysInMemoryStoreUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:InMemoryStore/set",
          {
            "update": {
              "singleton": {
                "description": "updated value"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get InMemoryStore
```


### Update

```sh
stalwart-cli update InMemoryStore --field description='updated value'
```



## Nested types


### InMemoryStoreBase

In-memory store backends.


- **`Redis`**: Redis/Valkey. Carries the fields of [`RedisStore`](#redisstore).
- **`RedisCluster`**: Redis Cluster. Carries the fields of [`RedisClusterStore`](#redisclusterstore).
- **`RedisSentinel`**: Redis Sentinel. Carries the fields of [`RedisSentinelStore`](#redissentinelstore).




#### RedisStore

Redis/Valkey store.



##### `url`

> Type: <code>Uri</code> · default: `"redis://127.0.0.1"`
>
> URL of the Redis server


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection





#### RedisClusterStore

Redis Cluster store.



##### `urls`

> Type: <code>Set&lt;Uri&gt;</code> · default: `{"redis://127.0.0.1":true}`
>
> URL(s) of the Redis server(s)


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `authUsername`

> Type: <code>String?</code>
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `maxRetryWait`

> Type: <code>Duration?</code> · max: 1024 · min: 1
>
> Maximum time to wait between retries


##### `minRetryWait`

> Type: <code>Duration?</code> · max: 1024 · min: 1
>
> Minimum time to wait between retries


##### `maxRetries`

> Type: <code>UnsignedInt?</code> · max: 1024 · min: 1
>
> Number of retries to connect to the Redis cluster


##### `readFromReplicas`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to read from replicas


##### `protocolVersion`

> Type: [<code>RedisProtocol</code>](#redisprotocol) · default: `"resp2"`
>
> Protocol Version


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection





##### SecretKeyOptional

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





#### RedisSentinelStore

Redis Sentinel store.



##### `urls`

> Type: <code>Set&lt;Uri&gt;</code> · default: `{"redis://127.0.0.1:26379":true}`
>
> Address(es) of the Sentinel node(s)


##### `serviceName`

> Type: <code>String</code> · default: `"mymaster"`
>
> Name of the monitored master (service) to query via the Sentinels


##### `connectTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Maximum time to wait for a new connection to the Redis server to be established


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Redis server


##### `authUsername`

> Type: <code>String?</code>
>
> Username to connect to the data nodes


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the data nodes


##### `sentinelUsername`

> Type: <code>String?</code>
>
> Username to connect to the Sentinel nodes


##### `sentinelSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the Sentinel nodes


##### `protocolVersion`

> Type: [<code>RedisProtocol</code>](#redisprotocol) · default: `"resp2"`
>
> Protocol Version


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `30000`
>
> Timeout for recycling a connection





### KeepTls

How connections to Stalwart Keep are protected and authenticated.


- **`Disabled`**: Plaintext, authenticated with the cluster secret. No additional fields.
- **`RawPublicKeys`**: Mutual TLS with raw public keys. Carries the fields of [`KeepTlsRawPublicKeys`](#keeptlsrawpublickeys).
- **`Authority`**: Mutual TLS with certificates from a cluster CA. Carries the fields of [`KeepTlsAuthority`](#keeptlsauthority).




#### KeepTlsRawPublicKeys

Mutual TLS 1.3 with raw public keys. Files are read from each node's filesystem when the store is opened, so every node can have its own key at the same path.



##### `keyPath`

> Type: <code>String</code> · required
>
> Path of this node's private key file, in PEM or DER format


##### `serverKeysPath`

> Type: <code>String</code> · required
>
> Path of the PEM file listing the public keys of the Stalwart Keep servers to accept





#### KeepTlsAuthority

Mutual TLS 1.3 with certificates from a cluster CA. Files are read from each node's filesystem when the store is opened, so every node can have its own certificate at the same path.



##### `caPath`

> Type: <code>String</code> · required
>
> Path of the cluster CA certificate file


##### `certPath`

> Type: <code>String</code> · required
>
> Path of this node's certificate chain file


##### `keyPath`

> Type: <code>String</code> · required
>
> Path of this node's private key file


##### `serverName`

> Type: <code>String?</code>
>
> Name the server certificates must carry. Leave empty to use the host of each server





## Enums


### RedisProtocol



| Value | Label |
|---|---|
| `resp2` | RESP2 |
| `resp3` | RESP3 |


### KeepStreamMode



| Value | Label |
|---|---|
| `everywhere` | Subscribe on every server and publish on one |
| `owner` | Subscribe and publish on one server chosen per cluster |


