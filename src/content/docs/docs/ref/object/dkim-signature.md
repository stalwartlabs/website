---
title: DkimSignature
description: Defines a DKIM signature used to sign outgoing email messages.
custom_edit_url: null
---

# DkimSignature

Defines a DKIM signature used to sign outgoing email messages.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures

## Fields

DkimSignature is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Dkim1Ed25519Sha256"`

DKIM1 - Ed25519 SHA-256


##### `auid`

> Type: <code>String?</code>
>
> Agent or user identifier included in the DKIM signature header


##### `canonicalization`

> Type: [<code>DkimCanonicalization</code>](#dkimcanonicalization) · default: `"relaxed/relaxed"`
>
> Canonicalization algorithm applied to the headers and body before signing


##### `expire`

> Type: <code>Duration?</code>
>
> Time after which this DKIM signature expires and should no longer be considered valid


##### `headers`

> Type: <code>String[]</code> · default: `["From","To","Date","Subject","Message-ID"]`
>
> List of message headers to include in the DKIM signature


##### `privateKey`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> PEM-encoded private key used to sign outgoing messages


##### `publicKey`

> Type: <code>Text</code> · server-set
>
> PEM-encoded public key used to verify signatures, derived from the private key


##### `report`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to request failure reports when signature verification fails on the recipient side


##### `thirdParty`

> Type: <code>String?</code>
>
> Authorized third-party signature value, used when signing on behalf of another domain


##### `thirdPartyHash`

> Type: [<code>DkimHash</code>](#dkimhash)<code>?</code>
>
> Hashing algorithm used to verify the authorized third-party signature DNS record


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain this DKIM signature is associated with


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this DKIM signature belongs to


##### `selector`

> Type: <code>String</code> · required
>
> Selector used to locate the DKIM public key in DNS


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the DKIM signature


##### `nextTransitionAt`

> Type: <code>UTCDateTime?</code>
>
> Date when this key will transition to the next rotation stage, or null if no transition is scheduled


##### `stage`

> Type: [<code>DkimRotationStage</code>](#dkimrotationstage) · default: `"active"`
>
> Current stage of the DKIM key in its rotation lifecycle



### `@type: "Dkim1RsaSha256"`

DKIM1 - RSA SHA-256


##### `auid`

> Type: <code>String?</code>
>
> Agent or user identifier included in the DKIM signature header


##### `canonicalization`

> Type: [<code>DkimCanonicalization</code>](#dkimcanonicalization) · default: `"relaxed/relaxed"`
>
> Canonicalization algorithm applied to the headers and body before signing


##### `expire`

> Type: <code>Duration?</code>
>
> Time after which this DKIM signature expires and should no longer be considered valid


##### `headers`

> Type: <code>String[]</code> · default: `["From","To","Date","Subject","Message-ID"]`
>
> List of message headers to include in the DKIM signature


##### `privateKey`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> PEM-encoded private key used to sign outgoing messages


##### `publicKey`

> Type: <code>Text</code> · server-set
>
> PEM-encoded public key used to verify signatures, derived from the private key


##### `report`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to request failure reports when signature verification fails on the recipient side


##### `thirdParty`

> Type: <code>String?</code>
>
> Authorized third-party signature value, used when signing on behalf of another domain


##### `thirdPartyHash`

> Type: [<code>DkimHash</code>](#dkimhash)<code>?</code>
>
> Hashing algorithm used to verify the authorized third-party signature DNS record


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain this DKIM signature is associated with


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this DKIM signature belongs to


##### `selector`

> Type: <code>String</code> · required
>
> Selector used to locate the DKIM public key in DNS


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the DKIM signature


##### `nextTransitionAt`

> Type: <code>UTCDateTime?</code>
>
> Date when this key will transition to the next rotation stage, or null if no transition is scheduled


##### `stage`

> Type: [<code>DkimRotationStage</code>](#dkimrotationstage) · default: `"active"`
>
> Current stage of the DKIM key in its rotation lifecycle




## JMAP API

The DkimSignature object is available via the `urn:stalwart:jmap` capability.


### `x:DkimSignature/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDkimSignatureGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimSignature/get",
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



### `x:DkimSignature/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDkimSignatureCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimSignature/set",
          {
            "create": {
              "new1": {
                "@type": "Dkim1Ed25519Sha256",
                "domainId": "<Domain id>",
                "privateKey": {
                  "@type": "Text",
                  "secret": "Example"
                },
                "selector": "Example"
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

This operation requires the `sysDkimSignatureUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimSignature/set",
          {
            "update": {
              "id1": {
                "auid": "updated value"
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

This operation requires the `sysDkimSignatureDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimSignature/set",
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




### `x:DkimSignature/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDkimSignatureQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimSignature/query",
          {
            "filter": {
              "domainId": "id1"
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




The `x:DkimSignature/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `domainId` | id of Domain |
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get DkimSignature id1
```


### Create

```sh
stalwart-cli create DkimSignature/Dkim1Ed25519Sha256 \
  --field 'privateKey={"@type":"Text","secret":"Example"}' \
  --field 'domainId=<Domain id>' \
  --field selector=Example
```


### Query

```sh
stalwart-cli query DkimSignature
stalwart-cli query DkimSignature --where domainId=id1
```


### Update

```sh
stalwart-cli update DkimSignature id1 --field auid='updated value'
```


### Delete

```sh
stalwart-cli delete DkimSignature --ids id1
```



## Nested types


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





## Enums


### DkimCanonicalization {#dkimcanonicalization}



| Value | Label |
|---|---|
| `relaxed/relaxed` | Relaxed/Relaxed |
| `simple/simple` | Simple/Simple |
| `relaxed/simple` | Relaxed/Simple |
| `simple/relaxed` | Simple/Relaxed |


### DkimHash {#dkimhash}



| Value | Label |
|---|---|
| `sha256` | SHA-256 |
| `sha1` | SHA-1 |


### DkimRotationStage {#dkimrotationstage}



| Value | Label |
|---|---|
| `active` | DKIM key is published in DNS and used for signing |
| `pending` | DKIM key is scheduled for DNS publication and not yet active |
| `retiring` | DKIM key has been superseded by a new key but still published in DNS |
| `retired` | DKIM key has been removed from DNS and is pending deletion |


