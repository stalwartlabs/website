---
sidebar_position: 6
---

# OAuth Clients

An OAuth client is an application or service that requests access tokens from the Stalwart OAuth server on behalf of a user. Every client that participates in an OAuth flow is identified by a client id and, for confidential clients, a client secret. Registered clients are stored on the server so that redirect URIs, contact information, and secrets can be validated against a known record before tokens are issued.

Each registered client is represented by an [OAuthClient](/docs/ref/object/o-auth-client) object (found in the WebUI under <!-- breadcrumb:OAuthClient --><!-- /breadcrumb:OAuthClient -->). Administrators can create, modify, and delete these objects from the WebUI or through the JMAP API; the same object is also created automatically when a client registers itself through the [dynamic client registration](/docs/auth/oauth/client-registration) endpoint.

## Pre-registered and dynamically registered clients

There are two ways a client record appears in the server. The first is pre-registration, in which an administrator creates an OAuthClient object directly, typically for first-party applications such as the Stalwart WebUI or for a small set of known third-party integrations. The second is [dynamic client registration](/docs/auth/oauth/client-registration), defined in RFC 7591, where the client itself calls the registration endpoint and the server creates the record in response. Dynamic registration is better suited to environments where many clients need to onboard without operator involvement, such as cloud services or IoT fleets; pre-registration is preferable when the set of trusted clients is small and well known.

Whether registration is mandatory is controlled by [`requireClientRegistration`](/docs/ref/object/oidc-provider#requireclientregistration) on the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><!-- /breadcrumb:OidcProvider -->). With the default value of `false`, any client id is accepted and the server issues tokens without consulting the registry. When set to `true`, every client must have a matching OAuthClient record, created either manually or through dynamic registration, before tokens are issued.

## Client credentials

The client is identified by [`clientId`](/docs/ref/object/o-auth-client#clientid), a string that must be unique across the server. Confidential clients additionally carry a [`secret`](/docs/ref/object/o-auth-client#secret) that the client presents when exchanging authorization codes or requesting tokens through flows that require client authentication. The secret is stored hashed and is returned in clear only once, at the time it is set. Public clients, such as single-page applications and mobile apps that cannot keep a secret, leave the field empty and rely on PKCE for flow protection.

An [`expiresAt`](/docs/ref/object/o-auth-client#expiresat) timestamp can be set to cause the client record to stop being accepted after a given date. A [`createdAt`](/docs/ref/object/o-auth-client#createdat) timestamp records when the record was issued. A [`description`](/docs/ref/object/o-auth-client#description) identifies the client in administrative listings, a [`logo`](/docs/ref/object/o-auth-client#logo) supplies a visual indicator that can be shown on consent screens, and [`contacts`](/docs/ref/object/o-auth-client#contacts) records one or more email addresses for the party responsible for the client.

## Redirect URIs

The [`redirectUris`](/docs/ref/object/o-auth-client#redirecturis) field enumerates the redirection endpoints the client may use at the end of an authorization code flow. The server refuses to complete a flow whose `redirect_uri` parameter does not exactly match one of the entries in this list, which prevents an attacker who learns a client id from redirecting authorization responses to a host they control. For native applications, this is also where the custom URI scheme used to return control to the app is declared; for instance, the Stalwart WebUI registers `stalwart://auth`.

## Tenant scoping

In multi-tenant deployments, the [`memberTenantId`](/docs/ref/object/o-auth-client#membertenantid) field binds the client to a single [Tenant](/docs/ref/object/tenant). A tenant-scoped client can only request tokens for accounts within that tenant, and administrators of other tenants cannot see or modify it. Clients left without a tenant assignment are visible at the server level and can authenticate accounts regardless of tenancy.
