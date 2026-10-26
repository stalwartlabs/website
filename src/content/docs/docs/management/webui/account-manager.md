---
sidebar_position: 2
title: "Account Manager"
description: "The self-service part of the WebUI at /account: settings, password and two-factor authentication, app passwords, API keys, connected applications and the account's data."
---

Many routine requests to a mail administrator concern a single account: a new password, an app password for a mail client, a vacation response. The Account Manager lets users handle these themselves. It is the part of the [WebUI](/docs/management/webui/) in which users manage their own account, served at `/account`.

The Account Manager is what an account without administrative permissions sees after signing in. Such an account is sent there even when it signs in at `/admin`. Each screen works on the objects of the signed-in account only. It uses the same management API as administrators and the [CLI](/docs/management/cli/), with the account's own permissions, which is why the Account Manager can be exposed to all users.

## Available screens

The screens shown depend on the permissions of the account: a screen appears only when the account may read the object behind it. With the default User role, the Account Manager contains these screens:

- Settings
- The Credentials screens: Password, App Passwords, API Keys and Connected Applications
- Mailboxes, Calendars, Address Books, Sieve Scripts, Vacation Response, Spam Samples and Public Keys

The Enterprise edition adds Masked Addresses and Archived Items.

## Settings

The Settings screen edits the [AccountSettings](/docs/ref/object/account-settings) of the account. These cover its description, which is the display name, its locale and time zone, and encryption at rest.

When encryption at rest is enabled, new messages are stored encrypted with one of the user's public keys, so their content cannot be read from the server's storage. The keys are managed on the Public Keys screen as [PublicKey](/docs/ref/object/public-key) objects. Each key is OpenPGP or S/MIME, and lists the addresses it applies to and an optional expiry date.

## Password and two-factor authentication

The Password screen, under <!-- breadcrumb:AccountPassword --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Password<!-- /breadcrumb:AccountPassword -->, writes the [AccountPassword](/docs/ref/object/account-password) singleton. Changing the password requires the current password, and the new one is checked against the [password policy](/docs/auth/authentication/password#password-policy). A password change also signs out every OAuth application of the account ([Tokens](/docs/auth/oauth/tokens#revocation)).

The same screen enables [two-factor authentication](/docs/auth/authentication/2fa), which adds a one-time code from an authenticator application to the password. Setting it up takes three steps:

1. The screen generates a secret and shows it as a QR code.
2. The user scans the code with an authenticator application.
3. The user enters the current code to confirm.

The secret is stored as the `otpUrl` of the account's password credential. Changing or removing two-factor authentication later requires a current code.

Two-factor authentication has a consequence for mail clients. Once it is enabled, mail clients that sign in with a password stop working, because the code can be entered only on the OAuth sign-in page. Such clients need an app password.

### Accounts of external directories

The Password screen is available only to accounts whose password is stored on the server. For an account whose domain is served by an LDAP, SQL or OpenID Connect directory, the password belongs to the directory, so password changes are made there. The server withholds the permissions of the AccountPassword object from such an account, and the screen is not shown. Two-factor authentication is not available for these accounts either.

A password or two-factor change attempted through the API fails in that case with `forbidden` and `Operation not allowed.`. When the account has no password credential at all, it fails with `Your account does not support password changes`.

## App passwords and API keys

An app password and an API key are both credentials that an account creates in addition to its main password. [App passwords](/docs/auth/authentication/app-password) serve mail clients, and [API keys](/docs/auth/authentication/api-key) serve programs. The App Passwords and API Keys screens list the account's credentials of each kind, and create and delete them.

When creating a credential, the user enters a description and can narrow its use: restrict it to IP addresses, set an expiry date and choose its permission mode. The server generates the secret and shows it once, when the credential is created. Deleting a credential takes effect immediately and affects no other credential.

Both screens are available to accounts of external directories as well. For such accounts, app passwords are the way to use mail clients that support neither OAuth nor the account's directory password.

## Connected applications

The Connected Applications screen, under <!-- breadcrumb:OAuthGrant --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Connected Applications<!-- /breadcrumb:OAuthGrant -->, lists the applications that signed in to the account through OAuth. It shows one entry per authorization, with these details:

- The application's name, and how it was registered
- The access granted
- When it was authorized and when it was last used

Applications that registered themselves are marked as unverified. Deleting an entry signs that application out: its tokens stop working, and it must ask for authorization again ([Consent and connected applications](/docs/auth/oauth/consent#connected-applications)).

## Masked addresses

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A masked address is a disposable address that delivers to the account, which lets a user give out an address without revealing the real one. The Masked Addresses screen creates them as [MaskedEmail](/docs/ref/object/masked-email) objects, found in the WebUI under <!-- breadcrumb:MaskedEmail --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><path d="M16 19h6" /></svg> Masked Addresses<!-- /breadcrumb:MaskedEmail -->. Each one can be disabled or deleted without affecting the others ([Masked email](/docs/email/management/masked-email)).

## Aliases

The Account Manager does not edit email aliases. Aliases are part of the account itself, so administrators manage them ([Managing accounts](/docs/auth/accounts/manage#add-or-remove-an-alias-or-a-group-membership)).
