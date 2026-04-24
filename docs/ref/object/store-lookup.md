---
title: StoreLookup
description: Defines an external store used for lookups.
custom_edit_url: null
---

# StoreLookup

Defines an external store used for lookups.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg> Lookups › Store Lookups

## Fields


##### `namespace`

> Type: <code>String</code> · read-only
>
> Unique identifier for this store when used in lookups


##### `store`

> Type: [<code>LookupStore</code>](#lookupstore) · required
>
> Store to use for lookups



## JMAP API

The StoreLookup object is available via the `urn:stalwart:jmap` capability.


### `x:StoreLookup/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysStoreLookupGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:StoreLookup/get",
          {
            "ids": [
              "id1"
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



### `x:StoreLookup/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysStoreLookupCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:StoreLookup/set",
          {
            "create": {
              "new1": {
                "store": {
                  "@type": "PostgreSql",
                  "allowInvalidCerts": false,
                  "authSecret": {
                    "@type": "None"
                  },
                  "authUsername": "stalwart",
                  "database": "stalwart",
                  "host": "Example",
                  "options": "Example",
                  "poolMaxConnections": 10,
                  "poolRecyclingMethod": "fast",
                  "port": 5432,
                  "readReplicas": [],
                  "timeout": "15s",
                  "useTls": false
                }
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


#### Update

This operation requires the `sysStoreLookupUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:StoreLookup/set",
          {
            "update": {
              "id1": {
                "store": {
                  "@type": "PostgreSql",
                  "allowInvalidCerts": false,
                  "authSecret": {
                    "@type": "None"
                  },
                  "authUsername": "stalwart",
                  "database": "stalwart",
                  "host": "Example",
                  "options": "Example",
                  "poolMaxConnections": 10,
                  "poolRecyclingMethod": "fast",
                  "port": 5432,
                  "readReplicas": [],
                  "timeout": "15s",
                  "useTls": false
                }
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


#### Destroy

This operation requires the `sysStoreLookupDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:StoreLookup/set",
          {
            "destroy": [
              "id1"
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




### `x:StoreLookup/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysStoreLookupQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:StoreLookup/query",
          {
            "filter": {}
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
stalwart-cli get store-lookup id1
```


### Create

```sh
stalwart-cli create store-lookup \
  --field 'store={"@type":"PostgreSql","allowInvalidCerts":false,"authSecret":{"@type":"None"},"authUsername":"stalwart","database":"stalwart","host":"Example","options":"Example","poolMaxConnections":10,"poolRecyclingMethod":"fast","port":5432,"readReplicas":[],"timeout":"15s","useTls":false}'
```


### Query

```sh
stalwart-cli query store-lookup
```


### Update

```sh
stalwart-cli update store-lookup id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete store-lookup --ids id1
```



## Nested types


### LookupStore {#lookupstore}

Lookup store backends.


- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).
- **`Sqlite`**: SQLite. Carries the fields of [`SqliteStore`](#sqlitestore).
- **`Sharded`**: Sharded Lookup Store. Carries the fields of [`ShardedInMemoryStore`](#shardedinmemorystore).
- **`Redis`**: Redis/Valkey. Carries the fields of [`RedisStore`](#redisstore).
- **`RedisCluster`**: Redis Cluster. Carries the fields of [`RedisClusterStore`](#redisclusterstore).




#### PostgreSqlStore {#postgresqlstore}

PostgreSQL data store.



##### `timeout`

> Type: <code>Duration?</code> · default: `"15s"`
>
> Connection timeout to the database


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolRecyclingMethod`

> Type: [<code>PostgreSqlRecyclingMethod</code>](#postgresqlrecyclingmethod) · default: `"fast"`
>
> Method to use when recycling connections in the pool


##### `readReplicas`

> Type: [<code>PostgreSqlSettings</code>](#postgresqlsettings)<code>[]</code> · [enterprise](/docs/server/enterprise)
>
> List of read replicas for the store


##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `5432` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





##### PostgreSqlSettings {#postgresqlsettings}

PostgreSQL connection settings.



##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `5432` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





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





#### MySqlStore {#mysqlstore}

MySQL data store.



##### `timeout`

> Type: <code>Duration?</code> · default: `"15s"`
>
> Connection timeout to the database


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `maxAllowedPacket`

> Type: <code>UnsignedInt?</code> · max: 1073741824 · min: 1024
>
> Maximum size of a packet in bytes


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolMinConnections`

> Type: <code>UnsignedInt?</code> · default: `5` · max: 8192 · min: 1
>
> Minimum number of connections to the store


##### `readReplicas`

> Type: [<code>MySqlSettings</code>](#mysqlsettings)<code>[]</code> · [enterprise](/docs/server/enterprise)
>
> List of read replicas for the store


##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `3306` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store





##### MySqlSettings {#mysqlsettings}

MySQL connection settings.



##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `3306` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store





#### SqliteStore {#sqlitestore}

SQLite embedded data store.



##### `path`

> Type: <code>String</code> · required
>
> Path to the SQLite data directory


##### `poolWorkers`

> Type: <code>UnsignedInt?</code> · max: 64 · min: 1
>
> Number of worker threads to use for the store, defaults to the number of cores


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store





#### ShardedInMemoryStore {#shardedinmemorystore}

Sharded in-memory store configuration.



##### `stores`

> Type: [<code>InMemoryStoreBase</code>](#inmemorystorebase)<code>[]</code> · min items: 2
>
> Stores to use for sharding





##### InMemoryStoreBase {#inmemorystorebase}

In-memory store backends.


- **`Redis`**: Redis/Valkey. Carries the fields of [`RedisStore`](#redisstore).
- **`RedisCluster`**: Redis Cluster. Carries the fields of [`RedisClusterStore`](#redisclusterstore).




##### RedisStore {#redisstore}

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





##### RedisClusterStore {#redisclusterstore}

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





## Enums


### PostgreSqlRecyclingMethod {#postgresqlrecyclingmethod}



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


### RedisProtocol {#redisprotocol}



| Value | Label |
|---|---|
| `resp2` | RESP2 |
| `resp3` | RESP3 |


