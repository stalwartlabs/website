---
sidebar_position: 2
---

# JMAP for Mail

JMAP for Mail ([RFC8621](https://www.rfc-editor.org/rfc/rfc8621.html)) is an extension to the [JMAP Core protocol](https://www.rfc-editor.org/rfc/rfc8620.html) that allows users to manage their email accounts using the JMAP API. This extension provides a way for users to upload, delete, and list their emails, as well as to manage their mailboxes and other related settings. This section covers the configuration parameters available for the JMAP for Mail protocol.

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
- `parse.max-items`: Limits the maximum number of items that can be parsed from an email message.


Example:
    
```toml
[jmap.email]
max-attachment-size = 50000000
max-size = 75000000

[jmap.email.parse]
max-items = 10
```
