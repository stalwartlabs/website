---
sidebar_position: 4
---

# Administrators

Stalwart has no dedicated "administrator account" type in the directory. Administrative capabilities are granted by assigning specific [permissions](/docs/auth/authorization/permissions) to regular [individual accounts](/docs/auth/principals/individual). This avoids handing out blanket administrative privileges and allows each administrator to hold only the permissions required for the tasks they perform.

Assigning permissions to ordinary accounts lets administrative responsibilities be distributed without compromising security. For example, one account may be granted the ability to manage domain settings and user accounts without being able to reconfigure system-wide services. This principle of least privilege reduces the risk of accidental or malicious changes to critical parts of the server.

Administrators can create one or more [Role](/docs/ref/object/role) objects that group administrative permissions together and assign those roles to the appropriate accounts. This provides consistent control over who can perform which administrative tasks.

For emergency access when the regular administrative accounts are unavailable, see the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) mechanism. It is an environment-variable credential that is only honoured while the server is running in [recovery mode](/docs/configuration/recovery-mode) or during first-time [bootstrap](/docs/configuration/bootstrap-mode), and is intended to be set temporarily while an incident is resolved.

## Master User

The master user is a special account granted full access to every mailbox on the server. It is used for system maintenance and monitoring, in particular operations that require reading messages across all accounts. Because its access is very broad, it should be used only for legitimate administrative tasks.

<!-- review: The previous docs exposed the master user through `authentication.master.user` and `authentication.master.secret`. The current Authentication singleton has no corresponding fields and no other object in the reference documents the master user. Confirm where the master user is now configured (Bootstrap, a dedicated object, or an account-level flag), and what the current field names are. -->

Once master user access is enabled, any mailbox can be accessed by signing in as `<account_name>%<master_user>`. For example, when the master user is `master`, the mailbox of `john` is accessed by logging in as `john%master`.
