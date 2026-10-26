---
sidebar_position: 8
title: "Tokens"
description: "Access and refresh tokens issued by Stalwart's OAuth server: lifetimes, refresh-token rotation, revocation, introspection and the token encryption key."
---

An OAuth grant gives an application two tokens, which play different roles:

- The access token is presented on each request. On HTTP it travels in an `Authorization: Bearer` header, and on the mail protocols through the `OAUTHBEARER` and `XOAUTH2` mechanisms. It expires after a short time.
- The refresh token is presented only to the token endpoint. The application exchanges it for a new access token when the old one expires, without asking the user to sign in again.

The split limits the damage of a leak. The access token is sent often but lives briefly, while the refresh token lives long but is sent only to one endpoint.

Both tokens are opaque to the application, which cannot read their contents. Both belong to one account and one grant, and both stop working when the grant is deleted. Token lifetimes and the encryption key are fields of the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->).

## Access tokens

An access token is valid for the time set in [`accessTokenExpiry`](/docs/ref/object/oidc-provider#accesstokenexpiry). The value cannot be lower than 10 minutes. Values below one hour depart from the OAuth Profile for Open Public Clients, which is what mail applications expect.

Access tokens are not bound to an audience, the service a token is meant for. A token is therefore accepted by every service its scopes allow, on every host of the server.

A token does not freeze the account's permissions at the time it was issued. Changes to the account's roles, permissions, group memberships or tenant apply to existing access tokens at their next use, without a new sign-in ([Roles](/docs/auth/authorization/roles#propagation-of-changes)).

## Refresh tokens

A refresh token is returned with every authorization code and device grant, whether or not the application requested `offline_access`.

[`refreshTokenExpiry`](/docs/ref/object/oidc-provider#refreshtokenexpiry) works as an idle timeout. Each refresh token expires that long after it was issued, but each refresh also issues a new one. A grant therefore ends only after the application has not been used for that period. The minimum is one day. Values below 30 days depart from the OAuth Profile for Open Public Clients, and make mail applications ask users to sign in again more often.

### Rotation

Refresh tokens are rotated. Every refresh returns a new access token and a new refresh token, and the new refresh token supersedes the one that was presented. Two situations are handled specially:

- A retry with the same refresh token, sent because the application lost the previous response, returns the same new refresh token again. A network failure therefore does not sign the application out.
- A refresh token that has already been superseded, presented after its successor was used, indicates that the token may have been copied. The server deletes the whole grant: the request fails with `invalid_grant`, and the grant's access tokens stop working.

An application must therefore serialise its refreshes and always keep the latest refresh token.

### Refresh requests

A refresh request must carry the `client_id` that the grant was issued to. It may also carry a `scope`, which must be a subset of the granted scopes, or the request is refused with `invalid_scope`. The new tokens keep the scopes of the grant either way.

At every refresh, the server also checks the client again. If the client has been deleted or has expired, the refresh fails with `invalid_client`. If its kind or its allowed scopes no longer cover the grant, the grant is deleted and the refresh fails with `invalid_grant`.

## Token responses

Every successful token response contains `access_token`, `token_type`, `expires_in`, `scope` and `username`, the name of the account that signed in. Authorization code and device grants add `refresh_token` and, when the granted scope contains `openid`, an [`id_token`](/docs/auth/oauth/openid-connect#id-tokens). Refresh responses never contain an ID token. The `scope` of a refresh response repeats the scopes originally requested.

The following response is typical for a mail application:

```json
{
  "access_token": "<access token>",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "<refresh token>",
  "scope": "urn:ietf:params:oauth:scope:mail",
  "username": "jane@example.com"
}
```

## Lifetimes

The following fields of the OidcProvider singleton set how long each kind of code and token remains valid:

| Field | Default | Minimum | Applies to |
|---|---|---|---|
| [`authCodeExpiry`](/docs/ref/object/oidc-provider#authcodeexpiry) | <!-- default:OidcProvider.authCodeExpiry -->10 minutes<!-- /default --> | 10 minutes | Authorization codes |
| [`accessTokenExpiry`](/docs/ref/object/oidc-provider#accesstokenexpiry) | <!-- default:OidcProvider.accessTokenExpiry -->1 hour<!-- /default --> | 10 minutes | Access tokens |
| [`refreshTokenExpiry`](/docs/ref/object/oidc-provider#refreshtokenexpiry) | <!-- default:OidcProvider.refreshTokenExpiry -->30 days<!-- /default --> | 1 day | Refresh tokens, measured from the last refresh |
| [`userCodeExpiry`](/docs/ref/object/oidc-provider#usercodeexpiry) | <!-- default:OidcProvider.userCodeExpiry -->30 minutes<!-- /default --> | | Device flow user codes |
| [`idTokenExpiry`](/docs/ref/object/oidc-provider#idtokenexpiry) | <!-- default:OidcProvider.idTokenExpiry -->15 minutes<!-- /default --> | | ID tokens |

Choosing a lifetime is a trade-off. A shorter access token limits how long a leaked token can be used, but makes applications refresh more often. A shorter refresh token signs out unused applications sooner, but makes users sign in again more often.

Changes to these fields apply after a [ReloadSettings action](/docs/management/tasks-actions/actions). Durations are written in milliseconds, so the following update sets the access-token lifetime to two hours:

```json
{
  "accessTokenExpiry": 7200000
}
```

## Revocation

A token stops working when its grant is deleted. The grant is deleted in these cases:

- The application calls the revocation endpoint, described below.
- The user deletes the application in [Connected Applications](/docs/auth/oauth/consent#connected-applications), or an administrator deletes the grant.
- The account's password is changed. This invalidates every token of the account and deletes all of its grants.
- The application presents a superseded refresh token.
- The account is deleted, including through deprovisioning by SCIM.

Other changes stop a client's refreshes: deleting or expiring the [OAuthClient](/docs/ref/object/o-auth-client), uninstalling the Application, or changing `clientMetadataDocuments` so that the client is no longer allowed.

An expired password has a similar effect. When the account's password has [expired](/docs/auth/authentication/password#password-policy), refreshes by clients other than first-party clients fail with `invalid_grant` until the password is changed.

Nothing else revokes tokens. The following changes leave access and refresh tokens valid:

- Changing the account's two-factor authentication settings
- Adding, changing or removing app passwords or API keys
- Changing roles or permissions, although these changes apply to existing tokens at once

### Revoking a token from a client

An application revokes its own tokens with `POST /auth/revoke`, as defined in [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009), for example when the user signs out. The form body carries two things:

- `token`, either an access token or a refresh token
- The client authentication used at the token endpoint: `client_id` alone for a public client, and HTTP Basic or `client_id` and `client_secret` for a confidential client

The endpoint is anonymous and rate limited like the token endpoint. `token_type_hint` is accepted but not needed. The following request revokes a refresh token of a public client:

```bash
curl -X POST https://mail.example.com/auth/revoke \
  -d token=<refresh token> \
  -d client_id=swc1.<encoded registration>
```

A successful revocation deletes the whole grant, with the same effect as deleting the application in Connected Applications: every access and refresh token of the grant stops working. The response is `200 OK` with an empty body.

The same response is returned for a token that cannot be decoded, belongs to another client or has no grant, as RFC 7009 section 2.2 requires. The response therefore reveals nothing about tokens the caller does not own. Two kinds of request are refused:

- A request without `token`, or with Basic credentials and a different client in the body, is refused with `invalid_request`.
- A request without a `client_id`, or whose client authentication fails, is refused with `invalid_client`.

The end-session endpoint `/auth/logout` revokes nothing ([Endpoints and metadata](/docs/auth/oauth/endpoints#authlogout)). An application that signs a user out must therefore also revoke its tokens here.

## Introspection

Introspection lets an authenticated caller ask the server about the state of a token. The caller sends the token to `POST /auth/introspect` ([RFC 7662](https://www.rfc-editor.org/rfc/rfc7662)).

An active token is reported with `active: true`, together with the owning account in `username` and `sub`, the granted `scope` and the `client_id` of the grant. Its `token_type` is `bearer` for an access token and `refresh_token` for a refresh token. A token whose grant has been deleted, and a refresh token that has been superseded, are reported with `active: false`.

## Token encryption

Tokens are encrypted and authenticated with a key derived from [`encryptionKey`](/docs/ref/object/oidc-provider#encryptionkey), and each token is bound to the account it was issued for. Encryption is what makes the tokens opaque: applications can neither read nor alter them. It also has consequences for clusters and for registration:

- Every node of a cluster must use the same key, or it cannot accept tokens issued by the others.
- The identifiers of dynamically registered clients are derived from the same key.

A fresh installation generates a random 64-character key. The field takes a `SecretKey` value, which can hold the key itself or read it from an environment variable or a file.

An empty key is never used. The server replaces it with a random key that lasts only until the process stops and, except in recovery mode, reports a configuration error. Every token then stops validating after a restart. The same applies to an empty OpenID Connect `signatureKey` with an HMAC algorithm.

### Rotating the encryption key

Rotating the key is disruptive. Changing `encryptionKey` invalidates every access and refresh token, so every application must ask its user to sign in again. It also invalidates every dynamically registered client id, so mail applications must register again. Use a key of at least 32 random bytes. To rotate the key:

1. Generate a new key, for example with `openssl rand -base64 48`.
2. Store it where the server reads it. The following value reads the key from the environment variable `OAUTH_KEY`, which must be set on every node:

   ```json
   {
     "encryptionKey": {
       "@type": "EnvironmentVariable",
       "variableName": "OAUTH_KEY"
     }
   }
   ```

3. Update the OidcProvider singleton with the new value, in the WebUI or with `stalwart-cli update OidcProvider`. In a cluster, first make sure that every node reads the same key.
4. Apply the change with a [ReloadSettings action](/docs/management/tasks-actions/actions) (`stalwart-cli create Action/ReloadSettings`), which every node picks up. Like the other OidcProvider settings, the key is read when the settings are loaded, so saving the object alone does not change it.
