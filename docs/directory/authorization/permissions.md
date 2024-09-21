---
sidebar_position: 2
---

# Permissions

Permissions in Stalwart Mail Server determine the specific actions and resources that a user, group, or entity is allowed to access. Permissions allow administrators to control fine-grained access to various operations within the mail server, providing a clear distinction between what actions an entity can or cannot perform. Permissions can be assigned directly to [individuals](/docs/directory/principals/individual), [groups](/docs/directory/principals/group), [roles](/docs/directory/authorization/roles), or even entire [tenants](/docs/directory/multi-tenant), giving administrators comprehensive control over access policies.

To simplify the management of permissions, multiple permissions can be grouped together into [roles](/docs/directory/authorization/roles). Assigning roles to users or groups allows administrators to more easily manage access by bundling related permissions rather than having to assign them individually.

## Effective Permissions

Each principal type in Stalwart Mail Server (such as individuals, groups, or roles) has two important fields related to permissions: `enabledPermissions` and `disabledPermissions`. The **effective permissions** for an individual are calculated using a combination of permissions from various levels:

- **Enabled Permissions**:  
   - Start with the `enabledPermissions` assigned directly to the **individual**.
   - Combine these with the `enabledPermissions` of any **roles** that are assigned to the individual.
   - Finally, intersect these with the `enabledPermissions` of the **tenant** to which the individual belongs.
- **Disabled Permissions**:  
   - Any permissions explicitly listed in the `disabledPermissions` field of the **individual**, **roles**, or **tenant** are subtracted from the total. This ensures that even if a permission is enabled at one level, it will be disabled if explicitly restricted at another.

This mechanism allows for a flexible yet precise approach to access control, ensuring that permissions are layered and can be modified at various levels to suit the needs of the organization.

## Permissions vs. ACLs

It's important to note that permissions in Stalwart Mail Server are distinct from Access Control Lists (ACLs). 

- **Permissions**: Defined by the **administrator**, permissions control access to specific resources and actions within the mail server itself. These determine what a user or entity is allowed to do globally within the system, such as managing settings, accessing logs, or sending emails.
- **Access Control Lists (ACLs)**: Managed by **users** and are used to grant other users or groups access to their emails, folders, or other specific data. ACLs, typically controlled via the IMAP ACL extension or JMAP, regulate how one user's data is shared with others and are applied on a per-folder or per-resource basis.

In summary, permissions are centrally controlled by administrators to define what actions and resources can be accessed by whom, while ACLs give users control over how their own data is shared and accessed by others. Together, they offer robust and flexible security and access control within the Stalwart Mail Server environment.
