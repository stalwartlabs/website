---
sidebar_position: 3
---

# Roles

Roles group [permissions](/docs/auth/authorization/permissions) so that access can be managed across individuals, groups, and tenants without assigning every permission individually. Each role is represented by a [Role](/docs/ref/object/role) object (found in the WebUI under <!-- breadcrumb:Role --><!-- /breadcrumb:Role -->) and can reference other roles, producing a hierarchical model in which a parent role inherits the permissions of its subroles.

A Role object carries the following fields:

- [`description`](/docs/ref/object/role#description): a human-readable description of the role's purpose. This also serves as the role's display label in the WebUI.
- [`memberTenantId`](/docs/ref/object/role#membertenantid): the tenant that owns the role, used in multi-tenant deployments to scope roles to a specific tenant.
- [`roleIds`](/docs/ref/object/role#roleids): a list of roles this role extends. Permissions from the listed roles are inherited by this role.
- [`enabledPermissions`](/docs/ref/object/role#enabledpermissions): permissions explicitly granted by the role.
- [`disabledPermissions`](/docs/ref/object/role#disabledpermissions): permissions explicitly denied by the role. Disabled permissions take precedence over inherited permissions.

The role's display label in listings is drawn from [`description`](/docs/ref/object/role#description); there is no separate `name` field. Membership is not stored on the Role object itself, it is tracked on the principals that reference the role, through the `roles` field on [Account](/docs/ref/object/account) (including its `Group` variant) and on [Tenant](/docs/ref/object/tenant).

Assigning a role to an account is done from the target principal. On an Account object (found in the WebUI under <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->), the [`roles`](/docs/ref/object/account#roles) field selects either a built-in role or a `Custom` role set that references one or more Role ids. Groups and tenants expose their own `roles` field of the same shape.

## Built-in Roles

Stalwart provides three built-in roles for common scenarios. The Account object references them through the `UserRoles` variants `User` and `Admin`, and tenant-level administration is covered by a dedicated role set.

- **user**: grants access to the regular services offered by the server, such as sending and receiving email and accessing mailboxes. It is intended for standard end-user accounts.
- **admin**: grants every permission defined by the server, including configuration and principal management. Intended for system administrators.
- **tenant-admin**: grants the administrative permissions required to manage users, groups, and settings within a single tenant or domain, without exposing global configuration changes.

Default roles automatically assigned to new accounts, groups, tenants, and administrators are configured on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><!-- /breadcrumb:Authentication -->) through [`defaultUserRoleIds`](/docs/ref/object/authentication#defaultuserroleids), [`defaultGroupRoleIds`](/docs/ref/object/authentication#defaultgrouproleids), [`defaultTenantRoleIds`](/docs/ref/object/authentication#defaulttenantroleids), and [`defaultAdminRoleIds`](/docs/ref/object/authentication#defaultadminroleids).
