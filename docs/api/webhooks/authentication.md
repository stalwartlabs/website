---
sidebar_position: 2
---

# Authentication events

## auth.*

The `Authentication` object is returned on any of the authentication events (`auth.success`, `auth.failure`, `auth.banned`) and contains the following fields:

- `login` (String): The login used for authentication.
- `protocol` (enum): The protocol used for authentication.
- `remoteIp` (String): The IP address of the client.
- `accountType` (enum): The type of account used for authentication.
- `isMasterLogin` (Boolean): Whether the account was accessed using the master login.

Example:

```json
{
    "login": "user@example.com",
    "protocol": "IMAP",
    "remoteIp": "192.0.2.1",
    "accountType": "user",
    "isMasterLogin": false
}
```

## auth.error

The `Error` object is returned on any authentication error events (`auth.error`) and contains the `message` field.

Example:

```json
{
    "message": "An error occurred"
}
```

