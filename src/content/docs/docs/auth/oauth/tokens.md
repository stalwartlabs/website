---
sidebar_position: 3
title: "Tokens"
---

OAuth tokens are the mechanism by which OAuth 2.0 grants access to protected resources. Instead of sending a username and password on every request, clients present tokens issued by the authorization server; each token has a defined scope and lifespan, which bounds what a compromised token can do.

OAuth defines two primary token types: access tokens and refresh tokens. Each has a distinct role in the authorization process.

## Access Tokens

An access token is a short-lived token issued by the authorization server (Stalwart's built-in OAuth server) after a successful authorization request. The client presents the token to the resource server, which validates it before serving the request.

Access tokens have deliberately short lifetimes (typically minutes to a few hours) to limit the impact of a leak. When the token expires, the client must obtain a new one, either by presenting a refresh token or by repeating the authorization flow.

Access tokens are issued with a scope that determines which resources and actions the token grants. A token issued for message submission, for example, does not authorise reading a user's inbox or changing their account settings.

## Refresh Tokens

Refresh tokens let the client obtain a new access token without involving the user again. When the current access token expires, the client presents its refresh token to the authorization server and receives a new access token.

Refresh tokens live longer than access tokens and are therefore more sensitive, because anyone holding a valid refresh token can mint new access tokens. They should be stored securely by the client and must not be shared. Depending on server policy, each use of a refresh token may either return the same refresh token or a rotated one; Stalwart rotates the refresh token when the remaining lifetime drops below a configured threshold.

Refresh tokens are typically issued alongside access tokens during the initial authorization flow.

## Configuration

OAuth token behaviour is configured through the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->).

### Encryption

Tokens issued by Stalwart are cryptographically signed using a construction inspired by [PASETO security tokens](https://paseto.io/):

- An encryption key is derived via [BLAKE3](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3), combining the principal encryption key configured through [`encryptionKey`](/docs/ref/object/oidc-provider#encryptionkey) with the device id, the expiration time, account details, and an [Argon2](https://en.wikipedia.org/wiki/Argon2) hash of the account's password.
- A nonce is derived via BLAKE3 from the user details and the token's expiration time.
- The derived key and nonce are used to seal the token with [AES-256-GCM-SIV](https://www.rfc-editor.org/rfc/rfc8452).

The [`encryptionKey`](/docs/ref/object/oidc-provider#encryptionkey) field accepts a `SecretKey` variant: a direct value, a reference to an environment variable, or a reference to a file. Reading the key from a file or environment variable avoids committing it to configuration objects.

A 512-bit key is generated during installation. To replace it, generate a new key (for example with `LC_ALL=C tr -dc '[:alpha:]' < /dev/urandom | head -c 64` on Linux) and update `encryptionKey`, for example:

```json
{
  "encryptionKey": {
    "@type": "Value",
    "secret": "sDRvvROsJmRUnjIfcUiDUSaAxdQpfixuLvdwlSffptaxUnSQZALenZSYUPQQByUI"
  }
}
```

To read the key from an environment variable such as `OAUTH_KEY`:

```json
{
  "encryptionKey": {
    "@type": "EnvironmentVariable",
    "variableName": "OAUTH_KEY"
  }
}
```

:::tip Be aware that

- Changing the encryption key immediately revokes every existing OAuth token.
- In clustered deployments, every node must use exactly the same encryption key. Tokens issued on one node are not accepted on another unless the key matches.
- The encryption key must be kept private. Reading it from an environment variable or a file prevents it from being stored alongside other configuration.

:::

### Expiration

Token and code lifetimes are configured through the following fields on the [OidcProvider](/docs/ref/object/oidc-provider) singleton:

- [`accessTokenExpiry`](/docs/ref/object/oidc-provider#accesstokenexpiry): lifetime of an access token. Default `"1h"`.
- [`refreshTokenExpiry`](/docs/ref/object/oidc-provider#refreshtokenexpiry): lifetime of a refresh token. Default `"30d"`.
- [`refreshTokenRenewal`](/docs/ref/object/oidc-provider#refreshtokenrenewal): remaining lifetime of a refresh token below which the server issues a new one to the client. Default `"4d"`.
- [`userCodeExpiry`](/docs/ref/object/oidc-provider#usercodeexpiry): lifetime of a user code issued by the device-authorization flow. Default `"30m"`.
- [`authCodeExpiry`](/docs/ref/object/oidc-provider#authcodeexpiry): lifetime of an authorization code issued by the authorization-code flow. Default `"10m"`.
- [`idTokenExpiry`](/docs/ref/object/oidc-provider#idtokenexpiry): lifetime of an OpenID Connect ID token. Default `"15m"`.

The maximum number of failed login attempts against an authorization code is configured through [`authCodeMaxAttempts`](/docs/ref/object/oidc-provider#authcodemaxattempts); beyond this count the code is invalidated and the user must restart the flow. Default `3`.

### Revocation

Access and refresh tokens can be revoked by changing the owning account's password, which invalidates every token previously issued against it. This is available to account owners and to administrators.
