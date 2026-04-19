---
title: Coordinator
description: Configures the cluster coordinator for inter-node communication.
custom_edit_url: null
---

# Coordinator

Configures the cluster coordinator for inter-node communication.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator

## Fields

Coordinator is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Disabled"`

Disabled



### `@type: "Default"`

Use in-memory store (Redis only)



### `@type: "Kafka"`

Kafka


##### `brokers`

> Type: <code>String[]</code> · min items: 1
>
> List of Kafka brokers


##### `groupId`

> Type: <code>String</code> · required
>
> Consumer group ID


##### `timeoutMessage`

> Type: <code>Duration</code> · default: `"5s"`
>
> Timeout for message processing


##### `timeoutSession`

> Type: <code>Duration</code> · default: `"5s"`
>
> Timeout for session



### `@type: "Nats"`

NATS


##### `addresses`

> Type: <code>String[]</code> · default: `["127.0.0.1:4444"]` · min items: 1
>
> Address of the NATS server


##### `maxReconnects`

> Type: <code>UnsignedInt?</code>
>
> Maximum number of times to attempt to reconnect to the server


##### `timeoutConnection`

> Type: <code>Duration</code> · default: `"5s"`
>
> Timeout for establishing a connection to the server


##### `timeoutRequest`

> Type: <code>Duration</code> · default: `"10s"`
>
> Timeout for requests to the server


##### `pingInterval`

> Type: <code>Duration</code> · default: `"60s"`
>
> Interval between pings to the server


##### `capacityClient`

> Type: <code>UnsignedInt</code> · default: `2048` · min: 1
>
> By default, Client dispatches op's to the Client onto the channel with capacity of 2048. This option enables overriding it


##### `capacityReadBuffer`

> Type: <code>UnsignedInt</code> · default: `65535` · min: 1
>
> Sets the initial capacity of the read buffer. Which is a buffer used to gather partial protocol messages.


##### `capacitySubscription`

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
> Use TLS to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `credentials`

> Type: [<code>SecretTextOptional</code>](#secrettextoptional) · required
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

The Coordinator singleton is available via the `urn:stalwart:jmap` capability.


### `x:Coordinator/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCoordinatorGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
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


This method requires the `sysCoordinatorUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Coordinator/set",
          {
            "update": {
              "singleton": {
                "id": "id1"
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
stalwart-cli get coordinator
```


### Update

```sh
stalwart-cli update coordinator --field description='Updated'
```



## Nested types


### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SecretTextOptional {#secrettextoptional}

An optional secret text value, or none.


- **`None`**: No secret. No additional fields.
- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretTextValue {#secrettextvalue}

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





## Enums


### RedisProtocol {#redisprotocol}



| Value | Label |
|---|---|
| `resp2` | RESP2 |
| `resp3` | RESP3 |


