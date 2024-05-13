---
sidebar_position: 4
---

# Administrators

Administrators play a critical role in the maintenance and management of the system. These privileged accounts are endowed with the ability to perform a wide range of management tasks, which include altering system settings, managing user accounts, and executing maintenance duties. Given the extensive capabilities of administrator accounts, such as deleting mail accounts and undertaking other potentially disruptive actions, it is paramount to ensure the security of their passwords. The integrity and security of the mail server rely heavily on maintaining the confidentiality of administrator credentials, underscoring the necessity of employing strong, unique passwords and regularly updating them to prevent unauthorized access.

## Granting Administrator Privileges

Any regular account can be elevated to an administrator status. This is achieved by setting the `type` field to `superuser`, `admin` or `administrator` within the configured directory. This allows the designation of multiple administrators according to the operational requirements and security protocols of the server. The process to elevate an account to administrator status is designed to be straightforward, ensuring that system administrators can efficiently manage and delegate control within the server environment.

## Fallback Administrator

Stalwart Mail Server introduces the concept of a "Fallback Administrator" to provide a robust solution for emergency access. This special account, defined directly in the configuration file, serves as a rescue or emergency account, enabling server access in scenarios where the authentication directory is unavailable. The fallback administrator ensures that administrative tasks can be performed even in the event of directory service failures, making it an essential feature for maintaining server operability and security.

The username for the fallback administrator is specified in the `authentication.fallback-admin.user` setting, while the password is defined in `authentication.fallback-admin.secret`. This account should be used sparingly and only in situations where normal administrative access through the primary authentication directory is compromised. Due to its powerful capabilities and bypass nature, it is crucial to secure the fallback administrator credentials with utmost care, applying the same stringent security measures as for primary administrator accounts to prevent unauthorized access.

Example:

```toml
[authentication.fallback-admin]
user = "admin"
secret = "$6$MM1wz7Y8.L8O4eN0$ti3/072t3T5SJ6xryK45RvpW38dW2hSH86cBcV0XHtgnBYCCAFjqibS84OsdxfAITd6.VkKfhfUhlfVczdkFx1"
```

## Master User

The master user is a special account that is granted full access to all mailboxes on the server. This account is typically used for system maintenance and monitoring purposes, allowing administrators to perform tasks that require access to all mailboxes. The master user is a powerful tool that should be used judiciously and only for legitimate system administration tasks.

In order to enable master user access for the fallback administrator, the `authentication.fallback-admin.enable-master` setting must be set to `true`. This setting grants the fallback administrator full access to all mailboxes on the server.

Once master user access is enabled, the fallback administrator can access any mailbox on the server using `<account_name>%<fallback_admin_user>` as the login username. For example, if the fallback administrator username is `admin`, the master user can access the mailbox for `john` by logging in as `john%admin`.
