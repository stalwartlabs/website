---
sidebar_position: 11
title: "Endpoints and metadata"
description: "Reference of the OAuth and OpenID Connect endpoints, discovery documents and authentication challenge served by Stalwart, with the specifications they implement."
---

This page is the reference for the HTTP side of the OAuth server: the endpoints that applications call, the discovery documents through which they find those endpoints, and the challenge that sends an unauthenticated client to them.
The OAuth and OpenID Connect endpoints are served on the HTTP listeners, under the server's public https URL. Endpoints marked as anonymous need no credentials, and they are subject to the anonymous request rate limit, which protects them against abuse. The others require an authenticated caller.

| Endpoint | Method | Authentication | Purpose |
|---|---|---|---|
| `/login` | GET | None (browser) | Authorization endpoint: consent screen and sign-in form |
| `/device` | GET | None (browser) | Verification page of the device flow |
| `/auth/token` | POST | Anonymous, client authentication | Token endpoint |
| `/auth/device` | POST | Anonymous, client authentication | Device authorization endpoint |
| `/auth/revoke` | POST | Anonymous, client authentication | Token revocation |
| `/auth/introspect` | POST | Required | Token introspection |
| `/auth/register` | POST | Anonymous for public clients | Dynamic client registration |
| `/auth/userinfo` | GET | Access token | OpenID Connect UserInfo |
| `/auth/jwks.json` | GET | Anonymous | Signing keys for ID tokens |
| `/auth/logout` | GET, POST | Anonymous | End-session endpoint |
| `/api/auth/client` | GET | Anonymous (browser) | Client details for the sign-in and device pages |
| `/api/auth` | POST | Anonymous (browser) | Credential and consent submission from the sign-in page |
| `/.well-known/oauth-authorization-server` | GET | Anonymous | Authorization server metadata |
| `/.well-known/openid-configuration` | GET | Anonymous | OpenID Connect discovery |
| `/.well-known/oauth-protected-resource` | GET | Anonymous | Protected resource metadata |
| `/<prefix>/oauth-client.json` | GET | Anonymous | Client metadata of an installed application |
| `/.well-known/user-agent-configuration.json` | GET | Anonymous | PACC document |

## Authorization server endpoints

The authorization server endpoints are the ones that take part in obtaining, checking and ending tokens. Two of them are pages that a person sees in the browser. The others are called by applications.

### `/login`

`/login` is the authorization endpoint. It is an OAuth page that a browser reaches through an authorization request, not a general sign-in page to bookmark. Without valid request parameters, it shows an error. [Authorization requests](/docs/auth/oauth/authorization#authorization-code-flow) lists the request parameters and errors. The page cannot be embedded in a frame.

### `/device`

This page is where a user enters the code shown by a device in the device authorization flow. The link in `verification_uri_complete`, `<public URL>/device/?code=<user code>`, opens it with the code already filled in. The link is built from the server's public https URL, whatever host the request was sent to. The page cannot be embedded in a frame.

### `/auth/token`

The token endpoint serves three grants: `authorization_code`, `refresh_token` and `urn:ietf:params:oauth:grant-type:device_code`. Clients authenticate to it with `none`, `client_secret_basic` or `client_secret_post`. [Authorization requests](/docs/auth/oauth/authorization#token-requests) and [Tokens](/docs/auth/oauth/tokens) describe the requests and the tokens it returns.

### `/auth/device`

This endpoint starts the device authorization flow for a registered client whose `grantTypes` include `deviceCode`. The response contains `device_code`, `user_code`, `verification_uri` (`<public URL>/device`), `verification_uri_complete` and an `interval` of 5 seconds.

### `/auth/revoke`

This endpoint implements token revocation ([RFC 7009](https://www.rfc-editor.org/rfc/rfc7009)). Revoking an access or refresh token deletes the whole grant it belongs to ([Revoking a token from a client](/docs/auth/oauth/tokens#revoking-a-token-from-a-client)).

### `/auth/introspect`

This endpoint implements token introspection ([RFC 7662](https://www.rfc-editor.org/rfc/rfc7662)). An authenticated caller uses it to ask whether a token is active ([Introspection](/docs/auth/oauth/tokens#introspection)).

### `/auth/register`

This endpoint implements dynamic client registration ([RFC 7591](https://www.rfc-editor.org/rfc/rfc7591)). Public clients register anonymously. Confidential clients need a caller with `sysOAuthClientCreate`, because their registration creates a stored client ([Registering an application](/docs/auth/oauth/register-client)).

### `/auth/userinfo`

The UserInfo endpoint returns the OpenID Connect claims of the account that owns the access token ([UserInfo](/docs/auth/oauth/openid-connect#userinfo)).

### `/auth/jwks.json`

This document is the JSON Web Key Set, which holds the public key that signs ID tokens. The set is empty when an HMAC algorithm is configured, because HMAC has no public key ([Signing](/docs/auth/oauth/openid-connect#signing)).

### `/auth/logout`

This is the end-session endpoint of [OpenID Connect RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html), to which an application sends the browser when the user signs out. It accepts `GET` with query parameters or `POST` with a form body. It reads `client_id`, `post_logout_redirect_uri`, `state` and `id_token_hint`, and ignores any other parameter.

Redirecting the browser to an arbitrary URI after sign-out would let anyone use the endpoint as an open redirect. The endpoint therefore redirects the browser with `303 See Other` to `post_logout_redirect_uri`, with `state` appended, only when both of these hold:

- The client is known, from `client_id` or from the audience of a valid `id_token_hint` issued by this server. When both are sent, they must name the same client.
- The URI is registered for that client. It may be registered in `postLogoutRedirectUris` of an [OAuthClient](/docs/auth/oauth/clients#oauthclient-object), in `post_logout_redirect_uris` of a [Client ID Metadata Document](/docs/auth/oauth/client-metadata-documents), or in the `oauth-client.json` of an [installed application](/docs/management/applications/). The match is exact, with no allowance for loopback ports.

In every other case, including invalid or missing parameters, the endpoint shows a page stating `You have been signed out`, and never an error. Dynamically registered clients cannot register post-logout URIs, so they always get this page.

The endpoint ends no session on the server and revokes no token or grant. An application that signs a user out must therefore also revoke its tokens at `/auth/revoke`.

### `/api/auth/client` and `/api/auth`

The sign-in and device pages call these two endpoints from the browser. Neither is meant to be called by applications.

`GET /api/auth/client`, with the query of an authorization request, returns the client's display name, logo, verification status, and whether consent is required. With `?user_code=<code>`, it returns the client that requested that device code. It is anonymous and rate limited.

`POST /api/auth` submits the credentials. When the server answers that consent is required, the page shows the consent screen and submits the decision in a second request to the same endpoint.

## Discovery documents

Discovery documents let an application find the server's endpoints and capabilities without any configuration. Each one is a JSON document at a well-known path.

### `/.well-known/oauth-authorization-server`

This document is the authorization server metadata of [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414). It lists the endpoint URLs: `authorization_endpoint`, `token_endpoint`, `device_authorization_endpoint`, `registration_endpoint`, `introspection_endpoint`, `revocation_endpoint` and `end_session_endpoint`. Besides these, it states:

| Member | Value |
|---|---|
| `code_challenge_methods_supported` | `["S256"]` |
| `authorization_response_iss_parameter_supported` | `true` |
| `client_id_metadata_document_supported` | `true`, always, because installed applications are always resolved |
| `grant_types_supported` | Authorization code, refresh token and device code |
| `token_endpoint_auth_methods_supported` | `none`, `client_secret_basic`, `client_secret_post` |
| `revocation_endpoint_auth_methods_supported` | The same list as the token endpoint |
| `scopes_supported` | The four service scope URNs, `files` only when a JMAP or WebDAV service is configured, plus `openid` and `offline_access` |
| `protected_resources` | Every resource identifier of the server |

### `/.well-known/openid-configuration`

This is the [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) document, which OpenID Connect relying parties read instead of the RFC 8414 metadata. It contains the members of the authorization server metadata except `introspection_endpoint`. `revocation_endpoint` and `end_session_endpoint` are included.

It adds the members that OpenID Connect defines: `userinfo_endpoint`, `jwks_uri`, `subject_types_supported`, `claims_supported` and `id_token_signing_alg_values_supported`. The last of these lists only the configured signing algorithm.

### `/.well-known/oauth-protected-resource`

This document is the protected resource metadata of [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728). A resource server publishes it to tell clients which authorization server issues tokens for it. The response contains `resource`, `authorization_servers`, `scopes_supported` and `bearer_methods_supported: ["header"]`.

The path-inserted form `/.well-known/oauth-protected-resource/<path>` describes the resource `https://<host>/<path>`. The document is served only on the server's trusted hosts, and other hosts receive `404`. For a host whose domain is served by an [OpenID Connect directory](/docs/auth/backend/oidc), `authorization_servers` names the issuer of the external provider, because that provider issues the tokens.

### `/<prefix>/oauth-client.json`

This is the Client ID Metadata Document of an installed application such as the WebUI. The server builds it for the requesting host from the template in the application's bundle. It is served without authentication or caching, and only on trusted hosts, or on any origin in bootstrap and recovery mode ([Applications](/docs/management/applications/)).

### `/.well-known/user-agent-configuration.json`

This is the PACC document of a domain, served on the host `ua-auto-config.<domain>`. What it advertises depends on who authenticates the domain's accounts. It advertises OAuth for domains of the built-in server, and for domains whose external provider conforms to the open public clients profile. For all other domains, it advertises password authentication only ([Autoconfig](/docs/server/autoconfig)).

## Authentication challenge

A client that calls an HTTP service without valid credentials has to learn where to obtain them. The response is therefore `401 Unauthorized` with a challenge that points to the protected resource metadata for the requested path:

```text
WWW-Authenticate: Bearer realm="Stalwart Server", resource_metadata="https://mail.example.com/.well-known/oauth-protected-resource/jmap/session"
```

The URL is absolute and built for each request. Services that also accept HTTP Basic add a second header, `WWW-Authenticate: Basic realm="Stalwart Server"`. The challenge carries no `error` attribute.

## Issuer and public URL

The issuer and the endpoint URLs in the metadata documents are built from the server's public https URL. When no public URL is set, as in bootstrap and recovery mode, they follow the host of the request.

The `/api/discover` endpoint used by the WebUI behaves differently on a connection without TLS: it returns relative endpoint URLs. The WebUI therefore keeps working behind a proxy that forwards plain HTTP.

## Standards

The OAuth server implements the following specifications:

- [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749): The OAuth 2.0 Authorization Framework
- [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750): Bearer Token Usage
- [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009): Token Revocation
- [RFC 7591](https://www.rfc-editor.org/rfc/rfc7591): Dynamic Client Registration Protocol
- [RFC 7628](https://www.rfc-editor.org/rfc/rfc7628): SASL Mechanisms for OAuth
- [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636): Proof Key for Code Exchange
- [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662): Token Introspection
- [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252): OAuth 2.0 for Native Apps
- [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414): Authorization Server Metadata
- [RFC 8628](https://www.rfc-editor.org/rfc/rfc8628): Device Authorization Grant
- [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707): Resource Indicators
- [RFC 9068](https://www.rfc-editor.org/rfc/rfc9068): JWT Profile for Access Tokens, for tokens of external providers
- [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207): Authorization Server Issuer Identification
- [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700): Best Current Practice for OAuth 2.0 Security
- [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728): Protected Resource Metadata
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html), [Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) and [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html)
- [draft-ietf-mailmaint-oauth-public](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/): OAuth Profile for Open Public Clients
- [draft-ietf-mailmaint-pacc](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-pacc/): Automatic Configuration of Email, Calendar, and Contact Server Settings
- [draft-ietf-oauth-client-id-metadata-document](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/): OAuth Client ID Metadata Document

DPoP ([RFC 9449](https://www.rfc-editor.org/rfc/rfc9449)), which binds tokens to a key held by the client, is not supported.
