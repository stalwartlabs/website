---
title: "Passkey"
description: "Passkey for passwordless sign-in to the account."
custom_edit_url: null
---

Passkey for passwordless sign-in to the account.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Passkey"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Passkeys</span>

## Fields


##### `registration`

> Type: [<code>PasskeyRegistration</code>](#passkeyregistration)<code>?</code> · read-only
>
> WebAuthn registration response produced by the authenticator, only accepted on creation


##### `description`

> Type: <code>String</code> · required · max length: 64
>
> Name of the passkey


##### `createdAt`

> Type: <code>UTCDateTime</code> · read-only · server-set
>
> Creation date of the passkey



## JMAP API

The Passkey object is available via the `urn:stalwart:jmap` capability.


### `x:Passkey/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysPasskeyGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Passkey/get",
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



### `x:Passkey/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the following operations in a single call: create, update, destroy.



#### Create

This operation requires the `sysPasskeyCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Passkey/set",
          {
            "create": {
              "new1": {
                "description": "Example"
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

This operation requires the `sysPasskeyUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Passkey/set",
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

This operation requires the `sysPasskeyDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Passkey/set",
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




### `x:Passkey/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysPasskeyQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Passkey/query",
          {
            "filter": {
              "createdAt": "2026-01-01T00:00:00Z"
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




The `x:Passkey/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `createdAt` | date |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Passkey id1
```


### Create

```sh
stalwart-cli create Passkey \
  --field description=Example
```


### Query

```sh
stalwart-cli query Passkey
stalwart-cli query Passkey --where createdAt=2026-01-01T00:00:00Z
```


### Update

```sh
stalwart-cli update Passkey id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete Passkey --ids id1
```



## Nested types


### PasskeyRegistration

WebAuthn registration response produced by the authenticator.



##### `clientDataJson`

> Type: <code>String</code> · required
>
> Client data JSON returned by the authenticator, base64url encoded


##### `attestationObject`

> Type: <code>String</code> · required
>
> Attestation object returned by the authenticator, base64url encoded





