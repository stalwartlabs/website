---
sidebar_position: 3
---

# Roles

Roles in Stalwart are used to group [permissions](/docs/auth/authorization/permissions), making it easier to manage access control across individuals, groups, and tenants. Roles are stored in the directory as principals, just like individuals or groups, and they can also contain subroles (roles within other roles) allowing for a hierarchical structure of access permissions. 

Roles are a powerful way to streamline permission management by assigning sets of predefined permissions to users, groups, or tenants. Instead of assigning permissions individually, administrators can assign roles that encapsulate multiple permissions at once.

A role [principal](/docs/auth/principals/overview) includes the following fields that define its properties and how it functions within the mail server:

- **name**: The name field is the identifier of the role within the system. It should be a unique name that represents the role's purpose (e.g., `admin`, `user`, `support-admin`).
- **type**: Specifies the principal type, which for roles is always set to `"role"`. This field helps the system differentiate between roles and other types of principals such as individuals or groups.
- **description**: A human-readable description of the role, providing additional context about its function. This field can be used to clarify the role's purpose, especially when custom roles are created by administrators.
- **members**: The members field lists the principals (such as **individuals**, **groups**, or other **roles**) that are using this role. When a principal is a member of a role, they inherit the permissions defined by that role.
- **tenant**: Indicates the [tenant](/docs/auth/authorization/tenants) to which the role belongs. This is important in multi-tenant environments, as each tenant may have its own set of roles that apply only to the users and groups within that tenant.
- **roles**: Roles can include subroles, meaning a role can be a collection of other roles. The **roles** field lists any subroles that this role includes. When subroles are included, their permissions are also inherited by the role.
- **enabledPermissions**: This field defines the set of [permissions](/docs/auth/authorization/permissions) that the role grants to its members. These permissions determine what actions and resources the role's members can access and perform within the system.
- **disabledPermissions**: This field lists any [permissions](/docs/auth/authorization/permissions) that are explicitly disabled for the role, ensuring that members of the role are restricted from performing certain actions, even if those actions are enabled in a subrole or elsewhere.

Roles are an essential tool for efficiently managing permissions in Stalwart. By grouping permissions into roles, administrators can assign access rights more easily to individuals, groups, or entire tenants. The built-in roles—**user**, **admin**, and **tenant-admin**—provide a ready-made starting point for typical scenarios, but custom roles can also be created to meet specific needs. Through the flexible use of **enabledPermissions**, **disabledPermissions**, and **subroles**, roles offer granular control over what resources can be accessed and what actions can be performed within the mail server.

## Built-in Roles

Stalwart includes three **built-in roles** to simplify common access control scenarios:

- `user`: This role grants access to all regular services offered by the mail server, such as email sending, receiving, and accessing mailboxes. It is designed for standard users who need full access to their email functions without any administrative rights.
- `admin`: The admin role is the most powerful role in Stalwart. It enables **every single permission type** within the system, giving the user full control over all aspects of the mail server, including configuration changes, user management, and system operations.
- `tenant-admin`:This role is intended for administrators of a specific **tenant** or **domain**. It grants basic administrative permissions to manage users, groups, and settings for their tenant or domain, but it restricts access to critical system configurations to prevent unintended changes at the global level.

