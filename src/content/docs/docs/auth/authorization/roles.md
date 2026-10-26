---
sidebar_position: 3
title: "Roles"
description: "Roles as named sets of permissions: the four default roles, how accounts and groups are assigned roles, custom roles, and when changes take effect."
---

Most accounts on a server need the same access as many others. Maintaining that access permission by permission on every account would be slow and error-prone. Roles solve this. A role is a named set of [permissions](/docs/auth/authorization/permissions), where each permission is an individual right that the server checks for an operation. An administrator defines a level of access once as a role, for example "help desk" or "domain administrator", and assigns the role to as many accounts and groups as need it.

Roles can also include other roles. A role for help-desk staff can therefore consist of the User role plus a few management permissions, instead of repeating every permission of the User role.

Each role is a [Role](/docs/ref/object/role) object (found in the WebUI under <!-- breadcrumb:Role --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Roles<!-- /breadcrumb:Role -->). It has these parts:

- A `description`, which is the role's name
- The permissions it grants, in `enabledPermissions`
- The permissions it removes, in `disabledPermissions`
- The roles it includes, in `roleIds`

A permission disabled by a role is removed even if an included role grants it. Roles do not list their members. Instead, each account and group refers to the roles it uses.

## Default roles

On first start, the server creates four roles and records them as defaults on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->). The default role sets on that singleton decide which roles an account receives when it does not name its own:

| Role | Purpose | Used by default in |
|---|---|---|
| User | Signing in and using every mail, calendar, contacts and file protocol, and managing one's own credentials and settings | `defaultUserRoleIds`; also part of `defaultAdminRoleIds` and `defaultTenantRoleIds` |
| Group | The protocol permissions of a group account | `defaultGroupRoleIds` |
| Tenant Administrator | Managing the domains, accounts and related objects of a tenant (Enterprise) | `defaultTenantRoleIds`, together with User |
| System Administrator | Managing the whole server | `defaultAdminRoleIds`, together with User |

[Permissions](/docs/auth/authorization/permissions#permissions-of-the-default-roles) lists the permissions in each role.

The default roles are ordinary Role objects, so they can be edited. A change applies to every account that uses the role. Because both administrator role sets include User, removing a permission from the User role also removes it from administrators.

## Assigning roles

Each account selects its roles in its `roles` field. For a user [account](/docs/auth/accounts/user), the field takes one of three values, depending on whether the account should follow a default role set or have its own:

- `User` applies the roles in `defaultUserRoleIds`, by default the User role. New accounts receive this value.
- `Admin` applies the roles in `defaultAdminRoleIds`, by default the System Administrator and User roles. For an account that belongs to a tenant, it applies `defaultTenantRoleIds` instead, which makes the account an administrator of its tenant and nothing more.
- `Custom` applies the roles listed in `roleIds`.

The `roles` field of a [group](/docs/auth/accounts/group) has two values: `Default`, which applies `defaultGroupRoleIds`, or `Custom`. The roles of a group govern what the group account itself may do, for example whether it may receive mail. They are not passed on to the group's members.

Changing `defaultUserRoleIds` or another default role set changes the roles of every account that uses the corresponding value. These fields are read when the settings are loaded, so a change applies only after a [ReloadSettings action](/docs/management/tasks-actions/actions). Even then, accounts that have been used since the last restart keep their previous permissions, because the server caches them. They pick up the change once an `InvalidateCaches` action clears the cached permissions, or when the server restarts. Changes to the Role objects themselves need neither action.

## Create a custom role

A custom role combines existing roles with additional permissions. The following role gives help-desk staff the User permissions plus the ability to look up accounts and reset passwords:

```json
{
  "description": "Help desk",
  "roleIds": {"<id of the User role>": true},
  "enabledPermissions": {
    "sysAccountGet": true,
    "sysAccountQuery": true,
    "sysAccountUpdate": true,
    "sysDomainGet": true,
    "sysDomainQuery": true
  }
}
```

An account receives the role through its `roles` field:

```json
{
  "roles": {"@type": "Custom", "roleIds": {"<id of the role>": true}}
}
```

The role does not let its holders manage every account. An account can change only accounts whose permissions it holds itself ([Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)). Help-desk staff with this role can therefore reset the passwords of ordinary users, but not of administrators.

In the Enterprise edition, a role can belong to a [tenant](/docs/auth/authorization/tenants) through `memberTenantId`. Tenant administrators create such roles for their own accounts, and these roles count against the tenant's `maxRoles` quota.

## Propagation of changes

Changes to access take effect without a new sign-in. A change to a Role, or to an account's roles, permissions, group memberships, tenant or credentials, applies to every affected account at its next HTTP request. This includes accounts that receive the role through another role or, in the Enterprise edition, through their tenant. Open IMAP and POP3 sessions pick up the change shortly after. OAuth access tokens follow the change as well, so applications do not have to sign in again.

A cluster without a [coordinator](/docs/cluster/coordination/) is the exception. There, the change reaches at once only the node that processed it. On the other nodes, sign-ins with a password or app password see the change. Requests with OAuth tokens or API keys, and changes to the permissions inside a role, keep the previous permissions until the cached entry is evicted or the node restarts.
