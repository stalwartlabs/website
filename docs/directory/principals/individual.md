---
sidebar_position: 2
---

# Individual

The **Individual** principal type in Stalwart Mail Server represents a single person or user account. It is the fundamental unit for user management, as each email user within the system is stored as an individual principal. Individual principals contain all the information necessary to manage and authenticate a user's account, such as login credentials, email addresses, group memberships, and permissions.

An individual principal holds several fields that define its properties and how it interacts with the Stalwart Mail Server. Below are the key fields that an individual principal stores:

- **name**: This field represents the login name or username of the account. It is the identifier used by the user to access the mail server and authenticate their session.
- **type**: Specifies the principal type. For user accounts, this field will always be set to `"individual"`, identifying the principal as a single user.
- **quota**:  Defines the storage quota allocated to the user account, measured in bytes. This value sets a limit on how much data the account can store on the mail server, including emails and attachments.
- **description**: A human-readable name or description for the account. This is often the user's full name and is typically used for display purposes within the system.
- **secrets**: This field holds one or more **secrets**, such as hashed passwords or other authentication tokens. These are used to securely authenticate the user when they attempt to log in.
- **emails**: A list of one or more email addresses associated with the account. Each user can have multiple email aliases or addresses that point to their individual account.
- **memberOf**: Lists the [groups](/docs/directory/principals/group) that the account is a member of. Group memberships are used to organize users and manage permissions or mailing lists at a group level.
- **tenant**: Indicates the [tenant](/docs/directory/multi-tenant) to which the account belongs. This is important in multi-tenant setups where different organizations or divisions share the same mail server infrastructure but need to keep their data isolated.
- **roles**: A list of [roles](/docs/directory/authorization/roles) assigned to the account. Roles can define a set of permissions or responsibilities for the user within the mail system, such as administrative privileges.
- **lists**: Lists the [mailing lists](/docs/directory/principals/list) that the account is subscribed to or a member of. This allows the account to receive messages sent to specific mailing lists.
- **enabledPermissions**: Specifies the [permissions](/docs/directory/authorization/permissions) that are enabled for the account. These permissions control what actions the user can perform, such as sending emails, accessing certain resources, or managing system settings.
- **disabledPermissions**: Specifies the [permissions](/docs/directory/authorization/permissions) that are explicitly disabled for the account. These are permissions that the account does not have, which restrict certain actions or access to resources.
- **picture**: Stores the account's profile picture. This is an image associated with the account, often used in email clients to display alongside the user's name or email address.

These fields allow the Stalwart Mail Server to manage the individual user’s account, ensuring secure authentication, handling email delivery, and managing their access to groups, roles, and resources within the system.

