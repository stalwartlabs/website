---
sidebar_position: 5
---

# Tenants

Multi-tenancy is a feature in Stalwart Mail Server that allows multiple independent organizations, known as **tenants**, to share the same mail server infrastructure while keeping their data and resources completely isolated from one another. A tenant is defined as a logical division within the mail server, representing a specific organization or group that has its own set of users, groups, mailing lists, and domains.

Each tenant in Stalwart is defined as a [principal](/docs/directory/principals/overview) within the directory. Principals assigned to a specific tenant (such as i[individuals](/docs/directory/principals/individual), [groups](/docs/directory/principals/group), and [lists](/docs/directory/principals/list)) are restricted to interacting only with other resources and users within the same tenant. This ensures complete separation between tenants, providing privacy and security for each organization. 

Additionally, any permissions assigned within a tenant are bound by the permissions of the tenant itself. For instance, if a tenant administrator assigns a permission to a user that the tenant itself does not have, this permission is ignored. This ensures that tenant administrators cannot assign more privileges than the tenant is allowed.

:::tip Enterprise feature

This feature is available exclusively in the Enterprise Edition of Stalwart Mail Server and not included in the Community Edition.

:::

## Properties

The tenant principal in Stalwart Mail Server contains several fields that define its properties and behavior:

- **name**: The name field stores the name of the tenant. This is the identifier used to represent the tenant within the system.
- **type**: Specifies the principal type, which for tenants is always set to `"tenant"`. This distinguishes it from other principal types, such as individuals or groups.
- **quota**: The quota field contains an array that defines various quotas for the tenant. The first item in the array represents the disk quota for the tenant in bytes. This defines the maximum storage allowed for the tenant's members. Subsequent items in the array represent quotas for different principal types (such as the number of accounts, groups, lists, or domains that the tenant can create).
- **description**: A human-readable name or description of the tenant. This field can be used to provide more context about the tenant, such as the organization it represents.
- **roles**: The **roles** field lists the roles that the tenant is allowed to assign to its principals (such as users, groups, or lists). These roles determine the permissions that can be granted to members of the tenant.
- **enabledPermissions**:  Specifies the [permissions](/docs/directory/authorization/permissions) that are granted to the tenant. Any roles or permissions assigned within the tenant are limited by this list.
- **disabledPermissions**: Specifies the [permissions](/docs/directory/authorization/permissions) that are explicitly restricted for the tenant. If a permission is listed here, it cannot be enabled for any principal within the tenant, regardless of their assigned roles or permissions.
- **picture**: The picture field contains a URL that points to the logo associated with the tenant. This logo is displayed on the tenant’s web administration interface as part of the tenant's branding.

In summary, the tenant principal in Stalwart Mail Server provides a structured way to define and manage organizations, enforce quotas, and apply branding. By allowing tenants to be isolated and managed independently, Stalwart enables secure and scalable multi-tenant operations while ensuring administrators can control access and resources efficiently.

## Quotas

Tenants in Stalwart Mail Server can have **disk quotas** assigned, which represent the maximum amount of storage the tenant can use across all its members. This disk quota includes the total disk usage of all individual accounts, groups, and other resources that belong to the tenant.

For example, if a tenant has a quota of 100GB and Member A has used 60GB, and Member B has used 40GB, the combined usage of 100GB means no further emails can be received for any accounts within the tenant, as the quota has been fully consumed. Disk quotas help prevent one tenant from using more than its fair share of resources on the mail server.

In addition to disk usage, tenants also have quotas that limit the number of principals (such as accounts, groups, lists, or domains) they can create. These quotas ensure that tenants do not create an excessive number of principals, which could impact the overall performance of the mail server.

## Branding

Stalwart Mail Server supports [branding](/docs/management/webadmin/branding) for tenants, allowing organizations to customize the appearance of the web administration interface. Each tenant can have its own **logo**, which is displayed to users when they access the [webadmin](/docs/management/webadmin/overview) portal. This feature is particularly useful in multi-tenant environments, as it allows each tenant to present its own branding and identity, making the user experience more personalized.
