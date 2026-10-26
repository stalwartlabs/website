---
title: "OpenID Connect"
sidebar_position: 10
description: "Stalwart as an OpenID Connect provider: ID token signing, the claims it issues, the UserInfo endpoint and sign-out."
---

[OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html) adds sign-in to OAuth 2.0. Plain OAuth gives an application access to an account, but it does not tell the application who the user is. OpenID Connect fills that gap with the ID token.

An application that includes the `openid` scope in its authorization request receives an ID token together with the access token. The ID token is a signed JSON Web Token (JWT), a compact JSON document with a signature that anyone holding the right key can verify. It states which account signed in, and it is issued for that one application. Applications use it to identify the user, for example to let the users of a self-hosted service sign in with their mail account.

The built-in OAuth server is also an OpenID Connect provider. It needs no configuration for this role beyond the signing key generated at installation.

This page describes Stalwart as a provider, the side that issues ID tokens. To let Stalwart accept sign-ins from an external provider instead, configure an [OpenID Connect directory](/docs/auth/backend/oidc).

## Signing

Relying parties, the applications that accept the ID tokens, trust a token only when its signature verifies. ID tokens are signed with the algorithm in [`signatureAlgorithm`](/docs/ref/object/oidc-provider#signaturealgorithm) and the private key in [`signatureKey`](/docs/ref/object/oidc-provider#signaturekey). Both are fields of the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->).

Fresh installations use `es256` with a generated P-256 key. The schema default of the field, <!-- default:OidcProvider.signatureAlgorithm -->`hs256`<!-- /default -->, applies only when the field has never been set.

### Algorithms

The supported algorithms fall into two groups. The asymmetric algorithms sign with a private key and are verified with a public key:

- ECDSA: `es256`, `es384`
- RSASSA-PSS: `ps256`, `ps384`, `ps512`
- RSASSA-PKCS1-v1_5: `rs256`, `rs384`, `rs512`

With an asymmetric algorithm, the server publishes the public key in the JSON Web Key Set at `/auth/jwks.json`. Relying parties fetch the key from there and verify the signature on their own.

The symmetric HMAC algorithms (`hs256`, `hs384`, `hs512`) remain supported, but they sign and verify with the same secret. The key set is then empty, because publishing the verification key would publish the secret. A relying party can verify the token only if it is given the secret. An HMAC algorithm with an empty key signs with a random key that changes at every restart.

### Key failures and changes

If the configured key cannot be loaded, the server reports the error and signs with a temporary ES256 key until the key is corrected. The temporary key is published in the key set, so relying parties can still verify tokens in the meantime.

Changing the signing key or the algorithm invalidates the ID tokens already issued. Access and refresh tokens stay valid, because they are protected by a different key.

The following update configures ES256 with a key given directly in the object. The key shown is an example only and must not be reused:

```json
{
  "signatureAlgorithm": "es256",
  "signatureKey": {
    "@type": "Text",
    "secret": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggybcqc86ulFFiOon\nWiYrLO4z8/kmkqvA7wGElBok9IqhRANCAAQxZK68FnQtHC0eyh8CA05xRIvxhVHn\n0ymka6XBh9aFtW4wfeoKhTkSKjHc/zjh9Rr2dr3kvmYe80fMGhW4ycGA\n-----END PRIVATE KEY-----\n"
  }
}
```

To keep the key out of the configuration, use the `EnvironmentVariable` or `File` variant of `signatureKey`. These variants read the PEM from an environment variable or a file.

## ID tokens

An ID token is issued in the token response of an authorization code or device grant, when the granted scope contains `openid`. It is never issued in the response to a refresh. The token is valid for the time set in [`idTokenExpiry`](/docs/ref/object/oidc-provider#idtokenexpiry), and it is signed but never encrypted. It carries these claims:

| Claim | Value |
|---|---|
| `iss` | The issuer identifier, the server's public https URL |
| `sub` | The account id |
| `aud` | The client id of the application |
| `iat`, `nbf`, `exp` | Issue time, start and end of validity |
| `nonce` | The `nonce` of the authorization request, when one was sent |
| `preferred_username` | The account name |
| `email` | The account name, which is its primary email address |
| `description` | The account description, when set |

The token does not contain `auth_time`. The discovery document lists in `id_token_signing_alg_values_supported` only the algorithm currently configured, for example `["ES256"]` on a default installation.

## UserInfo

The UserInfo endpoint `/auth/userinfo` gives an application a second way to learn who the user is. It returns the claims of the account that owns the presented access token. Any valid access token can reach it, including a token whose only scope is `openid`.

The discovery document lists `sub`, `name`, `preferred_username`, `email` and `email_verified` in `claims_supported`, and `public` in `subject_types_supported`.

## Signing out

A relying party that signs a user out sends the browser to the end-session endpoint `/auth/logout`, defined by [OpenID Connect RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html). The request carries `id_token_hint` or `client_id`, and optionally `post_logout_redirect_uri` and `state`.

The endpoint returns the browser to the relying party only when the URI is registered for the client. Otherwise it shows a signed-out page. [Endpoints and metadata](/docs/auth/oauth/endpoints#authlogout) gives the matching rules.

The endpoint revokes no tokens and ends no session on the server. A relying party that signs a user out must therefore also revoke its tokens at the [revocation endpoint](/docs/auth/oauth/tokens#revoking-a-token-from-a-client).
