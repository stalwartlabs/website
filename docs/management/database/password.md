---
sidebar_position: 4
---

# Password Reset

When using the [internal directory](/docs/directory/types/internal), creating the initial administrator account or resetting its password is a straightforward process that involves setting specific environment variables and executing the server binary with the appropriate configuration file. This process is essential for maintaining secure access to the server's administrative functions.

The following environment variables need to be set in order to create or reset the administrator password:

- `SET_ADMIN_USER`: This variable should be set to the username of the administrator account. If the specified account does not exist, it will be created.
- `SET_ADMIN_PASS`: The desired password for the administrator account. This password must be hashed using one of the supported [password hashing algorithms](/docs/directory/users#passwords).

Run the Stalwart Mail Server binary with the `--config` parameter, specifying the path to the configuration file.

For example:

```bash
SET_ADMIN_USER="admin" SET_ADMIN_PASS="hashed_secretpass" /opt/stalwart-mail/bin/stalwart-mail --config=/opt/stalwart-mail/etc/config.toml
```

If the password change is successful, the binary will return a message confirming the success and then exit. If an existing regular account (not an administrator) is passed as `SET_ADMIN_USER`, the password for that account will be updated, but the account will not be granted administrator rights.

:::tip Important Notes

- Ensure that the password set in `SET_ADMIN_PASS` is properly hashed using one of the supported [password hashing algorithms](/docs/directory/users#passwords).
- Take appropriate measures to handle and store the administrator credentials securely.
- Be cautious when creating or updating administrator accounts, as they have extensive access and control over the Stalwart Mail Server.

:::

