---
title: "PublicKey"
description: "Defines a public key for email encryption (OpenPGP or S/MIME)."
custom_edit_url: null
---

Defines a public key for email encryption (OpenPGP or S/MIME).

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="PublicKey"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z" /><path d="m14 7 3 3" /><path d="m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814" /></svg> Public Keys</span>

## Fields


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier for the account this public key belongs to


##### `key`

> Type: <code>Text</code> · required
>
> OpenPGP key or S/MIME certificate, armored, PEM, or binary encoded as base64


##### `description`

> Type: <code>String</code> · required
>
> Description of the public key


##### `strictKeyWrapEncoding`

> Type: <code>Boolean</code> · default: `false`
>
> Use the RFC 5753 key wrap encoding for elliptic-curve S/MIME certificates; required by gpgsm and KMail, may not be readable by Microsoft Outlook


##### `authenticatedEncryption`

> Type: <code>Boolean</code> · default: `false`
>
> All mail clients holding the private key can read AES-GCM with RSA-OAEP. Applies to S/MIME RSA and elliptic-curve keys. Apple Mail and Thunderbird ESR cannot read it.


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the public key


##### `expiresAt`

> Type: <code>UTCDateTime?</code> · server-set
>
> Expiration date of the key, taken from the key itself


##### `emailAddresses`

> Type: <code>Set&lt;EmailAddress&gt;</code> · server-set
>
> Email addresses bound to the key, taken from the key itself


##### `kind`

> Type: [<code>PublicKeyKind</code>](#publickeykind)<code>?</code> · server-set
>
> Type of key, taken from the key itself


##### `keyType`

> Type: <code>String?</code> · server-set
>
> Type of key and its encryption algorithms, taken from the key itself


##### `fingerprints`

> Type: <code>Set&lt;String&gt;</code> · server-set
>
> Fingerprints of the keys or certificates used for encryption


##### `capabilities`

> Type: <code>Set&lt;</code>[<code>PublicKeyCapability</code>](#publickeycapability)<code>&gt;</code> · server-set
>
> Encryption features supported by the key


##### `warnings`

> Type: <code>Set&lt;</code>[<code>PublicKeyWarning</code>](#publickeywarning)<code>&gt;</code> · server-set
>
> Issues detected in the key that may affect security or compatibility



## JMAP API

The PublicKey object is available via the `urn:stalwart:jmap` capability.


### `x:PublicKey/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysPublicKeyGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:PublicKey/get",
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



### `x:PublicKey/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the following operations in a single call: create, update, destroy.



#### Create

This operation requires the `sysPublicKeyCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:PublicKey/set",
          {
            "create": {
              "new1": {
                "description": "Example",
                "key": "Example"
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

This operation requires the `sysPublicKeyUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:PublicKey/set",
          {
            "update": {
              "id1": {
                "key": "updated value"
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

This operation requires the `sysPublicKeyDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:PublicKey/set",
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




### `x:PublicKey/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysPublicKeyQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:PublicKey/query",
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




The `x:PublicKey/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `accountId` | id of Account |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get PublicKey id1
```


### Create

```sh
stalwart-cli create PublicKey \
  --field key=Example \
  --field description=Example
```


### Query

```sh
stalwart-cli query PublicKey
stalwart-cli query PublicKey --where accountId=id1
```


### Update

```sh
stalwart-cli update PublicKey id1 --field key='updated value'
```


### Delete

```sh
stalwart-cli delete PublicKey --ids id1
```



## Enums


### PublicKeyKind



| Value | Label |
|---|---|
| `openPgp` | OpenPGP |
| `smime` | S/MIME |


### PublicKeyCapability



| Value | Label |
|---|---|
| `aead` | Authenticated encryption |
| `postQuantum` | Post-quantum |


### PublicKeyWarning



| Value | Label |
|---|---|
| `weakRsa` | RSA key shorter than 3072 bits |
| `noKnownDecryptor` | No common mail client can decrypt messages for this key type |
| `postQuantumOnly` | Only post-quantum keys, some clients cannot decrypt |
| `expiresSoon` | Expires within 14 days |
| `addressMismatch` | None of the key's addresses belong to this account |
| `unusable` | The key cannot be used for encryption |


