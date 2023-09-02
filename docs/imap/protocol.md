---
sidebar_position: 2
---

# Protocol

The IMAP Protocol settings section covers the configuration parameters for the IMAP server. These parameters influence various aspects of the protocol's behavior, such as request handling, authentication and mailbox settings, and event processing. 

## Request size

The `imap.request.max-size` setting determines the maximum size of an IMAP request that the server will accept. Larger requests will be rejected. For example:

```toml
[imap.request]
max-size = 52428800
```

## Authentication

The `imap.auth` section contains parameters that control authentication:

- `max-failures`: Limits the number of authentication attempts a user can make before being disconnected by the server. 
- `allow-plain-text`: When set to `true`, permits the use of plain text authentication over an unencrypted connection. For security reasons, it's recommended to set this to `false` unless necessary, ensuring that user credentials are not transmitted in an insecure manner.

For example:

```toml
[imap.auth]
max-failures = 3
allow-plain-text = false
```

## Folders

The `imap.folders` section contains parameters that control folder settings:

- `all-messages`: Specifies whether the server should create a folder that contains all messages in the user's mailbox.
- `name.shared`: Designates the name of the folder that will contain all shared folders.
- `name.all`: Specifies the name of the folder that will hold all mail.

For example:

```toml
[imap.folders]
all-messages = true

[imap.folders.name]
shared = "Shared Folders"
all = "All Mail"
```

## Timeouts

The `imap.timeout` configuration section manages different time limits:

- `authenticated`: Sets the duration an authenticated session can remain idle before the server terminates it. 
- `anonymous`: Establishes the period an anonymous (unauthenticated) session can stay inactive before being ended by the server.
- `idle`: Determines the time a connection can stay idle in the IMAP `IDLE` state (where the server keeps the connection open while waiting for new messages) before the server breaks the connection.

For example:

```toml
[imap.timeout]
authenticated = "30m"
anonymous = "1m"
idle = "30m"
```

