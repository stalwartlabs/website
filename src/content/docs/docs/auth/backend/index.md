---
sidebar_position: 1
title: "Overview"
description: "Directories in Stalwart: the internal directory and the LDAP, SQL and OpenID Connect directories, how to choose one, what each controls, and per-domain directories."
---

A mail server has to know which users exist and how to check their passwords. Many organisations already keep that information somewhere: in an LDAP server, in an SQL database or in an identity provider. Stalwart can manage the accounts itself, or it can take them from one of these existing systems, so that the accounts and passwords an organisation already maintains serve for mail as well.

The system that holds this information is called a directory. A directory is the source of truth for the accounts of a domain: it decides which accounts and addresses exist, and it verifies their passwords. Stalwart has its own directory, the internal directory, in which accounts are created and managed on the server. An external directory is one of the other systems, which the server queries instead.

Whatever the directory, every account is also stored on the server as an [Account](/docs/ref/object/account) object. The server needs this local account because mailboxes, quotas, roles and settings belong to the server, not to the directory. With an external directory, the server creates the local account the first time the directory returns it, and updates it from the directory afterwards.

## Choosing a directory

The choice follows from where the accounts are managed today. The directories also differ in how they check passwords, and in whether they can answer, for an incoming message, if a recipient address exists:

| Directory | Use when | Password check | Recipient lookup |
|---|---|---|---|
| [Internal](/docs/auth/backend/internal) | Stalwart is the only place accounts are managed | On the server | On the server |
| [LDAP](/docs/auth/backend/ldap) | Accounts live in OpenLDAP, Active Directory or another LDAP server | Bind as the user, or comparison with the hash in the directory | LDAP search |
| [SQL](/docs/auth/backend/sql) | Accounts live in a database table, for example of a hosting control panel | Comparison with the hash returned by a query | SQL query |
| [OpenID Connect](/docs/auth/backend/oidc) | Accounts live in an identity provider that issues OAuth tokens | None: clients sign in at the provider and present its tokens | None |

Two of these differences decide the choice more often than the others.

The first is two-factor authentication. The internal directory is the only one that supports [two-factor authentication](/docs/auth/authentication/2fa), so accounts of LDAP and SQL directories are never asked for a one-time code.

The second is the recipient lookup. An OpenID Connect directory cannot be queried for an address, which means that its accounts exist on the server only after they have signed in once. Mail for an account that has never signed in is therefore rejected.

Some deployments need the identity provider to create, suspend and delete accounts itself. For these, combine the directory with [SCIM provisioning](/docs/auth/scim/), a protocol through which the identity provider pushes account changes to the server. In a domain opened to SCIM, the directory then only verifies sign-ins, and it creates or updates no accounts. [Provisioning models](/docs/auth/scim/provisioning) compares the two approaches.

## Directory responsibilities

An external directory does not supply every property of an account. It supplies some, and the server keeps the rest:

| Property | Source |
|---|---|
| Whether an account or address exists (LDAP, SQL) | Directory |
| Password check | Directory |
| Display name | Directory, overwritten at each synchronisation |
| Aliases | Directory, added at each synchronisation; aliases removed from the directory are kept on the server |
| Group memberships | Directory, replaced at each synchronisation; missing groups are created |
| Roles, permissions, quotas, tenant, Sieve scripts and settings | Server |
| App passwords, API keys and OAuth grants | Server |

Because the server keeps its own copy of each account, removing an entry from the directory never deletes the account or its data. The account is deleted only when an administrator deletes it, or when SCIM does.

For a domain served by an LDAP or SQL directory, the directory alone decides which recipient addresses exist. An address is accepted only if the directory returns an account or group for it. A few kinds of address are still accepted without the directory: mailing lists, masked addresses and catch-all addresses defined on the server, and addresses of relay domains. Accounts and aliases that exist only on the server are not accepted.

The server caches positive answers from the directory for a short time. As a consequence, an entry deleted from the directory may still receive mail briefly.

## Configuration

External directories are [Directory](/docs/ref/object/directory) objects, with one variant per kind: `Ldap`, `Sql` and `Oidc`. In the WebUI they are found under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->.

Several directories can be configured, but one of them serves every domain that does not name its own. This default directory is selected by [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->). When `directoryId` is empty, the internal directory serves those domains.

Changes to Directory objects and to `directoryId` take effect after a [ReloadSettings action](/docs/management/tasks-actions/actions).

Whatever directory is configured, the recovery administrator is always authenticated by the server itself. It therefore remains available when an external directory fails ([Recovery mode](/docs/configuration/recovery-mode)).

## Per-domain directories

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A server that hosts several organisations may need a different directory for each of them. A domain can therefore use a directory other than the default by setting its own [`directoryId`](/docs/ref/object/domain#directoryid), which takes precedence over `Authentication.directoryId`. One server can thus serve one domain from Active Directory, another from an identity provider and a third from the internal directory.

With several directories, each sign-in has to reach the directory of its domain. Password sign-ins are routed by the domain of the user name. Bearer tokens without a user name are routed by the claims of the token.

A further check keeps the directories apart. After a token of an external OpenID Connect directory has been validated, the domain of the account must be served by that same directory. Without this check, one provider's tokens could sign in accounts of another provider's domain. When the check fails, the sign-in fails, and the `auth.failed` event records the reason `The account's domain is not served by the directory that authenticated it`.

A directory can also belong to a [tenant](/docs/auth/authorization/tenants) through its `memberTenantId`. In that case it counts against the tenant's `maxDirectories` quota.
