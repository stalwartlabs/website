---
title: AccountSettings
description: Configures default account settings for locale and encryption.
custom_edit_url: null
---

# AccountSettings

Configures default account settings for locale and encryption.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg> Settings

## Fields


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



## JMAP API

The AccountSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:AccountSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysAccountSettingsGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AccountSettings/get",
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



### `x:AccountSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysAccountSettingsUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AccountSettings/set",
          {
            "update": {
              "singleton": {
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get AccountSettings
```


### Update

```sh
stalwart-cli update AccountSettings --field description='updated value'
```



## Nested types


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





