---
title: AcmeProvider
description: Defines an ACME provider for automatic TLS certificate management.
custom_edit_url: null
---

# AcmeProvider

Defines an ACME provider for automatic TLS certificate management.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › ACME Providers

## Fields


##### `challengeType`

> Type: [<code>AcmeChallengeType</code>](#acmechallengetype) · default: `"TlsAlpn01"`
>
> The ACME challenge type used to validate domain ownership


##### `contact`

> Type: <code>EmailAddress[]</code> · min items: 1
>
> Contact email address, which is used for important communications regarding your ACME account and certificates


##### `directory`

> Type: <code>Uri</code> · read-only · default: `"https://acme-v02.api.letsencrypt.org/directory"`
>
> The URL of the ACME directory endpoint


##### `eabHmacKey`

> Type: <code>String?</code> · read-only · secret
>
> The External Account Binding (EAB) HMAC key


##### `eabKeyId`

> Type: <code>String?</code> · read-only
>
> The External Account Binding (EAB) key ID


##### `accountKey`

> Type: <code>String</code> · server-set · secret
>
> The account key used to authenticate with the ACME provider.


##### `accountUri`

> Type: <code>Uri</code> · server-set
>
> The account URI returned by the ACME server after registration. Used for CAA record accounturi binding.


##### `renewBefore`

> Type: [<code>AcmeRenewBefore</code>](#acmerenewbefore) · default: `"R23"`
>
> How long before expiration the certificate should be renewed


##### `maxRetries`

> Type: <code>Integer</code> · default: `10`
>
> Maximum number of retry attempts for failed challenges


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this ACME provider belongs to



## JMAP API

The AcmeProvider object is available via the `urn:stalwart:jmap` capability.


### `x:AcmeProvider/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysAcmeProviderGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AcmeProvider/get",
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



### `x:AcmeProvider/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysAcmeProviderCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AcmeProvider/set",
          {
            "create": {
              "new1": {
                "contact": {}
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

This operation requires the `sysAcmeProviderUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AcmeProvider/set",
          {
            "update": {
              "id1": {
                "challengeType": "TlsAlpn01"
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

This operation requires the `sysAcmeProviderDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AcmeProvider/set",
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




### `x:AcmeProvider/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysAcmeProviderQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AcmeProvider/query",
          {
            "filter": {
              "text": "example"
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




The `x:AcmeProvider/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get AcmeProvider id1
```


### Create

```sh
stalwart-cli create AcmeProvider \
  --field 'contact={}'
```


### Query

```sh
stalwart-cli query AcmeProvider
stalwart-cli query AcmeProvider --where text=example
```


### Update

```sh
stalwart-cli update AcmeProvider id1 --field challengeType=TlsAlpn01
```


### Delete

```sh
stalwart-cli delete AcmeProvider --ids id1
```



## Enums


### AcmeChallengeType



| Value | Label |
|---|---|
| `TlsAlpn01` | TLS-ALPN-01 |
| `DnsPersist01` | DNS-PERSIST-01 |
| `Dns01` | DNS-01 |
| `Http01` | HTTP-01 |


### AcmeRenewBefore



| Value | Label |
|---|---|
| `R12` | 1/2 of the remaining time until expiration |
| `R23` | 2/3 of the remaining time until expiration |
| `R34` | 3/4 of the remaining time until expiration |
| `R45` | 4/5 of the remaining time until expiration |


