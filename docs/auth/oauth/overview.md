---
sidebar_position: 1
---

# Overview

OAuth (Open Authorization) is an open standard for token-based authentication and authorization between applications and services. It allows third-party applications to act on a user's behalf without holding the user's password, using short-lived access tokens issued by an authorization server.

Access tokens are issued with a defined scope and lifespan, so third-party applications can only perform the actions they have been granted, and only for a bounded period. This model is standard across web, mobile, and desktop clients.

Stalwart includes a built-in OAuth server. It allows clients, such as mail applications or third-party services, to register and obtain the access tokens required to interact with the server's services.

Clients first register with the built-in OAuth server and receive a unique client id and, optionally, a client secret. Registration can be static (administrator-managed) or dynamic (self-registration over the OAuth Dynamic Client Registration protocol). Once registered, clients request an access token through one of the supported authorization flows and present that token on subsequent requests.

On each request, the OAuth server validates the access token before granting access to a protected resource, so only authorised clients with valid tokens can reach user data.

OAuth 2.0 is enabled by default and requires no configuration to function. Its behaviour can be adjusted through the [OidcProvider](/docs/ref/object/oidc-provider) singleton, which controls token lifetimes, client-registration policy, and related security settings.
