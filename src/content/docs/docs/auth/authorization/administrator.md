---
sidebar_position: 4
title: "Administrators"
---

Stalwart has no dedicated "administrator account" type in the directory. Administrative capabilities are granted by assigning specific [permissions](/docs/auth/authorization/permissions) to regular [individual accounts](/docs/auth/principals/individual). This avoids handing out blanket administrative privileges and allows each administrator to hold only the permissions required for the tasks they perform.

Assigning permissions to ordinary accounts lets administrative responsibilities be distributed without compromising security. For example, one account may be granted the ability to manage domain settings and user accounts without being able to reconfigure system-wide services. This principle of least privilege reduces the risk of accidental or malicious changes to critical parts of the server.

Administrators can create one or more [Role](/docs/ref/object/role) objects that group administrative permissions together and assign those roles to the appropriate accounts. This provides consistent control over who can perform which administrative tasks.

For emergency access when the regular administrative accounts are unavailable, see the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) mechanism. It is an environment-variable credential that is only honoured while the server is running in [recovery mode](/docs/configuration/recovery-mode) or during first-time [bootstrap](/docs/configuration/bootstrap-mode), and is intended to be set temporarily while an incident is resolved.

## Impersonation

There is no dedicated master-user configuration. Mailbox-wide access is instead granted by assigning the `impersonate` [permission](/docs/auth/authorization/permissions) to a regular account, typically through a [Role](/docs/ref/object/role). Any account that holds this permission can sign in on behalf of another account by supplying a composite login of the form `<target>%<impersonator>` together with the impersonator's password.

For example, when the impersonating account is `master@example.org` and the target mailbox belongs to `john@example.org`, signing in as `john@example.org%master@example.org` with the password of `master@example.org` grants access to `john`'s mailbox. The same convention works for single-label account names on deployments that do not use `user@domain` logins. Because this access is broad, the `impersonate` permission should be granted sparingly and only for legitimate administrative tasks such as maintenance or incident response.
