---
sidebar_position: 5
title: "Tenants"
description: "Multi-tenancy in Stalwart: how tenants isolate organisations, how they are populated and administered, their quotas, and the restrictions on tenant-owned objects."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Multi-tenancy lets several independent organisations share one Stalwart deployment, as a hosting provider does for its customers. Each organisation is a tenant. A tenant has its own domains, accounts, groups, mailing lists and other objects, and it is isolated from the other tenants in three ways:

- Accounts of one tenant cannot reach the objects of another.
- A tenant administrator manages only the tenant's own objects.
- The server operator decides how many resources and which permissions each tenant receives.

Each tenant is a [Tenant](/docs/ref/object/tenant) object (found in the WebUI under <!-- breadcrumb:Tenant --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Tenants<!-- /breadcrumb:Tenant -->). The object holds a `name`, its permissions and its quotas. It can also hold a `logo`, which brands the WebUI for the tenant's users ([Branding](/docs/management/webui/branding)).

## Tenant members

An object belongs to a tenant through its `memberTenantId` field. The following objects can belong to a tenant:

- [Accounts and groups](/docs/auth/accounts/)
- [Domains](/docs/domains/) and [mailing lists](/docs/email/management/mailing-lists)
- [Roles](/docs/auth/authorization/roles)
- [OAuth clients](/docs/auth/oauth/clients#tenant-owned-clients)
- [Directories](/docs/auth/backend/)
- DKIM signatures, ACME providers and DNS servers
- The external reports received for the tenant's domains

How `memberTenantId` is set depends on who creates the object. Objects that a tenant administrator creates are placed in the administrator's tenant automatically. The server operator, who works outside any tenant, sets `memberTenantId` explicitly.

A tenant administrator is an account of the tenant whose `roles` is `Admin`. For an account inside a tenant, `Admin` applies the Authentication singleton's `defaultTenantRoleIds` instead of the server administrator roles. By default these are the Tenant Administrator and User roles. They allow the account to manage the tenant's domains, accounts, groups, mailing lists, roles, OAuth clients, DKIM signatures, ACME providers, DNS servers and queued messages, and nothing outside the tenant.

## Permissions

A tenant sets the most that its members may hold, through its own `roles` and `permissions`. The server computes the effective permissions of a member from the member's own roles and permissions, and then restricts the result to those of the tenant ([Permissions](/docs/auth/authorization/permissions#effective-permissions)). A permission that the tenant lacks therefore has no effect on its members, whoever assigns it.

The ceiling is chosen in the same way as an account's permissions. With `roles` set to `Default`, it is the roles in `defaultTenantRoleIds`. `Custom` selects other roles. `permissions` then adjusts the result with the `Inherit`, `Merge` and `Replace` modes.

The `impersonate` permission is the exception: tenant members never receive it, even when their roles, their own permissions or the tenant's settings grant it. Impersonation reaches every account on the server, across tenant boundaries, so it is reserved for the server administrator ([Impersonation](/docs/auth/authorization/administrator#impersonation)). The server also refuses to add `impersonate` to a tenant's `permissions`. A tenant administrator therefore cannot act on another member's account through its `accountId`, for example to create an app password on the member's behalf.

## Quotas

Account quotas limit each member on its own. A tenant's `quotas` map adds a second limit, on what the tenant may consume in total:

| Quota | Limit |
|---|---|
| `maxDiskQuota` | Disk space used by all members together, in bytes |
| `maxAccounts`, `maxGroups` | User accounts and group accounts |
| `maxDomains`, `maxMailingLists`, `maxRoles` | Domains, mailing lists and roles |
| `maxOauthClients` | Registered OAuth clients |
| `maxDkimKeys`, `maxAcmeProviders`, `maxDnsServers`, `maxDirectories` | DKIM keys, ACME providers, DNS servers and external directories |

The disk quota is shared among the members. Suppose a tenant has a 100 GB quota, and one member uses 60 GB and another 40 GB. No member can then store more until usage falls, whatever its own account quota allows. An IMAP client that hits the limit receives `NO [OVERQUOTA] Organization disk quota exceeded.`, and mail for members is deferred with `Organization over quota.` ([Quotas](/docs/auth/authorization/quotas)).

The object quotas apply to every object created for the tenant, whether a tenant administrator or a server administrator creates it. They also apply to an existing object that is moved into the tenant by changing its `memberTenantId`. A creation beyond the limit fails with the JMAP error `overQuota` and a description such as `You have exceeded your quota of 50 accounts.`

## Restrictions on tenant-owned objects

Tenant administrators are not trusted with the server's network position. An object configured by a tenant could otherwise make the server contact internal services or read local files on the tenant's behalf. Objects owned by a tenant are therefore subject to restrictions that do not apply to the server's own objects:

- URLs configured on tenant-owned objects, such as DNS server endpoints, ACME directories and domain logos, must use https, must not contain credentials and must resolve to public IP addresses.
- Secrets of tenant-owned objects must be given as values. The `File` and `EnvironmentVariable` sources, which would read from the server's file system or environment, are rejected.
- OAuth clients owned by a tenant are shown as unverified on the consent screen, and they sign in only accounts of that tenant. Any other account receives `access_denied` ([OAuth clients](/docs/auth/oauth/clients#tenant-owned-clients)).
- An OpenID Connect directory owned by a tenant contacts its identity provider only on public IP addresses ([OpenID Connect directory](/docs/auth/backend/oidc)).
