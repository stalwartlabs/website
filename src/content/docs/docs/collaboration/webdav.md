---
sidebar_position: 2
title: "WebDAV"
---

Plain HTTP can fetch resources, but it has no standard way to create folders, lock a file while it is being edited or list the contents of a collection. WebDAV ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)) extends HTTP with methods for managing resources on a server: creating, editing and deleting files. Its CalDAV and CardDAV extensions build on the same methods to synchronise calendars and contacts.

This page covers the settings that apply to all WebDAV resources: property sizes, locks, request limits and the discovery of shared calendars and address books. Access control and URL routing for WebDAV are described separately, in the [WebDAV protocol documentation](/docs/http/webdav/).

The settings on this page belong to the [WebDav](/docs/ref/object/web-dav) singleton, found in the WebUI under <!-- breadcrumb:WebDav --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › WebDAV<!-- /breadcrumb:WebDav -->.

## WebDAV properties

Clients read and write metadata about a resource, such as a file, a calendar or an address book, as WebDAV properties, using the `PROPFIND` and `PROPPATCH` methods. Properties are of two kinds, and the server treats them differently.

Live properties are maintained by the server, such as `getlastmodified`, `resourcetype` and `quota-available-bytes`, or the properties defined by CalDAV and CardDAV. The server computes them, or restricts how they may be changed. Where a client may set a live property, [`maxLivePropertySize`](/docs/ref/object/web-dav#maxlivepropertysize) limits the size of the value.

Dead properties are arbitrary name-value pairs set by a client, such as a display colour. The server stores and returns them without interpreting them. They are stored as object metadata, the same storage that holds JMAP object metadata and IMAP annotations, so a value set through one protocol is visible through the others. For the same reason, their size and number are limited by the [Metadata](/docs/ref/object/metadata) object: per property, per resource, and in the number of entries per resource, as described in [Object metadata](/docs/server/metadata).

## WebDAV locks

When several clients write the same resource, one client's changes can overwrite another's. A WebDAV lock prevents such conflicting changes. A client acquires a lock with the `LOCK` method and receives a lock token. It includes the token in later requests to prove that it holds the lock, and it releases the lock with `UNLOCK`. Lock tokens use the format described in [URN namespace](/docs/development/urn).

Locks come in two kinds. An exclusive lock prevents every other client from modifying the resource. A shared lock allows several clients, each holding a shared lock, to work on the resource.

Two settings limit locking. The first bounds how long a lock can last. [`maxLockTimeout`](/docs/ref/object/web-dav#maxlocktimeout) is the longest time a lock can be held, <!-- default:WebDav.maxLockTimeout -->1 hour<!-- /default --> by default. A client that requests a longer timeout, or no timeout, receives this value. A lock that is not refreshed then expires, so a client that disappears cannot block a resource indefinitely.

The second bounds how many locks a user can hold. [`maxLocks`](/docs/ref/object/web-dav#maxlocks) is the number of locks one user can hold at the same time on the resources of one account, and `0` removes the limit. A `LOCK` request beyond the limit fails with HTTP status 429.

## Request and result limits

Two limits protect the server from oversized WebDAV requests and responses. [`maxRequestSize`](/docs/ref/object/web-dav#maxrequestsize) is the largest XML body accepted in a WebDAV request. [`maxResults`](/docs/ref/object/web-dav#maxresults) is the largest number of resources returned by one `PROPFIND` or `REPORT`. [Connection and request limits](/docs/performance/connections#webdav-and-calendar-limits) describes how these limits relate to the other request limits of the server.

## WebDAV assisted discovery

Each account and group has its own calendar and address book home, the collection under which its calendars or address books live. The calendars of the account `john` live under `/dav/cal/john/`, and the address books of a group named `sales` under `/dav/card/sales/`. A calendar that another account shares with `john` stays under that other account's home.

CalDAV and CardDAV clients discover calendars and address books through the `calendar-home-set` and `addressbook-home-set` properties of the user's principal. The standards allow several homes in these properties, so Stalwart can list the user's own home together with the home of every account that shares something with the user. Many clients, however, read only the first home, and so they never see the shared collections.

Assisted discovery works around these clients. It is controlled by [`enableAssistedDiscovery`](/docs/ref/object/web-dav#enableassisteddiscovery), which is <!-- default:WebDav.enableAssistedDiscovery as=enabled -->enabled<!-- /default --> by default, and it changes what the home-set properties and the home contain.

With assisted discovery enabled, the home-set properties contain only the user's own home. A `PROPFIND` on that home lists the user's own calendars or address books, followed by every calendar or address book that other accounts share with the user, including groups the user belongs to. Clients that read one home therefore see all the collections. Synchronisation reports on the home are not changed, and file storage is not affected.

With assisted discovery disabled, the home-set properties list the user's own home and the home of each account that shares calendars or address books with the user. Each home lists only its own collections. This is the behaviour the standards describe.

The choice involves two trade-offs. Assisted discovery lists collections of other accounts under the user's home, and clients that follow the standards strictly may not expect them there, so disable it when all clients in use support several home sets. It also has a cost: on accounts with access to many shared accounts, a `PROPFIND` on the home reads the collections of every one of them.

Some clients do not show shared resources with either setting. The remedy then lies in the client, which needs support for WebDAV ACL ([RFC 3744](https://www.rfc-editor.org/rfc/rfc3744)) and for several home sets.
