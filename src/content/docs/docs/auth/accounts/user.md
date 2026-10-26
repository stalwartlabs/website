---
sidebar_position: 2
title: "User accounts"
description: "The User variant of the Account object: address, credentials, aliases, group membership, roles, permissions, quotas and personal settings."
---

A user account represents someone who signs in to the server and owns a mailbox. Usually that is a person, but it can also be a service, such as an application that sends notifications. Creating a user account is what gives a new user an address, a place to store mail and data, and the credentials to reach them.

A user account is the `User` variant of the [Account](/docs/ref/object/account) object (found in the WebUI under <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account -->). This page describes the fields that require a decision when an account is created or changed, grouped by what they decide. The [reference page](/docs/ref/object/account) lists every field with its type and default, and [Accounts](/docs/auth/accounts/) explains the model.

## Identity and address

The first decision is the account's address, which is also its identity. [`name`](/docs/ref/object/account#name) is the local part of the address, and [`domainId`](/docs/ref/object/account#domainid) is the domain it belongs to. Both are required. From them the server derives the read-only [`emailAddress`](/docs/ref/object/account#emailaddress), `name@domain`, which is also the name the user signs in with. [`description`](/docs/ref/object/account#description) is the user's display name, for example the full name.

[`aliases`](/docs/ref/object/account#aliases) lists further addresses that deliver to the account. Each alias has these parts:

- A local part (`name`) and a `domainId`.
- An optional `description`.
- An `enable` flag, which turns the alias off without deleting it.

Every alias must be an address that no other account, group or mailing list uses. Users can also sign in with an alias when they hold the `authenticateWithAlias` permission, which the default User role includes.

## Credentials

[`credentials`](/docs/ref/object/account#credentials) is the list of the account's credentials. The `Password` credential holds:

- The password, in `secret`.
- An optional two-factor authentication URL, in `otpUrl`.
- Optional `expiresAt` and `allowedIps` restrictions.

A password can be given in two forms. In clear text, the server hashes it before storing it. As a hash in one of the [supported formats](/docs/auth/authentication/password#supported-hash-formats), the server stores it as given, which allows accounts to be migrated from another system.

App passwords and API keys appear in the same list, but they cannot be set through it. They are created afterwards, through the [AppPassword](/docs/ref/object/app-password) and [ApiKey](/docs/ref/object/api-key) objects, so that the server can generate their secret. An attempt to include one in `credentials` fails with `Secondary credentials cannot be set directly.` [Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key) describes the procedure. Accounts from an external directory can hold app passwords and API keys like any other account.

## Groups

[`memberGroupIds`](/docs/ref/object/account#membergroupids) is the set of [groups](/docs/auth/accounts/group) the user belongs to. Membership gives the user access to the group's mailboxes and to everything shared with the group.

Mailing lists are a separate concept, and they are not configured on the account. A [mailing list](/docs/email/management/mailing-lists) is an address that expands to a list of recipients, while a group is an account with its own mailbox.

## Roles and permissions

The account's permissions are decided in two steps. [`roles`](/docs/ref/object/account#roles) first selects the roles that grant the account its permissions. It takes one of three values:

- `User`, the value new accounts receive, applies the default user role set of the Authentication singleton.
- `Admin` applies the default administrator role set of the Authentication singleton.
- `Custom` applies the roles listed in its `roleIds` ([Assigning roles](/docs/auth/authorization/roles#assigning-roles)).

[`permissions`](/docs/ref/object/account#permissions) then adjusts the result of the roles. It too has three modes:

- `Inherit` uses the roles alone.
- `Merge` adds the permissions in `enabledPermissions` to those of the roles.
- `Replace` ignores the roles and grants only `enabledPermissions`.

In `Merge` and `Replace` mode, `disabledPermissions` removes permissions, whatever their source. [Permissions](/docs/auth/authorization/permissions) describes the computation, and [Roles](/docs/auth/authorization/roles) the default roles.

## Quotas

[`quotas`](/docs/ref/object/account#quotas) limits how much the account may store. It maps a quota type to a limit. `maxDiskQuota` is given in bytes, and the other types are counts, such as `maxEmails`, `maxMailboxes`, `maxAppPasswords` or `maxApiKeys`. A type that is not listed is not limited by the account.

The read-only [`usedDiskQuota`](/docs/ref/object/account#useddiskquota) reports the space currently in use. [Quotas](/docs/auth/authorization/quotas) describes how limits are enforced.

## Personal settings

Some fields describe the user's preferences. [`locale`](/docs/ref/object/account#locale) records the user's language, and [`timeZone`](/docs/ref/object/account#timezone) the user's time zone.

[`encryptionAtRest`](/docs/ref/object/account#encryptionatrest) decides whether messages are stored encrypted. When it is enabled, the server encrypts the messages stored for the account with one of the user's OpenPGP or S/MIME [public keys](/docs/ref/object/public-key). `Disabled` stores messages as received.

Users can change these settings themselves in the [Account Manager](/docs/management/webui/account-manager).

## Enterprise fields

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Two fields link the account to features of the Enterprise edition. [`memberTenantId`](/docs/ref/object/account#membertenantid) places the account in a [tenant](/docs/auth/authorization/tenants). [`externalId`](/docs/ref/object/account#externalid) holds the identifier assigned by a [SCIM](/docs/auth/scim/) identity provider, and is set by the provisioning process.

## Example

The following object creates the user `jane@example.com`. It gives the user a password, the alias `j.doe@example.com`, membership of one group and a 5 GB disk quota. The domain and the group are referenced by their ids:

```json
{
  "@type": "User",
  "name": "jane",
  "domainId": "b",
  "description": "Jane Doe",
  "credentials": {
    "0": {"@type": "Password", "secret": "correct horse battery staple"}
  },
  "aliases": {
    "0": {"name": "j.doe", "domainId": "b"}
  },
  "memberGroupIds": {"d": true},
  "roles": {"@type": "User"},
  "permissions": {"@type": "Inherit"},
  "quotas": {"maxDiskQuota": 5368709120},
  "encryptionAtRest": {"@type": "Disabled"}
}
```
