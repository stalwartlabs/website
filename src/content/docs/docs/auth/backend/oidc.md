---
sidebar_position: 5
title: "OpenID Connect"
description: "Use an external OpenID Connect identity provider for the accounts of a domain: how Stalwart validates the provider's tokens, WebUI sign-in through the provider, mail clients, compatibility settings and troubleshooting."
---

Organisations that run an identity provider, such as Keycloak, Authentik or Microsoft Entra ID, often want every application to sign in through it. That way the provider's password policy and multi-factor authentication apply everywhere, and a user has one set of credentials. An OpenID Connect directory brings mail into this arrangement. It delegates the accounts of a domain to the external provider: users sign in at the provider, and clients then present the provider's access tokens to Stalwart on JMAP, IMAP, SMTP and the other protocols.

In OAuth terms, the provider is the authorization server for such a domain, the system that signs users in and issues tokens. Stalwart acts only as a resource server, the system that accepts those tokens. It validates the tokens that the provider issued and maps them to accounts, but it never brokers sign-ins on behalf of the provider.

This division has a consequence for mail applications. An application that supports OAuth discovers the provider, registers with it and requests its tokens there, without Stalwart's involvement. For such applications to work, the provider itself must implement the [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/). The directory follows that profile unless configured otherwise, and each relaxation is a setting that must be enabled explicitly.

:::caution[Mail applications and external providers]
OAuth Public clients are applications that use PACC discovery, dynamic registration without credentials and the interoperable mail, contacts, calendars and files scopes. With a directory that follows the profile strictly, they do not work with most OpenID Connect providers until those providers implement the specification. The [compatibility settings](#compatibility-settings) relax some of the requirements on the tokens Stalwart accepts, so that such providers can still be used, but the relaxed rules mostly let web clients connect, such as the WebUI and webmail applications. An OAuth Public client, Apple Mail for example, still fails when the provider does not support the full specification, whatever these settings say. For the WebUI on a provider without Client ID Metadata Document support, see [Client id of the WebUI](#client-id-of-the-webui).
:::

To connect a provider, create a [Directory](/docs/ref/object/directory) object of type `Oidc` (in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->). Then set its id as `directoryId` on the Authentication singleton or, in the Enterprise edition, on the domains the directory serves ([Per-domain directories](/docs/auth/backend/#per-domain-directories)).

## Account provisioning

OpenID Connect provides no way to look up an account without a token of its owner. Stalwart therefore learns about an account only when the user first signs in, and it creates the local account at that point. Until then, the address does not exist on the server, and mail for it is rejected.

To accept mail from the start, the accounts have to exist before the first sign-in. There are two ways to achieve this. The accounts can be created in advance in the WebUI, with the [CLI](/docs/management/cli/) or through the management API. Alternatively, [SCIM provisioning](/docs/auth/scim/) (Enterprise) lets the provider create each account as soon as it exists upstream.

In a domain opened to SCIM, sign-ins create and update no accounts. A sign-in by an account that SCIM has not provisioned fails with `Accounts in this domain are provisioned through SCIM, just-in-time provisioning is disabled`.

Accounts are never deleted or suspended automatically. A user disabled at the provider can no longer sign in, but the mailbox keeps receiving mail. That continues until an administrator suspends or deletes the account, or until SCIM does. [Provisioning models](/docs/auth/scim/provisioning) compares the approaches.

## Discovery and issuer

[`issuerUrl`](/docs/ref/object/directory#issuerurl) identifies the provider. When the directory is loaded, the server reads the provider's metadata from that URL, a JSON document that lists the provider's endpoints and capabilities. It first tries the [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414) authorization server metadata, served with the content type `application/json`. If that fails, it falls back to `<issuer>/.well-known/openid-configuration`. When the first document it reads lacks the UserInfo or end-session endpoint, it fetches the other document as well.

The `issuer` in the metadata must equal `issuerUrl` exactly, and a trailing slash counts. Type the issuer as the provider publishes it, or enable `lenientIssuerMatch`. Templated multi-tenant issuers that contain a `{tenantid}` placeholder are not supported, so use the tenant-specific issuer URL instead.

Requests to the provider time out after 30 seconds and never follow redirects. Which providers a directory may contact depends on its owner. A directory owned by the server may contact providers on private networks, whereas one owned by a [tenant](/docs/auth/authorization/tenants) may contact only providers on public addresses. [`allowInvalidCerts`](/docs/ref/object/directory#allowinvalidcerts) accepts invalid TLS certificates and is meant for testing.

Temporary failures while the server starts are retried for a short time. Three conditions make the directory fail to load, and the error is logged: a discovery failure, an issuer mismatch, and `introspection` mode with a provider that publishes no introspection endpoint.

## Mapping tokens to accounts

A token says who signed in through its claims, the named values it carries. Every token must lead to an email address, which becomes the address of the account.

[`claimUsername`](/docs/ref/object/directory#claimusername) names the claim that identifies the account, <!-- default:Directory.claimUsername -->`preferred_username`<!-- /default --> unless changed. The server turns its value into an address in one of three ways:

- A value that is an email address is used as it is.
- A value that is not an address gets the domain in [`usernameDomain`](/docs/ref/object/directory#usernamedomain) appended, when that field is set, so that `john` becomes `john@example.org`.
- Without `usernameDomain`, the `email` claim is used instead.

A token from which no address can be derived is rejected.

Two further claims are optional. [`claimName`](/docs/ref/object/directory#claimname) names the claim with the display name, and [`claimGroups`](/docs/ref/object/directory#claimgroups) the claim with group memberships, such as `groups` or `roles`. When neither is set, the server reads no display name or groups from the provider.

Setting these claims has a cost. When a JWT access token lacks one of the configured claims, the server calls the provider's UserInfo endpoint at every sign-in to obtain it. Set `claimName` and `claimGroups` only when the provider includes them in access tokens, or when the extra request is acceptable. Groups named by the provider map to local groups, which are created as needed, and their roles and permissions are assigned on the server.

SCIM takes precedence over these claims. In a domain where SCIM provisioning is enabled, SCIM is authoritative for the display name and group memberships, so `claimName` and `claimGroups` are not applied there. `claimUsername` still identifies the account.

## Validating access tokens

Before a token grants access, the server checks its form, its audience and its scopes. Tokens come in two forms, which are validated differently. JWT access tokens can be validated by the server alone. Opaque tokens need the provider's help.

### JWT access tokens

A JSON Web Token (JWT) is a token whose claims are readable and signed by the provider. Access tokens in this form are verified offline, against the provider's published keys. The key set is cached and fetched again when a token names an unknown key, so key rotation at the provider is picked up automatically. HMAC-signed tokens (HS256, HS384, HS512) are always refused.

A token must carry `iss` and `exp`, which are checked with 60 seconds of tolerance. The client is read from `azp`, `client_id`, `cid` or `appid`, and a token that names different clients in these claims is rejected. The scopes are read from `scope` or `scp`, and only the four interoperable URNs among them count.

A provider also issues ID tokens and refresh tokens, which are not meant to grant access. The server refuses them when they are presented as access tokens, and it recognises them by how the provider marks them:

- A token that the provider marks as an ID or refresh token is always rejected.
- A token marked as an access token, by a header type of `at+jwt` or an equivalent claim, is accepted.
- A token that carries neither marking is rejected as a possible ID token in two cases: if it contains a `nonce` or `at_hash` claim, or if it contains neither a scope nor a client claim. Enabling `allowIdTokenClaims` lifts this rule. For this check, the client claims are `client_id`, `cid` and `appid`; `azp` alone does not count.

### Audience

The audience of a token names the services it was issued for. Checking it prevents a token that the provider issued to some other application from being used at Stalwart. The token's `aud` claim, a string or an array, must contain one of the server's resource identifiers or a value listed in [`acceptedAudiences`](/docs/ref/object/directory#acceptedaudiences). The server lists its resource identifiers in `protected_resources` of its `/.well-known/oauth-authorization-server` document. A token without `aud`, or with no matching value, is rejected unless `skipAudienceValidation` is enabled.

The value that the provider puts in `aud` is configured at the provider. Depending on the product, it is an audience, API identifier or resource configured for the client, or the client id itself. Add that value to `acceptedAudiences`.

### Access granted

What a valid token may do depends on its client and its scopes, in three cases:

- A token whose client claim equals the [`oauthClientId`](/docs/ref/object/application#oauthclientid) of an installed Application, or identifies the Client ID Metadata Document of an installed Application such as the WebUI, receives the account's full permissions.
- A token that carries interoperable scopes is limited to them ([Scopes](/docs/auth/oauth/scopes)).
- A token that carries none is handled by [`unscopedTokens`](/docs/ref/object/directory#unscopedtokens), which is <!-- default:Directory.unscopedTokens -->`reject`<!-- /default --> unless changed, so such tokens are rejected.

### Opaque tokens

An opaque token is a string that only its issuer can interpret. Access tokens that are not JWTs are of this kind, so they cannot be verified offline. [`opaqueTokenValidation`](/docs/ref/object/directory#opaquetokenvalidation) decides how they are handled, and is <!-- default:Directory.opaqueTokenValidation -->`none`<!-- /default --> unless changed:

- `none` rejects them without contacting the provider.
- `introspection` validates each token at the provider's introspection endpoint ([RFC 7662](https://www.rfc-editor.org/rfc/rfc7662)), which must be listed in the provider's metadata. The server authenticates to the endpoint with [`introspectionClientId`](/docs/ref/object/directory#introspectionclientid) and `introspectionClientSecret`, by the method set in [`introspectionAuthMethod`](/docs/ref/object/directory#introspectionauthmethod): `clientSecretBasic`, `clientSecretPost`, or `none` when there is no secret. The response must report the token as active, and the audience, client, scope and issuer checks then apply as for JWTs. The claims are read from the response, and a missing required claim fails the sign-in.
- `userInfo` accepts any token that the provider's UserInfo endpoint accepts. The endpoint reveals neither the audience nor the scopes, so a token that the provider issued to any application authenticates, and its access is always decided by `unscopedTokens`. That setting must then be `interoperable` or `full`; with `reject`, the directory logs a warning.

Only one of these methods is used for a token.

### Expiry and domain binding

A token stops working at its `exp`.

After a token has been validated, the domain of the account must be served by this directory. Otherwise the sign-in fails, and the `auth.failed` event records the reason `The account's domain is not served by the directory that authenticated it`. The check matters when several directories serve different domains.

The [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) is not affected by any of this. It always signs in through Stalwart's own authorization server, also for domains of an OpenID Connect directory.

## Signing in to the WebUI

The WebUI follows the directory too. When the default directory, or the directory of the user's domain, is an OpenID Connect directory, the WebUI signs in at the provider. It uses the authorization code flow, as a public client with PKCE (`S256`), and it learns from the server the provider's endpoints, the client id to use and the scopes to request. The WebUI always sends the access token to the server, never the ID token. That token receives full access through its client claim (see [Access granted](#access-granted)).

### Client id of the WebUI

The provider has to know the WebUI as a client, and the client id the WebUI presents comes from its [Application](/docs/management/applications/). There are two possibilities:

- When [`oauthClientId`](/docs/ref/object/application#oauthclientid) is set on the Application, the WebUI uses that static client id.
- Otherwise it uses the URL of its Client ID Metadata Document, `https://<host>/<prefix>/oauth-client.json`. The provider fetches this document from Stalwart, so the server must then be reachable from the provider over https.

There is no built-in client id. If no static id is set and the provider does not advertise `client_id_metadata_document_supported` in its metadata, the WebUI shows a configuration error.

:::note
If the provider does not support Client ID Metadata Documents, register a public client for the WebUI at the provider and set its client id as the Application's `oauthClientId`. Set it only in that case, because the WebUI then uses the static id for every sign-in. On a server where some domains sign in through Stalwart's own authorization server, that server answers `Unknown client id` unless a first-party [OAuthClient](/docs/auth/oauth/clients) with the same client id exists.
:::

### Scopes requested

The WebUI requests only the scopes it needs for the configured claims, and each one only when the provider lists it in `scopes_supported`:

- `openid`
- The scope that carries the `claimUsername` claim
- `email`, when `claimUsername` is not `email` and `usernameDomain` is not set
- `profile`, for `claimName`
- `groups`, for `claimGroups`

When the provider publishes no `scopes_supported`, the standard `email` and `profile` scopes are assumed.

The WebUI never requests `offline_access` or the interoperable scopes. This matters for providers that issue refresh tokens only when `offline_access` is requested: with such a provider, the WebUI session ends when the access token expires, and the user signs in again.

### Provider checklist

The client for the WebUI at the provider needs these settings:

- A public client without a secret, or acceptance of the WebUI's Client ID Metadata Document URL
- The redirect URI `https://<host>/admin/oauth/callback` for the administration interface and `https://<host>/account/oauth/callback` for the Account Manager, or the equivalent for other prefixes
- PKCE with `S256`
- An audience in its access tokens that matches a resource identifier of the server or an `acceptedAudiences` entry
- The scopes listed above, and the groups claim if `claimGroups` is used

## Mail, calendar and contacts clients

Applications that sign in with OAuth present the provider's tokens like any other bearer token: through `OAUTHBEARER` or `XOAUTH2` on IMAP, POP3, SMTP and ManageSieve, and through bearer authentication on HTTP ([Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients)). For these domains, the server names the provider as the authorization server in three places: in the RFC 7628 error response, in the protected resource metadata and in the WebUI discovery.

[PACC](/docs/server/autoconfig) is the discovery document from which a mail application learns how to connect to a domain, including whether OAuth is available. Whether the PACC document of a domain advertises OAuth depends on whether the provider conforms to the open public clients profile. The server checks this against the provider's metadata when the directory loads. The profile requires:

- An https issuer without query, fragment or user information, and with a lowercase host
- Metadata served as `application/json`
- A registration endpoint, and authorization and token endpoints
- `code` among the response types
- `authorization_code` and `refresh_token` among the grant types
- `none` among the token endpoint authentication methods
- `S256`
- `authorization_response_iss_parameter_supported: true`
- The interoperable scopes of the published services: `mail` always, and `calendars`, `contacts` and `files` when CalDAV, CardDAV or WebDAV is enabled

A conforming provider is advertised with its issuer in the PACC document of its domains. For a provider that does not conform, the server logs a warning that lists the missing items:

```text
The identity provider does not conform to OAuth Public, PACC documents for its domains will only advertise password authentication. Missing: ...
```

The PACC document of those domains is still published, together with its DNS record, but it advertises password authentication only. No setting overrides this.

## Compatibility settings

Many providers issue tokens that do not meet every requirement above. The compatibility settings relax the rules for the tokens Stalwart accepts, so that such providers can still be used. The WebUI groups them under "Compatibility (reduces security)", because each one accepts tokens that the strict rules would refuse. Each must be enabled explicitly, and each has a cost:

- [`unscopedTokens`](/docs/ref/object/directory#unscopedtokens) accepts tokens that carry none of the interoperable scopes. `interoperable` treats them as carrying the mail, contacts, calendars and files scopes. `full` grants every permission of the account, including management, which is unsafe unless the audience check is strict. WebUI tokens recognised by their client claim always have full access and do not need this setting.
- [`skipAudienceValidation`](/docs/ref/object/directory#skipaudiencevalidation) accepts tokens whose `aud` is missing or matches neither a resource identifier nor `acceptedAudiences`. Tokens that the provider issued to any application are then accepted. Listing the provider's value in `acceptedAudiences` is not a relaxation, and is preferable.
- [`allowIdTokenClaims`](/docs/ref/object/directory#allowidtokenclaims) accepts JWT access tokens that carry `nonce` or `at_hash`, as produced by providers whose access tokens are copies of the ID token. An ID token can then be presented as an access token, although tokens that the provider explicitly marks as ID tokens are still rejected.
- [`lenientIssuerMatch`](/docs/ref/object/directory#lenientissuermatch) ignores a trailing-slash difference between `issuerUrl` and the issuer reported by the provider and found in tokens.

The modes of `opaqueTokenValidation` involve the same tradeoff: `introspection` keeps the audience, client and scope checks, whereas `userInfo` drops them.

These settings only decide which tokens Stalwart accepts. They do not make Stalwart advertise OAuth in the PACC document of a non-conforming provider's domains. They also do not make the provider offer dynamic client registration or the interoperable scopes.

## Example

The following directory serves `example.org` from a provider without Client ID Metadata Document support. A public client `mail-webui` is registered at the provider for the WebUI. The provider issues JWT access tokens with that client id as audience, a bare user name in `preferred_username` and groups in a `groups` claim. For the WebUI to use that client, and for its tokens to be recognised as first party, the WebUI's [Application](/docs/ref/object/application) must also have `oauthClientId` set to `mail-webui`:

```json
{
  "@type": "Oidc",
  "description": "Corporate identity provider",
  "issuerUrl": "https://sso.example.org/realms/corp",
  "claimUsername": "preferred_username",
  "usernameDomain": "example.org",
  "claimGroups": "groups",
  "acceptedAudiences": {"mail-webui": true}
}
```

## Troubleshooting

The server logs the reason for every rejected token. Each message below names the cause and the remedy:

| Message | Cause and remedy |
|---|---|
| `Failed to decode token ... configured as the default directory under the Authentication object` | The token was not issued by Stalwart, and no OpenID Connect directory handles it. Set the directory as `directoryId` of the Authentication singleton or of the domain. |
| `Token audience ... matches neither a resource identifier of this server nor acceptedAudiences` | Add the token's `aud` value to `acceptedAudiences`. |
| `Token carries none of the urn:ietf:params:oauth:scope:{mail,contacts,calendars,files} scopes and unscopedTokens is set to reject` | The provider does not issue the interoperable scopes. Configure them at the provider, or set `unscopedTokens`. |
| `Opaque access tokens are not accepted, only JWT access tokens are validated` | Configure the provider to issue JWT access tokens, or set `opaqueTokenValidation`. |
| `ID and refresh tokens are not accepted as access tokens` | The client sent an ID or refresh token instead of the access token. |
| `Token carries ID token claims (nonce or at_hash), enable allowIdTokenClaims ...` | The provider copies the ID token into the access token. Enable `allowIdTokenClaims`. |
| `Token has no scope or client_id claim and may be an ID token ...` | The token carries no scope or client claim. Configure the provider to add one, or enable `allowIdTokenClaims`. |
| `Unsupported algorithm` | The token is signed with an HMAC algorithm. Configure an asymmetric signing algorithm at the provider. |
| `Unknown key id` | The token's signing key is not in the provider's key set. |
| `The account's domain is not served by the directory that authenticated it` | The token's account belongs to a domain served by another directory. |
