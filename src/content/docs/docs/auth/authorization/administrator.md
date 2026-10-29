---
sidebar_position: 4
title: "Administrators"
description: "How administrative access is granted in Stalwart, the rules that limit administrators, impersonation of other accounts, and the recovery administrator."
---

Every server needs accounts that can manage it: create domains and users, change settings and fix problems. Stalwart has no separate administrator account type for this. An administrator is an ordinary user account whose roles contain management permissions. Because administrative access is only a set of permissions, it can be granted in any measure, from full control of the server to the right to reset passwords in one domain.

This page describes the default administrator setup and the rules that bound what an administrator can do. It also describes impersonation, the mechanism administrators use to act on behalf of other accounts.

## Granting administrative access

An account becomes a full administrator when its `roles` field is set to `Admin`. This value applies the roles listed in the Authentication singleton's `defaultAdminRoleIds`. By default these are two roles. The System Administrator role holds every management permission. The User role holds the permissions to use mail and the other protocols, which an administrator needs as well ([Roles](/docs/auth/authorization/roles)).

The same value means something narrower inside a [tenant](/docs/auth/authorization/tenants). An account in `Admin` mode that belongs to a tenant becomes an administrator of that tenant only. A server-wide administrator is therefore always an account outside any tenant. Like every account, it counts against the account limit of an Enterprise license.

Many responsibilities do not call for full control. For these, create a custom role that holds only the permissions the task needs, and assign it with `roles` set to `Custom`. The [help-desk example](/docs/auth/authorization/roles#create-a-custom-role) shows such a role.

### First and recovery administrators

The first administrator is created during [bootstrap](/docs/configuration/bootstrap-mode), when the setup wizard runs on a new installation.

A server can also end up with no administrator who can sign in, for example after a lost password. For that case, the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) provides access. It is defined by the `STALWART_RECOVERY_ADMIN` environment variable. While the variable is set, its credentials are accepted for password sign-in on every start, not only in recovery mode, and they can impersonate any account. Because of that reach, remove the variable once a regular administrator exists.

## Limits on administrators

Administrative permissions do not override every rule. The following rules apply to administrators too, and they regularly surprise them.

An administrator cannot grant a permission it does not hold. Creating, changing or deleting an account requires holding every permission of that account, and superusers have no exception ([Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)). This has a practical consequence: an administrator whose own permissions were narrowed, for example by removing the User role, can no longer manage ordinary users.

The `Admin` value of `roles` is a reference to `defaultAdminRoleIds`, not a copy of it. Editing those roles, or the default role sets, therefore changes the permissions of every administrator at once.

An administrator can delete its own account. The account is deleted like any other, with its data, credentials and OAuth grants ([Managing accounts](/docs/auth/accounts/manage#delete-an-account)), and the administrator loses access at once.

:::caution
If the deleted account was the last one holding the System Administrator role, the server can be managed again only through the recovery administrator. Create a second administrator before deleting or replacing the current one.
:::

Administrators can also create [app passwords](/docs/auth/authentication/app-password) and [API keys](/docs/auth/authentication/api-key) for other users. They do this through those objects, with the request-level `accountId` of the user ([Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key)).

## Impersonation

Some administrative tasks need access to another user's data as that user sees it, for example a mailbox migration or the investigation of an incident. The `impersonate` permission provides this: it lets an account access the data of every other account.

How impersonation works depends on the interface. Through the management API and JMAP, the permission allows requests that carry the `accountId` of any account. For clients that sign in with a password, it enables master-user sign-in. In a master-user sign-in, the impersonating account signs in with a composite user name of the form `<target>%<impersonator>` and its own password, and the session then belongs to the target account. For example, signing in as `john@example.org%master@example.org` with the password of `master@example.org` opens John's mailbox.

Master-user sign-in works only under these conditions:

- It is available only for password sign-ins: HTTP Basic authentication, the SASL `PLAIN` mechanism and the IMAP `LOGIN` command.
- The impersonating account must hold both `impersonate` and `authenticate`, and the target must hold `authenticate`. A [suspended](/docs/auth/accounts/manage#suspend-an-account) account therefore cannot be impersonated.
- The impersonating account must sign in with its account password. App passwords are refused with `App passwords cannot be used for impersonation`. API keys and OAuth tokens are bearer credentials, so they have no user name to combine with a target.
- An impersonating account with [two-factor authentication](/docs/auth/authentication/2fa) cannot use master-user sign-in, because these sign-ins cannot carry the one-time code.

The System Administrator role holds the `impersonate` permission. The permission gives access to every mailbox, so grant it to further accounts only for tasks that require it, such as migrations or incident response.

Impersonation is reserved for server administrators. In deployments with [tenants](/docs/auth/authorization/tenants), the server removes `impersonate` from every member of a tenant, tenant administrators included, so it cannot be used to cross tenant boundaries.
