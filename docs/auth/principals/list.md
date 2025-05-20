---
sidebar_position: 3
---

# Mailing List

A **Mailing List** principal in Stalwart represents a group of recipients—both individuals and groups—who are subscribed to receive emails sent to a common email address. Mailing lists are commonly used for distributing messages to multiple users at once, simplifying communication with a large group of people. While similar to groups, mailing lists are designed primarily for one-way communication, where messages are sent to all members of the list, rather than shared access to an inbox like group principals.

A mailing list principal holds specific fields that define its properties and behavior within the Stalwart:

- **name**: The name of the mailing list, used to identify it within the system. This is the label by which the mailing list is referenced, and it must be unique within its context.
- **type**: Specifies the principal type. For mailing lists, this field is always set to `"list"`, differentiating it from other principal types like individuals or groups.
- **description**: A human-readable description of the mailing list. This field provides additional information about the list’s purpose or the type of communications it handles, which can be useful for list management or administrative purposes.
- **emails**: This field holds one or more email addresses associated with the mailing list. These addresses are the primary means by which messages are sent to the list members. Any message sent to one of these email addresses is automatically forwarded to all members of the list.
- **members**: The members field contains a list of individual accounts and groups that are subscribed to the mailing list. These are the recipients of any emails sent to the list, and both [individual](/docs/auth/principals/individual) users and [groups](/docs/auth/principals/group) can be included.
- **tenant**: Indicates the [tenant](/docs/auth/authorization/tenants) to which the mailing list belongs. This is relevant in multi-tenant environments where different organizations or divisions share the same mail server infrastructure but require separation between their mailing lists and other resources.

Mailing lists provide an efficient way to manage mass communication and ensure that messages reach the intended audience in a timely manner. By organizing recipients into a list, administrators can simplify the process of sending updates, newsletters, or other announcements without the need to manually address multiple individuals or groups.
