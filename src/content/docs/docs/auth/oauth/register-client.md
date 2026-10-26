---
sidebar_position: 3
title: "Registering an application"
description: "Register OAuth clients with Stalwart: dynamic registration for mail applications, confidential clients, administrator-created clients, metadata documents and first-party applications."
---

An application must be known to the authorization server before it can obtain tokens. How it becomes known depends on the kind of application, and this page gives the procedure for each path:

- Mail, calendar and contacts applications usually register themselves, at the moment a user adds an account. They use the dynamic client registration endpoint defined in [RFC 7591](https://www.rfc-editor.org/rfc/rfc7591).
- Web applications and services that need a client secret, https redirect URIs or the device grant are registered by an administrator. Alternatively, they register through the same endpoint with an authenticated request.
- An application that publishes a Client ID Metadata Document, or a trusted application that needs full access, is registered by a superuser.

[OAuth clients](/docs/auth/oauth/clients) explains which path fits which kind of client. Whatever the path, a client id that the server cannot resolve is always refused with `invalid_client`. No setting makes the server accept arbitrary client ids.

## Register a native or mail client dynamically

Dynamic registration lets a mail application that has never seen the server obtain a client id on its own, without involving an administrator. A public client registers by sending its metadata to `POST /auth/register` without credentials. Registration is always open for public clients and needs no initial access token, although it is subject to the anonymous request rate limit.

The server stores nothing for such a registration. Instead, it encodes the registration into the client id it returns, which starts with `swc1.`, and the client presents that id in its authorization requests. The following request registers a desktop mail application that receives the authorization response on a loopback port:

```bash
curl -X POST https://mail.example.com/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "Example Mail",
    "redirect_uris": ["http://127.0.0.1/callback"],
    "token_endpoint_auth_method": "none",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "scope": "urn:ietf:params:oauth:scope:mail urn:ietf:params:oauth:scope:calendars"
  }'
```

The server answers with `201 Created`. The response contains the new client id and the time it was issued, followed by the registered metadata:

```json
{
  "client_id": "swc1.<encoded registration>",
  "client_id_issued_at": 1792051200,
  "redirect_uris": ["http://127.0.0.1/callback"],
  "scope": "urn:ietf:params:oauth:scope:mail urn:ietf:params:oauth:scope:calendars",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "client_name": "Example Mail",
  "token_endpoint_auth_method": "none"
}
```

### Registration rules

The server checks each registration against the OAuth Profile for Open Public Clients. A request that breaks a rule is answered with `400 Bad Request` and an RFC 7591 error. The rules are:

- `redirect_uris` must not be empty. Each entry must be either a loopback URI with a path, `http://127.0.0.1[:port]/<path>` or `http://[::1][:port]/<path>`, or a URI with a private-use scheme that contains a dot, such as `com.example.mail:/oauth`. A port given at registration is accepted, and any port matches at authorization time, as [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252) section 7.3 requires for native applications. The following are refused with `invalid_redirect_uri`: https URIs, `http://localhost`, other `http://` hosts, schemes without a dot, URIs with a fragment, and a loopback URI without a path (`http://127.0.0.1`).
- `token_endpoint_auth_method` must be `none` or absent, because a dynamically registered client never has a secret.
- `grant_types`, when present, must include both `authorization_code` and `refresh_token`. `response_types`, when present, must include `code`. The device grant cannot be registered this way.
- `client_uri`, `logo_uri`, `tos_uri` and `policy_uri` must be https URLs.
- `client_name` is at most 256 bytes and must not contain control or bidirectional override characters.
- The encoded client id is at most 2048 bytes. A request body over 20 KiB is not read and fails as a malformed request.

Every violation other than one in the redirect URIs is reported as `invalid_client_metadata`.

Two members are handled in a particular way. The `scope` member caps the scopes the client may request later, and unknown scope names in it are ignored. `post_logout_redirect_uris` is ignored altogether, so the end-session endpoint never redirects a dynamically registered client. An application that needs a post-logout redirect must instead be created as an OAuthClient with [`postLogoutRedirectUris`](/docs/ref/object/o-auth-client#postlogoutredirecturis).

Dynamic client ids are derived from the OAuth encryption key. Changing the key therefore invalidates every dynamic client id together with every token, and applications then have to register again ([Tokens](/docs/auth/oauth/tokens#rotating-the-encryption-key)).

## Register a confidential client

A confidential client is one that can keep a secret, such as a service that runs on a server. It may register through the same endpoint by setting `token_endpoint_auth_method` to `client_secret_basic` or `client_secret_post`. Unlike public registration, this path creates a stored OAuthClient, so it requires an authenticated request from an account or [API key](/docs/auth/authentication/api-key) that holds the `sysOAuthClientCreate` permission. The following request registers a reporting service with an API key:

```bash
curl -X POST https://mail.example.com/auth/register \
  -H 'Authorization: Bearer API_<key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "Example Reports",
    "redirect_uris": ["https://reports.example.com/oauth/callback"],
    "token_endpoint_auth_method": "client_secret_basic",
    "scope": "urn:ietf:params:oauth:scope:mail",
    "contacts": ["it@example.com"]
  }'
```

The response carries a generated client id and secret. `client_secret_expires_at` is set to `0`, which means that the secret does not expire:

```json
{
  "client_id": "k3v9q0w2m8x1r5t7z4b6",
  "client_secret": "<48-character secret>",
  "client_id_issued_at": 1792051200,
  "client_secret_expires_at": 0,
  "redirect_uris": ["https://reports.example.com/oauth/callback"],
  "scope": "urn:ietf:params:oauth:scope:mail",
  "contacts": ["it@example.com"],
  "client_name": "Example Reports",
  "token_endpoint_auth_method": "client_secret_basic"
}
```

The secret is returned only in this response. The server stores it hashed, so it cannot be retrieved later. The redirect URIs must be https, loopback or private-use URIs, which is stricter than creating the same client through the management API.

The registration members become fields of the stored client. `scope`, `grant_types` and `contacts` are stored as the client's `scopes`, `grantTypes` and `contacts`. A client registered without `grant_types` may use the authorization code grant and refresh tokens, and an unknown grant type is refused with `Unsupported grant type.`. Unlike a public client, a confidential client may register the device grant, `urn:ietf:params:oauth:grant-type:device_code`.

`logo_uri` is stored as well. The consent screen, however, displays only `data:image/` logos, so a logo URL registered this way is never shown. Clients registered through this endpoint are never first party.

In the Enterprise edition, a request from a tenant administrator creates a client of that tenant. Once the tenant's `maxOauthClients` quota is used up, the request fails with `The tenant has reached its OAuth client quota.`.

## Create a client as an administrator

Administrators can also create clients directly as [OAuthClient](/docs/ref/object/o-auth-client) objects, in the WebUI under <!-- breadcrumb:OAuthClient --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › OAuth Clients<!-- /breadcrumb:OAuthClient -->, with the CLI or through the management API. This path is the most permissive. It accepts any absolute redirect URI except the unsafe schemes listed in [OAuth clients](/docs/auth/oauth/clients#oauthclient-object), and it is the only way to set post-logout redirect URIs.

The following command creates a public single-page application that may access mail and contacts:

```sh
stalwart-cli create OAuthClient \
  --field clientId=team-webmail \
  --field description='Team Webmail' \
  --field 'redirectUris={"https://webmail.example.com/callback":true}' \
  --field 'postLogoutRedirectUris={"https://webmail.example.com/":true}' \
  --field 'scopes={"mail":true,"contacts":true}'
```

The following JMAP call to the management endpoint creates the same client:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:OAuthClient/set", {
        "create": {
          "c1": {
            "clientId": "team-webmail",
            "description": "Team Webmail",
            "redirectUris": {"https://webmail.example.com/callback": true},
            "postLogoutRedirectUris": {"https://webmail.example.com/": true},
            "scopes": {"mail": true, "contacts": true}
          }
        }
      }, "0"]
    ]
  }'
```

A device without a browser, such as a television or a wall display, signs in with the device authorization grant. To allow this, add `deviceCode` to the client's `grantTypes`, for example `{"authorizationCode": true, "refreshToken": true, "deviceCode": true}`.

## Pre-register an application that publishes a metadata document

Some applications identify themselves with the https URL of a [Client ID Metadata Document](/docs/auth/oauth/client-metadata-documents). Such an application can be accepted without allowing metadata documents in general. To do so, create an OAuthClient whose `clientId` is that URL and whose redirect URIs are the application's.

The client then works whatever the `clientMetadataDocuments` policy says. The consent screen also shows the name and logo from the OAuthClient, not from the document. Only a superuser can create a client with an https client id. A superuser is an account outside any tenant that holds the `impersonate` permission. The following object pre-registers a calendar application:

```json
{
  "clientId": "https://app.example.net/oauth-client.json",
  "description": "Example Calendar",
  "redirectUris": {"https://app.example.net/callback": true},
  "scopes": {"calendars": true, "contacts": true}
}
```

## Trust a first-party application

A first-party application receives unscoped tokens, which carry the account's full permissions. This is meant for a trusted application that is not installed on the server as an [Application](/docs/management/applications/), for example an in-house portal or a WebUI build hosted elsewhere. To make an application first party, create an OAuthClient with `firstParty` set to `true` and at least one redirect URI. Only a superuser can set the flag.

First party does not remove consent. The user is still asked for consent at every sign-in, and the request is shown as `Full access to your account`. The following object creates such a client:

```json
{
  "clientId": "it-portal",
  "description": "IT Portal",
  "redirectUris": {"https://portal.example.com/oauth/callback": true},
  "firstParty": true
}
```

Web applications installed as Applications, including the WebUI, need no OAuthClient, because the server recognises them from their bundle.
