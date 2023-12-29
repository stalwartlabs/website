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

## UIDPLUS extension

The UIDPLUS IMAP extension enhances the functionality of the IMAP protocol by providing additional features for handling email message identifiers (UIDs). It introduces new capabilities, such as the ability to assign unique identifiers to messages upon their creation or copying. This extension enables clients to more efficiently manage and synchronize changes to mailboxes, such as detecting newly added messages or ensuring the consistency of operations like moving messages between folders. UIDPLUS simplifies client-server interactions by providing more detailed information about the results of certain commands, thereby improving the overall efficiency of email management in IMAP.

The `imap.protocol.uidplus` setting enables the `UIDPLUS` extension, for example:

```toml
[imap.protocol]
uidplus = true
```

## Folders

The `imap.folders` section contains parameters that control folder settings:

- `name.shared`: Designates the name of the folder that will contain all shared folders.

For example:

```toml
[imap.folders.name]
shared = "Shared Folders"
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

