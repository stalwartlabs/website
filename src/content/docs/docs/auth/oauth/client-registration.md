---
sidebar_position: 4
title: "Dynamic Registration"
---

The OAuth Dynamic Client Registration Protocol ([RFC 7591](https://www.rfc-editor.org/rfc/rfc7591.html)) extends OAuth 2.0 so that clients can register with an authorization server without administrator intervention. In a pre-registration model, each client id and secret is created manually; dynamic registration is well suited to environments where many applications or devices need to connect, such as cloud services or IoT deployments.

A client that wants to register sends an HTTP request to the OAuth server's registration endpoint, supplying metadata about itself (name, redirect URIs, and the types of grants it intends to use). If the request is accepted, the server returns a client id and, when applicable, a client secret that the client uses to authenticate during subsequent OAuth flows.

The overall sequence is as follows:

1. **Registration request**: the client sends an HTTP POST to the OAuth server's registration endpoint with its metadata (name, redirect URIs, supported flows, and so on).
2. **Client registration**: the server validates the request and, if acceptable, returns a client id and optional secret.
3. **Client use of credentials**: the client uses the returned credentials to drive OAuth flows and obtain access and refresh tokens.

Stalwart supports the Dynamic Client Registration Protocol against its built-in OAuth server.

## Enabling registration

By default, Stalwart does not require clients to register before requesting access tokens: any client id is accepted. To enforce registration, set [`requireClientRegistration`](/docs/ref/object/oidc-provider#requireclientregistration) on the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->) to `true`. When enabled, every client must register and obtain credentials before the server issues tokens to it.

## Client authentication

Before a client can register, it must itself authenticate. The recommended approach is to create an [API Key](/docs/auth/authentication/api-key) for the client. The key should be granted the `authenticate` and `oauth-client-registration` [permissions](/docs/auth/authorization/permissions), allowing the client to authenticate and to perform the registration call.

## Anonymous registrations

Clients can also be allowed to register without any prior authentication, although this is not recommended because it widens the attack surface. Anonymous registration is controlled by [`anonymousClientRegistration`](/docs/ref/object/oidc-provider#anonymousclientregistration) on the [OidcProvider](/docs/ref/object/oidc-provider) singleton. The default, `false`, should be kept unless there is a specific reason to allow untrusted clients to self-register.

## Managing clients

Once dynamic registration is enabled and a client registers successfully, the client is stored as an [OAuthClient](/docs/ref/object/o-auth-client) object (found in the WebUI under <!-- breadcrumb:OAuthClient --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › OAuth Clients<!-- /breadcrumb:OAuthClient -->). The relevant fields are [`clientId`](/docs/ref/object/o-auth-client#clientid), [`description`](/docs/ref/object/o-auth-client#description), [`contacts`](/docs/ref/object/o-auth-client#contacts), [`redirectUris`](/docs/ref/object/o-auth-client#redirecturis), [`secret`](/docs/ref/object/o-auth-client#secret), [`logo`](/docs/ref/object/o-auth-client#logo), [`expiresAt`](/docs/ref/object/o-auth-client#expiresat), and [`memberTenantId`](/docs/ref/object/o-auth-client#membertenantid). Administrators can modify or delete registered clients from the [WebUI](/docs/management/webui/) or the JMAP API.

## WebUI client

The Stalwart [WebUI](/docs/management/webui/), which includes the Self-Service Portal for end users, authenticates through OAuth. When `requireClientRegistration` is set to `true`, the WebUI stops working unless it is itself registered, because its default client id (`webadmin`) is not registered automatically.

### Manual registration

To keep the WebUI functional after enforcing client registration, create an OAuthClient object with:

- [`clientId`](/docs/ref/object/o-auth-client#clientid): `webadmin`
- [`redirectUris`](/docs/ref/object/o-auth-client#redirecturis): `["stalwart://auth"]`

With the WebUI registered as an OAuth client, administrators and users continue to reach the WebUI and the Self-Service Portal without interruption.

### Alternative

When administrators prefer not to register the WebUI explicitly, they can instead grant the `oauth-client-override` [permission](/docs/auth/authorization/permissions) to administrative accounts. This permission allows the holder to use any client id, bypassing the registration requirement.

The `oauth-client-override` permission should not be granted to regular accounts. Doing so effectively disables the registration requirement for those accounts and should be reserved for administrators who need to manage the server or troubleshoot access.
