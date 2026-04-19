---
title: Tenant
description: Defines a tenant for multi-tenant environments with isolated resources and quotas.
custom_edit_url: null
---

# Tenant

Defines a tenant for multi-tenant environments with isolated resources and quotas.

:::info[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Tenants

## Fields


##### `name`

> Type: <code>String</code> · required
>
> Name of the tenant


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the tenant


##### `logo`

> Type: <code>String?</code>
>
> URL or base64-encoded image representing the tenant


##### `roles`

> Type: [<code>Roles</code>](#roles) · required
>
> Roles assigned to this tenant


##### `permissions`

> Type: [<code>Permissions</code>](#permissions) · required
>
> Permissions assigned to this tenant


##### `quotas`

> Type: <code>Map&lt;</code>[<code>TenantStorageQuota</code>](#tenantstoragequota)<code>, UnsignedInt&gt;</code>
>
> Quotas for different object types within this tenant


##### `usedDiskQuota`

> Type: <code>Size</code> · server-set
>
> Amount of disk space currently used by this tenant (bytes)



## JMAP API

The Tenant object is available via the `urn:stalwart:jmap` capability.


### `x:Tenant/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysTenantGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tenant/get",
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



### `x:Tenant/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysTenantCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tenant/set",
          {
            "create": {
              "new1": {
                "logo": "Example",
                "name": "Example",
                "permissions": {
                  "@type": "Inherit"
                },
                "quotas": {},
                "roles": {
                  "@type": "Default"
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

This operation requires the `sysTenantUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tenant/set",
          {
            "update": {
              "id1": {
                "name": "updated value"
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

This operation requires the `sysTenantDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tenant/set",
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




### `x:Tenant/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysTenantQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tenant/query",
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




The `x:Tenant/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get tenant id1
```


### Create

```sh
stalwart-cli create tenant \
  --field name=Example \
  --field logo=Example \
  --field 'roles={"@type":"Default"}' \
  --field 'permissions={"@type":"Inherit"}' \
  --field 'quotas={}'
```


### Query

```sh
stalwart-cli query tenant
stalwart-cli query tenant --where text=example
```


### Update

```sh
stalwart-cli update tenant id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete tenant --ids id1
```



## Nested types


### Roles {#roles}

Role assignment for groups and tenants.


- **`Default`**: Default role. No additional fields.
- **`Custom`**: Custom role. Carries the fields of [`CustomRoles`](#customroles).




#### CustomRoles {#customroles}

Custom role assignment with specific role references.



##### `roleIds`

> Type: <code>Id&lt;</code>[<code>Role</code>](./role.md)<code>&gt;[]</code>
>
> List of roles assigned to this principal.





### Permissions {#permissions}

Permission assignment mode for accounts, groups, and tenants.


- **`Inherit`**: Inherited permissions. No additional fields.
- **`Merge`**: Permissions are combined with inherited permissions. Carries the fields of [`PermissionsList`](#permissionslist).
- **`Replace`**: Permissions replace all inherited permissions. Carries the fields of [`PermissionsList`](#permissionslist).




#### PermissionsList {#permissionslist}

Explicit permission grants and denials.



##### `enabledPermissions`

> Type: [<code>Permission</code>](../permissions.md)<code>[]</code>
>
> List of permissions that are explicitly enabled.


##### `disabledPermissions`

> Type: [<code>Permission</code>](../permissions.md)<code>[]</code>
>
> List of permissions that are explicitly disabled, even if they would be inherited through other roles or groups. This takes precedence over enabled permissions.





## Enums


### TenantStorageQuota {#tenantstoragequota}



| Value | Label |
|---|---|
| `maxAccounts` | Maximum number of accounts |
| `maxGroups` | Maximum number of groups |
| `maxDomains` | Maximum number of domains |
| `maxMailingLists` | Maximum number of mailing lists |
| `maxRoles` | Maximum number of roles |
| `maxOauthClients` | Maximum number of OAuth clients |
| `maxDkimKeys` | Maximum number of DKIM keys |
| `maxDnsServers` | Maximum number of DNS servers |
| `maxDirectories` | Maximum number of external directories |
| `maxAcmeProviders` | Maximum number of ACME providers |
| `maxDiskQuota` | Maximum disk space allocated (bytes) |


