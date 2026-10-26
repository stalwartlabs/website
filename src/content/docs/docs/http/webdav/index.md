---
sidebar_position: 1
title: "Overview"
description: "WebDAV, CalDAV and CardDAV in Stalwart: the collection URLs, discovery, the specifications implemented, assisted discovery of shared collections, locks and access restrictions."
---

Calendar and contact applications on desktop and mobile platforms synchronise with a server through CalDAV and CardDAV, and file managers can mount remote storage through WebDAV. All three rest on WebDAV ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)), which extends HTTP with methods to manage collections of resources on a server, such as `PROPFIND`, `MKCOL` and `LOCK`.

Stalwart uses WebDAV for three services: file storage with WebDAV itself, calendars with CalDAV ([RFC 4791](https://www.rfc-editor.org/rfc/rfc4791)) and contacts with CardDAV ([RFC 6352](https://www.rfc-editor.org/rfc/rfc6352)). This page covers the protocol side. The collaboration section describes [calendars](/docs/collaboration/calendar), [contacts](/docs/collaboration/contact) and [file storage](/docs/collaboration/file-storage) from the user's side.

## URLs

The DAV services are served on every HTTP listener, under these paths:

| Path | Contents |
|---|---|
| `/dav/cal/<account>/` | The account's calendars (CalDAV) |
| `/dav/card/<account>/` | The account's address books (CardDAV) |
| `/dav/file/<account>/` | The account's files (WebDAV) |
| `/dav/pal/<account>/` | The account's principal, which clients read to find its collections and access rights |
| `/dav/itip/` | Calendar scheduling messages |

In these paths, `<account>` identifies the account in one of two forms. The first is any of the account's email addresses, aliases included, with `@` encoded as `%40` in the links that the server generates (`/dav/cal/jane%40example.com/`). The second is `_` followed by the numeric account id. Other forms are not accepted: a bare user name such as `jane`, a sub-address and a catch-all address return `404`. Access to another account's collections requires that the account shared them.

Clients do not need to know these paths, because they find the collections from the server name. `/.well-known/caldav` and `/.well-known/carddav` redirect (HTTP 307) to `/dav/cal` and `/dav/card`. From there, the client reads the user's principal and its home collections. [Setting up clients](/docs/server/clients) lists the settings that clients need.

## Specifications

Besides WebDAV, CalDAV and CardDAV, the server implements a number of related specifications:

- WebDAV access control ([RFC 3744](https://www.rfc-editor.org/rfc/rfc3744))
- Extended `MKCOL` ([RFC 5689](https://www.rfc-editor.org/rfc/rfc5689))
- Collection synchronisation ([RFC 6578](https://www.rfc-editor.org/rfc/rfc6578))
- Quota properties ([RFC 4331](https://www.rfc-editor.org/rfc/rfc4331))
- The current principal property ([RFC 5397](https://www.rfc-editor.org/rfc/rfc5397))
- The `Prefer` header ([RFC 8144](https://www.rfc-editor.org/rfc/rfc8144))
- CalDAV scheduling ([RFC 6638](https://www.rfc-editor.org/rfc/rfc6638))
- Time zones by reference ([RFC 7809](https://www.rfc-editor.org/rfc/rfc7809))
- Service discovery ([RFC 6764](https://www.rfc-editor.org/rfc/rfc6764))

Clients learn which of these the server supports from the `DAV` header returned to `OPTIONS` requests, which lists the compliance classes: `1, 2, 3, access-control, extended-mkcol, calendar-access, calendar-auto-schedule, calendar-no-timezone, addressbook`.

Properties that a client sets with `PROPPATCH` and that the server does not interpret are called dead properties. They are stored as [object metadata](/docs/server/metadata), whose limits apply to them.

## Settings

The [WebDav](/docs/ref/object/web-dav) singleton (found in the WebUI under <!-- breadcrumb:WebDav --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › WebDAV<!-- /breadcrumb:WebDav -->) holds the protocol settings. Its size limits are described in [Limits](/docs/http/webdav/protocol).

Shared collections raise a discovery problem, because many clients look only in the user's own home collection. [`enableAssistedDiscovery`](/docs/ref/object/web-dav#enableassisteddiscovery), <!-- default:WebDav.enableAssistedDiscovery as=enabled -->enabled<!-- /default --> unless changed, helps these clients. With it, a `PROPFIND` on the user's calendar or address book home also lists the calendars and address books that other accounts have shared with the user, and the user's principal names only the user's own home collection. Without it, the principal names the home collection of every account that shared something with the user, and clients must look in each one. File storage is not affected.

WebDAV clients take locks before editing a file, and these locks are limited by [`maxLocks`](/docs/ref/object/web-dav#maxlocks) and [`maxLockTimeout`](/docs/ref/object/web-dav#maxlocktimeout), as described in [WebDAV locks](/docs/collaboration/webdav#webdav-locks).

## Disabling WebDAV

WebDAV can be restricted for some users or turned off for everyone. A user can use each service only with the corresponding [permissions](/docs/auth/authorization/permissions), so removing the CalDAV, CardDAV or WebDAV permissions from a role restricts the users that have it. To turn off the DAV services for all clients, add an [access control](/docs/http/access-control) rule that refuses paths under `/dav`.
