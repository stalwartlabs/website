---
title: "Coordinator"
description: "Configures the cluster coordinator for inter-node communication."
custom_edit_url: null
---

Configures the cluster coordinator for inter-node communication.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Coordinator"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator</span>

## Fields

Coordinator is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Disabled"`

Disabled



### `@type: "Default"`

Use in-memory store (Stalwart Keep or Redis only)



### `@type: "Kafka"`

Kafka


##### `hosts`

> Type: <code>Set&lt;String&gt;</code> · min items: 1
>
> Kafka bootstrap brokers, as host:port pairs


##### `groupId`

> Type: <code>String</code> · required
>
> Consumer group ID prefix. Each node joins its own consumer group, named after this prefix followed by a dash and the node ID, so that every node receives every notification


##### `messageTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Timeout for message processing


##### `sessionTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Timeout for session


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the Kafka brokers


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the Kafka brokers



### `@type: "Nats"`

NATS


##### `hosts`

> Type: <code>Set&lt;String&gt;</code> · default: `{"127.0.0.1:4222":true}` · min items: 1
>
> NATS servers to connect to, as host:port pairs


##### `maxReconnects`

> Type: <code>UnsignedInt?</code>
>
> Maximum number of times to attempt to reconnect to the server


##### `connectTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Timeout for establishing a connection to the server


##### `requestTimeout`

> Type: <code>Duration</code> · default: `10000`
>
> Timeout for requests to the server


##### `pingInterval`

> Type: <code>Duration</code> · default: `60000`
>
> Interval between pings to the server


##### `clientCapacity`

> Type: <code>UnsignedInt</code> · default: `2048` · min: 1
>
> By default, Client dispatches op's to the Client onto the channel with capacity of 2048. This option enables overriding it


##### `readBufferCapacity`

> Type: <code>UnsignedInt</code> · default: `65535` · min: 1
>
> Sets the initial capacity of the read buffer. Which is a buffer used to gather partial protocol messages.


##### `subscriptionCapacity`

> Type: <code>UnsignedInt</code> · default: `65536` · min: 1
>
> Sets the capacity for Subscribers. Exceeding it will trigger slow consumer error callback and drop messages.


##### `noEcho`

> Type: <code>Boolean</code> · default: `true`
>
> Disables delivering messages that were published from the same connection.


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the NATS server


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the NATS server


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `credentials`

> Type: [<code>SecretTextOptional</code>](#secrettextoptional) · default: `{"@type":"None"}`
>
> String containing the JWT credentials



### `@type: "Zenoh"`

Eclipse Zenoh


##### `config`

> Type: <code>Text</code> · required
>
> Zenoh configuration string



### `@type: "Redis"`

Redis


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

The Coordinator singleton is available via the `urn:stalwart:jmap` capability.


### `x:Coordinator/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCoordinatorGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Coordinator/get",
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



### `x:Coordinator/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCoordinatorUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Coordinator/set",
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
stalwart-cli get Coordinator
```


### Update

```sh
stalwart-cli update Coordinator --field description='updated value'
```



## Nested types


### SecretKeyOptional

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SecretTextOptional

An optional secret text value, or none.


- **`None`**: No secret. No additional fields.
- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretTextValue

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





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


