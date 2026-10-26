---
title: "Cache"
description: "Configures in-memory cache sizes for data, DNS records, and authorization tokens."
custom_edit_url: null
---

Configures in-memory cache sizes for data, DNS records, and authorization tokens.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Cache"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Cache</span>

## Fields


##### `accessTokens`

> Type: <code>Size</code> · default: `10485760` · min: 2048
>
> Maximum size of the access tokens cache


##### `contacts`

> Type: <code>Size</code> · default: `33554432` · min: 2048
>
> Maximum size of the address books and contacts cache


##### `dnsIpv4`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the IPv4 record cache


##### `dnsIpv6`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the IPv6 record cache


##### `dnsMtaSts`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the MTA-STS record cache


##### `dnsMx`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the MX record cache


##### `dnsPtr`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the PTR record cache


##### `spamLookup`

> Type: <code>Size</code> · default: `6291456` · min: 2048
>
> Maximum size of the spam filter lookup cache, which holds DNSBL results and resolved URL redirects


##### `dnsTlsa`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the TLSA record cache


##### `dnsTxt`

> Type: <code>Size</code> · default: `8388608` · min: 2048
>
> Maximum size of the TXT record cache


##### `events`

> Type: <code>Size</code> · default: `50331648` · min: 2048
>
> Maximum size of the calendar and events cache


##### `scheduling`

> Type: <code>Size</code> · default: `6291456` · min: 2048
>
> Maximum size of the scheduling cache


##### `files`

> Type: <code>Size</code> · default: `25165824` · min: 2048
>
> Maximum size of the file storage data cache


##### `httpAuth`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the HTTP authorization headers cache


##### `messages`

> Type: <code>Size</code> · default: `335544320` · min: 2048
>
> Maximum size of the e-mail data cache


##### `messagesLarge`

> Type: <code>Size</code> · default: `536870912`
>
> Maximum size of the e-mail data cache for accounts too large for the main e-mail data cache. Set it to zero to disable it, so that these accounts are only shared between the requests using them at the same time


##### `messagesLargeTtl`

> Type: <code>Duration</code> · default: `3600000`
>
> Minimum time the e-mail data cache of a large account is kept in memory after it was last used. Once it has passed, the cache is released the next time an e-mail data cache is updated. Set it to zero to keep these caches until the space is needed for another large account


##### `groupwareLarge`

> Type: <code>Size</code> · default: `536870912`
>
> Maximum size of the calendar, contact, file and scheduling caches for accounts too large for their main cache. Set it to zero to disable it, so that these accounts are only shared between the requests using them at the same time


##### `groupwareLargeTtl`

> Type: <code>Duration</code> · default: `3600000`
>
> Minimum time the calendar, contact, file or scheduling cache of a large account is kept in memory after it was last used. Once it has passed, the cache is released the next time one of these caches is updated. Set it to zero to keep these caches until the space is needed for another large account


##### `domains`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the domains cache


##### `domainNames`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the domain name lookup cache


##### `domainNamesNegative`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the domain name lookup negative cache


##### `emailAddresses`

> Type: <code>Size</code> · default: `8388608` · min: 2048
>
> Maximum size of the email addresses lookup cache


##### `emailAddressesNegative`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the email addresses lookup negative cache


##### `accounts`

> Type: <code>Size</code> · default: `16777216` · min: 2048
>
> Maximum size of the accounts cache


##### `roles`

> Type: <code>Size</code> · default: `1048576` · min: 2048
>
> Maximum size of the roles cache


##### `tenants`

> Type: <code>Size</code> · [enterprise](/docs/server/enterprise) · default: `1048576` · min: 2048
>
> Maximum size of the tenants cache


##### `mailingLists`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the mailing lists cache


##### `dkimSignatures`

> Type: <code>Size</code> · default: `8388608` · min: 2048
>
> Maximum size of the DKIM signatures cache


##### `negativeTtl`

> Type: <code>Duration</code> · default: `3600000`
>
> Time-to-live for negative cache entries of domain and account name lookups, and the maximum time a negative DNS answer is cached


##### `directoryRecipients`

> Type: <code>Size</code> · default: `2097152` · min: 2048
>
> Maximum size of the cache that records which recipients were recently resolved against an external directory


##### `directoryRecipientsTtl`

> Type: <code>Duration</code> · default: `600000`
>
> How long a recipient resolved against an external directory is trusted before the directory is queried again


##### `swap`

> Type: [<code>CacheSwap</code>](#cacheswap) · default: `{"@type":"Disabled"}`
>
> Where account cache snapshots are persisted, so a cache miss reloads a snapshot and catches it up from the change log instead of rebuilding the whole cache from the data store



## JMAP API

The Cache singleton is available via the `urn:stalwart:jmap` capability.


### `x:Cache/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCacheGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Cache/get",
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



### `x:Cache/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCacheUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Cache/set",
          {
            "update": {
              "singleton": {
                "accessTokens": 10485760
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
stalwart-cli get Cache
```


### Update

```sh
stalwart-cli update Cache --field accessTokens=10485760
```



## Nested types


### CacheSwap

Where account cache snapshots are persisted.


- **`Disabled`**: Disabled. No additional fields.
- **`LocalFile`**: Node-local file. Carries the fields of [`LocalFileSwap`](#localfileswap).
- **`Redis`**: In-memory store (Redis only). Carries the fields of [`RedisSwap`](#redisswap).
- **`BlobStore`**: Blob store. Carries the fields of [`BlobStoreSwap`](#blobstoreswap).




#### LocalFileSwap

Cache snapshots stored on this node's filesystem.



##### `path`

> Type: <code>String</code> · required
>
> Directory in which cache snapshots are stored


##### `flushChanges`

> Type: <code>UnsignedInt</code> · default: `2000` · min: 1
>
> Minimum number of changes accumulated against an account cache before its snapshot is rewritten. Large accounts need proportionally more: one sixteenth of the messages or resources in the cache


##### `flushInterval`

> Type: <code>Duration</code> · default: `600000`
>
> Shortest interval between two snapshot writes for the same account


##### `maxAccountSize`

> Type: <code>Size</code> · default: `1073741824` · min: 2048
>
> Largest snapshot that will be persisted. Accounts whose snapshot would exceed this are skipped


##### `minAccountSize`

> Type: <code>Size</code> · default: `1048576`
>
> Smallest snapshot worth persisting. Below this the rebuild costs less than the write, so the account is skipped. This is the uncompressed snapshot size, which is close to the account's in-memory cache size and much smaller than its compressed size in the database





#### RedisSwap

Cache snapshots stored in Redis, shared across all nodes in the cluster.



##### `store`

> Type: [<code>RedisSwapStore</code>](#redisswapstore) · default: `{"@type":"Default"}`
>
> Redis deployment in which cache snapshots are stored


##### `chunkSize`

> Type: <code>Size</code> · default: `1048576` · min: 65536
>
> Size of each snapshot chunk written to Redis


##### `retention`

> Type: <code>Duration</code> · default: `604800000`
>
> How long a snapshot survives in Redis without being rewritten before it expires


##### `flushChanges`

> Type: <code>UnsignedInt</code> · default: `2000` · min: 1
>
> Minimum number of changes accumulated against an account cache before its snapshot is rewritten. Large accounts need proportionally more: one sixteenth of the messages or resources in the cache


##### `flushInterval`

> Type: <code>Duration</code> · default: `600000`
>
> Shortest interval between two snapshot writes for the same account


##### `maxAccountSize`

> Type: <code>Size</code> · default: `1073741824` · min: 2048
>
> Largest snapshot that will be persisted. Accounts whose snapshot would exceed this are skipped


##### `minAccountSize`

> Type: <code>Size</code> · default: `1048576`
>
> Smallest snapshot worth persisting. Below this the rebuild costs less than the write, so the account is skipped. This is the uncompressed snapshot size, which is close to the account's in-memory cache size and much smaller than its compressed size in the database





##### RedisSwapStore

Redis deployment used to store cache snapshots.


- **`Default`**: Use in-memory store (Redis only). No additional fields.
- **`Redis`**: Redis/Valkey. Carries the fields of [`RedisStore`](#redisstore).
- **`RedisCluster`**: Redis Cluster. Carries the fields of [`RedisClusterStore`](#redisclusterstore).
- **`RedisSentinel`**: Redis Sentinel. Carries the fields of [`RedisSentinelStore`](#redissentinelstore).




##### RedisStore

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





##### RedisClusterStore

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





##### RedisSentinelStore

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





#### BlobStoreSwap

Cache snapshots stored in a blob store, shared across all nodes in the cluster.



##### `store`

> Type: [<code>BlobSwapStore</code>](#blobswapstore) · default: `{"@type":"Default"}`
>
> Blob store in which cache snapshots are stored


##### `retention`

> Type: <code>Duration</code> · default: `604800000`
>
> How long a snapshot survives in the blob store without being rewritten before the cleanup task removes it


##### `flushChanges`

> Type: <code>UnsignedInt</code> · default: `2000` · min: 1
>
> Minimum number of changes accumulated against an account cache before its snapshot is rewritten. Large accounts need proportionally more: one sixteenth of the messages or resources in the cache


##### `flushInterval`

> Type: <code>Duration</code> · default: `600000`
>
> Shortest interval between two snapshot writes for the same account


##### `maxAccountSize`

> Type: <code>Size</code> · default: `1073741824` · min: 2048
>
> Largest snapshot that will be persisted. Accounts whose snapshot would exceed this are skipped


##### `minAccountSize`

> Type: <code>Size</code> · default: `1048576`
>
> Smallest snapshot worth persisting. Below this the rebuild costs less than the write, so the account is skipped. This is the uncompressed snapshot size, which is close to the account's in-memory cache size and much smaller than its compressed size in the database





##### BlobSwapStore

Blob store used to store cache snapshots.


- **`Default`**: Use blob store. No additional fields.
- **`S3`**: S3-compatible. Carries the fields of [`S3Store`](#s3store).
- **`Azure`**: Azure blob storage. Carries the fields of [`AzureStore`](#azurestore).
- **`FileSystem`**: Filesystem. Carries the fields of [`FileSystemStore`](#filesystemstore).
- **`FoundationDb`**: FoundationDB. Carries the fields of [`FoundationDbStore`](#foundationdbstore).
- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).




##### S3Store

S3-compatible blob store.



##### `region`

> Type: [<code>S3StoreRegion</code>](#s3storeregion) · default: `{"@type":"UsEast1"}`
>
> The S3 region where the bucket resides


##### `bucket`

> Type: <code>String</code> · required
>
> The S3 bucket where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `accessKeyId`

> Type: [<code>PublicStringOptional</code>](#publicstringoptional) · default: `{"@type":"None"}`
>
> Access key ID that identifies the S3 account


##### `secretKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> The secret access key for the S3 account


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Session token for temporary credentials, sent as the x-amz-security-token header


##### `profile`

> Type: <code>String?</code>
>
> Used when retrieving credentials from a shared credentials file. If specified, the server will use the access key ID, secret access key, and session token (if available) associated with the given profile


##### `timeout`

> Type: <code>Duration</code> · default: `30000`
>
> Request timeout for S3 operations


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10
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





##### S3StoreRegion

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




##### S3StoreCustomRegion

Custom S3-compatible endpoint.



##### `url`

> Type: <code>Uri</code> · required
>
> Endpoint URL


##### `region`

> Type: <code>String</code> · required
>
> Region name





##### PublicStringOptional

An optional public value, or none.


- **`None`**: No value. No additional fields.
- **`Value`**: Value. Carries the fields of [`PublicStringValue`](#publicstringvalue).
- **`EnvironmentVariable`**: Value read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Value read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### PublicStringValue

A public value provided directly.



##### `value`

> Type: <code>String</code> · required
>
> Value





##### AzureStore

Azure Blob Storage store.



##### `storageAccount`

> Type: <code>String</code> · required
>
> The Azure Storage Account where blobs (e-mail messages, Sieve scripts, etc.) will be stored


##### `container`

> Type: <code>String</code> · required
>
> The name of the container in the Storage Account


##### `environment`

> Type: [<code>AzureEnvironment</code>](#azureenvironment) · default: `"public"`
>
> Azure cloud environment, used to derive the default blob service URL and the Microsoft Entra ID authority


##### `url`

> Type: <code>Uri?</code>
>
> Custom blob service URL, for private endpoints or the Azurite emulator. When empty, it is derived from the storage account and the cloud environment


##### `auth`

> Type: [<code>AzureAuth</code>](#azureauth) · required
>
> Authentication method used to access the Storage Account


##### `timeout`

> Type: <code>Duration</code> · default: `30000`
>
> Request timeout for Azure Blob Storage operations


##### `maxRetries`

> Type: <code>UnsignedInt</code> · default: `3` · max: 10
>
> The maximum number of times to retry failed requests. Set to 0 to disable retries


##### `keyPrefix`

> Type: <code>String?</code>
>
> A prefix that will be added to the keys of all objects stored in the blob store





##### AzureAuth

Azure Blob Storage authentication method.


- **`SharedKey`**: Shared Key. Carries the fields of [`AzureAuthSharedKey`](#azureauthsharedkey).
- **`SasToken`**: SAS Token. Carries the fields of [`AzureAuthSasToken`](#azureauthsastoken).
- **`ClientSecret`**: Service Principal (Client Secret). Carries the fields of [`AzureAuthClientSecret`](#azureauthclientsecret).
- **`ManagedIdentity`**: Managed Identity. Carries the fields of [`AzureAuthManagedIdentity`](#azureauthmanagedidentity).
- **`WorkloadIdentity`**: Workload Identity. Carries the fields of [`AzureAuthWorkloadIdentity`](#azureauthworkloadidentity).




##### AzureAuthSharedKey

Azure Storage Account shared key authentication.



##### `accountKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The shared key of the Azure Storage Account





##### SecretKey

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### AzureAuthSasToken

Azure shared access signature (SAS) token authentication.



##### `sasToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> SAS token granting read, write and delete permissions on the container. The leading '?' is optional





##### AzureAuthClientSecret

Microsoft Entra ID service principal authentication using a client secret.



##### `tenantId`

> Type: <code>String</code> · required
>
> Microsoft Entra ID tenant ID


##### `clientId`

> Type: <code>String</code> · required
>
> Application (client) ID of the service principal


##### `clientSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Application client secret





##### AzureAuthManagedIdentity

Azure managed identity authentication.



##### `clientId`

> Type: <code>String?</code>
>
> Client ID of a user-assigned managed identity. When empty, the system-assigned identity is used





##### AzureAuthWorkloadIdentity

Microsoft Entra Workload ID authentication using a federated token file.



##### `tenantId`

> Type: <code>String?</code>
>
> Microsoft Entra ID tenant ID. When empty, the AZURE_TENANT_ID environment variable is used


##### `clientId`

> Type: <code>String?</code>
>
> Application (client) ID. When empty, the AZURE_CLIENT_ID environment variable is used


##### `tokenFile`

> Type: <code>String?</code>
>
> Path to the federated token file. When empty, the AZURE_FEDERATED_TOKEN_FILE environment variable is used





##### FileSystemStore

Filesystem blob store.



##### `path`

> Type: <code>String</code> · required
>
> Where to store the data in the server's filesystem


##### `depth`

> Type: <code>UnsignedInt</code> · default: `2` · max: 5
>
> Maximum depth of nested directories





##### FoundationDbStore

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





##### PostgreSqlStore

PostgreSQL data store.



##### `connectTimeout`

> Type: <code>Duration?</code> · default: `15000`
>
> Maximum time to wait for a connection to the database server to be established


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · max: 8192 · min: 1
>
> Maximum number of connections to the store. When unset, 4 per CPU core, between 16 and 32.


##### `poolRecyclingMethod`

> Type: [<code>PostgreSqlRecyclingMethod</code>](#postgresqlrecyclingmethod) · default: `"fast"`
>
> Method to use when recycling connections in the pool


##### `readReplicas`

> Type: <code>List&lt;</code>[<code>PostgreSqlSettings</code>](#postgresqlsettings)<code>&gt;</code> · [enterprise](/docs/server/enterprise)
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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





##### PostgreSqlSettings

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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





##### MySqlStore

MySQL data store.



##### `idleTimeout`

> Type: <code>Duration?</code> · default: `15000`
>
> Time an idle connection may stay open before the server closes it (sets the MySQL wait_timeout session variable)


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

> Type: <code>UnsignedInt?</code> · max: 8192 · min: 1
>
> Maximum number of connections to the store. When unset, 4 per CPU core, between 16 and 32.


##### `poolMinConnections`

> Type: <code>UnsignedInt?</code> · default: `5` · max: 8192 · min: 1
>
> Minimum number of connections to the store


##### `readReplicas`

> Type: <code>List&lt;</code>[<code>MySqlSettings</code>](#mysqlsettings)<code>&gt;</code> · [enterprise](/docs/server/enterprise)
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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store





##### MySqlSettings

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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store





## Enums


### RedisProtocol



| Value | Label |
|---|---|
| `resp2` | RESP2 |
| `resp3` | RESP3 |


### AzureEnvironment



| Value | Label |
|---|---|
| `public` | Public |
| `china` | China |
| `us-government` | US Government |


### PostgreSqlRecyclingMethod



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


