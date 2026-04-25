---
title: InMemoryStore
description: Configures the in-memory cache and lookup store.
custom_edit_url: null
---

# InMemoryStore

Configures the in-memory cache and lookup store.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store

## Fields

InMemoryStore is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Default"`

Use data store



### `@type: "Sharded"`

Sharded Store


##### `stores`

> Type: [<code>InMemoryStoreBase</code>](#inmemorystorebase)<code>[]</code> · min items: 2
>
> Stores to use for sharding



### `@type: "Redis"`

Redis/Valkey


##### `url`

> Type: <code>Uri</code> · default: `"redis://127.0.0.1"`
>
> URL of the Redis server


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Connection timeout to the database


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for recycling a connection



### `@type: "RedisCluster"`

Redis Cluster


##### `urls`

> Type: <code>Uri[]</code> · default: `["redis://127.0.0.1"]`
>
> URL(s) of the Redis server(s)


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Connection timeout to the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
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

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for recycling a connection




## JMAP API

The InMemoryStore singleton is available via the `urn:stalwart:jmap` capability.


### `x:InMemoryStore/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysInMemoryStoreGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
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


This method requires the `sysInMemoryStoreUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get InMemoryStore
```


### Update

```sh
stalwart-cli update InMemoryStore --field description='updated value'
```



## Nested types


### InMemoryStoreBase {#inmemorystorebase}

In-memory store backends.


- **`Redis`**: Redis/Valkey. Carries the fields of [`RedisStore`](#redisstore).
- **`RedisCluster`**: Redis Cluster. Carries the fields of [`RedisClusterStore`](#redisclusterstore).




#### RedisStore {#redisstore}

Redis/Valkey store.



##### `url`

> Type: <code>Uri</code> · default: `"redis://127.0.0.1"`
>
> URL of the Redis server


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Connection timeout to the database


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolTimeoutCreate`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for recycling a connection





#### RedisClusterStore {#redisclusterstore}

Redis Cluster store.



##### `urls`

> Type: <code>Uri[]</code> · default: `["redis://127.0.0.1"]`
>
> URL(s) of the Redis server(s)


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Connection timeout to the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
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

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for creating a new connection


##### `poolTimeoutWait`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for waiting for a connection from the pool


##### `poolTimeoutRecycle`

> Type: <code>Duration?</code> · default: `"30s"`
>
> Timeout for recycling a connection





##### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





## Enums


### RedisProtocol {#redisprotocol}



| Value | Label |
|---|---|
| `resp2` | RESP2 |
| `resp3` | RESP3 |


