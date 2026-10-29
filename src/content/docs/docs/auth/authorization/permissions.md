---
sidebar_position: 2
title: "Permissions"
description: "How Stalwart computes the effective permissions of an account, the permissions held by the default roles, the permissions administrators assign by hand, and who may change an account."
---

Permissions are how Stalwart decides whether an authenticated account may do what it asks. A permission authorizes one kind of action: signing in, sending mail, calling a JMAP method, reading or changing a configuration object, or running a task. An account may perform an action only if its effective permissions contain the permission for that action.

An account rarely receives its permissions one by one. Most come from [roles](/docs/auth/authorization/roles), which bundle permissions under a name. Permissions can also be set directly on accounts and groups, and in the Enterprise edition they are capped by tenants. This page describes how the server combines these sources into the effective permissions, and which permissions an administrator typically assigns by hand. The [permission reference](/docs/ref/permissions) lists every permission with its description.

## Permission names

There are many permissions, but their names follow a fixed pattern. The permission that guards an action can therefore be derived from the action itself:

- Configuration objects are guarded by `sys<Object><Operation>`. The operations are `Get`, `Create`, `Update`, `Destroy` and `Query`, and singletons have only `Get` and `Update`. Creating a [Domain](/docs/ref/object/domain), for example, requires `sysDomainCreate`, and changing the [OidcProvider](/docs/ref/object/oidc-provider) singleton requires `sysOidcProviderUpdate`.
- Each kind of [task and action](/docs/management/tasks-actions/) has its own permission, `task<Variant>` or `action<Variant>`, for example `actionReloadSettings`.
- Protocol operations carry the protocol in the prefix: `imap*` for IMAP commands (`imapAppend`, `imapFetch`), `pop3*`, `jmap*` for JMAP methods (`jmapEmailGet`, `jmapMailboxCreate`), `dav*` for WebDAV, CalDAV and CardDAV requests, `sieve*` for ManageSieve, `calendar*` for calendar notifications and scheduling, and `email*` for sending and receiving mail (`emailSend`, `emailReceive`).
- A small number of permissions stand alone, such as `authenticate` and `impersonate`, which are described [below](#permissions-assigned-by-hand).

## Effective permissions

The effective permissions of an account are the set the server actually checks. It computes them in this order:

1. The permissions of the account's roles are combined. Roles can include other roles, and the permissions of those are included too.
2. The account's own `permissions` field is applied according to its mode.
3. In the Enterprise edition, the result is restricted to the permissions of the account's tenant, and `impersonate` is removed from members of a tenant.
4. Every permission disabled at any of these levels is removed.

The second step depends on a decision made for each account: how its own permissions relate to those of its roles. The `permissions` field of an [Account](/docs/ref/object/account), and of a [Tenant](/docs/ref/object/tenant), records that decision as one of three modes:

- `Inherit` leaves the decision to the roles, so the account has exactly the permissions its roles grant.
- `Merge` keeps the permissions of the roles and adds the ones listed in `enabledPermissions`, for an account that needs a few extra rights.
- `Replace` ignores the roles, and only `enabledPermissions` applies, for an account whose permissions must be listed explicitly.

In `Merge` and `Replace` mode, `disabledPermissions` lists permissions to remove. A disabled permission takes precedence over every source, including roles and the tenant. This precedence is what makes it possible to [suspend](/docs/auth/accounts/manage#suspend-an-account) an account without changing its roles.

The following value gives an account the permissions of its roles plus `impersonate`, but takes away `emailSend`:

```json
{
  "permissions": {
    "@type": "Merge",
    "enabledPermissions": {"impersonate": true},
    "disabledPermissions": {"emailSend": true}
  }
}
```

### Permissions of a request

A single request can carry fewer permissions than its account. This happens in three cases, each of which can narrow the permissions but never extend them:

- [App passwords](/docs/auth/authentication/app-password) and [API keys](/docs/auth/authentication/api-key) have their own mode, `Inherit`, `Disable` or `Replace`, which can remove permissions but never add any.
- A token issued to an OAuth application other than a first-party client is limited to the permissions mapped to its [scopes](/docs/auth/oauth/scopes). These never include management (`sys*`), telemetry, SCIM or administration.
- A token of an external identity provider that carries scopes is limited in the same way.

Changes to roles, permissions, group memberships or the tenant take effect without a new sign-in ([Roles](/docs/auth/authorization/roles#propagation-of-changes)).

## Permissions of the default roles

The server creates four roles on first start. They contain these permissions:

| Role | Permissions |
|---|---|
| User | `authenticate`, `authenticateWithAlias`; every protocol permission (`jmap*`, `imap*`, `pop3*`, `dav*`, `sieve*`, `calendar*`, `email*`); the self-service objects `sysAccountPassword*`, `sysAccountSettings*`, `sysApiKey*`, `sysAppPassword*`, `sysPublicKey*`, `sysMaskedEmail*`, `sysArchivedItem*`, the `sysOAuthGrant*` permissions for listing and revoking connected applications, reading and deleting spam training samples; `interactAi` |
| Group | Every protocol permission, the `sysAccountSettings*`, `sysPublicKey*`, `sysMaskedEmail*` and `sysArchivedItem*` permissions, and reading and deleting spam training samples |
| Tenant Administrator | `authenticate`, `authenticateWithAlias`, `fetchAnyBlob`, `liveDeliveryTest`, `interactAi`, and the management of domains, DKIM signatures, ACME providers, accounts, roles, OAuth clients, mailing lists, external reports, DNS servers and queued messages (`sysDomain*`, `sysDkimSignature*`, `sysAcmeProvider*`, `sysAccount*`, `sysRole*`, `sysOAuthClient*`, `sysMailingList*`, `sysExternalReport*`, `sysDnsServer*`, `sysQueuedMessage*`) |
| System Administrator | Every permission except the protocol permissions |

Neither administrator role contains the protocol permissions. An administrator account therefore also receives the User role, and the defaults provide it: `roles: Admin` applies System Administrator together with User, and a tenant administrator receives Tenant Administrator together with User. Tenant administrators exist only in deployments with [tenants](/docs/auth/authorization/tenants), an Enterprise feature.

## Permissions assigned by hand

Most permissions reach an account through its roles. A few are the exception, because administrators most often add them to, or remove them from, individual accounts, custom roles or credentials:

| Permission | Effect |
|---|---|
| `authenticate` | Sign in with any credential. Disabling it suspends all sign-ins of the account. |
| `authenticateWithAlias` | Sign in with an alias address of the account as well as its primary address. |
| `emailSend`, `emailReceive` | Submit mail through SMTP or JMAP; receive mail at the account's addresses. |
| `impersonate` | Access any account's data and act on its behalf, through [master-user sign-in](/docs/auth/authorization/administrator#impersonation) and through the `accountId` of JMAP requests. Superusers hold it. |
| `unlimitedRequests`, `unlimitedUploads` | Bypass the request rate limits and the upload size and rate limits, for example for migration accounts. |
| `fetchAnyBlob` | Download any blob by id, even one not owned by the account. |
| `liveDeliveryTest` | Run the delivery test in the WebUI troubleshooting tools. |
| `liveTracing`, `liveMetrics` | View live event traces and metrics. |
| `scimAccess` | Use the [SCIM](/docs/auth/scim/) provisioning endpoint. |
| `interactAi` | Use the AI features that send content to an [AI model](/docs/server/ai-models). |

## Granting permissions to other accounts

An account that can manage users could, without a further rule, create an account more powerful than itself, or take one over. The server prevents this with a rule that applies to every change to an account. Creating, changing or deleting an account requires the `sysAccountCreate`, `sysAccountUpdate` or `sysAccountDestroy` permission. In addition, the caller must hold every effective permission of the target account. An account can therefore grant only permissions it holds itself.

The rule applies everywhere accounts are changed: the management API, the WebUI, the CLI and [SCIM](/docs/auth/scim/) provisioning. It has no exception for superusers.

A request that breaks the rule fails with the JMAP error `forbidden`, in `notCreated`, `notUpdated` or `notDestroyed`, or with HTTP status 403 on SCIM. The description names up to five of the missing permissions:

```text
You are not authorized to grant permissions: impersonate, unlimitedRequests, unlimitedUploads, fetchAnyBlob, liveDeliveryTest and <N> more
```

The caller's permissions are those of the credential it presented, which are not always those of its account. A password carries the permissions of its account, and so does an app password or API key in `Inherit` mode. In `Disable` mode the listed permissions are removed, and in `Replace` mode only the listed permissions that the account holds are kept.

The rule has these consequences in practice:

- A help-desk role with `sysAccountUpdate` and the User permissions can reset the password of ordinary users, but not of administrators.
- A credential restricted to account management, for example an API key in `Replace` mode with only `sysAccount*` permissions, cannot manage ordinary users, because users hold every protocol permission of the User role. Use a credential in `Inherit` or `Disable` mode on an account that holds the User permissions as well.
- An account that manages administrators must hold the administrators' permissions.
- Tenant administrators can manage the accounts of their tenant, because their roles include the User permissions.

[SCIM configuration](/docs/auth/scim/configuration#permissions) describes what this means for provisioning credentials.

## Permissions and access control lists

Permissions decide which kinds of actions an account may perform. They do not decide which mailboxes, calendars, address books or folders of other accounts it may reach. That is decided by access control lists, which the owner of each resource sets when sharing it, through IMAP ACL, JMAP sharing or WebDAV ACL ([Sharing](/docs/collaboration/sharing)).

An account needs both kinds of authorization. Opening a mailbox that another account owns over IMAP requires the `imapSelect` permission, which is needed to open any mailbox, and an access control entry on that mailbox.
