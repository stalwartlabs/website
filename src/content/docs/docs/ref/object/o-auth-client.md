---
title: OAuthClient
description: Defines a registered OAuth client application.
custom_edit_url: null
---

# OAuthClient

Defines a registered OAuth client application.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › OAuth Clients

## Fields


##### `clientId`

> Type: <code>String</code> · required
>
> Unique identifier of the OAuth client


##### `description`

> Type: <code>String?</code>
>
> Description of the OAuth client


##### `contacts`

> Type: <code>EmailAddress[]</code>
>
> Contact email addresses for the OAuth client


##### `secret`

> Type: <code>String?</code> · secret
>
> Secret value of the OAuth client


##### `createdAt`

> Type: <code>UTCDateTime</code> · read-only · server-set
>
> Creation date of the OAuth client


##### `expiresAt`

> Type: <code>UTCDateTime?</code>
>
> Expiration date of the OAuth client


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this OAuth client belongs to


##### `redirectUris`

> Type: <code>Uri[]</code>
>
> List of redirect URIs for the OAuth client


##### `logo`

> Type: <code>String?</code>
>
> URL or base64-encoded image representing the OAuth client



## JMAP API

The OAuthClient object is available via the `urn:stalwart:jmap` capability.


### `x:OAuthClient/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysOAuthClientGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthClient/get",
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



### `x:OAuthClient/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysOAuthClientCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthClient/set",
          {
            "create": {
              "new1": {
                "clientId": "Example",
                "contacts": {},
                "redirectUris": {}
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

This operation requires the `sysOAuthClientUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthClient/set",
          {
            "update": {
              "id1": {
                "clientId": "updated value"
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

This operation requires the `sysOAuthClientDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthClient/set",
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




### `x:OAuthClient/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysOAuthClientQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthClient/query",
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




The `x:OAuthClient/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `clientId` | text |
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get OAuthClient id1
```


### Create

```sh
stalwart-cli create OAuthClient \
  --field clientId=Example \
  --field 'contacts={}' \
  --field 'redirectUris={}'
```


### Query

```sh
stalwart-cli query OAuthClient
stalwart-cli query OAuthClient --where text=example
```


### Update

```sh
stalwart-cli update OAuthClient id1 --field clientId='updated value'
```


### Delete

```sh
stalwart-cli delete OAuthClient --ids id1
```



