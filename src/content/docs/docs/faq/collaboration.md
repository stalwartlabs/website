---
title: "Calendars, contacts and clients"
description: "Frequently asked questions about connecting mail, calendar and contact clients, CalDAV and CardDAV addresses, calendar invitations, and exporting calendars and address books."
sidebar_position: 8
---

## Clients

### How do I connect an iPhone, a Mac, Thunderbird or Outlook?

[Setting up clients](/docs/server/clients) lists the ports and addresses to enter and notes how each common client behaves. The main difference between clients is whether they can find their settings on their own. Thunderbird finds them through Mozilla autoconfig, and Outlook through Autodiscover. Apple Mail, Calendar and Contacts on macOS and iOS read neither, so they are set up manually, with a separate CalDAV account for calendars and CardDAV account for contacts. See [Per-client notes](/docs/server/clients#per-client-notes).

### What is the CalDAV or CardDAV address of an account?

Calendars are at `https://<host>/dav/cal/<account>/` and address books at `https://<host>/dav/card/<account>/`. The `<account>` part identifies the account in one of two ways:

- One of the account's email addresses, with `@` written as `%40` where a client requires it.
- `_` followed by the numeric account id.

A bare local name such as `jane` is not accepted. Most clients, however, need only the host name, because `/.well-known/caldav` and `/.well-known/carddav` redirect to `/dav/cal` and `/dav/card`. See [Calendar, contacts and file URLs](/docs/server/clients#calendar-contacts-and-file-urls).

## Calendars and scheduling

### Why aren't calendar invitations added automatically?

The server adds an invitation only when it has reason to trust the sender, and it decides in two steps. First, an invitation received by email is processed at all only when its sender is authenticated, by a DMARC pass or as a local user, and the message is not spam. Second, a processed invitation is added to the calendar only when the sender is a local account or is listed in the recipient's address book.

Enabling `autoAddInvitations` drops the second condition, so that every invitation from an authenticated sender is added. See [Automatic event addition](/docs/collaboration/scheduling#automatic-event-addition).

### Why are Outlook "propose new time" replies ignored?

A proposal for a new time is sent as an iTIP `COUNTER` message, and Stalwart does not support the `COUNTER` and `DECLINECOUNTER` methods. (iTIP is the standard that defines how calendar invitations and their replies are exchanged.) Such a message is therefore delivered as an ordinary email, and the server logs `calendar.itip-message-error` with `Unsupported method: COUNTER`. An organiser on the server processes `REPLY` and `REFRESH` messages. See [Supported methods](/docs/collaboration/scheduling#supported-methods).

### Can I invite a group to an event?

Yes, but the group takes part as a single attendee. An attendee of type group (`CUTYPE=GROUP`) is not expanded into the members of the group. See [Supported methods](/docs/collaboration/scheduling#supported-methods).

## Contacts and sharing

### How do I export a user's address book or calendar?

For individual calendars and address books, a CalDAV or CardDAV client connected to the account can export them.

To copy all of an account's data, including its calendars, events, address books and contacts, use the [Vandelay](/docs/migration/import-export/) import and export tool. Vandelay copies the account into an archive file. Its export step, which writes an archive back to a server, restores the account from that archive. See [Archive as a backup](/docs/migration/import-export/backup#archive-as-a-backup).
