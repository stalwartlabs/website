---
sidebar_position: 5
title: "Authorization requests"
description: "Reference for the authorization code flow, the token endpoint and the device authorization flow of Stalwart's OAuth server: parameters, validation rules and errors."
---

An application obtains its tokens in two steps. First it sends the user's browser to the authorization endpoint, where the user allows the request and signs in. The server answers with a short-lived authorization code, which the application then exchanges for tokens at the token endpoint. The code passes through the browser, but the tokens do not, which keeps them out of browser history and logs. Devices without a browser cannot take part in the first step, so they use the device authorization flow instead.

This page describes the rules the server applies to each of these requests. They follow [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) as profiled by the [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/), together with these extensions:

- PKCE ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)), which binds the authorization code to the client that requested it
- Resource indicators ([RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)), with which a client names the services it intends to use
- The `iss` response parameter ([RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)), which tells the client which server issued the response
- The device authorization grant ([RFC 8628](https://www.rfc-editor.org/rfc/rfc8628))

[Endpoints and metadata](/docs/auth/oauth/endpoints) lists the endpoint URLs.

## Authorization code flow

Every kind of client uses the authorization code flow: native mail applications, browser-based applications and server-side services. The flow runs in four stages:

1. The client sends the user's browser to the authorization endpoint `/login`.
2. The server shows the consent screen and the sign-in form.
3. The server redirects the browser to the client's redirect URI, with an authorization code.
4. The client exchanges the code at the token endpoint for an access token and a refresh token.

The following URL is a typical request from a native application, with line breaks added for readability:

```text
https://mail.example.com/login?response_type=code
    &client_id=swc1.<encoded registration>
    &redirect_uri=http%3A%2F%2F127.0.0.1%3A49152%2Fcallback
    &state=af0ifjsldkj
    &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    &code_challenge_method=S256
    &scope=urn%3Aietf%3Aparams%3Aoauth%3Ascope%3Amail
    &resource=imap.example.com
```

The endpoint recognises the following parameters and ignores any other:

| Parameter | Rule |
|---|---|
| `client_id` | Required. Must identify a known client ([OAuth clients](/docs/auth/oauth/clients)). |
| `redirect_uri` | Required. Must be identical to a redirect URI registered for the client, for every client kind; a registered loopback URI matches any port. |
| `response_type` | Required. Only `code` is supported. |
| `state` | Required and non-empty. Returned unchanged on the redirect. |
| `code_challenge`, `code_challenge_method` | Required unless the client has a secret. The method must be `S256` and the challenge 43 base64url characters. |
| `scope` | Optional. Space-separated; every scope must be allowed for the client ([Scopes](/docs/auth/oauth/scopes)). |
| `resource` | Optional, up to 16 values. Each must identify a service of this server. |
| `nonce` | Optional. Copied into the ID token. |

`state` is a value the client chooses and checks when the response arrives, which protects it against forged responses. `code_challenge` is the hash half of PKCE: the client keeps the original value, the verifier, and presents it later at the token endpoint.

The query string is limited to 8 KiB, and a longer request is answered with the error page. A registered client whose `grantTypes` do not include the authorization code grant is refused with `unauthorized_client`.

### Resource indicators

A `resource` value names a service the client intends to use. It takes one of two forms:

- A bare hostname, equal to the hostname of an IMAP, POP3, SMTP submission or ManageSieve service of the server
- An https URL whose host and port equal those of an HTTP service of the server, with any path

The query of such a URL is ignored, and a URL with user information or a fragment is refused. Any other value is refused with `invalid_target`. In bootstrap and recovery mode, a resource equal to the origin of the request is also accepted.

The server validates resources but does not bind them into the tokens. A token therefore remains valid for every service that its scopes allow, whatever resources the request named.

### Responses and errors

When the user allows the request and signs in, the browser is redirected to the redirect URI with three parameters: `code`, `state`, and `iss`, the issuer identifier of the server. The code is valid for the time set in [`authCodeExpiry`](/docs/ref/object/oidc-provider#authcodeexpiry), can be used once, and is bound to the client and the redirect URI of the request.

The server reports errors in one of two ways, depending on whether it can trust the redirect URI. It cannot trust it in these cases:

- The query string exceeds 8 KiB.
- The client is unknown, or `client_id` is missing or repeated.
- `redirect_uri` is missing, repeated or not registered for the client.

Redirecting the browser to an untrusted URI would hand the response to whoever controls it. In these cases the server therefore shows an error page in the browser and never redirects. Every other error is returned to the client by redirecting to its redirect URI with `error`, an `error_description`, `state` and `iss`:

| Condition | `error` |
|---|---|
| Missing `response_type` or `state`, a repeated parameter other than `resource`, a missing or malformed PKCE challenge, a challenge method other than `S256` | `invalid_request` |
| `response_type` other than `code` | `unsupported_response_type` |
| The client may not use the authorization code grant | `unauthorized_client` |
| A scope outside the client's allowed set | `invalid_scope` |
| An unknown resource, or more than 16 `resource` values | `invalid_target` |
| The user denies the request on the consent screen | `access_denied` |
| A tenant-owned client and an account outside its tenant | `access_denied` |

The pages served at `/login` and `/device` cannot be embedded in a frame, which protects users against pages that overlay the sign-in form. They are sent with `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'`.

## Token requests

The token endpoint is where clients obtain and refresh their tokens. They call `POST /auth/token` with a form-encoded body. The endpoint supports three grant types, each with its own parameters:

- `authorization_code` exchanges an authorization code. It takes `code`, `redirect_uri`, `client_id` and, when the authorization request carried a challenge, `code_verifier`.
- `refresh_token` obtains new tokens with a refresh token. It takes `refresh_token` and `client_id`, and optionally `scope`.
- `urn:ietf:params:oauth:grant-type:device_code` completes the device flow. It takes `device_code` and `client_id`.

How a client identifies itself depends on whether it has a secret. Public clients send `client_id` in the body, which corresponds to the method `none`. Confidential clients authenticate either with HTTP Basic (`client_secret_basic`) or with `client_id` and `client_secret` in the body (`client_secret_post`). A request that sends Basic credentials together with a different or additional `client_id` or `client_secret` in the body is ambiguous, and is refused with `invalid_request`.

The following request exchanges an authorization code:

```bash
curl -X POST https://mail.example.com/auth/token \
  -d grant_type=authorization_code \
  -d code=<code> \
  -d redirect_uri=http://127.0.0.1:49152/callback \
  -d client_id=swc1.<encoded registration> \
  -d code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

The token endpoint applies these rules:

- `code_verifier` must be 43 to 128 characters from `[A-Za-z0-9-._~]`, and it must match the stored challenge. A client that sent no challenge, which only a confidential client may do, must not send a verifier. A verifier without a stored challenge is refused with `invalid_grant`.
- An invalid, expired or already used authorization code or refresh token is refused with `invalid_grant`. So is a refresh token presented by a client other than the one it was issued to. A refresh request without `client_id` is refused with `invalid_request`.
- A refresh request may carry `scope`, which must be a subset of the scopes originally granted, or the request is refused with `invalid_scope`. The new tokens keep the scopes of the grant either way.
- The client is resolved again on every request. If it no longer exists, has expired or fails authentication, the response is `invalid_client` with HTTP status 401, plus a `WWW-Authenticate: Basic` header when the client used Basic authentication. If its kind has changed, or the grant holds scopes the client no longer allows, the grant is deleted and the request fails with `invalid_grant`.
- An unknown or expired device code is refused with `expired_token`.

A successful response contains `access_token`, `token_type`, `expires_in`, `scope` and `username`. The authorization code and device grants also return a `refresh_token`, and an `id_token` when the granted scope contains `openid`.

One exception applies to the recovery administrator. When its grant cannot be stored, for example because the data store is failing in recovery mode, the sign-in still succeeds, but the response carries no refresh token. The administrator then signs in again when the access token expires. [Tokens](/docs/auth/oauth/tokens) describes token lifetimes, refresh-token rotation and revocation.

## Device authorization flow

Some devices have no browser, or only limited input, such as a television or a wall display. The device authorization flow lets such a device sign in through a second device that has a browser. The flow runs as follows:

1. The device requests a code pair from `POST /auth/device`.
2. The device shows the user a short user code and the verification URL `/device`.
3. The user opens the URL on another device, enters the code, allows the request and signs in.
4. Meanwhile, the device polls the token endpoint every 5 seconds (the `interval` in the response) until the user has finished.

The response also contains `verification_uri_complete`, a link of the form `<public URL>/device/?code=<user code>` that opens the page with the code already filled in.

The following request starts the flow:

```bash
curl -X POST https://mail.example.com/auth/device \
  -d client_id=living-room-display \
  -d scope=urn:ietf:params:oauth:scope:calendars
```

Only registered clients whose `grantTypes` include `deviceCode` can use the flow, and any other client is refused with `unauthorized_client`. Requested scopes follow the same rules as in the authorization code flow. A user code expires after the time set in [`userCodeExpiry`](/docs/ref/object/oidc-provider#usercodeexpiry).

Once the user enters the code, the verification page shows the client's name and logo and the access it requests, and the user must allow the request and sign in. Until the user has decided, polling returns `authorization_pending`. If the user denies the request, polling returns `access_denied`.
