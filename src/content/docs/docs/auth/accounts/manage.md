---
title: "Managing accounts"
description: "Create, change, suspend and delete user and group accounts from the WebUI, the CLI or the JMAP management API."
sidebar_position: 4
---

This page gives the procedures for the account changes that administrators make most often. Each procedure can be carried out in three ways: in the WebUI, with [`stalwart-cli`](/docs/management/cli/), or with a JMAP call to the management endpoint `/jmap/`. The three are interchangeable, because the WebUI and the CLI send the same JMAP calls. The fields involved are described in [User accounts](/docs/auth/accounts/user) and [Group accounts](/docs/auth/accounts/group).

Two permission requirements apply to every change. The caller needs the corresponding `sysAccount*` permission, such as `sysAccountCreate`. The caller must also hold every permission of the account it creates, changes or deletes, so that nobody can create or modify an account more powerful than their own ([Permissions](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)).

## Create a user

In the WebUI, open <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account --> and create the account.

With the CLI, the `Account/User` form selects the User variant of the Account object. The following command creates `jane@example.com` with a password, an alias, a group membership and a 5 GB quota. In it, `b` is the id of the domain and `d` the id of the group:

```sh
stalwart-cli create Account/User \
  --field name=jane \
  --field domainId=b \
  --field description='Jane Doe' \
  --field 'credentials={"0":{"@type":"Password","secret":"correct horse battery staple"}}' \
  --field 'aliases={"0":{"name":"j.doe","domainId":"b"}}' \
  --field 'memberGroupIds={"d":true}' \
  --field 'quotas={"maxDiskQuota":5368709120}'
```

The following JMAP call creates the same account:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:Account/set", {
        "create": {
          "u1": {
            "@type": "User",
            "name": "jane",
            "domainId": "b",
            "description": "Jane Doe",
            "credentials": {"0": {"@type": "Password", "secret": "correct horse battery staple"}},
            "aliases": {"0": {"name": "j.doe", "domainId": "b"}},
            "memberGroupIds": {"d": true},
            "roles": {"@type": "User"},
            "permissions": {"@type": "Inherit"},
            "quotas": {"maxDiskQuota": 5368709120},
            "encryptionAtRest": {"@type": "Disabled"}
          }
        }
      }, "0"]
    ]
  }'
```

In both forms, lists such as `credentials` and `aliases`, and sets such as `memberGroupIds`, are written as JSON objects, not as arrays ([Object encoding](/docs/configuration/object-encoding)).

A group is created in the same way, with `Account/Group` and without credentials.

## Add or remove an alias or a group membership

An update sends only the changes, not the whole account. It takes the form of a JMAP patch, in which each key is a path into the object and each value is the new content at that path. The paths follow the structure of the field:

- To add an entry to a set, set its path to `true`.
- To remove an entry from a set, set its path to `null`.
- List entries are addressed by their position. A new alias takes the next free position, and an existing one is removed by setting its position to `null`.

Sending the whole field instead of a path replaces the field entirely. Sending an array is rejected with an `invalidPatch` error.

The following commands make three changes to the account with id `c`. They add it to the group `d`, remove it from the group `e`, and add a second alias:

```sh
stalwart-cli update Account c --field 'memberGroupIds/d=true'
stalwart-cli update Account c --field 'memberGroupIds/e=null'
stalwart-cli update Account c --field 'aliases/1={"name":"jane.doe","domainId":"b"}'
```

The following JMAP update makes the same changes:

```json
["x:Account/set", {
  "update": {
    "c": {
      "memberGroupIds/d": true,
      "memberGroupIds/e": null,
      "aliases/1": {"name": "jane.doe", "domainId": "b"}
    }
  }
}, "0"]
```

An alias can also be disabled without being removed. To do so, set its `enable` field to `false`, for example through the path `aliases/1/enable`.

## Reset a password

An administrator resets a user's password by replacing the `secret` of the account's Password credential, which requires the `sysAccountUpdate` permission. The following command sets a new password for the account `c`, whose password is its first credential:

```sh
stalwart-cli update Account c --field 'credentials/0/secret=new password here'
```

The value can be a password in clear text or a hash in a [supported format](/docs/auth/authentication/password#supported-hash-formats).

Accounts of an LDAP, SQL or OpenID Connect directory keep their password in the directory, so it cannot be changed on the server. An attempt fails with `Cannot set credentials for accounts in an external directory.`

Users change their own password in the [Account Manager](/docs/management/webui/account-manager). The Account Manager writes the [AccountPassword](/docs/ref/object/account-password) singleton and requires the current password. Self-service password changes are therefore available only for accounts whose password is stored on the server.

A password change has a side effect on OAuth applications: it signs out every OAuth application of the account. Their tokens stop working, and their [connected applications](/docs/auth/oauth/consent#connected-applications) are removed. Other changes leave OAuth tokens in place. These include adding or removing app passwords or API keys, changing the two-factor authentication URL (`otpUrl`), and changing roles or permissions.

## Add an app password or API key

App passwords and API keys are secondary credentials, and they are not part of account creation. They are created afterwards, as [AppPassword](/docs/ref/object/app-password) and [ApiKey](/docs/ref/object/api-key) objects. The server generates the secret and returns it only in the response to the creation. This is why they cannot be included in the `credentials` field of an account, and an attempt to do so fails with `Secondary credentials cannot be set directly.`

A user creates them in the Account Manager under Credentials, or with the CLI. The CLI attaches the credential to the account that runs the command:

```sh
stalwart-cli create AppPassword \
  --field description='Phone' \
  --field 'permissions={"@type":"Inherit"}'
```

An administrator can create an app password or API key for another user, with a JMAP call whose `accountId` argument is the id of the target account. This requires three permissions: `impersonate`, and `sysAppPasswordCreate` or `sysApiKeyCreate`. The default System Administrator role holds all three. Because the call acts on the target account, the target's `maxAppPasswords` or `maxApiKeys` quota applies. The secret is returned to the administrator, who passes it on to the user. The following call creates an app password for the account `c`:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:AppPassword/set", {
        "accountId": "c",
        "create": {
          "p1": {
            "description": "Legacy mail client",
            "permissions": {"@type": "Inherit"},
            "allowedIps": {}
          }
        }
      }, "0"]
    ]
  }'
```

The `created` entry of the response contains the generated `secret`. It cannot be read again later.

## Suspend an account

Suspending an account stops it from signing in, receiving mail and sending mail, while keeping all of its data. An account has no enabled flag for this purpose. Instead, the administrator disables the corresponding permissions on the account. Disabled permissions take precedence over every role, so the suspension holds whatever roles the account has.

How to disable them depends on the account's current `permissions` mode:

- For an account that already has its own permissions in `Merge` or `Replace` mode, add the entries to its `disabledPermissions`, for example by patching `permissions/disabledPermissions/authenticate` to `true`. This keeps the account's other permission settings.
- For an account whose `permissions` is `Inherit`, replace the field with a `Merge` value that disables the permissions.

The following update suspends an account in `Inherit` mode:

```json
{
  "permissions": {
    "@type": "Merge",
    "enabledPermissions": {},
    "disabledPermissions": {"authenticate": true, "emailReceive": true, "emailSend": true}
  }
}
```

Each disabled permission blocks one activity. With `authenticate` disabled, no credential of the account is accepted, including app passwords, API keys and OAuth tokens. Without `emailReceive`, delivery to the account fails permanently with `This account is not authorized to receive email.`, and the sender receives a bounce. Without `emailSend`, the account cannot send mail.

To lift the suspension, set `permissions` back to `{"@type": "Inherit"}`. If the account had its own permissions, remove the entries from `disabledPermissions` instead.

## Delete an account

Deleting an account happens in two stages. The first is immediate: the server removes the Account object with its credentials, so the account can no longer sign in, and it revokes the shares the account had granted on its own data.

A background task then completes the deletion. It removes the account from the shares of other accounts, and deletes its public keys, masked addresses and OAuth grants. It then deletes the account's data: mailboxes and messages, calendars, address books, files, Sieve scripts and its search index.

In the Enterprise edition, the deletion of the data can be postponed. When [`archiveDeletedAccountsFor`](/docs/ref/object/data-retention#archivedeletedaccountsfor) is set, the data is kept for that period, and the account can be restored until it ends ([Restore a deleted account](/docs/management/maintenance/deleted-items#restore-a-deleted-account)).

The following command deletes the account `c`:

```sh
stalwart-cli delete Account --ids c
```

:::caution
Nothing prevents an administrator from deleting its own account. The administrator loses access at once. If no other account holds the System Administrator role, the server can then be managed only through the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator). Create a second administrator account before deleting or replacing the current one ([Administrators](/docs/auth/authorization/administrator)).
:::

Accounts of an LDAP, SQL or OpenID Connect directory need an extra step. The server creates them again the next time the directory returns them, at sign-in or when mail arrives for their address. Remove the account from the directory before deleting it on the server, or use [SCIM provisioning](/docs/auth/scim/), which deletes accounts when the identity provider does.
