---
sidebar_position: 1
title: "Overview"
---

A mail server is often only part of what an organisation needs. Its users also keep calendars, share address books and exchange documents, and these are usually served by separate systems. Stalwart stores calendars, address books and files for each account alongside its email, and lets accounts share them with each other.

The same data is available over two families of protocols. The first is WebDAV and its extensions, which existing clients already speak: CalDAV ([RFC 4791](https://www.rfc-editor.org/rfc/rfc4791)) for calendars, CardDAV ([RFC 6352](https://www.rfc-editor.org/rfc/rfc6352)) for contacts and WebDAV ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)) for file storage, with the WebDAV ACL extension ([RFC 3744](https://www.rfc-editor.org/rfc/rfc3744)) for sharing. The second is JMAP, for clients that use JSON over HTTP: JMAP for Calendars, JMAP for Contacts, JMAP for File Storage and JMAP Sharing. [JMAP capabilities](/docs/http/jmap/capabilities) lists the capabilities the server advertises.

Both families work on the same stored data. A change made through one protocol is therefore visible through the other, so a user can edit an event in a CalDAV client and see it in a JMAP client. Files, calendars and contacts also count towards the account's disk quota, together with its email.

The pages in this section cover the following topics:

- [WebDAV](/docs/collaboration/webdav): settings shared by all WebDAV resources, locks, and the discovery of shared calendars and address books.
- [Calendar](/docs/collaboration/calendar): calendar limits, the default calendar, event privacy and the data each user keeps on a shared event.
- [Scheduling](/docs/collaboration/scheduling): invitations and replies between organisers and attendees, over CalDAV, JMAP and email.
- [Free/busy and availability](/docs/collaboration/availability): which calendars and events count when others look up a user's free time.
- [Notifications](/docs/collaboration/notifications): email alarms for events, and notifications of changes made by other users to shared calendars.
- [Contacts](/docs/collaboration/contact) and [File storage](/docs/collaboration/file-storage): limits and defaults for address books and files.
- [Sharing](/docs/collaboration/sharing): group resources, sharing with individual accounts, and revoking access.

Clients can also attach their own metadata to calendars, address books, files and events, such as a colour or a client-specific tag. This metadata is stored as object metadata, the same storage that holds JMAP metadata and IMAP annotations, and [Object metadata](/docs/server/metadata) describes its limits. File contents and calendar and contact data are added to the search index, as described in [Search indexing](/docs/storage/indexing).

## Opting out

Not every installation wants these features. They consume resources only when clients use them, so an installation that serves only email carries no extra load from them.

WebDAV is available as soon as an HTTP listener is configured. It can be turned off at two levels. For everyone, an HTTP access control rule can block the `/dav` path. For some accounts, groups or tenants, the `dav*` permissions can be removed from them, for example `davCalPropFind` and `davCardPropFind`. [Disabling WebDAV](/docs/http/webdav/#disabling-webdav) describes both methods. Access through JMAP is controlled by the corresponding JMAP permissions, which are listed in [Permissions](/docs/auth/authorization/permissions).
