---
sidebar_position: 5
---

# Tenants

Multi-tenancy allows several independent organisations, referred to as tenants, to share the same Stalwart deployment while keeping their data and resources isolated from one another. A tenant is a logical division within the server: it has its own accounts, groups, mailing lists, and domains, and principals that belong to one tenant cannot reach resources that belong to another.

Each tenant is represented by a [Tenant](/docs/ref/object/tenant) object (found in the WebUI under <!-- breadcrumb:Tenant --><!-- /breadcrumb:Tenant -->). Principals associated with a tenant (accounts, groups, lists, and similar) carry a `memberTenantId` field referencing the owning tenant and are restricted to resources of that same tenant.

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

<!-- review: The previous docs exposed a `description` field on tenants (a human-readable description separate from the name). The current Tenant object has only `name`, with no description field. Confirm that descriptive text is now carried via `name` alone, or identify the replacement field. -->

Isolation, quotas, and custom role sets together allow secure and scalable multi-tenant operation, while still giving administrators the ability to regulate how much of the server each tenant can consume.

## Quotas

A tenant's disk quota is the maximum storage consumed by all of its members combined. The sum of every member's used storage must fit within this value. For example, when a tenant has a 100GB quota, if member A has consumed 60GB and member B has consumed 40GB, no further mail can be accepted for any account in the tenant until usage is reduced.

Tenants also carry principal-count quotas, which limit the number of accounts, groups, lists, or domains the tenant can create. Both kinds of quota are expressed through the tenant's [`quotas`](/docs/ref/object/tenant#quotas) map.

## Branding

Stalwart supports per-tenant branding in the WebUI through the [`logo`](/docs/ref/object/tenant#logo) field on the Tenant object. The logo is displayed when a user belonging to the tenant accesses the [WebUI](/docs/management/webui/overview), letting each tenant present its own visual identity in multi-tenant deployments.
