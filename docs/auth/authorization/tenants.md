---
sidebar_position: 5
---

# Tenants

Multi-tenancy allows several independent organisations, referred to as tenants, to share the same Stalwart deployment while keeping their data and resources isolated from one another. A tenant is a logical division within the server: it has its own accounts, groups, mailing lists, and domains, and principals that belong to one tenant cannot reach resources that belong to another.

Each tenant is represented by a [Tenant](/docs/ref/object/tenant) object (found in the WebUI under <!-- breadcrumb:Tenant --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Tenants<!-- /breadcrumb:Tenant -->). Principals associated with a tenant (accounts, groups, lists, and similar) carry a `memberTenantId` field referencing the owning tenant and are restricted to resources of that same tenant.

Permissions granted within a tenant are bounded by the tenant's own permissions. If a tenant administrator assigns a permission to a principal that is not enabled on the tenant, the grant has no effect. This ensures a tenant cannot exceed the privileges allocated to it at the server level.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Properties

A Tenant object exposes the following fields:

- [`name`](/docs/ref/object/tenant#name): the tenant's name, used as its identifier in the system.
- [`logo`](/docs/ref/object/tenant#logo): a URL or base64-encoded image used when rendering the tenant in the WebUI.
- [`roles`](/docs/ref/object/tenant#roles): the roles assigned to the tenant itself, modelled as a `Roles` variant that can be either the default role set or a custom set referencing specific roles.
- [`permissions`](/docs/ref/object/tenant#permissions): the permissions the tenant is allowed to grant to its principals, modelled as a `Permissions` variant (`Inherit`, `Merge`, or `Replace`) combined with an explicit enable/disable list.
- [`quotas`](/docs/ref/object/tenant#quotas): a map from `TenantStorageQuota` keys to numeric limits. This includes the tenant's total disk quota and the maximum number of principals of each kind (accounts, groups, lists, domains) that the tenant can create.
- [`usedDiskQuota`](/docs/ref/object/tenant#useddiskquota): the amount of disk space currently consumed by the tenant, computed by the server.

The [`name`](/docs/ref/object/tenant#name) field carries the tenant's human-readable label. There is no separate description field on the Tenant object.

Isolation, quotas, and custom role sets together allow multi-tenant operation, while still giving administrators the ability to regulate how much of the server each tenant can consume.

## Quotas

A tenant's disk quota is the maximum storage consumed by all of its members combined. The sum of every member's used storage must fit within this value. For example, when a tenant has a 100GB quota, if member A has consumed 60GB and member B has consumed 40GB, no further mail can be accepted for any account in the tenant until usage is reduced.

Tenants also carry principal-count quotas, which limit the number of accounts, groups, lists, or domains the tenant can create. Both kinds of quota are expressed through the tenant's [`quotas`](/docs/ref/object/tenant#quotas) map.

## Branding

Stalwart supports per-tenant branding in the WebUI through the [`logo`](/docs/ref/object/tenant#logo) field on the Tenant object. The logo is displayed when a user belonging to the tenant accesses the [WebUI](/docs/management/webui/overview), letting each tenant present its own visual identity in multi-tenant deployments.
