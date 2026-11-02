---
title: "ExternalPublicKey"
description: "Public key of a remote recipient used by the encryption gateway, entered manually, kept up to date from a discovery method or learned from received mail."
custom_edit_url: null
---

Public key of a remote recipient used by the encryption gateway, entered manually, kept up to date from a discovery method or learned from received mail.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="ExternalPublicKey"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › External Public Keys</span>, <span data-target="ExternalPublicKey/PendingExternalPublicKey"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Pending Key Changes</span>

## Fields


##### `emailAddress`

> Type: <code>EmailAddress</code> · required
>
> Address the key is used for


##### `key`

> Type: <code>Text?</code>
>
> OpenPGP key or S/MIME certificate, armored, PEM, or binary encoded as base64; an S/MIME certificate may be followed by its intermediate certificates


##### `description`

> Type: <code>String?</code>
>
> Description of the key


##### `status`

> Type: [<code>ExternalPublicKeyStatus</code>](#externalpublickeystatus) · default: `"active"`
>
> Whether the key is used


##### `pinned`

> Type: <code>Boolean</code> · default: `false`
>
> Never replace this key automatically


##### `authenticatedEncryption`

> Type: <code>Boolean</code> · default: `false`
>
> All mail clients holding the private key can read AES-GCM with RSA-OAEP. Applies to S/MIME RSA and elliptic-curve keys. Apple Mail and Thunderbird ESR cannot read it.


##### `source`

> Type: [<code>KeySource</code>](#keysource) · default: `{"@type":"Manual"}`
>
> Where the key comes from; it cannot be changed once the key is created


##### `trust`

> Type: [<code>KeyTrust</code>](#keytrust) · server-set
>
> Trust level derived from the source and certificate validation


##### `kind`

> Type: [<code>PublicKeyKind</code>](#publickeykind)<code>?</code> · server-set
>
> Type of key, taken from the key itself


##### `keyType`

> Type: <code>String?</code> · server-set
>
> Type of key and its encryption algorithms, taken from the key itself


##### `fingerprint`

> Type: <code>String?</code> · server-set
>
> Fingerprint of the key or certificate used for encryption


##### `capabilities`

> Type: <code>Set&lt;</code>[<code>PublicKeyCapability</code>](#publickeycapability)<code>&gt;</code> · server-set
>
> Encryption features supported by the key


##### `smimeCiphers`

> Type: <code>Set&lt;</code>[<code>SmimeCipher</code>](#smimecipher)<code>&gt;</code> · server-set
>
> Content encryption algorithms advertised by the recipient in signed S/MIME messages


##### `smimeOaep`

> Type: <code>Boolean</code> · server-set · default: `false`
>
> Whether the recipient advertised support for RSA-OAEP in signed S/MIME messages


##### `smimeSignedAt`

> Type: <code>UTCDateTime?</code> · server-set
>
> Signing time of the message the S/MIME capabilities were learned from


##### `firstSeen`

> Type: <code>UTCDateTime</code> · server-set
>
> When the key was first stored


##### `lastSeen`

> Type: <code>UTCDateTime</code> · server-set
>
> When the key was last seen in a discovery result or received message


##### `lastChecked`

> Type: <code>UTCDateTime?</code> · server-set
>
> When the key was last confirmed by its discovery method or certificate check


##### `nextCheckAt`

> Type: <code>UTCDateTime?</code> · server-set
>
> When the key is next fetched or checked


##### `expiresAt`

> Type: <code>UTCDateTime?</code> · server-set
>
> When the key stops being used: its own expiration date or, for keys from DNSSEC, the end of the DNS TTL


##### `nextKey`

> Type: <code>Text?</code> · server-set
>
> Replacement key waiting for approval, or for the current key to expire


##### `nextKeyType`

> Type: <code>String?</code> · server-set
>
> Type of the replacement key and its encryption algorithms


##### `nextFingerprint`

> Type: <code>String?</code> · server-set
>
> Fingerprint of the replacement key


##### `nextCapabilities`

> Type: <code>Set&lt;</code>[<code>PublicKeyCapability</code>](#publickeycapability)<code>&gt;</code> · server-set
>
> Encryption features supported by the replacement key


##### `nextExpiresAt`

> Type: <code>UTCDateTime?</code> · server-set
>
> Expiration date of the replacement key


##### `blockedFingerprints`

> Type: <code>Set&lt;String&gt;</code> · server-set
>
> Fingerprints of keys that were revoked or rejected and are not accepted again



## JMAP API

The ExternalPublicKey object is available via the `urn:stalwart:jmap` capability.


### `x:ExternalPublicKey/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysExternalPublicKeyGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ExternalPublicKey/get",
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



### `x:ExternalPublicKey/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the following operations in a single call: create, update, destroy.



#### Create

This operation requires the `sysExternalPublicKeyCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ExternalPublicKey/set",
          {
            "create": {
              "new1": {
                "emailAddress": "user@example.com",
                "source": {
                  "@type": "Manual"
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

This operation requires the `sysExternalPublicKeyUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ExternalPublicKey/set",
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

This operation requires the `sysExternalPublicKeyDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ExternalPublicKey/set",
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




### `x:ExternalPublicKey/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysExternalPublicKeyQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ExternalPublicKey/query",
          {
            "filter": {
              "emailAddress": "example"
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




The `x:ExternalPublicKey/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `emailAddress` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get ExternalPublicKey id1
```


### Create

```sh
stalwart-cli create ExternalPublicKey \
  --field emailAddress=user@example.com \
  --field 'source={"@type":"Manual"}'
```


### Query

```sh
stalwart-cli query ExternalPublicKey
stalwart-cli query ExternalPublicKey --where emailAddress=example
```


### Update

```sh
stalwart-cli update ExternalPublicKey id1 --field key='updated value'
```


### Delete

```sh
stalwart-cli delete ExternalPublicKey --ids id1
```



## Nested types


### KeySource

Where an external public key comes from.


- **`Manual`**: Enter the key manually. No additional fields.
- **`Automatic`**: Keep the key up to date from a discovery method. Carries the fields of [`KeySourceAutomatic`](#keysourceautomatic).
- **`HarvestedSmime`**: Learned from an S/MIME signature. No additional fields.
- **`HarvestedPgp`**: Learned from an OpenPGP signature. No additional fields.
- **`Autocrypt`**: Learned from an Autocrypt header. No additional fields.




#### KeySourceAutomatic

Discovery method that keeps an external public key up to date.



##### `method`

> Type: [<code>KeyDiscoverySource</code>](#keydiscoverysource) · required
>
> Where the key is fetched from





## Enums


### ExternalPublicKeyStatus



| Value | Label |
|---|---|
| `active` | Active |
| `disabled` | Disabled |
| `pendingApproval` | Pending approval (the current key stays in use) |
| `rejected` | Reject the replacement key |


### KeyDiscoverySource



| Value | Label |
|---|---|
| `dnssec` | DNS (OPENPGPKEY and SMIMEA, DNSSEC required) |
| `wkd` | Web Key Directory |
| `vks` | keys.openpgp.org |
| `hkp` | Keyservers (HKP) |


### KeyTrust



| Value | Label |
|---|---|
| `manual` | Manual |
| `verified` | Verified (CA chain or DNSSEC) |
| `discovered` | Fetched from WKD or keys.openpgp.org |
| `harvested` | Harvested from authenticated mail without a CA chain |
| `unverified` | Unverified |


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


### SmimeCipher



| Value | Label |
|---|---|
| `aes128Cbc` | AES-128-CBC |
| `aes192Cbc` | AES-192-CBC |
| `aes256Cbc` | AES-256-CBC |
| `aes128Gcm` | AES-128-GCM |
| `aes192Gcm` | AES-192-GCM |
| `aes256Gcm` | AES-256-GCM |
| `chaCha20Poly1305` | ChaCha20-Poly1305 |


