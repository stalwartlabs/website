---
sidebar_position: 3
---

# Protocol

The JMAP Protocol settings section covers the configuration parameters for the JMAP server. These parameters influence various aspects of the protocol's behavior, such as request handling, data uploading, quota management, email and mailbox settings, and event processing. 

## Requests Limits

Request limits are used to prevent abuse of the JMAP server. The following parameters can be set under the `jmap.protocol.request` section:

- `max-concurrent`: Restricts the number of concurrent requests a user can make to the JMAP server.
- `max-size`: Defines the maximum size of a single request, in bytes, that the server will accept.
- `max-calls`: Limits the maximum number of method calls that can be included in a single request.

Example:
    
```toml
[jmap.protocol.request]
max-concurrent = 4
max-size = 10000000
max-calls = 16
```

## Upload Limits

Upload limits control how often and how many files users can upload to the JMAP server. The following parameters can be configured under the `jmap.protocol.upload` section:

- `max-size`: Defines the maximum file size, in bytes, for file uploads to the server.
- `max-concurrent`: Restricts the number of concurrent file uploads a user can perform.
- `ttl`: specifies the Time-To-Live (TTL) for each uploaded file, after which the file is [deleted from temporary storage](/docs/storage/blob#maintenance).
- `quota.files`: Specifies the maximum number of files that a user can upload within a certain period.
- `quota.size`: Defines the total size of files, in bytes, that a user can upload within a certain period.

Example:
    
```toml
[jmap.protocol.upload]
max-size = 50000000
max-concurrent = 4
ttl = "1h"

[jmap.protocol.upload.quota]
files = 1000
size = 50000000
```

## Object limits

Object limits are used to restrict the number of objects that can be fetched, modified, or returned by a method call. The following parameters can be configured:

- `jmap.protocol.get.max-objects`: Determines the maximum number of objects that can be fetched in a single method call.
- `jmap.protocol.set.max-objects`: Establishes the maximum number of objects that can be modified in a single method call.
- `jmap.protocol.query.max-results`: Sets the maximum number of results that a Query method can return.
- `jmap.protocol.changes.max-results`: Determines the maximum number of change objects that a Changes method can return.
- `jmap.email.parse.max-items`: Limits the maximum number of items that can be parsed from an email message.

Example:
    
```toml
[jmap.protocol.get]
max-objects = 500

[jmap.protocol.set]
max-objects = 500

[jmap.protocol.query]
max-results = 5000

[jmap.protocol.changes]
max-results = 5000

[jmap.email.parse]
max-items = 10
```

## Mailbox settings

Mailbox settings control the behavior of the mailbox creation process. The following parameters can be configured under the `jmap.mailbox` section:

- `max-depth`: Restricts the maximum depth of nested mailboxes a user can create.
- `max-name-length`: Establishes the maximum length of a mailbox name.

Example:
    
```toml
[jmap.mailbox]
max-depth = 10
max-name-length = 255
```

## Email settings

Email settings control the behavior of the email creation process. The following parameters can be configured under the `jmap.email` section:

- `max-attachment-size`: Specifies the maximum size, in bytes, for an email attachment.
- `max-size`: Determines the maximum size, in bytes, for an email message.

Example:
    
```toml
[jmap.email]
max-attachment-size = 50000000
max-size = 75000000
```

## Principal lookups

Principal lookups control whether a user can perform lookups of other users' details. The following parameter can be configured under the `jmap.principal` section:

- `allow-lookups`: Specifies whether authenticated users can perform lookups of other users' details.

Example:
    
```toml
[jmap.principal]
allow-lookups = true
```
