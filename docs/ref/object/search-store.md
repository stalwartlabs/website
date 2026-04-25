---
title: SearchStore
description: Configures the full-text search backend.
custom_edit_url: null
---

# SearchStore

Configures the full-text search backend.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store

## Fields

SearchStore is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Default"`

Use data store



### `@type: "ElasticSearch"`

ElasticSearch


##### `url`

> Type: <code>Uri</code> · required
>
> URL of the ElasticSearch server


##### `numReplicas`

> Type: <code>UnsignedInt</code> · default: `0` · max: 2048
>
> Number of replicas for the index


##### `numShards`

> Type: <code>UnsignedInt</code> · default: `3` · max: 1048576 · min: 1
>
> Number of shards for the index


##### `includeSource`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to index the full source document


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Timeout for HTTP requests


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow invalid SSL certificates


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests



### `@type: "Meilisearch"`

MeiliSearch


##### `url`

> Type: <code>Uri</code> · required
>
> URL of the store


##### `pollInterval`

> Type: <code>Duration</code> · default: `"500ms"`
>
> Interval between polling for task status


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `120` · max: 1024 · min: 1
>
> Number of times to poll for task status before giving up


##### `failOnTimeout`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to fail the operation if the task does not complete within the polling retries


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Timeout for HTTP requests


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow invalid SSL certificates


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests



### `@type: "FoundationDb"`

FoundationDB


##### `clusterFile`

> Type: <code>String?</code>
>
> Path to the cluster file for the FoundationDB cluster


##### `datacenterId`

> Type: <code>String?</code>
>
> Data center ID (optional)


##### `machineId`

> Type: <code>String?</code>
>
> Machine ID in the FoundationDB cluster (optional)


##### `transactionRetryDelay`

> Type: <code>Duration?</code>
>
> Transaction maximum retry delay


##### `transactionRetryLimit`

> Type: <code>UnsignedInt?</code> · max: 1000 · min: 1
>
> Transaction retry limit


##### `transactionTimeout`

> Type: <code>Duration?</code>
>
> Transaction timeout



### `@type: "PostgreSql"`

PostgreSQL


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



### `@type: "MySql"`

mySQL


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




## JMAP API

The SearchStore singleton is available via the `urn:stalwart:jmap` capability.


### `x:SearchStore/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSearchStoreGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SearchStore/get",
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



### `x:SearchStore/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSearchStoreUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SearchStore/set",
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
stalwart-cli get SearchStore
```


### Update

```sh
stalwart-cli update SearchStore --field description='updated value'
```



## Nested types


### HttpAuth {#httpauth}

Defines the HTTP authentication method to use for HTTP requests.


- **`Unauthenticated`**: Anonymous. No additional fields.
- **`Basic`**: Basic Authentication. Carries the fields of [`HttpAuthBasic`](#httpauthbasic).
- **`Bearer`**: Bearer Token. Carries the fields of [`HttpAuthBearer`](#httpauthbearer).




#### HttpAuthBasic {#httpauthbasic}

HTTP Basic authentication credentials.



##### `username`

> Type: <code>String</code> · required
>
> Username for HTTP Basic Authentication


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Password for HTTP Basic Authentication





##### SecretKey {#secretkey}

A secret value provided directly, from an environment variable, or from a file.


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





#### HttpAuthBearer {#httpauthbearer}

HTTP Bearer token authentication.



##### `bearerToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Bearer token for HTTP Bearer Authentication





### PostgreSqlSettings {#postgresqlsettings}

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





#### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




### MySqlSettings {#mysqlsettings}

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





## Enums


### PostgreSqlRecyclingMethod {#postgresqlrecyclingmethod}



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


