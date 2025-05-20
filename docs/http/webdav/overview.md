---
sidebar_position: 1
---

# Overview

WebDAV (Web Distributed Authoring and Versioning) is an extension of the HTTP protocol that enables users to collaboratively manage and edit files stored on a remote server. By building on standard web technologies, WebDAV allows files and directories on a server to be accessed, created, modified, and deleted as if they were part of a local file system. This makes it an ideal protocol for enabling remote file storage and document collaboration across multiple platforms and devices.

Stalwart includes full support for WebDAV, extending its functionality beyond traditional email to provide integrated collaboration tools. Through WebDAV, users can manage remote file storage directly from compatible clients, offering a seamless experience for storing, retrieving, and organizing documents and other data on the server.

In addition to file storage, Stalwart also supports two important WebDAV-based protocols for collaboration: CalDAV and CardDAV. CalDAV allows users to manage calendar data, including creating, editing, and synchronizing events across devices and clients that support the protocol. Similarly, CardDAV is used for managing contact data, enabling users to maintain and synchronize address books in a consistent and standards-compliant way.

Together, WebDAV, CalDAV, and CardDAV provide a powerful foundation for collaborative workflows within Stalwart. These protocols ensure broad interoperability with client applications and devices, making Stalwart a flexible and reliable platform for modern communication and data management needs.

## Enabling WebDAV

In order to be able to accept WebDAV connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `http`.

For example:

```toml
[server.listener."webdav"]
bind = ["[::]:443"]
protocol = "http"
tls.implicit = true
```

Note that this step is usually not required as, in most setups, an `http` listener is created automatically during the installation process.

## Accessing WebDAV

Stalwart organizes its WebDAV resources under a structured path hierarchy, making it easy to locate and interact with different types of data, including calendars, contacts, files, and user principals. Each resource type is accessible under a distinct URL prefix, allowing client applications to efficiently navigate and interact with the appropriate service.

Calendar data managed via CalDAV is available under the `/dav/cal` path. For example, a user named `john` would have their calendar data accessible at `/dav/cal/john`. Similarly, contact data managed through CardDAV is located under `/dav/card`, so the address book for a user `john` would reside at `/dav/card/john`.

For general file storage, the WebDAV file system is available under `/dav/file`. This path serves as the root directory for users’ personal file storage. For instance, the file storage area for user `jane` would be found at `/dav/file/jane`, where she can upload, organize, and retrieve documents and other data through any standard WebDAV client.

Stalwart also supports WebDAV ACL (Access Control List) extensions, and user principals are exposed via the `/dav/pal` path. These principal resources are used to define and manage access rights across the various WebDAV services, and are typically accessed by clients to retrieve information about user identities and permissions.

To streamline configuration, Stalwart provides autodiscovery endpoints for both CalDAV and CardDAV services. These endpoints are located at `/.well-known/caldav` and `/.well-known/carddav`, respectively. When queried, they redirect clients to the appropriate resource location for the authenticated user, simplifying initial setup in compliant calendar and contact applications.

## Disabling WebDAV

By default, WebDAV access is enabled in Stalwart when an HTTP listener is configured. This allows users to take advantage of calendar synchronization (CalDAV), contact management (CardDAV), and file storage via WebDAV without additional setup. However, some organizations may wish to limit or disable WebDAV access entirely for security, compliance, or policy reasons.

The most straightforward way to disable WebDAV access server-wide is by creating an [HTTP access control rule](/docs/http/access-control) that blocks incoming requests to any path under `/dav`. This effectively prevents clients from accessing all WebDAV-related endpoints, including `/dav/cal`, `/dav/card`, `/dav/file`, and `/dav/pal`, regardless of user account settings.

For more granular control, WebDAV access can also be restricted on a per-user, per-group, or per-tenant basis. This is done by removing the relevant [WebDAV permissions](/docs/auth/authorization/permissions) from the corresponding account or entity. Specifically, administrators can revoke the CalDAV, CardDAV, and general WebDAV permissions, ensuring that only authorized users or organizational units are allowed to access those services.

