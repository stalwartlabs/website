---
sidebar_position: 3
---

# Group

The **Group** principal type in Stalwart Mail Server represents a collection of individual users and potentially other groups. Groups function similarly to regular accounts in that they can receive emails, but they differ in a few important ways: group accounts cannot log in to the mail server using IMAP, POP3, or JMAP. Instead, groups are designed to organize users and share resources. When an individual is added as a member of a group, they gain access to the group’s inbox, which appears as a shared folder in their email client when using IMAP or JMAP.

A group principal holds a set of fields that define its properties and how it interacts with the Stalwart Mail Server. Below are the key fields for a group principal:

- **name**: The name field represents the group's identifier. This is the name used to refer to the group within the system, and it is unique to the group within its context.
- **type**: Specifies the principal type. For groups, this is always set to `"group"`, distinguishing the principal as a collection of individuals or other groups.
- **quota**: Defines the storage quota allocated to the group, measured in bytes. This sets the limit on how much data (such as emails) the group can store on the server.
- **description**: A human-readable description or name for the group, which may be used for display purposes. This can often be the same as the group's formal name or a more detailed label.
- **emails**: A list of one or more email addresses associated with the group. Just like an individual principal, a group can have multiple email addresses or aliases to receive mail.
- **memberOf**: Lists any groups that this group is a member of. Groups can be nested within other groups to simplify managing permissions and access.
- **members**: Contains a list of [individuals](/docs/auth/principals/individual) and other **groups** that are members of this group. These members inherit certain privileges, such as accessing the group's shared inbox.
- **tenant**: Indicates the [tenant](/docs/auth/authorization/tenants) to which the group belongs. This is relevant in multi-tenant environments where different organizations share the same mail server infrastructure.
- **roles**: A list of [roles](/docs/auth/authorization/roles) assigned to the group. Roles help define what the group can do within the mail system, such as administrative roles or access to certain shared resources.
- **lists**: Lists the [mailing lists](/docs/auth/principals/list) the group is a member of. This allows the group to receive messages sent to those mailing lists.
- **enabledPermissions**: Specifies the [permissions](/docs/auth/authorization/permissions) that are enabled for the group. These define what the group, and its members, can do within the mail server environment, such as viewing shared inboxes or managing specific settings.
- **disabledPermissions**: Specifies the [permissions](/docs/auth/authorization/permissions) that are explicitly disabled for the group. These limit what actions the group is allowed to perform, controlling access to certain features or resources.
- **picture**: Stores the group's picture. This image can be used in email clients or within the server's management interface to visually represent the group.

Groups are a powerful feature of Stalwart Mail Server, allowing administrators to manage multiple users more efficiently by assigning shared resources, permissions, and email addresses. When individuals are added to a group, they can access the group’s inbox and messages as if they were their own, simplifying collaboration and communication across the organization.
