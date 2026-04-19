---
sidebar_position: 1
---

# Overview

WebDAV (Web Distributed Authoring and Versioning) is an extension of the HTTP protocol that allows clients to manage and edit files stored on a remote server. Built on standard web technologies, it exposes files and directories on the server through HTTP verbs for creation, modification, and deletion, so that remote storage can be treated as an extension of the local file system.

Stalwart includes full support for WebDAV, along with the two related protocols CalDAV and CardDAV. CalDAV covers calendar data, including events and scheduling information; CardDAV covers contact data, keeping address books synchronised across clients. Together these protocols form the basis of Stalwart's collaboration features and provide broad interoperability with existing client applications.

## Enabling WebDAV

Accepting WebDAV connections requires an HTTP [listener](/docs/server/listener) defined on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->) with the [`protocol`](/docs/ref/object/network-listener#protocol) set to `http`. In most installations this listener is created automatically during setup, so no further action is required.

## Accessing WebDAV

Stalwart organises its WebDAV resources under a structured path hierarchy so that calendars, contacts, files, and user principals can be located quickly. Each resource type is served under a distinct URL prefix.

Calendar data managed via CalDAV is available under the `/dav/cal` path. For example, a user named `john` would have their calendar data accessible at `/dav/cal/john`. Contact data managed through CardDAV is located under `/dav/card`, so the address book for user `john` would reside at `/dav/card/john`.

The general-purpose WebDAV file system is available under `/dav/file`. This path serves as the root directory for users' personal file storage; for instance, the file storage area for user `jane` is reachable at `/dav/file/jane`, where she can upload, organise, and retrieve documents through any standard WebDAV client.

Stalwart also supports the WebDAV ACL (Access Control List) extensions, and user principals are exposed via `/dav/pal`. Principal resources define and manage access rights across the WebDAV services and are typically consulted by clients to retrieve information about user identities and permissions.

For client setup, Stalwart provides autodiscovery endpoints at `/.well-known/caldav` and `/.well-known/carddav`. When queried, they redirect to the appropriate resource location for the authenticated user.

## Disabling WebDAV

By default, WebDAV access is available as soon as an HTTP listener is configured, exposing calendar synchronisation (CalDAV), contact management (CardDAV), and file storage. Some deployments may need to restrict or disable this entirely for security, compliance, or policy reasons.

The most direct way to disable WebDAV access server-wide is to add an [HTTP access control rule](/docs/http/access-control) that blocks any path under `/dav`. This denies access to every WebDAV endpoint, including `/dav/cal`, `/dav/card`, `/dav/file`, and `/dav/pal`, regardless of per-user settings.

For finer control, WebDAV access can be restricted on a per-user, per-group, or per-tenant basis by removing the relevant [WebDAV permissions](/docs/auth/authorization/permissions) from the account or entity. Revoking the CalDAV, CardDAV, and general WebDAV permissions ensures that only authorised principals can use those services.
