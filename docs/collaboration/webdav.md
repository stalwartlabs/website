---
sidebar_position: 2
---

# WebDAV

WebDAV (Web Distributed Authoring and Versioning) extends the HTTP protocol with operations for remote content management: creating, editing, and deleting files, as well as accessing and synchronising calendars and contacts. WebDAV is widely used in collaborative environments for file sharing, calendar coordination, and contact management.

This page covers WebDAV storage-related settings, such as limits on property length and lock behaviour. All such settings are carried on the [WebDav](/docs/ref/object/web-dav) singleton (found in the WebUI under <!-- breadcrumb:WebDav --><!-- /breadcrumb:WebDav -->). For WebDAV protocol behaviour, including access controls and path routing, see the [WebDAV protocol documentation](/docs/http/webdav/overview).

## WebDAV properties

WebDAV allows clients to store, retrieve, and manipulate metadata about resources using WebDAV properties. These properties are pieces of information associated with a file, calendar entry, contact, or other resource, accessed through methods such as `PROPFIND` and `PROPPATCH`.

WebDAV properties fall into two categories, dead properties and live properties:

- **Dead properties** are arbitrary name-value pairs set and maintained by the client. The server stores them without interpreting or enforcing any semantics. For example, a client might add a dead property such as `displayColor` or `clientTag`; the server stores and returns the data as-is. Dead properties are useful for custom metadata, user preferences, and other auxiliary information that does not require server-side processing.
- **Live properties** are understood and actively managed by the server. They typically represent dynamic or system-managed values such as `getlastmodified`, `resourcetype`, `quota-available-bytes`, or calendar-specific fields defined by the CalDAV or CardDAV standards. The server generates, updates, or restricts modifications to these properties automatically in response to changes in the resource or system state.

The difference lies in server awareness: live properties have defined meaning and behaviour enforced by the server; dead properties are stored and returned without interpretation.

The maximum size of dead properties is controlled by [`deadPropertyMaxSize`](/docs/ref/object/web-dav#deadpropertymaxsize); the default is `1024` bytes per property. The maximum size of live properties is controlled by [`livePropertyMaxSize`](/docs/ref/object/web-dav#livepropertymaxsize); the default is `250` bytes per property. Both limits apply to the total size of each individual property value and can be adjusted to accommodate larger or smaller metadata as required.

## WebDAV locks

WebDAV includes a locking mechanism that guards against conflicting changes when multiple clients access the same resource concurrently. Locks are particularly important in collaborative environments where shared files or calendar entries may be written by more than one client at once.

A WebDAV lock claims temporary exclusive or shared access to a resource. While a lock is held, the operations other clients can perform on the resource are restricted depending on the lock type. Two lock types are defined:

- **Exclusive locks** prevent any other client from modifying the locked resource. Only the lock holder can make changes for the duration of the lock.
- **Shared locks** allow multiple clients to read and potentially modify a resource concurrently, provided each holds a shared lock and respects the others' operations.

Locks are typically associated with a [lock token](/docs/development/urn#resource-types), which the client must include in subsequent requests to confirm ownership. Locks may also have an expiration time, after which they are automatically released if not refreshed. Clients use the `LOCK` and `UNLOCK` HTTP methods to acquire and release locks.

Two fields bound locking behaviour:

- [`maxLockTimeout`](/docs/ref/object/web-dav#maxlocktimeout) defines the maximum duration a WebDAV lock can remain active. The default is `"1h"`. If a client requests a longer timeout, the server caps it at this value. A reasonable timeout prevents stale locks from blocking shared resources indefinitely.
- [`maxLocks`](/docs/ref/object/web-dav#maxlocks) limits the total number of active WebDAV locks a single account can hold at once. The default is `10`. The limit guards against clients accumulating excessive locks, whether inadvertently or maliciously.

## Request and result limits

Two further fields bound the scale of a single WebDAV operation. [`requestMaxSize`](/docs/ref/object/web-dav#requestmaxsize) sets the maximum XML body size the server will accept for a WebDAV request; the default is `"25mb"`. [`maxResults`](/docs/ref/object/web-dav#maxresults) caps the number of results returned by a WebDAV query; the default is `2000`.
