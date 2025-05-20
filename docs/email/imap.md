---
sidebar_position: 3
---

# IMAP and POP3

The IMAP Protocol settings section covers the configuration parameters for the IMAP server. Some of these settings also apply to the POP3 server, as they share the same configuration structure. These parameters influence various aspects of the protocol's behavior, such as request handling, authentication and mailbox settings, and event processing. 

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

The `email.folders.<special-use>` section contains parameters that control special use folder settings. The special use folders are predefined folders that have specific purposes, such as the inbox, drafts, sent, and trash folders. The following special use folders are supported:

- `inbox`: The inbox folder.
- `drafts`: The drafts folder.
- `sent`: The sent folder.
- `trash`: The trash folder.
- `archive`: The archive folder.
- `junk`: The junk folder.
- `shared`: The shared folder.

The parameters that can be configured for each special use folder are:

- `name`: The name of the folder.
- `create`: When set to `true`, the folder will be created if it does not exist.
- `subscribe`: When set to `true`, the folder will be subscribed to by default.

For example:

```toml
[email.folders.sent]
name = "Sent Items"
create = true
subscribe = true

[email.folders.junk]
name = "SPAM"
create = true
subscribe = false

[email.folders.shared]
name = "Shared Folders"
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

