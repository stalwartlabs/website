---
sidebar_position: 1
---

# Overview

**OpenID Connect (OIDC)** is an identity layer built on top of the [OAuth](/docs/auth/oauth/overview) 2.0 protocol. While OAuth 2.0 is primarily concerned with authorization — granting third-party applications access to resources — OpenID Connect adds authentication, enabling clients to verify the identity of users. It allows for single sign-on (SSO) functionality, where a user can log in once and use their authenticated identity across multiple services or applications.

In an OpenID Connect flow, the user authenticates with an identity provider (OIDC server), and the client receives an **ID token** in addition to the usual OAuth access token. The ID token contains information about the authenticated user, such as their unique identifier (subject), name, email, and other claims. This enables clients to confirm the user’s identity without needing to handle usernames and passwords directly.

OpenID Connect is widely used for SSO and identity management in web and mobile applications, as it simplifies the login process and enhances security by delegating authentication to a trusted identity provider. 

## OAuth

OpenID Connect extends OAuth 2.0 by adding the capability to perform user authentication in addition to the authorization features provided by OAuth. OAuth handles authorization by issuing access tokens that allow clients to access specific resources on behalf of a user, but it doesn’t directly authenticate the user or provide identity information. 

With OIDC, OAuth's authorization framework is enhanced by introducing the **ID token**, a JSON Web Token (JWT) that provides user identity information. The OIDC specification uses OAuth's existing flows (such as the **Authorization Code Flow**) but includes additional endpoints and token types to support authentication. Thus, OpenID Connect allows OAuth 2.0 to manage both authorization and authentication in a unified protocol.

## Provider vs Client

Stalwart Mail Server supports OpenID Connect in two primary ways: it can function as an **OpenID Connect Provider** (OIDC server) or be configured to authenticate users against **third-party OIDC providers**. This flexibility allows administrators to either use Stalwart as the central identity provider or leverage external OIDC services for authentication.

- [OIDC Provider](/docs/auth/openid/provider):  Stalwart Mail Server acts as an OpenID Connect provider, allowing clients (such as web applications, email clients, or other services) to authenticate users and obtain ID tokens that confirm their identity. This mode is useful when Stalwart is the central service managing user identities across multiple applications and services within an organization.
- [OIDC Client](/docs/auth/backend/oidc): Stalwart Mail Server can also be configured to authenticate users against a third-party OpenID Connect provider, allowing the server to delegate user authentication to an external OIDC service. This approach is useful for organizations that prefer to use a centralized identity provider (such as Google, Azure AD, or any other OpenID Connect-compliant provider) to manage user authentication across different services, including Stalwart Mail Server.

OpenID Connect is a powerful addition to the OAuth 2.0 framework that enables both authentication and authorization in a unified protocol. Stalwart Mail Server provides flexible OpenID Connect support by acting as an OIDC provider, allowing clients to authenticate users and obtain identity information directly from Stalwart. Alternatively, it can be configured to authenticate users against third-party OIDC providers, integrating seamlessly with external identity services. This flexibility ensures that Stalwart Mail Server can meet the authentication needs of a wide range of environments, whether by managing identities internally or leveraging existing external identity providers.
