---
sidebar_position: 5
---

# Endpoints

Stalwart Mail Server provides multiple OAuth endpoints to facilitate secure authentication and authorization processes. These endpoints allow clients to interact with the OAuth server for tasks such as obtaining access tokens, authorizing devices, and validating tokens. Below is a description of the available endpoints and their functions.

## `/.well-known/oauth-authorization-server`

The `/.well-known/oauth-authorization-server` endpoint is used to obtain metadata about the OAuth server’s configuration. This metadata, as defined by the OAuth 2.0 Authorization Server Metadata specification, includes information about all available OAuth endpoints, supported flows, token lifetimes, and other capabilities of the server.

Clients can request the metadata from this endpoint to dynamically discover the URLs of the authorization, token, device, and introspection endpoints, along with other essential details like supported scopes and signing algorithms. This provides clients with the necessary information to interact correctly with the OAuth server, reducing manual configuration and simplifying integration.

## `/auth/token`

The `/auth/token` endpoint is the **Token Endpoint** of the OAuth server, responsible for issuing and refreshing access tokens. This is a central endpoint for all OAuth flows, as clients use it to exchange authorization codes, device codes, or refresh tokens for access tokens.

In the **Authorization Code Flow**, clients send the authorization code received after user consent to this endpoint to obtain an access token. In the **Device Authorization Flow**, the client exchanges the device code for an access token here after the user has completed authorization. Additionally, clients can use this endpoint to refresh access tokens using refresh tokens if they were issued during the initial token exchange.

## `/auth/device`

The `/auth/device` endpoint is the **Device Authorization Endpoint** used in the **Device Authorization Flow**. This flow is specifically designed for devices with limited input capabilities, such as smart TVs or IoT devices, where traditional login methods are not feasible.

Clients initiate the Device Authorization Flow by making a request to this endpoint, providing the necessary client details. The server responds with a **device code** and a **user code**, along with instructions for the user to visit a URL (often on another device, such as a phone or computer) to enter the user code and approve the request. Once the user authorizes the client, the client polls the `/auth/token` endpoint using the device code to obtain an access token.

## `/auth/introspect`

The `/auth/introspect` endpoint is the **Token Introspection Endpoint**, used to validate and inspect the status of access tokens. This endpoint allows resource servers to verify whether an access token is valid, expired, revoked, or has specific scopes or permissions attached to it.

When a resource server receives a request from a client using an access token, it can query this endpoint to confirm the token’s validity and associated metadata. The response will include details such as the token’s active status, expiration time, scopes, and the client ID it was issued to.

## Conformed RFCs

- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html)
- [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html)
- [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628)
- [RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol](https://www.rfc-editor.org/rfc/rfc7591.html)
- [RFC 7662 - OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662)

