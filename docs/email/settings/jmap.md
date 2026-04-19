---
sidebar_position: 2
---

# JMAP for Mail

JMAP for Mail ([RFC8621](https://www.rfc-editor.org/rfc/rfc8621.html)) is an extension to the [JMAP Core protocol](https://www.rfc-editor.org/rfc/rfc8620.html) that allows users to manage their email accounts using the JMAP API. The extension covers uploading, deleting, and listing emails, as well as managing mailboxes and related settings. Message-level limits and mailbox-shape constraints are carried on the [Email](/docs/ref/object/email) singleton (found in the WebUI under <!-- breadcrumb:Email --><!-- /breadcrumb:Email -->); JMAP request-parsing limits are carried on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><!-- /breadcrumb:Jmap -->).

## Mailbox settings

Mailbox shape is controlled through two fields on the Email singleton:

- [`maxMailboxDepth`](/docs/ref/object/email#maxmailboxdepth): maximum depth of nested mailboxes a user can create. Default `10`.
- [`maxMailboxNameLength`](/docs/ref/object/email#maxmailboxnamelength): maximum length of a mailbox name. Default `255`.

Example:

```json
{
  "maxMailboxDepth": 10,
  "maxMailboxNameLength": 255
}
```

## Email settings

Message-size limits are set on the Email singleton:

- [`maxAttachmentSize`](/docs/ref/object/email#maxattachmentsize): maximum size, in bytes, for an email attachment. Default `50000000`.
- [`maxMessageSize`](/docs/ref/object/email#maxmessagesize): maximum size, in bytes, for an email message. Default `75000000`.

The upper bound on the number of email messages that can be parsed in a single JMAP request is set on the Jmap singleton through [`parseLimitEmail`](/docs/ref/object/jmap#parselimitemail), which defaults to `10`.

Example:

```json
{
  "maxAttachmentSize": 50000000,
  "maxMessageSize": 75000000
}
```

And on the Jmap singleton:

```json
{
  "parseLimitEmail": 10
}
```
