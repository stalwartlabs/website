---
sidebar_position: 4
---

# Endpoints

Stalwart supports various **OpenID Connect (OIDC)** endpoints that allow clients and applications to interact with the server for authentication and identity information. Below is a brief description of the key OIDC endpoints available in Stalwart.

## `/.well-known/openid-configuration`

The `/.well-known/openid-configuration` endpoint, also known as the **OIDC Discovery Endpoint**, provides a JSON document containing metadata about the OpenID Connect provider. This metadata helps clients dynamically discover important information about the OIDC provider’s configuration, such as the URLs for authorization, token issuance, and user information endpoints, as well as supported signing algorithms and scopes.

Clients typically use this endpoint to automatically configure themselves to interact with the OIDC server, removing the need for manual configuration.

## `/auth/userinfo`

The `/auth/userinfo` endpoint is used to retrieve identity information about the authenticated user. After the client obtains an access token via an OAuth or OpenID Connect flow, it can query the UserInfo endpoint to get detailed claims about the user, such as their email, username, and other profile information. This endpoint is an essential part of the OpenID Connect standard and helps clients access the user’s identity after successful authentication.

The client must include the access token in the request, which the server uses to look up and return the associated user information.

## `/auth/jwks.json`

The `/auth/jwks.json` endpoint provides the **JSON Web Key Set (JWKS)**, which is a set of public keys used by clients to verify the signatures of ID tokens, access tokens, or other signed JWTs issued by the server. This endpoint plays a critical role in enabling clients to securely validate the authenticity and integrity of tokens without needing access to the server’s private keys.

The keys provided by this endpoint are used to validate the JWTs’ digital signatures, ensuring they were issued by the correct OIDC provider and have not been tampered with.

## Conformed Standards

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [OpenID Connect Dynamic Client Registration 1.0](https://openid.net/specs/openid-connect-registration-1_0.html)
- [RFC 7517 - JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517)


