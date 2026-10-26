---
sidebar_position: 2
title: "OAuth clients"
description: "The kinds of OAuth client Stalwart accepts, how each is identified and trusted, and the fields of the OAuthClient object."
---

An OAuth client is an application that requests tokens from the authorization server on behalf of a user. Before issuing a token, the server has to decide how far to trust the client, and it bases that decision on the way the client is identified. Three levels of trust follow from it:

- A client that an administrator registered is shown to the user as verified.
- A client that registered itself is shown as unverified.
- Only a client that an administrator has designated as first party receives tokens with the account's full permissions.

The client id presented in the authorization request determines which of these rules applies. A client id that matches none of the kinds described below is refused with `invalid_client`.

Some of the settings on this page can be made only by a superuser. A superuser is an account outside any tenant that holds the `impersonate` permission.

## Client kinds

The server records the kind of client in every grant it creates, as the `clientKind` value of the [OAuthGrant](/docs/ref/object/o-auth-grant) object. The kinds differ in how the client obtains its id, whether the server stores anything for it, and how the consent screen presents it:

| Kind | `clientKind` | Client id | Stored on the server | Redirect URIs | Client secret | Access | Consent screen |
|---|---|---|---|---|---|---|---|
| Dynamic | `dynamic` | `swc1.` id returned by the registration endpoint | No | Loopback or private-use scheme | Never | Registered scopes | Shown, unverified |
| Registered | `registered` | Set by the administrator | OAuthClient | Any listed URI | Optional | `scopes` of the OAuthClient | Shown, verified |
| First-party registered | `firstParty` | Set by a superuser | OAuthClient with `firstParty` | Any listed URI, at least one | Optional | Full account permissions | Shown, verified |
| Installed application | `firstParty` | `https://<host>/<prefix>/oauth-client.json` | Application bundle | From the bundle document | Never | Full account permissions | Not shown |
| Metadata document | `metadataDocument` | https URL of the document | No (cached) | From the fetched document | Never | Scopes in the document, all four if none | Shown, unverified |

A client without a secret has nothing with which to prove its identity at the token endpoint. Such a client must therefore use PKCE (Proof Key for Code Exchange) with the `S256` method. With PKCE, the client generates a secret value for each request and sends a hash of it with the authorization request. It then presents the value itself when it exchanges the authorization code, which binds the code to the client that requested it. A client with a secret may omit PKCE. [Authorization requests](/docs/auth/oauth/authorization) lists the rules for the authorization request itself.

Two terms in the table are easy to confuse:

- "First party" refers to access, not to consent. A first-party client receives an unscoped token, which carries every permission of the account, including management permissions where the account holds them. A first-party OAuthClient still shows the consent screen, which asks for `Full access to your account`. The consent screen is skipped only for installed applications, because the bundle installed on the server establishes their identity.
- "Verified" means that an administrator registered the client. The name and logo shown on the consent screen therefore come from the OAuthClient object, not from the client itself.

### Dynamic clients

A mail, calendar or contacts application that has never been registered with the server obtains a client id by calling the registration endpoint `POST /auth/register` without credentials. The server encodes the registration (name, redirect URIs, requested scopes) into the `swc1.` client id it returns, and stores nothing. A dynamic client therefore consumes no storage, but it also cannot be listed or deleted.

The redirect URI is where the browser delivers the authorization response. For a dynamic client it must be a loopback address (`http://127.0.0.1/...` or `http://[::1]/...`) or a private-use URI scheme such as `com.example.app:/callback`, because these are the ways in which native applications receive the response. [Registering an application](/docs/auth/oauth/register-client) gives the full rules.

### Registered clients

Some clients need more than dynamic registration allows: https redirect URIs, a client secret, the device authorization grant, or a name that the user can trust. For these, an administrator creates an [OAuthClient](/docs/ref/object/o-auth-client). Registered clients are the right choice for web applications and services that integrate with the server. They are also the only kind that can use the device authorization grant.

### First-party clients

The WebUI, and any other web application installed as an [Application](/docs/management/applications/), is first party through its bundle. The server reads the application's `oauth-client.json` from the installed bundle, never over the network, and accepts its client id on the server's own hosts. [Applications](/docs/management/applications/) describes the bundle document and the hosts on which it is recognised.

A trusted application that is not installed on the server can be made first party with an OAuthClient that has `firstParty` enabled. Examples are a web application hosted elsewhere and a development build of the WebUI. Only a superuser can enable the setting, and the client must list at least one redirect URI.

### Metadata document clients

A client can use the https URL of a Client ID Metadata Document as its client id. The server fetches the document from that URL during the authorization request, and takes the client's name and redirect URIs from it.

Because anyone can publish such a document, the server accepts these clients only when the [`clientMetadataDocuments`](/docs/ref/object/oidc-provider#clientmetadatadocuments) policy of the OidcProvider singleton allows the URL. They are always shown as unverified. [Client ID Metadata Documents](/docs/auth/oauth/client-metadata-documents) describes the policy and the rules the document must follow.

## OAuthClient object

Registered and first-party registered clients are OAuthClient objects (found in the WebUI under <!-- breadcrumb:OAuthClient --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › OAuth Clients<!-- /breadcrumb:OAuthClient -->). Creating, changing and deleting them requires the `sysOAuthClientCreate`, `sysOAuthClientUpdate` and `sysOAuthClientDestroy` permissions. The default roles grant these permissions to superusers and tenant administrators. The fields that require a decision are described below, and the [reference page](/docs/ref/object/o-auth-client) lists all of them.

### Identity

[`clientId`](/docs/ref/object/o-auth-client#clientid) is the identifier that the application presents, and it is unique on the server. Identifiers generated by the server never start with `https://`.

A value that does start with `https://` has a special purpose: it pre-registers an application that publishes a Client ID Metadata Document. Such a client works whatever the `clientMetadataDocuments` policy says, and only a superuser can create it.

[`description`](/docs/ref/object/o-auth-client#description) is the application name shown on the consent screen and in Connected Applications. [`logo`](/docs/ref/object/o-auth-client#logo) is displayed on the consent screen only when it is a `data:image/` URI. An image URL is stored but never shown.

[`contacts`](/docs/ref/object/o-auth-client#contacts) records the addresses of the people responsible for the client. It has no effect on authorization.

### Client secret

[`secret`](/docs/ref/object/o-auth-client#secret) decides whether the client is confidential or public. A confidential client holds a secret and must authenticate at the token endpoint, either with HTTP Basic (`client_secret_basic`) or with form parameters (`client_secret_post`).

The server stores the secret hashed with the algorithm set in `passwordHashAlgorithm` of the [Authentication](/docs/ref/object/authentication) singleton. A value that is already a password hash, starting with `$` or `{`, is stored as given. Like every secret, it is masked in management API responses, so the administrator who sets it must keep the plain value.

Public clients leave the field empty and rely on PKCE. This is the right choice for browser-based applications and native applications, which cannot keep a secret from their users.

### Redirect URIs

[`redirectUris`](/docs/ref/object/o-auth-client#redirecturis) lists the URIs to which the authorization response may be sent. The `redirect_uri` of an authorization request must match an entry exactly, with one exception: any port matches a loopback URI, because native applications listen on a port chosen at run time.

Each entry must be an absolute URI of at most 2048 bytes. It must not contain a fragment, whitespace, control characters or backslashes, and the schemes `javascript`, `data`, `vbscript`, `file`, `blob` and `about` are refused. An invalid entry fails the save with an `invalidProperties` error.

[`postLogoutRedirectUris`](/docs/ref/object/o-auth-client#postlogoutredirecturis) lists the URIs to which the end-session endpoint `/auth/logout` may send the user after signing out. While the list is empty, the user sees the server's signed-out page instead. The entries follow the rules of `redirectUris` and may be at most 2048 bytes long, but they must be matched exactly, with no allowance for loopback ports. [Endpoints and metadata](/docs/auth/oauth/endpoints#authlogout) describes the end-session endpoint.

### Access

[`scopes`](/docs/ref/object/o-auth-client#scopes) limits the services the client may request: `mail`, `contacts`, `calendars` and `files`. When the set is empty, the client can request only two scopes. `openid` signs the user in without access to any service, and `offline_access` is always allowed. The setting is ignored for first-party clients, which receive full access. [Scopes](/docs/auth/oauth/scopes) lists what each scope gives access to.

[`grantTypes`](/docs/ref/object/o-auth-client#granttypes) lists the grants the client may use, that is, the ways in which it may obtain tokens. A new client may use <!-- default:OAuthClient.grantTypes -->`authorizationCode` and `refreshToken`<!-- /default -->. The device authorization grant, which serves devices without a browser, is therefore available only once `deviceCode` is added.

[`expiresAt`](/docs/ref/object/o-auth-client#expiresat) ends the client's validity at the given date. After that date, the client is refused with `invalid_client` and its refresh tokens stop working.

### Example

The following object registers a confidential web application that may access mail and calendars:

```json
{
  "clientId": "crm-integration",
  "description": "Example CRM",
  "secret": "6dJq2Vn8sXw4LkP0aTzR",
  "redirectUris": {"https://crm.example.com/oauth/callback": true},
  "scopes": {"mail": true, "calendars": true},
  "grantTypes": {"authorizationCode": true, "refreshToken": true},
  "contacts": {"it@example.com": true}
}
```

Grants issued through a first-party OAuthClient appear in Connected Applications as "Web application of this server", which is the label of the `firstParty` kind.

## Changing or removing a client

A change to an OAuthClient takes effect at the client's next authorization request or token refresh. At each refresh, the server resolves the client again and compares it with the grant. Two kinds of change invalidate the grant:

- The client's kind has changed, for example because `firstParty` was enabled or disabled.
- The grant holds a scope that the client's `scopes` no longer allows.

In either case the server deletes the grant and the refresh fails with `invalid_grant`, so the user must authorize the application again. Deleting an OAuthClient, or letting it expire, has a different result: every refresh by that client fails with `invalid_client`.

## Tenant-owned clients

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A tenant administrator can register clients for the accounts of the tenant. An OAuthClient whose [`memberTenantId`](/docs/ref/object/o-auth-client#membertenantid) is set belongs to that [tenant](/docs/auth/authorization/tenants), and it signs in only accounts of the tenant. An account of another tenant, or one outside any tenant, is refused with `access_denied`, in the authorization code flow and in the device flow alike.

The tenant, not the server operator, vouches for such a client. The consent screen therefore marks it as unverified. Tenant clients also count against the tenant's `maxOauthClients` quota.

The following object registers a public single-page application for the tenant with id `b`:

```json
{
  "clientId": "acme-webmail",
  "description": "Acme Webmail",
  "redirectUris": {"https://webmail.acme.example/callback": true},
  "scopes": {"mail": true, "contacts": true},
  "memberTenantId": "b"
}
```
