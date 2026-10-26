---
sidebar_position: 1
title: "Request authentication"
description: "The credentials Stalwart accepts, the authentication mechanisms offered on each protocol, the TLS rule for bearer tokens, and what happens when authentication fails."
---

Every client that connects to Stalwart must prove which account it acts for before it can read or change any data. This applies to every kind of client: a mail application, a calendar client, the WebUI and a script that calls the management API. The proof is a credential, and the way a client presents it depends on the protocol it speaks. This page describes the credentials the server accepts, how each protocol carries them and what the server does when authentication fails.

Authentication answers only the question of who the client is. The account model behind it is described in [Accounts](/docs/auth/accounts/). The separate question of what an authenticated account may do is answered by [Authorization](/docs/auth/authorization/).

## Credentials

The server accepts five kinds of credential, which fall into two families. Passwords and app passwords are presented together with an account name. API keys and access tokens are bearer credentials: whoever holds one is treated as its owner, and no account name accompanies it. The table compares them:

| Credential | Presented as | Accepted on |
|---|---|---|
| [Password](/docs/auth/authentication/password) | Account name and password | Every protocol |
| [App password](/docs/auth/authentication/app-password) | Account name and a password of the form `app_...` | Every protocol |
| [API key](/docs/auth/authentication/api-key) | Bearer token of the form `API_...` | HTTP; `OAUTHBEARER` and `XOAUTH2` on the mail protocols |
| [OAuth access token](/docs/auth/oauth/tokens) | Bearer token | HTTP; `OAUTHBEARER` and `XOAUTH2` on the mail protocols |
| Access token of an external identity provider | Bearer token | HTTP; `OAUTHBEARER` and `XOAUTH2` on the mail protocols |

Where the account lives decides who checks the password. In most cases the server verifies passwords and app passwords itself. The exception is an [LDAP directory](/docs/auth/backend/ldap) in bind mode, which verifies the passwords of its own accounts. For an account of an LDAP or [SQL directory](/docs/auth/backend/sql) in comparison mode, the directory returns a hash and the server compares the password with it.

Access tokens of an external provider are accepted only for domains served by an [OpenID Connect directory](/docs/auth/backend/oidc). [SCIM](/docs/auth/scim/) provisioning requests need no special treatment, because they authenticate like any other HTTP request.

Two permissions apply to sign-ins. The first is `authenticate`, which every credential requires, so disabling it suspends all sign-ins of an account at once ([Managing accounts](/docs/auth/accounts/manage#suspend-an-account)). The second is `authenticateWithAlias`, which lets a user sign in with an alias address of the account as well as with its primary address. The default User role includes it.

## Mechanisms per protocol

The mail protocols (IMAP, POP3, SMTP and ManageSieve) carry credentials in SASL mechanisms. SASL is the authentication framework these protocols share, and each mechanism defines one way of encoding a credential. Two groups of mechanisms matter here:

- `PLAIN`, and on SMTP also `LOGIN`, transmit the account name together with a password or app password.
- `OAUTHBEARER` ([RFC 7628](https://www.rfc-editor.org/rfc/rfc7628)) and `XOAUTH2` transmit a bearer token.

HTTP services use the `Authorization` header instead. Its `Basic` scheme carries passwords and app passwords, and its `Bearer` scheme carries tokens and API keys.

Which mechanisms a client sees depends on whether the connection is encrypted. By default the server offers no mechanism on a cleartext connection, so that no password crosses the network unprotected. The table shows what each protocol offers in each case:

| Protocol | With TLS | Without TLS, default | Without TLS, plain-text authentication allowed |
|---|---|---|---|
| IMAP | `PLAIN`, `OAUTHBEARER`, `XOAUTH2`, `LOGIN` command | None | `PLAIN`, `LOGIN` command |
| POP3 | `PLAIN`, `OAUTHBEARER`, `XOAUTH2`, `USER`/`PASS` | None | `PLAIN`, `USER`/`PASS` |
| ManageSieve | `PLAIN`, `OAUTHBEARER`, `XOAUTH2` | None | `PLAIN` |
| SMTP | `PLAIN`, `LOGIN`, `OAUTHBEARER`, `XOAUTH2` on ports other than 25 | None | The password mechanisms returned by `saslMechanisms` |

For IMAP, POP3 and ManageSieve, the decision to allow passwords without TLS is made with [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth) on the [Imap](/docs/ref/object/imap) singleton. On a new installation it is <!-- default:Imap.allowPlainTextAuth as=enabled -->disabled<!-- /default -->, and while it is disabled no mechanism at all is offered on a cleartext connection.

SMTP makes the same decision through an expression. The mechanisms it offers are those returned by the [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms) expression of [MtaStageAuth](/docs/ref/object/mta-stage-auth). The default expression offers the four mechanisms on TLS connections to ports other than 25, and no authentication otherwise ([SMTP authentication](/docs/mta/inbound/auth)).

### Bearer tokens require TLS on the mail protocols

Bearer credentials follow a stricter rule than passwords. On IMAP, POP3, SMTP and ManageSieve, `OAUTHBEARER` and `XOAUTH2` are neither offered nor accepted on a connection without TLS. The rule covers every bearer credential these mechanisms carry, API keys included. Neither `allowPlainTextAuth` nor the SMTP expression relaxes it.

A proxy that terminates TLS must tell the server that the client's connection was encrypted. The connection counts as TLS only when the proxy sends a [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) version 2 header that carries the SSL TLV with the `PP2_CLIENT_SSL` flag. A version 1 header, or a version 2 header without the TLV, counts as cleartext.

The check is skipped in two special modes. The first is [bootstrap mode](/docs/configuration/bootstrap-mode), which runs the setup wizard on a new installation. The second is [recovery mode](/docs/configuration/recovery-mode), the maintenance mode for repairing a configuration.

A token used with these mechanisms must also carry the `mail` [scope](/docs/auth/oauth/scopes), the OAuth grant of access to mail. A token without it fails with `insufficient_scope`. API keys have no scopes, so they pass this check.

When a bearer mechanism fails, the server tells the client why before it rejects the attempt. It first sends a JSON error document that describes the failure, in the RFC 7628 format for `OAUTHBEARER` and in the XOAUTH2 format for `XOAUTH2`. It then sends the protocol's failure reply ([Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients#scope-and-failure-responses)).

## Two-factor authentication

An account with [two-factor authentication](/docs/auth/authentication/2fa) needs a one-time code in addition to its password. Only the sign-in form of the OAuth server has a field for that code. Once two-factor authentication is enabled, a password alone therefore no longer works on IMAP, POP3, SMTP, ManageSieve or HTTP Basic, and applications must sign in through OAuth or use an app password. Two-factor authentication is available for accounts of the internal directory only.

## Authentication policy

The settings that apply to every sign-in are kept on one object, the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->). It decides:

- Which directory verifies passwords by default (`directoryId`). The internal directory is used when the field is empty.
- The [password policy](/docs/auth/authentication/password#password-policy).
- The default limits on app passwords and API keys.
- The default roles assigned to users, groups, tenant administrators and administrators ([Roles](/docs/auth/authorization/roles)).

In the Enterprise edition, a domain can name its own directory, which then takes precedence over the default ([Directories](/docs/auth/backend/)).

When accounts are owned by an external system, the server learns about them in one of two ways: through the directory, or through SCIM. [Provisioning models](/docs/auth/scim/provisioning) compares the two.

## Failed authentication

The server answers a failed attempt in a way that gives an attacker as little information as possible. The reply comes after a random delay of up to half a second, so that response times do not reveal whether an account exists. The reply also does not say which part of the credential was wrong.

Failed attempts are counted per client IP address and per account name. An address that exceeds the configured rate is banned by the [automatic ban](/docs/server/auto-ban) mechanism. IMAP, POP3, ManageSieve and SMTP add a second limit within each session, and close the session after a number of failures in it.

Each failure is recorded as an event ([Events](/docs/ref/events)):

- A failed attempt produces `auth.failed`, logged at the `debug` level.
- A correct password without the required one-time code produces `auth.mfa-required`, at the `trace` level.
- A ban produces `security.authentication-ban`.
