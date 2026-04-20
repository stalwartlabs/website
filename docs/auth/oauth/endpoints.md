---
sidebar_position: 5
---

# Endpoints

Stalwart exposes several OAuth endpoints that clients use to obtain access tokens, authorize devices, and validate tokens. The endpoint behaviour is governed by the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->), which defines token lifetimes, the authorization-code retry limit, and related policy.

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

