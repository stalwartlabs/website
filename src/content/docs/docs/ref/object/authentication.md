---
title: Authentication
description: Configures authentication settings including password policies and default roles.
custom_edit_url: null
---

# Authentication

Configures authentication settings including password policies and default roles.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General

## Fields


##### `directoryId`

> Type: <code>Id&lt;</code>[<code>Directory</code>](/docs/ref/object/directory)<code>&gt;?</code>
>
> External directory used for authentication, or null to use the internal directory


##### `defaultUserRoleIds`

> Type: <code>Id&lt;</code>[<code>Role</code>](/docs/ref/object/role)<code>&gt;[]</code>
>
> Default roles to assign for accounts.


##### `defaultGroupRoleIds`

> Type: <code>Id&lt;</code>[<code>Role</code>](/docs/ref/object/role)<code>&gt;[]</code>
>
> Default roles to assign for groups.


##### `defaultTenantRoleIds`

> Type: <code>Id&lt;</code>[<code>Role</code>](/docs/ref/object/role)<code>&gt;[]</code> · [enterprise](/docs/server/enterprise)
>
> Default roles to assign for tenants in multi-tenant environments.


##### `defaultAdminRoleIds`

> Type: <code>Id&lt;</code>[<code>Role</code>](/docs/ref/object/role)<code>&gt;[]</code>
>
> Default roles to assign for administrators.


##### `passwordHashAlgorithm`

> Type: [<code>PasswordHashAlgorithm</code>](#passwordhashalgorithm) · default: `"argon2id"`
>
> Password hashing algorithm to use for storing user passwords in the internal directory.


##### `passwordMinLength`

> Type: <code>UnsignedInt</code> · default: `8` · min: 1 · max: 100
>
> Minimum length for user passwords in the internal directory.


##### `passwordMaxLength`

> Type: <code>UnsignedInt</code> · default: `128` · min: 1 · max: 1000
>
> Maximum length for user passwords in the internal directory.


##### `passwordMinStrength`

> Type: [<code>PasswordStrength</code>](#passwordstrength) · default: `"three"`
>
> Minimum strength for user passwords in the internal directory, calculated using the zxcvbn algorithm.


##### `passwordDefaultExpiry`

> Type: <code>Duration?</code>
>
> Default expiration time for user passwords in the internal directory, after which the user will be required to change their password.


##### `maxAppPasswords`

> Type: <code>UnsignedInt?</code> · default: `5` · min: 1
>
> The default maximum number of app passwords a user can create


##### `maxApiKeys`

> Type: <code>UnsignedInt?</code> · default: `5` · min: 1
>
> The default maximum number of API keys a user can create



## JMAP API

The Authentication singleton is available via the `urn:stalwart:jmap` capability.


### `x:Authentication/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysAuthenticationGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Authentication/get",
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



### `x:Authentication/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysAuthenticationUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Authentication/set",
          {
            "update": {
              "singleton": {
                "directoryId": "<Directory id>"
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
stalwart-cli get Authentication
```


### Update

```sh
stalwart-cli update Authentication --field directoryId='<Directory id>'
```



## Enums


### PasswordHashAlgorithm



| Value | Label |
|---|---|
| `argon2id` | Argon2id |
| `bcrypt` | Bcrypt |
| `scrypt` | Scrypt |
| `pbkdf2` | Pbkdf2 |


### PasswordStrength



| Value | Label |
|---|---|
| `zero` | Too guessable: risky password. (guesses < 10^3) |
| `one` | Very guessable: protection from throttled online attacks. (guesses < 10^6) |
| `two` | Somewhat guessable: protection from unthrottled online attacks. (guesses < 10^8) |
| `three` | Safely unguessable: moderate protection from offline slow-hash scenario. (guesses < 10^10) |
| `four` | Very unguessable: strong protection from offline slow-hash scenario. (guesses >= 10^10) |


