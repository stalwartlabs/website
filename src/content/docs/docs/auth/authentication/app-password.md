---
sidebar_position: 4
title: "App passwords"
description: "Separate passwords for individual applications and devices: how they work, how to restrict them, and how users and administrators create them."
---

Many clients still sign in with a password: a mail client without OAuth support, a scanner that sends mail, a script that reads a mailbox. Giving each of them the account password has two drawbacks. Every device then holds the one secret that controls the whole account, and revoking access for a single device means changing the password everywhere.

An app password solves both problems. It is an additional password for a single application or device, used in place of the account password. Because each app password is separate, it can be shaped to the application that uses it:

- It can be limited to the access the application needs.
- It can be restricted to certain IP addresses.
- It can be given an expiry date.
- It can be revoked without changing the account password or affecting other devices.

App passwords are also the way to keep password-based clients working on an account with [two-factor authentication](/docs/auth/authentication/2fa), because they are not subject to the one-time code.

## App password credentials

An app password is an [AppPassword](/docs/ref/object/app-password) credential of the account (found in the WebUI under <!-- breadcrumb:AppPassword --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › App Passwords<!-- /breadcrumb:AppPassword -->).

The server generates the secret when the app password is created, in the form `app_<random characters>`, and returns it once. The server keeps only a hash of it, so the secret cannot be shown again and must be recorded at creation.

The client uses an app password like an ordinary password. It presents the account name as the user name and the app password as the password. This works on any protocol that accepts passwords: IMAP, POP3, SMTP submission, ManageSieve, and HTTP Basic authentication for JMAP, CalDAV, CardDAV and WebDAV.

Each app password has a `description`, which identifies it in listings. Three optional restrictions narrow what it can do:

- `expiresAt` sets the date after which the app password stops working.
- `allowedIps` lists the IP addresses or networks from which it is accepted.
- [`permissions`](/docs/ref/object/app-password#permissions) decides which permissions it carries. `Inherit`, which also applies when the field is left at its default, gives it the permissions of the account. `Disable` removes the listed permissions. `Replace` keeps only the listed permissions that the account also holds.

Whatever the mode, an app password can narrow the account's permissions but never extend them.

App passwords cannot be used for master-user [impersonation](/docs/auth/authorization/administrator#impersonation), in which one account signs in on behalf of another. Such an attempt fails with `App passwords cannot be used for impersonation`.

App passwords work for accounts of external directories too. An account whose password is checked by an LDAP or SQL directory can hold app passwords like any other account, because the server verifies app passwords itself.

The number of app passwords per account is limited by the `maxAppPasswords` quota. When the account does not set the quota, the limit falls back to <!-- default:Authentication.maxAppPasswords -->5<!-- /default --> ([Passwords](/docs/auth/authentication/password#password-policy)).

## Create an app password

Users create, list and delete their own app passwords in the [Account Manager](/docs/management/webui/account-manager), under Credentials.

The CLI can create them as well. It creates the credential for the account that runs the command. The following command creates an app password for a network scanner. The password may only send mail, only from one address, and only until the end of 2027:

```sh
stalwart-cli create AppPassword \
  --field description='Office scanner' \
  --field 'permissions={"@type":"Replace","permissions":{"authenticate":true,"emailSend":true}}' \
  --field 'allowedIps={"192.0.2.10":true}' \
  --field expiresAt=2027-12-31T23:59:59Z
```

The output shows the generated secret. Because the secret cannot be shown again, it must be recorded before running another command:

```text
Created AppPassword aab

Credential
  Secret: app_<generated secret>
```

The permission list in this example contains only what the scanner needs. Every credential needs the `authenticate` permission, and SMTP submission requires `emailSend`. The `Replace` mode withholds everything else, so the scanner cannot read mail with this password.

## Create an app password for another user

An administrator sometimes needs to create an app password on a user's behalf, for example to set up a device for the user. The administrator does this by calling `x:AppPassword/set` with the request-level `accountId` of the user, which makes the call act on the user's account.

The call requires two permissions: `impersonate`, to act on another account, and `sysAppPasswordCreate`. The default System Administrator role holds both. The rest of the procedure follows from acting on the user's account:

- The user's `maxAppPasswords` quota applies.
- The secret is returned to the administrator, once, and the administrator must pass it on to the user.
- A `Replace` permission list may contain only permissions that the administrator could grant.

[Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key) shows the request.

With the same permissions, an administrator can also list and delete a user's app passwords, through `x:AppPassword/query` and `x:AppPassword/set` with the user's `accountId`.
