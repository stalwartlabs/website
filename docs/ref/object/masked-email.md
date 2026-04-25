---
title: MaskedEmail
description: Defines a masked email address for privacy protection.
custom_edit_url: null
---

# MaskedEmail

Defines a masked email address for privacy protection.

:::info[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><path d="M16 19h6" /></svg> Masked Addresses

## Fields


##### `enabled`

> Type: <code>Boolean</code> · default: `true`
>
> Whether this masked email address is enabled


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · read-only
>
> Identifier for the account this masked email address belongs to


##### `email`

> Type: <code>String</code> · server-set
>
> The masked email address


##### `description`

> Type: <code>String?</code>
>
> Description of the masked email address


##### `forDomain`

> Type: <code>String?</code>
>
> The domain name of the site this address was created for, e.g. "https://example.com". This is intended to be added automatically by password managers.


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> The date-time the email address was created.


##### `createdBy`

> Type: <code>String?</code>
>
> The name of the client that created this email address. This will be set by the server automatically based on the credentials used to authenticate the request, e.g. "ACME Password Manager".


##### `expiresAt`

> Type: <code>UTCDateTime?</code> · read-only
>
> Expiration date of the email address


##### `url`

> Type: <code>String?</code>
>
> A URL pointing back to the integrator's use of this email address, e.g. a custom-uri to open "ACME Password Manager" at the appropriate entry.


##### `emailPrefix`

> Type: <code>EmailLocalPart?</code> · read-only
>
> This is only used on create and otherwise ignored; if supplied, the server-assigned email will start with the given prefix. The string MUST be &lt;= 64 characters in length and MUST only contain characters a-z, 0-9 and _ (underscore).


##### `emailDomain`

> Type: <code>DomainName?</code> · read-only
>
> This is only used on create and otherwise ignored; if supplied, the server-assigned email will end with the given domain.



## JMAP API

The MaskedEmail object is available via the `urn:stalwart:jmap` capability.


### `x:MaskedEmail/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMaskedEmailGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MaskedEmail/get",
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



### `x:MaskedEmail/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMaskedEmailCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MaskedEmail/set",
          {
            "create": {
              "new1": {}
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

This operation requires the `sysMaskedEmailUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MaskedEmail/set",
          {
            "update": {
              "id1": {
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


#### Destroy

This operation requires the `sysMaskedEmailDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MaskedEmail/set",
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




### `x:MaskedEmail/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMaskedEmailQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MaskedEmail/query",
          {
            "filter": {
              "accountId": "id1"
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




The `x:MaskedEmail/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `accountId` | id of Account |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get MaskedEmail id1
```


### Create

```sh
stalwart-cli create MaskedEmail
```


### Query

```sh
stalwart-cli query MaskedEmail
stalwart-cli query MaskedEmail --where accountId=id1
```


### Update

```sh
stalwart-cli update MaskedEmail id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete MaskedEmail --ids id1
```



