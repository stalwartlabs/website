---
title: "Scopes"
description: "The OAuth scopes Stalwart accepts, the services each one opens and how scopes limit a token's permissions."
sidebar_position: 6
---

A scope names the access an application requests. When a user approves a request, the scopes of the request are recorded in the grant, and they then limit every token issued for it. This is what allows a user to give a calendar application access to calendars without also giving it access to mail.

Stalwart uses the interoperable scopes of the [OAuth Profile for Open Public Clients](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-oauth-public/). These scopes are the same on every server that implements the profile, so a mail application written for any server can request access to mail, contacts or calendars without knowing anything specific about Stalwart. The profile also lets a server define scopes of its own, and Stalwart adds three for what the interoperable scopes leave out: managing the account itself (security and settings) and full access. The scopes of a grant decide which services its tokens can reach and, within those services, which permissions they carry.

## Scope values

The server accepts the following scopes, each of which opens the services listed next to it:

| Scope | Services |
|---|---|
| `urn:ietf:params:oauth:scope:mail` | IMAP, POP3, SMTP submission, ManageSieve, JMAP Mail |
| `urn:ietf:params:oauth:scope:contacts` | CardDAV, JMAP Contacts |
| `urn:ietf:params:oauth:scope:calendars` | CalDAV, JMAP Calendars |
| `urn:ietf:params:oauth:scope:files` | WebDAV, JMAP File Storage |
| `urn:stalwart:oauth:scope:security` | Account security objects over JMAP ([Stalwart scopes](#stalwart-scopes)) |
| `urn:stalwart:oauth:scope:settings` | Account settings objects over JMAP ([Stalwart scopes](#stalwart-scopes)) |
| `urn:stalwart:oauth:scope:full` | Everything the account may do, administration included |
| `openid` | Sign-in only: an ID token and `/auth/userinfo` |
| `offline_access` | Accepted, with no effect |

`openid` and `offline_access` are always allowed. In OAuth generally, `offline_access` asks for a refresh token. Stalwart does not need it, because every authorization code and device grant returns a refresh token anyway.

The `files` scope is advertised in the server metadata (`scopes_supported`) only when a JMAP or WebDAV service is configured. The three Stalwart scopes are always advertised. On [OAuthClient](/docs/ref/object/o-auth-client) objects, scopes are written in short form, as `mail`, `contacts`, `calendars`, `files`, `security`, `settings` and `full`.

## Stalwart scopes

The interoperable scopes reach mail, contacts, calendars and files, but none of the objects through which a user manages the account. A third-party client such as a webmail therefore cannot offer app passwords or encryption settings with them. The Stalwart scopes fill that gap. Like every scope, each of them is only a request: the token receives the permissions of the scope intersected with the permissions of the account, so a scope never gives an account more than it already has.

`urn:stalwart:oauth:scope:security` covers the objects that control how the account signs in: the account password and two-factor authentication (`sysAccountPasswordGet`, `sysAccountPasswordUpdate`), app passwords and API keys (every `sysAppPassword*` and `sysApiKey*` permission), and the grants of connected applications, which it can list and revoke (`sysOAuthGrantGet`, `sysOAuthGrantQuery`, `sysOAuthGrantDestroy`).

`urn:stalwart:oauth:scope:settings` covers the account's own settings: locale, time zone and encryption at rest (`sysAccountSettingsGet`, `sysAccountSettingsUpdate`) and public keys (every `sysPublicKey*` permission). In the Enterprise edition it also covers masked email addresses (every `sysMaskedEmail*` permission).

Some account objects hold mail rather than settings, so the grouped scopes leave them out. Spam training samples carry the sender, subject and content of a message, so they belong to `urn:ietf:params:oauth:scope:mail` (`sysSpamTrainingSampleGet`, `sysSpamTrainingSampleCreate`, `sysSpamTrainingSampleDestroy`, `sysSpamTrainingSampleQuery`). Archived items (Enterprise edition), which keep deleted mail and Sieve scripts, are reachable only with `urn:stalwart:oauth:scope:full`.

Neither grouped scope reaches an administration object, even on an administrator's account. Only `urn:stalwart:oauth:scope:full` does: a token granted it is unscoped and carries every permission of the account, administration included.

A scoped token cannot hand out more than it holds itself. An [app password](/docs/ref/object/app-password) or [API key](/docs/ref/object/api-key) created with it is checked against the token's own permissions, so the default `permissions` value (`Inherit`, every permission of the account) is refused whenever the account has a permission outside the token's scopes. With `security`, a client creates such a credential with `permissions` set to `Replace` and a list drawn from the scopes it was granted, for example the permissions of the `mail` scope for a mail client's app password when the token also holds `mail`. A client that needs to create credentials with all of the account's permissions requests `full`.

### Full access

Full access never exceeds the account's permissions, but it reaches further than any other scope. A client holding it can create app passwords and API keys, change the password and revoke other grants, which lets it keep access after its own grant is revoked, and on an administrator's account it can administer the server. Because anyone can register a client dynamically or publish a metadata document, under any name, a sign-in link from such a client would be enough to ask an administrator for that access. The server therefore allows `full` only to clients an administrator has vouched for: an OAuthClient created by a superuser outside any tenant. Dynamically registered clients, clients identified by a metadata document and clients registered by a tenant administrator can request `security` and `settings`, but never `full`. Installed [applications](/docs/management/applications/) always receive full access without requesting it.

## Allowed scopes per client

Each client has a set of scopes it may request, and the set depends on the kind of client. A request for a scope outside the set is refused with `invalid_scope`. Scope values the server does not know, such as the OpenID Connect `email` and `profile` scopes, are ignored and left out of the granted scope; the claims they stand for are already returned with `openid`:

- A registered client may request the scopes in its `scopes` field. With an empty field, it can request only `openid`.
- A dynamically registered client may request the scopes it named in its registration.
- A client identified by a metadata document may request the service scopes in the document's `scope` member, or all four when the member is absent.
- Installed applications have no restriction and always receive full access.

For every client except installed applications, `full` is allowed only when the client is an OAuthClient created by a superuser outside any tenant. A dynamically registered client that names `full` in its registration has it removed from the registered scopes, and the registration response leaves it out.

## Permissions of scoped tokens

A token is scoped unless it was issued to an installed application or granted `full`. A scoped token carries only the permissions that belong to its scopes, intersected with the permissions of the account. The account's own permissions are therefore an upper bound, and the scopes narrow them further.

Everything not mapped to one of the granted scopes is denied. Management (the `sys*` permissions, apart from the account objects of the `security` and `settings` scopes and the spam training samples of `mail`), telemetry, SCIM, administration and AI interaction are therefore never reachable with a scoped token, whatever the account itself may do. A token granted only `openid` reaches nothing but `/auth/userinfo`.

### JMAP sessions

The scopes also shape the JMAP session, the document in which a JMAP server tells the client which capabilities it offers. The session object of a scoped token lists only the capabilities of its scopes:

| Scopes | JMAP capabilities |
|---|---|
| Any of the four service scopes | `core`, `blob`, `quota`, `principals`, `principals:owner`, `websocket`, `webpush-vapid`, `metadata` |
| `mail` | `mail`, `submission`, `vacationresponse`, `sieve`, `mail:share`, `emailpush` |
| `contacts` | `contacts`, `contacts:parse` |
| `calendars` | `calendars`, `calendars:parse`, `principals:availability` |
| `files` | `filenode` |
| `security` or `settings` | `core`, `urn:stalwart:jmap` |

A token granted `full` is unscoped, so its session lists every capability.

A request whose `using` list names a capability outside the token's scopes is not rejected. The server drops the capability instead, and methods that need it fail with `unknownMethod`.

The same restriction applies to the push channels. The event source (`/jmap/eventsource`) and the WebSocket endpoint (`/jmap/ws`) require one of the four service scopes. Push notifications carry changes only for the data types of the token's scopes.

### Mail protocols

On IMAP, POP3, SMTP and ManageSieve, the `OAUTHBEARER` and `XOAUTH2` mechanisms accept a token only when it carries the `mail` scope. A token without it is refused with `insufficient_scope` ([Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients)). [API keys](/docs/auth/authentication/api-key) use the same mechanisms but have no scopes, so this check does not apply to them.

## Unscoped tokens

Installed applications and clients granted `full` receive unscoped tokens. An unscoped token carries every permission of the account, including management permissions where the account holds them.

Every token response carries a `scope` member, and the response to an installed application is no exception. It still echoes the scopes that the application requested, even though the token is not limited to them.

## Tokens from external identity providers

A token issued by an external provider for an [OpenID Connect directory](/docs/auth/backend/oidc) is scoped by its `scope` or `scp` claim. Only the four service scope URNs and the three Stalwart scope URNs in that claim count, with the same meaning as above. The provider decides which clients may receive the Stalwart scopes; [OpenID Connect](/docs/auth/backend/oidc#access-granted) describes how to add them at the provider.

Two kinds of token are handled differently. A token whose client claim identifies the WebUI is unscoped. A token that carries none of these scopes is handled according to the directory's `unscopedTokens` setting, and such a token is refused while the setting is left at <!-- default:Directory.Oidc.unscopedTokens -->`reject`<!-- /default -->.
