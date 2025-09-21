---
sidebar_position: 4
---

# Administrators

In Stalwart, there is no specific concept of dedicated "administrator accounts" within the directory. Instead, [regular accounts](/docs/auth/principals/individual) can be selectively granted specific [permissions](/docs/auth/authorization/permissions) to perform management tasks. This approach provides a more secure and flexible way to manage access, as it avoids giving users blanket administrative privileges. Instead of an "all-or-nothing" approach, permissions can be carefully tailored to individual needs, ensuring that users only have access to the functions they require.

By assigning permissions to regular user accounts, Stalwart allows administrators to distribute management responsibilities without compromising security. For example, an account may be granted the ability to manage email settings or user accounts without being given full control over the entire mail server. This principle of **least privilege** ensures that no account has more access than necessary, reducing the risk of accidental or malicious changes to critical system components.

Administrators can create one or more roles that grant specific administrative permissions (such as managing users, domains, or mailing lists) and assign these roles to the appropriate users. This provides fine-tuned control over who can perform administrative tasks within the system.

## Fallback Administrator

While Stalwart relies on regular accounts with specific permissions for day-to-day management, it does include a special internal mechanism called the **fallback administrator**. This account is not stored in the directory and exists outside the regular user and role management system. The fallback administrator is intended for **initial setup** of the mail server or as an **emergency mechanism** to regain access to the system in case the directory becomes unavailable.

### Key Characteristics:

- **Not part of the directory**: The fallback administrator is an internal account that exists independently from the regular user and role management system.
- **Full access**: This account is automatically granted **every single permission** in the system, giving it unrestricted access to all resources and settings.
- **Emergency use only**: Because of its full access rights, it is strongly discouraged to use the fallback administrator for routine administrative tasks. Its primary purpose is for setting up Stalwart during the initial installation and for emergencies when no other administrative access is available.
- **Security risk**: Since the fallback administrator has complete control over the system, it poses a potential security risk if used regularly. For day-to-day management, it is much safer to assign specific permissions to regular user accounts to limit the risk of misuse.

### Best Practices

When managing administrative access in Stalwart, it is essential to follow best practices to ensure the security and integrity of the system. Some key recommendations include:

- **Use regular accounts with granular permissions**: Instead of relying on a single, all-powerful account, create multiple accounts with only the necessary management permissions for each administrator.
- **Restrict use of the fallback administrator**: This account should only be used for initial setup or emergencies. Once regular accounts are configured, the fallback administrator should be set aside and not used for daily tasks.
- **Assign roles to simplify permission management**: Use roles to group permissions and assign them to individuals, ensuring consistent access control across different users.

By adhering to these practices, administrators can maintain a secure and manageable system while avoiding unnecessary risks associated with overly broad access rights.

### Configuration

The username for the fallback administrator is specified in the `authentication.fallback-admin.user` setting, while the password is defined in `authentication.fallback-admin.secret`. This account should be used sparingly and only in situations where normal administrative access through the primary authentication directory is compromised. Due to its powerful capabilities and bypass nature, it is crucial to secure the fallback administrator credentials with utmost care, applying the same stringent security measures as for primary administrator accounts to prevent unauthorized access.

Example:

```toml
[authentication.fallback-admin]
user = "admin"
secret = "$6$MM1wz7Y8.L8O4eN0$ti3/072t3T5SJ6xryK45RvpW38dW2hSH86cBcV0XHtgnBYCCAFjqibS84OsdxfAITd6.VkKfhfUhlfVczdkFx1"
```

where `secret` is the SHA-512 of the password, that can be computed using `openssl passwd -6 <password>`.

## Master User

The master user is a special account that is granted full access to all mailboxes on the server. This account is typically used for system maintenance and monitoring purposes, allowing administrators to perform tasks that require access to all mailboxes. The master user is a powerful tool that should be used judiciously and only for legitimate system administration tasks.

The username for the master user is specified in the `authentication.master.user` setting, while the password is defined in `authentication.master.secret`. The master user account should be secured with a strong, unique password to prevent unauthorized access. Example:

```toml
[authentication.master]
user = "master"
secret = "$6$MM1wz7Y8.L8O4eN0$ti3/072t3T5SJ6xryK45RvpW38dW2hSH86cBcV0XHtgnBYCCAFjqibS84OsdxfAITd6.VkKfhfUhlfVczdkFx1"
```

Once master user access is enabled, any mailbox on the server can be accessed using `<account_name>%<master_user>` as the login username. For example, if the master user is `master`, the master user can access the mailbox for `john` by logging in as `john%master`.
