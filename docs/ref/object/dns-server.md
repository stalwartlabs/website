---
title: DnsServer
description: Defines a DNS server for automatic record management.
custom_edit_url: null
---

# DnsServer

Defines a DNS server for automatic record management.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers

## Fields

DnsServer is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Tsig"`

RFC2136 (TSIG)


##### `host`

> Type: <code>IpAddr</code> · required
>
> The IP address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · max: 65535 · min: 1
>
> The port used to communicate with the DNS server


##### `keyName`

> Type: <code>String</code> · required
>
> The key used to authenticate with the DNS server


##### `key`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `protocol`

> Type: [<code>IpProtocol</code>](#ipprotocol) · default: `"udp"`
>
> The protocol used to communicate with the DNS server


##### `tsigAlgorithm`

> Type: [<code>TsigAlgorithm</code>](#tsigalgorithm) · default: `"hmac-sha512"`
>
> The TSIG algorithm used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Sig0"`

RFC2136 (SIG0)


##### `host`

> Type: <code>IpAddr</code> · required
>
> The IP address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · max: 65535 · min: 1
>
> The port used to communicate with the DNS server


##### `publicKey`

> Type: <code>String</code> · required
>
> The public key used to authenticate with the DNS server


##### `key`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> The secret or token used to authenticate with the DNS server


##### `signerName`

> Type: <code>String</code> · required
>
> The signer name used in the SIG0 records


##### `protocol`

> Type: [<code>IpProtocol</code>](#ipprotocol) · default: `"udp"`
>
> The protocol used to communicate with the DNS server


##### `sig0Algorithm`

> Type: [<code>Sig0Algorithm</code>](#sig0algorithm) · default: `"ed25519"`
>
> The SIG0 algorithm used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Cloudflare"`

Cloudflare


##### `email`

> Type: <code>String?</code>
>
> Optional account email to authenticate with Cloudflare


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DigitalOcean"`

DigitalOcean


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DeSEC"`

DeSEC


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ovh"`

OVH


##### `applicationKey`

> Type: <code>String</code> · required
>
> The application key used to authenticate with the OVH DNS server


##### `applicationSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The application secret used to authenticate with the OVH DNS server


##### `consumerKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The consumer key used to authenticate with the OVH DNS server


##### `ovhEndpoint`

> Type: [<code>OvhEndpoint</code>](#ovhendpoint) · default: `"ovh-eu"`
>
> Which OVH endpoint to use


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Bunny"`

BunnyDNS


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Porkbun"`

Porkbun


##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Porkbun


##### `secretApiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret API key used to authenticate with Porkbun


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Dnsimple"`

DNSimple


##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The authentication token used to authenticate with DNSimple


##### `accountIdentifier`

> Type: <code>String</code> · required
>
> The account ID used to authenticate with DNSimple


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Spaceship"`

Spaceship


##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Spaceship


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Route53"`

AWS Route53


##### `accessKeyId`

> Type: <code>String</code> · required
>
> The AWS access key ID


##### `secretAccessKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The AWS secret access key


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional session token for temporary AWS credentials


##### `region`

> Type: <code>String</code> · default: `"us-east-1"`
>
> The AWS region


##### `hostedZoneId`

> Type: <code>String?</code>
>
> Hosted zone ID to use (resolved automatically by name if not set)


##### `privateZoneOnly`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "GoogleCloudDns"`

Google Cloud DNS


##### `serviceAccountJson`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> Service account JSON credentials used to authenticate with Google Cloud


##### `projectId`

> Type: <code>String</code> · required
>
> The Google Cloud project ID that owns the managed zone


##### `managedZone`

> Type: <code>String?</code>
>
> Managed zone name (resolved automatically by longest suffix match if not set)


##### `privateZone`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `impersonateServiceAccount`

> Type: <code>String?</code>
>
> Optional service account email to impersonate


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)




## JMAP API

The DnsServer object is available via the `urn:stalwart:jmap` capability.


### `x:DnsServer/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDnsServerGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/get",
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



### `x:DnsServer/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDnsServerCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
          {
            "create": {
              "new1": {
                "@type": "Tsig",
                "description": "Example",
                "host": "192.0.2.1",
                "key": {
                  "@type": "Value",
                  "secret": "Example"
                },
                "keyName": "Example"
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

This operation requires the `sysDnsServerUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
          {
            "update": {
              "id1": {
                "keyName": "updated value"
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

This operation requires the `sysDnsServerDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
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




### `x:DnsServer/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDnsServerQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/query",
          {
            "filter": {
              "memberTenantId": "id1"
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




The `x:DnsServer/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get DnsServer id1
```


### Create

```sh
stalwart-cli create DnsServer/Tsig \
  --field host=192.0.2.1 \
  --field keyName=Example \
  --field 'key={"@type":"Value","secret":"Example"}' \
  --field description=Example
```


### Query

```sh
stalwart-cli query DnsServer
stalwart-cli query DnsServer --where memberTenantId=id1
```


### Update

```sh
stalwart-cli update DnsServer id1 --field keyName='updated value'
```


### Delete

```sh
stalwart-cli delete DnsServer --ids id1
```



## Nested types


### SecretKey {#secretkey}

A secret value provided directly, from an environment variable, or from a file.


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





### SecretText {#secrettext}

A secret text value provided directly, from an environment variable, or from a file.


- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretTextValue {#secrettextvalue}

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




## Enums


### IpProtocol {#ipprotocol}



| Value | Label |
|---|---|
| `udp` | UDP |
| `tcp` | TCP |


### TsigAlgorithm {#tsigalgorithm}



| Value | Label |
|---|---|
| `hmac-md5` | HMAC-MD5 |
| `gss` | GSS |
| `hmac-sha1` | HMAC-SHA1 |
| `hmac-sha224` | HMAC-SHA224 |
| `hmac-sha256` | HMAC-SHA256 |
| `hmac-sha256-128` | HMAC-SHA256-128 |
| `hmac-sha384` | HMAC-SHA384 |
| `hmac-sha384-192` | HMAC-SHA384-192 |
| `hmac-sha512` | HMAC-SHA512 |
| `hmac-sha512-256` | HMAC-SHA512-256 |


### Sig0Algorithm {#sig0algorithm}



| Value | Label |
|---|---|
| `ecdsa-p256-sha256` | ECDSA-P256-SHA256 |
| `ecdsa-p384-sha384` | ECDSA-P384-SHA384 |
| `ed25519` | ED25519 |


### OvhEndpoint {#ovhendpoint}



| Value | Label |
|---|---|
| `ovh-eu` | OVH EU |
| `ovh-ca` | OVH CA |
| `kimsufi-eu` | Kimsufi EU |
| `kimsufi-ca` | Kimsufi CA |
| `soyoustart-eu` | Soyoustart EU |
| `soyoustart-ca` | Soyoustart CA |


