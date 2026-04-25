---
title: ApiKey
description: API key credential for programmatic access.
custom_edit_url: null
---

# ApiKey

API key credential for programmatic access.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › API Keys

## Fields


##### `description`

> Type: <code>String</code> · required
>
> Description of the credential


##### `secret`

> Type: <code>String</code> · read-only · server-set · secret
>
> Secret value of the credential


##### `createdAt`

> Type: <code>UTCDateTime</code> · read-only · server-set
>
> Creation date of the credential


##### `expiresAt`

> Type: <code>UTCDateTime?</code>
>
> Expiration date of the credential


##### `permissions`

> Type: [<code>CredentialPermissions</code>](#credentialpermissions) · required
>
> List of permissions assigned to this credential


##### `allowedIps`

> Type: <code>IpMask[]</code>
>
> List of allowed IP addresses or CIDR ranges for this credential



## JMAP API

The ApiKey object is available via the `urn:stalwart:jmap` capability.


### `x:ApiKey/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysApiKeyGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ApiKey/get",
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



### `x:ApiKey/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysApiKeyCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ApiKey/set",
          {
            "create": {
              "new1": {
                "allowedIps": {},
                "description": "Example",
                "permissions": {
                  "@type": "Inherit"
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

This operation requires the `sysApiKeyUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ApiKey/set",
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

This operation requires the `sysApiKeyDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ApiKey/set",
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




### `x:ApiKey/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysApiKeyQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ApiKey/query",
          {
            "filter": {
              "expiresAt": "2026-01-01T00:00:00Z"
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




The `x:ApiKey/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `expiresAt` | date |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get ApiKey id1
```


### Create

```sh
stalwart-cli create ApiKey \
  --field description=Example \
  --field 'permissions={"@type":"Inherit"}' \
  --field 'allowedIps={}'
```


### Query

```sh
stalwart-cli query ApiKey
stalwart-cli query ApiKey --where expiresAt=2026-01-01T00:00:00Z
```


### Update

```sh
stalwart-cli update ApiKey id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete ApiKey --ids id1
```



## Nested types


### CredentialPermissions {#credentialpermissions}

Permission assignment mode for a credential.


- **`Inherit`**: Same permissions as account. No additional fields.
- **`Disable`**: Disable some permissions. Carries the fields of [`CredentialPermissionsList`](#credentialpermissionslist).
- **`Replace`**: Replace all permissions. Carries the fields of [`CredentialPermissionsList`](#credentialpermissionslist).




#### CredentialPermissionsList {#credentialpermissionslist}

List of permissions to assign to a credential.



##### `permissions`

> Type: [<code>Permission</code>](../permissions.md)<code>[]</code>
>
> List of permissions to assign.





