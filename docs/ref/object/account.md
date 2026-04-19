---
title: Account
description: Defines a user or group account for authentication and email access.
custom_edit_url: null
---

# Account

Defines a user or group account for authentication and email access.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts

## Fields

Account is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "User"`

User account


##### `name`

> Type: <code>EmailLocalPart</code> · required
>
> Name of the account, typically an email address local part.


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain this account belongs to. This is used to determine the email address of the account, which is formed as name@domain.


##### `emailAddress`

> Type: <code>EmailAddress</code> · server-set
>
> Email address for the user account, formed as name@domain.


##### `credentials`

> Type: [<code>Credential</code>](#credential)<code>[]</code>
>
> List of credential objects representing authentication methods for the account


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the account


##### `memberGroupIds`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;[]</code>
>
> List of groups that this account is a member of


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this account belongs to


##### `roles`

> Type: [<code>UserRoles</code>](#userroles) · required
>
> Roles assigned to this user account


##### `permissions`

> Type: [<code>Permissions</code>](#permissions) · required
>
> Permissions assigned to this account


##### `quotas`

> Type: <code>Map&lt;</code>[<code>StorageQuota</code>](#storagequota)<code>, UnsignedInt&gt;</code>
>
> Quotas for different object types within this account


##### `usedDiskQuota`

> Type: <code>Size</code> · server-set
>
> Amount of disk space currently used by this account (bytes)


##### `aliases`

> Type: [<code>EmailAlias</code>](#emailalias)<code>[]</code>
>
> List of email aliases for the account


##### `description`

> Type: <code>String?</code>
>
> Description of the account


##### `locale`

> Type: [<code>Locale</code>](../enum/locale.md) · default: `"en_US"`
>
> Preferred locale for the account


##### `timeZone`

> Type: [<code>TimeZone</code>](../enum/time-zone.md)<code>?</code>
>
> Preferred time zone for the account


##### `encryptionAtRest`

> Type: [<code>EncryptionAtRest</code>](#encryptionatrest) · required
>
> Encryption-at-rest settings for the account



### `@type: "Group"`

Group account


##### `name`

> Type: <code>EmailLocalPart</code> · required
>
> Name of the group, typically an email address local part.


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain this group belongs to. This is used to determine the email address of the group, which is formed as name@domain.


##### `emailAddress`

> Type: <code>EmailAddress</code> · server-set
>
> Email address of the group, formed as name@domain.


##### `description`

> Type: <code>String?</code>
>
> Description of the group


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the account


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this group belongs to


##### `roles`

> Type: [<code>Roles</code>](#roles) · required
>
> Roles assigned to this group


##### `quotas`

> Type: <code>Map&lt;</code>[<code>StorageQuota</code>](#storagequota)<code>, UnsignedInt&gt;</code>
>
> Quotas for different object types within this group


##### `usedDiskQuota`

> Type: <code>Size</code> · server-set
>
> Amount of disk space currently used by this account (bytes)


##### `permissions`

> Type: [<code>Permissions</code>](#permissions) · required
>
> Permissions assigned to this group


##### `aliases`

> Type: [<code>EmailAlias</code>](#emailalias)<code>[]</code>
>
> List of email aliases for the group


##### `locale`

> Type: [<code>Locale</code>](../enum/locale.md) · default: `"en_US"`
>
> Preferred locale for the group


##### `timeZone`

> Type: [<code>TimeZone</code>](../enum/time-zone.md)<code>?</code>
>
> Preferred time zone for the account




## JMAP API

The Account object is available via the `urn:stalwart:jmap` capability.


### `x:Account/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysAccountGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Account/get",
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



### `x:Account/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysAccountCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Account/set",
          {
            "create": {
              "new1": {
                "@type": "User",
                "aliases": [],
                "credentials": [],
                "description": "Example",
                "domainId": "<Domain id>",
                "encryptionAtRest": {
                  "@type": "Disabled"
                },
                "locale": "en_US",
                "memberGroupIds": [],
                "memberTenantId": "<Tenant id>",
                "name": "alice",
                "permissions": {
                  "@type": "Inherit"
                },
                "quotas": {},
                "roles": {
                  "@type": "User"
                },
                "timeZone": "Africa/Abidjan"
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

This operation requires the `sysAccountUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Account/set",
          {
            "update": {
              "id1": {
                "id": "id1"
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

This operation requires the `sysAccountDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Account/set",
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




### `x:Account/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysAccountQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Account/query",
          {
            "filter": {}
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




The `x:Account/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `name` | text |
| `domainId` | id of Domain |
| `memberTenantId` | id of Tenant |
| `memberGroupIds` | id of Account/Group |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get account id1
```


### Create

```sh
stalwart-cli create account/user \
  --field name=alice \
  --field 'domainId=<Domain id>' \
  --field 'credentials=[]' \
  --field 'memberGroupIds=[]' \
  --field 'memberTenantId=<Tenant id>' \
  --field 'roles={"@type":"User"}' \
  --field 'permissions={"@type":"Inherit"}' \
  --field 'quotas={}' \
  --field 'aliases=[]' \
  --field description=Example \
  --field locale=en_US \
  --field timeZone=Africa/Abidjan \
  --field 'encryptionAtRest={"@type":"Disabled"}'
```


### Query

```sh
stalwart-cli query account
```


### Update

```sh
stalwart-cli update account id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete account --ids id1
```



## Nested types


### Credential {#credential}

Defines an authentication credential for an account.


- **`Password`**: Password for authenticating to the account. Carries the fields of [`PasswordCredential`](#passwordcredential).
- **`AppPassword`**: App password for third-party applications. Carries the fields of [`SecondaryCredential`](#secondarycredential).
- **`ApiKey`**: API key for programmatic access. Carries the fields of [`SecondaryCredential`](#secondarycredential).




#### PasswordCredential {#passwordcredential}

Password-based authentication credential.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Secret value of the account


##### `otpAuth`

> Type: <code>Uri?</code> · secret
>
> OTP authentication URI for the account


##### `expiresAt`

> Type: <code>UTCDateTime?</code>
>
> Expiration date of the credential


##### `allowedIps`

> Type: <code>IpMask[]</code>
>
> List of allowed IP addresses or CIDR ranges for this credential





#### SecondaryCredential {#secondarycredential}

App password or API key credential for programmatic access.



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





##### CredentialPermissions {#credentialpermissions}

Permission assignment mode for a credential.


- **`Inherit`**: Same permissions as account. No additional fields.
- **`Disable`**: Disable some permissions. Carries the fields of [`CredentialPermissionsList`](#credentialpermissionslist).
- **`Replace`**: Replace all permissions. Carries the fields of [`CredentialPermissionsList`](#credentialpermissionslist).




##### CredentialPermissionsList {#credentialpermissionslist}

List of permissions to assign to a credential.



##### `permissions`

> Type: [<code>Permission</code>](../permissions.md)<code>[]</code>
>
> List of permissions to assign.





### UserRoles {#userroles}

Role assignment for user accounts.


- **`User`**: User role. No additional fields.
- **`Admin`**: Administrator role. No additional fields.
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





### EmailAlias {#emailalias}

Defines an email alias for an account or mailing list.



##### `enabled`

> Type: <code>Boolean</code> · default: `true`
>
> Whether this email alias is enabled


##### `name`

> Type: <code>EmailLocalPart</code> · required
>
> The local part of the email alias (the part before the @ symbol)


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain of the email alias (the part after the @ symbol).


##### `description`

> Type: <code>String?</code>
>
> Description of the email alias





### EncryptionAtRest {#encryptionatrest}

Encryption-at-rest algorithm selection.


- **`Disabled`**: Disabled. No additional fields.
- **`Aes128`**: AES-128. Carries the fields of [`EncryptionSettings`](#encryptionsettings).
- **`Aes256`**: AES-256. Carries the fields of [`EncryptionSettings`](#encryptionsettings).




#### EncryptionSettings {#encryptionsettings}

Encryption-at-rest settings for an account.



##### `publicKey`

> Type: <code>Id&lt;</code>[<code>PublicKey</code>](./public-key.md)<code>&gt;</code> · required
>
> Public key used for encrypting emails


##### `encryptOnAppend`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to encrypt emails when they are appended to mailboxes


##### `allowSpamTraining`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow training the spam classifier with plaintext emails before encryption





### Roles {#roles}

Role assignment for groups and tenants.


- **`Default`**: Default role. No additional fields.
- **`Custom`**: Custom role. Carries the fields of [`CustomRoles`](#customroles).




## Enums


### StorageQuota {#storagequota}



| Value | Label |
|---|---|
| `maxEmails` | Maximum number of emails |
| `maxMailboxes` | Maximum number of mailboxes |
| `maxEmailSubmissions` | Maximum number of email submissions |
| `maxEmailIdentities` | Maximum number of email identities |
| `maxParticipantIdentities` | Maximum number of participant identities |
| `maxSieveScripts` | Maximum number of Sieve scripts |
| `maxPushSubscriptions` | Maximum number of push subscriptions |
| `maxCalendars` | Maximum number of calendars |
| `maxCalendarEvents` | Maximum number of calendar events |
| `maxCalendarEventNotifications` | Maximum number of calendar event notifications |
| `maxAddressBooks` | Maximum number of address books |
| `maxContactCards` | Maximum number of contact cards |
| `maxFiles` | Maximum number of files |
| `maxFolders` | Maximum number of folders |
| `maxMaskedAddresses` | Maximum number of masked email addresses |
| `maxAppPasswords` | Maximum number of app passwords |
| `maxApiKeys` | Maximum number of API keys |
| `maxPublicKeys` | Maximum number of public keys |
| `maxDiskQuota` | Maximum disk space allocated (bytes) |


