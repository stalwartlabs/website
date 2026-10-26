---
sidebar_position: 9
title: "Mail, calendar and contacts clients"
description: "How mail, calendar and contacts applications discover Stalwart's OAuth server, register, and sign in to IMAP, POP3, SMTP, ManageSieve, CalDAV and CardDAV with OAuth tokens."
---

Mail, calendar and contacts applications can sign in to Stalwart with OAuth, so they never have to store the user's password. How the application presents its access token depends on the protocol:

- On the HTTP-based protocols (JMAP, CalDAV, CardDAV, WebDAV), the application sends the token in an `Authorization: Bearer` header.
- On IMAP, POP3, SMTP and ManageSieve, the application uses one of two SASL mechanisms, the pluggable authentication methods of these protocols. `OAUTHBEARER` is defined in [RFC 7628](https://www.rfc-editor.org/rfc/rfc7628). `XOAUTH2` is an older mechanism with the same purpose, which some applications implement instead.

Stalwart supports both mechanisms, and the PACC specification advises clients to prefer `OAUTHBEARER`.

Presenting a token is only part of the problem. For an application to work with any server without manual setup, it must also find the authorization server and obtain a client id on its own. The [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/) defines how this happens:

1. The application discovers the server's OAuth metadata.
2. It registers dynamically, without credentials.
3. It requests the interoperable mail, contacts, calendars and files [scopes](/docs/auth/oauth/scopes).
4. It protects the authorization code with PKCE (`S256`), so that an intercepted code is useless to anyone else.

Stalwart implements this profile with its default settings. An application that implements it therefore needs no configuration on the server.

## Discovery

An application usually starts with nothing but the user's email address. It finds the server settings through the [PACC](/docs/server/autoconfig) document of the domain ([draft-ietf-mailmaint-pacc](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-pacc/)). The document lists the protocols and their endpoints, states whether OAuth is supported, and names the issuer of the authorization server. From there, the application reads the authorization server metadata at `/.well-known/oauth-authorization-server`.

A second path leads to the same place. An application that first contacts an HTTP service without a token receives a `401` response. Its `WWW-Authenticate` header carries a `resource_metadata` URL, which points to the protected resource metadata of [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728), and that document names the authorization server as well. [Endpoints and metadata](/docs/auth/oauth/endpoints) lists these documents.

Once it knows the server, the application registers at `/auth/register` as described in [Registering an application](/docs/auth/oauth/register-client#register-a-native-or-mail-client-dynamically). It then opens the authorization endpoint in a browser and obtains its tokens.

## TLS on the mail protocols

A bearer token works like a password for as long as it is valid, so it must not cross the network in cleartext. On IMAP, POP3, SMTP and ManageSieve, the `OAUTHBEARER` and `XOAUTH2` mechanisms are therefore offered and accepted only on connections protected by TLS, as the open public clients profile requires. The rule covers every bearer credential carried by these mechanisms:

- Access tokens of the built-in server
- Tokens of an external identity provider
- [API keys](/docs/auth/authentication/api-key)

Two settings that relax authentication without TLS do not change this, because they control the password mechanisms only. These are the [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth) setting of IMAP, POP3 and ManageSieve, and the SMTP [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms) expression. `allowPlainTextAuth` is <!-- default:Imap.allowPlainTextAuth as=enabled -->disabled<!-- /default --> unless changed. While it is disabled, IMAP, POP3 and ManageSieve offer no SASL mechanism at all on a cleartext connection.

A client that attempts a bearer mechanism without TLS receives one of these replies:

| Protocol | Reply |
|---|---|
| IMAP | `NO [PRIVACYREQUIRED] OAUTHBEARER and XOAUTH2 require a TLS connection.` |
| POP3 | `-ERR OAUTHBEARER and XOAUTH2 require a TLS connection.` |
| ManageSieve | `NO (ENCRYPT-NEEDED) "OAUTHBEARER and XOAUTH2 require a TLS connection."` |

The check is skipped in two maintenance modes: [bootstrap mode](/docs/configuration/bootstrap-mode), which runs the setup wizard on a new installation, and [recovery mode](/docs/configuration/recovery-mode), which serves to repair a configuration.

### TLS terminated at a proxy

When a proxy terminates TLS and forwards the connection to Stalwart in cleartext, the server cannot see the TLS session itself. It relies on the proxy to report it. The connection counts as TLS only if the proxy sends a [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) version 2 header that carries the SSL TLV with the `PP2_CLIENT_SSL` flag. HAProxy, for example, sends this header with `send-proxy-v2-ssl`.

A version 1 header, or a version 2 header without the TLV, makes the connection count as cleartext. Mail clients behind such a proxy cannot sign in with OAuth.

## Scope and failure responses

A token used on IMAP, POP3, SMTP or ManageSieve must carry the `urn:ietf:params:oauth:scope:mail` scope. API keys have no scopes, so they are not subject to this check.

When a bearer mechanism fails, the server does not simply reject the attempt. It answers as RFC 7628 sections 3.2.2 and 3.2.3 describe, in three steps:

1. The server sends a JSON error document as a SASL challenge, which tells the client what went wrong.
2. The client replies with a single `%x01` byte (`AQ==` in base64) to acknowledge it.
3. The server returns the protocol's failure response.

For `OAUTHBEARER`, the error document has this form:

```json
{
  "status": "invalid_token",
  "scope": "urn:ietf:params:oauth:scope:mail",
  "openid-configuration": "https://mail.example.com/.well-known/openid-configuration"
}
```

`status` is `invalid_token` for a token that is invalid or expired, and `insufficient_scope` for a valid token without the `mail` scope.

The `openid-configuration` member tells the client where to obtain a new token. It is optional in RFC 7628 but required by the open public clients profile. Its value depends on who serves the account:

- For accounts of the built-in server, it is `<public URL>/.well-known/openid-configuration`. It is omitted when no public https URL is set, as in recovery mode.
- For a domain served by an [OpenID Connect directory](/docs/auth/backend/oidc), it is the URL from which Stalwart read the identity provider's metadata. That is either the provider's RFC 8414 authorization server metadata or its OpenID Connect discovery document.

`XOAUTH2` failures use a different format, `{"status":"401","schemes":"Bearer","scope":"urn:ietf:params:oauth:scope:mail"}`. The status is `403` for a token without the `mail` scope.

On SMTP, the final reply to an invalid token is `535 5.7.8 Authentication credentials invalid.`, and to an expired token `535 5.7.8 OAuth token expired.`. The reply to a token without the `mail` scope is `550 5.7.1 Your account is not authorized to use this service.`.

## Revocation and sign-out

A user signs an application out by deleting it in [Connected Applications](/docs/auth/oauth/consent#connected-applications). Its tokens are then revoked: its access tokens are rejected, and its refresh token no longer works. Other applications and devices of the same account are not affected.

## Applications without OAuth support

An application that supports neither `OAUTHBEARER` nor `XOAUTH2` signs in with a password instead. This stops working once the account uses [two-factor authentication](/docs/auth/authentication/2fa). The password alone then fails on IMAP, POP3, SMTP and ManageSieve, because these protocols cannot carry the one-time code. Such an application must use an [app password](/docs/auth/authentication/app-password).

## Domains served by an external identity provider

For a domain whose accounts are in an [OpenID Connect directory](/docs/auth/backend/oidc), the external identity provider is the authorization server. Stalwart does not broker the sign-in. The application discovers the provider, registers with it and obtains its tokens there, and Stalwart only validates them.

Whether mail applications are told about OAuth depends on the provider. When the provider's metadata conforms to the open public clients profile, the PACC document of these domains advertises OAuth with the provider's issuer. Otherwise, the PACC document advertises password authentication only, and the server logs a warning at startup.

Most external providers do not yet implement the profile in full. With such a provider, OAuth applications that rely on the profile, Apple Mail among them, do not work with these domains. The compatibility settings of the OpenID Connect directory let web clients such as the WebUI sign in, but they cannot help an application whose registration or discovery the provider does not support. The [caution on the directory page](/docs/auth/backend/oidc) describes the consequences.
