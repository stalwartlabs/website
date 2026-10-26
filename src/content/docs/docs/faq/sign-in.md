---
title: "Sign-in, directories and API access"
description: "Frequently asked questions about LDAP, SQL and OpenID Connect directories, single sign-on to the WebUI, OAuth in mail clients, two-factor authentication, app passwords and API keys."
sidebar_position: 4
---

## External directories

### Can I use LDAP or Active Directory, and what stays in Stalwart?

Yes. An [LDAP directory](/docs/auth/backend/ldap), which also covers Active Directory, takes over the identity side of each account. The directory decides which accounts and addresses exist, checks passwords and supplies the display name, aliases and group memberships.

Everything else stays on the server: roles, permissions, quotas, the tenant, Sieve scripts and other settings, as well as app passwords, API keys and OAuth grants. The same division applies to SQL directories.

An OpenID Connect directory takes a smaller share. It validates sign-in tokens and supplies the account's details, but it does not decide which recipient addresses exist. See [Directory responsibilities](/docs/auth/backend/#directory-responsibilities).

### A user deleted in LDAP, SQL or the OIDC provider still has a mailbox. Why?

Accounts that come from an external directory are created and updated on the server, but never removed. The account and its mail remain until an administrator deletes it.

An identity provider that provisions accounts through [SCIM](/docs/auth/scim/) behaves differently, because SCIM also carries deletions: when an account is deleted at the provider, the provider deletes it on the server too. See [Provisioning models](/docs/auth/scim/provisioning#limitations).

## Single sign-on

### Can I sign in to the WebUI with Keycloak, Authentik or another OIDC provider?

Yes, for the users of a domain served by an [OpenID Connect directory](/docs/auth/backend/oidc). The provider has to recognise the WebUI as a client, and the WebUI identifies itself in one of two ways:

- By default, with the URL of its Client ID Metadata Document, a document that describes the client and that the provider fetches instead of requiring a registration.
- With the static `oauthClientId` of its Application, when one is set.

A provider that does not support Client ID Metadata Documents needs a public client registered for the WebUI, with PKCE and the WebUI's redirect URIs. The id of that client is then set as `oauthClientId`. Set it only in that case, because while it is set, sign-in through Stalwart's own authorization server fails with `Unknown client id`.

The provider's audience must also match the server or be listed in `acceptedAudiences`. See [Signing in to the WebUI](/docs/auth/backend/oidc#signing-in-to-the-webui) and the [provider checklist](/docs/auth/backend/oidc#provider-checklist).

### What does "Failed to decode token ... configured as the default directory under the Authentication object" mean?

A request carried a bearer token that Stalwart did not issue, and no OpenID Connect directory is set up to handle it. Set the directory as the `directoryId` of the [Authentication](/docs/ref/object/authentication) object, or of the user's domain.

The token format matters too. If the provider issues opaque access tokens, which carry no readable content, either configure it to issue JWT access tokens or set `opaqueTokenValidation` on the directory. See [Troubleshooting](/docs/auth/backend/oidc#troubleshooting).

### Do groups from my identity provider become roles?

No, they become local groups. The `claimGroups` setting of the OpenID Connect directory names the token claim that lists the user's groups. Each group named by the provider is mapped to a local group, which is created as needed. Roles and permissions are then assigned to those groups on the server. See [Mapping tokens to accounts](/docs/auth/backend/oidc#mapping-tokens-to-accounts).

### Can several OIDC clients share one directory?

Yes. A token is accepted when its audience contains a resource identifier of the server or one of the values listed in the directory's `acceptedAudiences`. List the audience of each client there, and the directory accepts tokens from all of them. See [Audience](/docs/auth/backend/oidc#audience).

### Why can't my mail client sign in with OAuth?

Mail applications are open public clients: no one registers them in advance with each server. They discover the authorization server and register with it through the OAuth profile for open public clients, which Stalwart implements. Several conditions then have to hold:

- The `OAUTHBEARER` and `XOAUTH2` mechanisms are offered on IMAP, POP3, SMTP and ManageSieve only over TLS.
- The token must carry the `mail` scope.
- The application must implement the profile. One that does not needs an [app password](/docs/auth/authentication/app-password) instead.

For a domain served by an external identity provider, the provider must implement the profile as well. Most providers do not yet implement it. OAuth applications that rely on it, Apple Mail among them, therefore do not work with these domains, and the server advertises only password authentication for them. See [Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients).

## 2FA, app passwords and API keys

### After enabling 2FA my IMAP and SMTP clients cannot log in. Why?

These protocols have no place for the one-time code. Password sign-ins over IMAP, POP3, SMTP, ManageSieve and HTTP Basic authentication can carry only a password, so they always fail for an account with two-factor authentication. SMTP, for example, answers `334 5.7.8 This account requires multi-factor authentication. Alternatively, you can use an app password if your account has one.`

Such clients need OAuth or an [app password](/docs/auth/authentication/app-password). Two-factor authentication applies only to accounts of the internal directory, so accounts of an LDAP or SQL directory are never asked for a code. See [Signing in with two-factor authentication](/docs/auth/authentication/2fa#signing-in-with-two-factor-authentication).

### Can I require two-factor authentication for everyone?

No. Two-factor authentication is enabled per account, and no setting requires it for all accounts of a server, domain or tenant. It is also available only for accounts of the internal directory. See [Two-factor authentication](/docs/auth/authentication/2fa).

### Which authenticator app settings does 2FA accept?

The account stores the authenticator settings as an `otpauth://totp/` URL, and the server accepts a range of values in it:

- A secret of at least 128 bits.
- The algorithm `SHA1` (the default), `SHA256` or `SHA512`.
- 6 to 8 digits.
- Any period, 30 seconds by default.

The codes of the previous and the next period are accepted as well, which tolerates small clock differences. In practice, use SHA1, 6 digits and 30 seconds, because every authenticator application supports them. The URL is not validated when it is stored, so an invalid one shows up only at sign-in, as an `auth.error` event. See [Accepted otpauth URLs](/docs/auth/authentication/2fa#accepted-otpauth-urls).

### Can users log in with an alias address?

Yes, by default. Signing in with an alias requires the `authenticateWithAlias` permission, and the default User role includes it. To require the primary address, remove the permission from an account or a role. See [Permission names](/docs/auth/authorization/permissions#permission-names).

### How do I give a script API access without an administrator password?

Create an [API key](/docs/auth/authentication/api-key). There are two ways to control what the key may do:

- Create it for an account that holds the permissions the script needs.
- Give the key the `Replace` permission mode with a list of permissions. The key then receives only those listed permissions that the account also holds.

The secret is shown once, when the key is created, so store it at that point. See [Create an API key](/docs/auth/authentication/api-key#create-an-api-key).

### Can an administrator create an app password or API key for a user?

Yes, with a JMAP call whose `accountId` argument is the id of the user's account. The call requires the `impersonate` permission together with `sysAppPasswordCreate` or `sysApiKeyCreate`, all of which the default System Administrator role holds. The secret is returned once, to the administrator. These credentials cannot be added through the account's `credentials` list. See [Add an app password or API key](/docs/auth/accounts/manage#add-an-app-password-or-api-key).
