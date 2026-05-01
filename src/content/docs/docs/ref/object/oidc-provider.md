---
title: OidcProvider
description: Configures the OAuth and OpenID Connect provider settings.
custom_edit_url: null
---

# OidcProvider

Configures the OAuth and OpenID Connect provider settings.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider

## Fields


##### `authCodeMaxAttempts`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1 · max: 1000
>
> Number of failed login attempts before an authorization code is invalidated


##### `anonymousClientRegistration`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow OAuth clients to register without authentication


##### `requireClientRegistration`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to require OAuth client_ids to be registered before they can be used


##### `authCodeExpiry`

> Type: <code>Duration</code> · default: `"10m"`
>
> Expiration time of an authorization code issued by the authorization code flow


##### `refreshTokenExpiry`

> Type: <code>Duration</code> · default: `"30d"`
>
> Expiration time of an OAuth refresh token


##### `refreshTokenRenewal`

> Type: <code>Duration</code> · default: `"4d"`
>
> Remaining time in a refresh token before a new one is issued to the client


##### `accessTokenExpiry`

> Type: <code>Duration</code> · default: `"1h"`
>
> Expiration time of an OAuth access token


##### `userCodeExpiry`

> Type: <code>Duration</code> · default: `"30m"`
>
> Expiration time of a user code issued by the device authentication flow


##### `idTokenExpiry`

> Type: <code>Duration</code> · default: `"15m"`
>
> Expiration time of an OpenID Connect ID token


##### `encryptionKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Encryption key to use for OAuth


##### `signatureAlgorithm`

> Type: [<code>JwtSignatureAlgorithm</code>](#jwtsignaturealgorithm) · default: `"hs256"`
>
> JWT signature algorithm to use for OpenID Connect.


##### `signatureKey`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> Contents of the private key PEM used to sign JWTs for OpenID Connect.



## JMAP API

The OidcProvider singleton is available via the `urn:stalwart:jmap` capability.


### `x:OidcProvider/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysOidcProviderGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OidcProvider/get",
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



### `x:OidcProvider/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysOidcProviderUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OidcProvider/set",
          {
            "update": {
              "singleton": {
                "authCodeMaxAttempts": 3
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
stalwart-cli get OidcProvider
```


### Update

```sh
stalwart-cli update OidcProvider --field authCodeMaxAttempts=3
```



## Nested types


### SecretKey

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SecretText

A secret text value provided directly, from an environment variable, or from a file.


- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretTextValue

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





## Enums


### JwtSignatureAlgorithm



| Value | Label |
|---|---|
| `es256` | ECDSA using P-256 and SHA-256 |
| `es384` | ECDSA using P-384 and SHA-384 |
| `ps256` | RSASSA-PSS using SHA-256 and MGF1 with SHA-256 |
| `ps384` | RSASSA-PSS using SHA-384 and MGF1 with SHA-384 |
| `ps512` | RSASSA-PSS using SHA-512 and MGF1 with SHA-512 |
| `rs256` | RSASSA-PKCS1-v1_5 using SHA-256 |
| `rs384` | RSASSA-PKCS1-v1_5 using SHA-384 |
| `rs512` | RSASSA-PKCS1-v1_5 using SHA-512 |
| `hs256` | HMAC using SHA-256 |
| `hs384` | HMAC using SHA-384 |
| `hs512` | HMAC using SHA-512 |


