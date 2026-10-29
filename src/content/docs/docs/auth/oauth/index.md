---
sidebar_position: 1
title: "Overview"
description: "The built-in OAuth 2.0 authorization server and OpenID Connect provider: which clients it accepts, what users see, and how it relates to external identity providers."
---

OAuth 2.0 ([RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)) lets an application act on behalf of a user without ever holding the user's password. Instead of asking for the password, the application sends the user to an authorization server. The user signs in there and approves the request, and the application receives two tokens in return. The access token is presented to the server on each request, in place of a password. The refresh token is kept by the application and exchanged for a new access token whenever the current one expires, so the user does not have to sign in again. OpenID Connect builds on this exchange and adds a third token, the ID token, which tells the application who signed in.

Stalwart includes an OAuth 2.0 authorization server and an OpenID Connect provider. The tokens it issues are accepted on every protocol it serves: JMAP, IMAP, POP3, SMTP submission, ManageSieve, CalDAV, CardDAV, WebDAV and the management API. Three kinds of application rely on it:

- Mail, calendar and contacts applications use it to sign in without storing a password.
- The [WebUI](/docs/management/webui/) uses it for every sign-in.
- Third-party applications use it to obtain limited access to an account.

The server works without any configuration. Its defaults implement the [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/), a specification that defines how a mail application can obtain tokens from a server it has never been registered with. The [PACC](/docs/server/autoconfig) discovery document advertises this support to mail clients, so that they can find and use it on their own.

## Clients

Every application that requests tokens is an OAuth client, and each client is identified by a client id. Stalwart issues tokens only to clients it can identify. It recognises a client id in one of five forms:

- A dynamically registered client, whose id starts with `swc1.`. Mail applications obtain such an id from the registration endpoint without any credentials, and the server stores nothing for it.
- A registered client. This is an [OAuthClient](/docs/ref/object/o-auth-client) object that an administrator has created, for example for a third-party web application that authenticates with a client secret.
- A first-party registered client. This is an OAuthClient that a superuser has marked as first party, and its tokens carry the account's full permissions. A superuser is an administrator outside any tenant who holds the `impersonate` permission.
- An installed web application, such as the WebUI. The server recognises it from the `oauth-client.json` document in its bundle.
- A Client ID Metadata Document. This is an https URL that serves a description of the client, and the server accepts it when its policy allows.

Any other client id is refused with `invalid_client`, so tokens are never issued to an unknown client. [OAuth clients](/docs/auth/oauth/clients) describes each kind and how they differ.

## User consent

When an application requests access, the user's browser opens the server's sign-in page. After the user signs in, the page shows a consent screen for every application except installed web applications such as the WebUI. The screen names the application and the access it requests, and the application receives access only after the user allows it.

Each authorization creates a grant, the server's record that this user allowed this application. While a grant covers what the application asks for, later sign-ins skip the consent screen. Users review their grants in the Account Manager under Connected Applications, and revoking a grant there signs the application out. [Consent and connected applications](/docs/auth/oauth/consent) describes the consent screen and the grants.

## Settings

The settings of the authorization server are fields of the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->). They cover the token lifetimes, the key that encrypts tokens, the key that signs OpenID Connect ID tokens, and the policy for Client ID Metadata Documents.

Registered clients are OAuthClient objects (found in the WebUI under <!-- breadcrumb:OAuthClient --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › OAuth Clients<!-- /breadcrumb:OAuthClient -->).

A fresh installation generates both keys. No other setting has to change before mail applications or the WebUI can sign in.

## External identity providers

Stalwart can also rely on an external OpenID Connect provider, such as a corporate identity platform, for some or all of its domains. The accounts of a domain served by an [OpenID Connect directory](/docs/auth/backend/oidc) authenticate at that provider. The provider then acts as the authorization server, and Stalwart only validates the tokens the provider issues.

The two roles are independent of each other. The built-in server keeps serving the domains that use the internal, LDAP or SQL directory, while the external provider serves its own domains.

Stalwart never brokers sign-ins on behalf of an external provider. A native mail application registers with the provider and requests its tokens there, which means that the provider must itself implement the OAuth Profile for Open Public Clients for these applications to work. Most providers do not yet implement it in full. [OpenID Connect directory](/docs/auth/backend/oidc) describes the consequences, and the compatibility settings that let web clients such as the WebUI sign in regardless.
