---
title: "Scopes"
description: "The OAuth scopes Stalwart accepts, the services each one opens and how scopes limit a token's permissions."
sidebar_position: 6
---

A scope names the access an application requests. When a user approves a request, the scopes of the request are recorded in the grant, and they then limit every token issued for it. This is what allows a user to give a calendar application access to calendars without also giving it access to mail.

Stalwart uses the interoperable scopes of the [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/). These scopes are the same on every server that implements the profile, so a mail application written for any server can request access to mail, contacts or calendars without knowing anything specific about Stalwart. The scopes of a grant decide which services its tokens can reach and, within those services, which permissions they carry.

## Scope values

The server accepts the following scopes, each of which opens the services listed next to it:

| Scope | Services |
|---|---|
| `urn:ietf:params:oauth:scope:mail` | IMAP, POP3, SMTP submission, ManageSieve, JMAP Mail |
| `urn:ietf:params:oauth:scope:contacts` | CardDAV, JMAP Contacts |
| `urn:ietf:params:oauth:scope:calendars` | CalDAV, JMAP Calendars |
| `urn:ietf:params:oauth:scope:files` | WebDAV, JMAP File Storage |
| `openid` | Sign-in only: an ID token and `/auth/userinfo` |
| `offline_access` | Accepted, with no effect |

`openid` and `offline_access` are always allowed. In OAuth generally, `offline_access` asks for a refresh token. Stalwart does not need it, because every authorization code and device grant returns a refresh token anyway.

The `files` scope is advertised in the server metadata (`scopes_supported`) only when a JMAP or WebDAV service is configured. On [OAuthClient](/docs/ref/object/o-auth-client) objects, the four service scopes are written in short form, as `mail`, `contacts`, `calendars` and `files`.

## Allowed scopes per client

Each client has a set of scopes it may request, and the set depends on the kind of client. A request for any scope outside the set is refused with `invalid_scope`:

- A registered client may request the scopes in its `scopes` field. With an empty field, it can request only `openid`.
- A dynamically registered client may request the scopes it named in its registration.
- A client identified by a metadata document may request the service scopes in the document's `scope` member, or all four when the member is absent.
- First-party clients, both installed applications and OAuthClients with `firstParty`, have no restriction.

## Permissions of scoped tokens

A token issued to any client other than a first-party client is scoped. A scoped token carries only the permissions that belong to its scopes, intersected with the permissions of the account. The account's own permissions are therefore an upper bound, and the scopes narrow them further.

Everything not mapped to one of the granted scopes is denied. Management (the `sys*` permissions), telemetry, SCIM, administration and AI interaction are therefore never reachable with a scoped token, whatever the account itself may do. A token granted only `openid` reaches nothing but `/auth/userinfo`.

### JMAP sessions

The scopes also shape the JMAP session, the document in which a JMAP server tells the client which capabilities it offers. The session object of a scoped token lists only the capabilities of its scopes:

| Scopes | JMAP capabilities |
|---|---|
| Any of the four service scopes | `core`, `blob`, `quota`, `principals`, `principals:owner`, `websocket`, `webpush-vapid`, `metadata` |
| `mail` | `mail`, `submission`, `vacationresponse`, `sieve`, `mail:share`, `emailpush` |
| `contacts` | `contacts`, `contacts:parse` |
| `calendars` | `calendars`, `calendars:parse`, `principals:availability` |
| `files` | `filenode` |
| Unscoped tokens only | `urn:stalwart:jmap` |

A request whose `using` list names a capability outside the token's scopes is not rejected. The server drops the capability instead, and methods that need it fail with `unknownMethod`.

The same restriction applies to the push channels. The event source (`/jmap/eventsource`) and the WebSocket endpoint (`/jmap/ws`) require one of the four service scopes. Push notifications carry changes only for the data types of the token's scopes.

### Mail protocols

On IMAP, POP3, SMTP and ManageSieve, the `OAUTHBEARER` and `XOAUTH2` mechanisms accept a token only when it carries the `mail` scope. A token without it is refused with `insufficient_scope` ([Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients)). [API keys](/docs/auth/authentication/api-key) use the same mechanisms but have no scopes, so this check does not apply to them.

## Unscoped tokens

First-party clients receive unscoped tokens. An unscoped token carries every permission of the account, including management permissions where the account holds them.

Every token response carries a `scope` member, and the response to a first-party client is no exception. It still echoes the scopes that the client requested, even though the token is not limited to them.

## Tokens from external identity providers

A token issued by an external provider for an [OpenID Connect directory](/docs/auth/backend/oidc) is scoped by its `scope` or `scp` claim. Only the four service scope URNs in that claim count.

Two kinds of token are handled differently. A token whose client claim identifies the WebUI is unscoped. A token that carries none of the service scopes is handled according to the directory's `unscopedTokens` setting, and such a token is refused while the setting is left at <!-- default:Directory.Oidc.unscopedTokens -->`reject`<!-- /default -->.
