---
title: BlobStore
description: Configures the blob storage backend for messages and files.
custom_edit_url: null
---

# BlobStore

Configures the blob storage backend for messages and files.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store

## Fields

BlobStore is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Default"`

Use data store



### `@type: "Sharded"`

Sharded Blob Store


##### `stores`

> Type: [<code>BlobStoreBase</code>](#blobstorebase)<code>[]</code> · min items: 2
>
> Stores to use for sharding



### `@type: "S3"`

S3-compatible


##### `region`

> Type: [<code>S3StoreRegion</code>](#s3storeregion) · required
>
> The S3 region where the bucket resides


##### `bucket`

> Type: <code>String</code> · required
>
> The S3 bucket where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `accessKey`

> Type: <code>String?</code>
>
> Identifies the S3 account


##### `secretKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The secret key for the S3 account


##### `securityToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Security token for temporary credentials


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Temporary session token for the S3 account


##### `profile`

> Type: <code>String?</code>
>
> Used when retrieving credentials from a shared credentials file. If specified, the server will use the access key ID, secret access key, and session token (if available) associated with the given profile


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Connection timeout to the S3 service


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10 · min: 1
>
> The maximum number of times to retry failed requests. Set to 0 to disable retries


##### `keyPrefix`

> Type: <code>String?</code>
>
> A prefix that will be added to the keys of all objects stored in the blob store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the S3 service


##### `verifyAfterWrite`

> Type: <code>Boolean</code> · default: `true`
>
> After each successful write, verify the object is readable on the backend. Defends against the rare case where an S3-compatible backend returns success but does not actually persist the data. Adds one extra request per write.



### `@type: "Azure"`

Azure blob storage


##### `storageAccount`

> Type: <code>String</code> · required
>
> The Azure Storage Account where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `container`

> Type: <code>String</code> · required
>
> The name of the container in the Storage Account


##### `accessKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The access key for the Azure Storage Account


##### `sasToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> SAS Token, when not using accessKey based authentication


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Connection timeout to the database


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10 · min: 1
>
> The maximum number of times to retry failed requests. Set to 0 to disable retries


##### `keyPrefix`

> Type: <code>String?</code>
>
> A prefix that will be added to the keys of all objects stored in the blob store



### `@type: "FileSystem"`

Filesystem


##### `path`

> Type: <code>String</code> · required
>
> Where to store the data in the server's filesystem


##### `depth`

> Type: <code>UnsignedInt</code> · default: `2` · max: 5
>
> Maximum depth of nested directories



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

The BlobStore singleton is available via the `urn:stalwart:jmap` capability.


### `x:BlobStore/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysBlobStoreGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlobStore/get",
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



### `x:BlobStore/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysBlobStoreUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlobStore/set",
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
stalwart-cli get BlobStore
```


### Update

```sh
stalwart-cli update BlobStore --field description='updated value'
```



## Nested types


### BlobStoreBase {#blobstorebase}

Base blob store backends.


- **`S3`**: S3-compatible. Carries the fields of [`S3Store`](#s3store).
- **`Azure`**: Azure blob storage. Carries the fields of [`AzureStore`](#azurestore).
- **`FileSystem`**: Filesystem. Carries the fields of [`FileSystemStore`](#filesystemstore).
- **`FoundationDb`**: FoundationDB. Carries the fields of [`FoundationDbStore`](#foundationdbstore).
- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).




#### S3Store {#s3store}

S3-compatible blob store.



##### `region`

> Type: [<code>S3StoreRegion</code>](#s3storeregion) · required
>
> The S3 region where the bucket resides


##### `bucket`

> Type: <code>String</code> · required
>
> The S3 bucket where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `accessKey`

> Type: <code>String?</code>
>
> Identifies the S3 account


##### `secretKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The secret key for the S3 account


##### `securityToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Security token for temporary credentials


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Temporary session token for the S3 account


##### `profile`

> Type: <code>String?</code>
>
> Used when retrieving credentials from a shared credentials file. If specified, the server will use the access key ID, secret access key, and session token (if available) associated with the given profile


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Connection timeout to the S3 service


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10 · min: 1
>
> The maximum number of times to retry failed requests. Set to 0 to disable retries


##### `keyPrefix`

> Type: <code>String?</code>
>
> A prefix that will be added to the keys of all objects stored in the blob store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the S3 service


##### `verifyAfterWrite`

> Type: <code>Boolean</code> · default: `true`
>
> After each successful write, verify the object is readable on the backend. Defends against the rare case where an S3-compatible backend returns success but does not actually persist the data. Adds one extra request per write.





##### S3StoreRegion {#s3storeregion}

Predefined S3 regions.


- **`UsEast1`**: us-east-1. No additional fields.
- **`UsEast2`**: us-east-2. No additional fields.
- **`UsWest1`**: us-west-1. No additional fields.
- **`UsWest2`**: us-west-2. No additional fields.
- **`CaCentral1`**: ca-central-1. No additional fields.
- **`AfSouth1`**: af-south-1. No additional fields.
- **`ApEast1`**: ap-east-1. No additional fields.
- **`ApSouth1`**: ap-south-1. No additional fields.
- **`ApNortheast1`**: ap-northeast-1. No additional fields.
- **`ApNortheast2`**: ap-northeast-2. No additional fields.
- **`ApNortheast3`**: ap-northeast-3. No additional fields.
- **`ApSoutheast1`**: ap-southeast-1. No additional fields.
- **`ApSoutheast2`**: ap-southeast-2. No additional fields.
- **`CnNorth1`**: cn-north-1. No additional fields.
- **`CnNorthwest1`**: cn-northwest-1. No additional fields.
- **`EuNorth1`**: eu-north-1. No additional fields.
- **`EuCentral1`**: eu-central-1. No additional fields.
- **`EuCentral2`**: eu-central-2. No additional fields.
- **`EuWest1`**: eu-west-1. No additional fields.
- **`EuWest2`**: eu-west-2. No additional fields.
- **`EuWest3`**: eu-west-3. No additional fields.
- **`IlCentral1`**: il-central-1. No additional fields.
- **`MeSouth1`**: me-south-1. No additional fields.
- **`SaEast1`**: sa-east-1. No additional fields.
- **`DoNyc3`**: Digital Ocean nyc3. No additional fields.
- **`DoAms3`**: Digital Ocean ams3. No additional fields.
- **`DoSgp1`**: Digital Ocean sgp1. No additional fields.
- **`DoFra1`**: Digital Ocean fra1. No additional fields.
- **`Yandex`**: Yandex Object Storage. No additional fields.
- **`WaUsEast1`**: Wasabi us-east-1. No additional fields.
- **`WaUsEast2`**: Wasabi us-east-2. No additional fields.
- **`WaUsCentral1`**: Wasabi us-central-1. No additional fields.
- **`WaUsWest1`**: Wasabi us-west-1. No additional fields.
- **`WaCaCentral1`**: Wasabi ca-central-1. No additional fields.
- **`WaEuCentral1`**: Wasabi eu-central-1. No additional fields.
- **`WaEuCentral2`**: Wasabi eu-central-2. No additional fields.
- **`WaEuWest1`**: Wasabi eu-west-1. No additional fields.
- **`WaEuWest2`**: Wasabi eu-west-2. No additional fields.
- **`WaApNortheast1`**: Wasabi ap-northeast-1. No additional fields.
- **`WaApNortheast2`**: Wasabi ap-northeast-2. No additional fields.
- **`WaApSoutheast1`**: Wasabi ap-southeast-1. No additional fields.
- **`WaApSoutheast2`**: Wasabi ap-southeast-2. No additional fields.
- **`Custom`**: Custom. Carries the fields of [`S3StoreCustomRegion`](#s3storecustomregion).




##### S3StoreCustomRegion {#s3storecustomregion}

Custom S3-compatible endpoint.



##### `customEndpoint`

> Type: <code>Uri</code> · required
>
> Endpoint URL


##### `customRegion`

> Type: <code>String</code> · required
>
> Region name





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





#### AzureStore {#azurestore}

Azure Blob Storage store.



##### `storageAccount`

> Type: <code>String</code> · required
>
> The Azure Storage Account where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `container`

> Type: <code>String</code> · required
>
> The name of the container in the Storage Account


##### `accessKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The access key for the Azure Storage Account


##### `sasToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> SAS Token, when not using accessKey based authentication


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Connection timeout to the database


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10 · min: 1
>
> The maximum number of times to retry failed requests. Set to 0 to disable retries


##### `keyPrefix`

> Type: <code>String?</code>
>
> A prefix that will be added to the keys of all objects stored in the blob store





#### FileSystemStore {#filesystemstore}

Filesystem blob store.



##### `path`

> Type: <code>String</code> · required
>
> Where to store the data in the server's filesystem


##### `depth`

> Type: <code>UnsignedInt</code> · default: `2` · max: 5
>
> Maximum depth of nested directories





#### FoundationDbStore {#foundationdbstore}

FoundationDB data store.



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





## Enums


### PostgreSqlRecyclingMethod {#postgresqlrecyclingmethod}



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


