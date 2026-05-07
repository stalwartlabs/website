---
sidebar_position: 1
title: "Overview"
---

OpenID Connect (OIDC) is an identity layer built on top of the [OAuth](/docs/auth/oauth/) 2.0 protocol. Where OAuth 2.0 is concerned with authorization (granting applications access to resources), OpenID Connect adds authentication: clients can verify the identity of the user who signed in. This supports single sign-on, in which a user authenticates once and uses the resulting identity across several services.

In an OIDC flow the user authenticates with an identity provider (the OIDC server) and the client receives an ID token in addition to the usual OAuth access token. The ID token carries information about the authenticated user, such as a unique subject identifier, name, email, and other claims, and lets the client confirm the user's identity without handling passwords directly.

## OAuth

OIDC extends OAuth 2.0 by introducing the ID token: a JSON Web Token (JWT) that carries user identity information. OIDC reuses existing OAuth flows (such as the Authorization Code Flow) but adds endpoints and token types that support authentication. Together, OAuth 2.0 and OIDC cover both authorization and authentication in a single protocol family.

## Provider vs Client

Stalwart supports OpenID Connect in two directions. It can act as an OpenID Connect provider or it can authenticate users against a third-party provider. This lets administrators either use Stalwart as the central identity provider or delegate authentication to an existing identity system.

- [OIDC Provider](/docs/auth/openid/provider): Stalwart acts as the OpenID Connect provider. Clients (web applications, email clients, or other services) authenticate users against Stalwart and receive ID tokens that confirm their identity. This mode is useful when Stalwart is the identity provider for other services.
- [OIDC Client](/docs/auth/backend/oidc): Stalwart delegates authentication to a third-party OpenID Connect provider. This mode is useful when identity is centrally managed elsewhere (for example by Google, Microsoft Entra ID, or Keycloak) and the same accounts should authenticate to the mail server.

Both directions share the same OAuth foundation, and the same [OidcProvider](/docs/ref/object/oidc-provider) singleton controls token lifetimes and related policy when Stalwart acts as the provider.
