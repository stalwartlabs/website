---
sidebar_position: 1
title: "Overview"
---

A collaboration server goes beyond traditional email by providing tools and protocols that support shared access to calendars, contacts, documents, and other data across users and devices. Stalwart is designed with these capabilities in mind, functioning not just as a mail server but as a standards-based collaboration platform.

In addition to handling email, Stalwart supports calendar management, contact synchronization, and file storage, so accounts, calendars, address books, and files are managed through a single integrated system. These features are exposed through the WebDAV protocol family for client compatibility, and through JMAP for modern JSON-based clients:

- **CalDAV** is a WebDAV extension for accessing and managing calendar data. It allows clients to create events, manage recurring appointments, and synchronize calendars across devices and platforms.
- **CardDAV** is a similar WebDAV extension for managing contact data. It allows maintaining address books and synchronizing contact information in a consistent, interoperable way.
- **File storage via WebDAV** allows files to be stored, retrieved, and organized on the server as a remote file system, supporting shared and remote access to documents from any compatible WebDAV client.

To manage access and permissions across these services, Stalwart also supports the WebDAV ACL (Access Control List) extension. This allows fine-grained control over who can read, write, or manage each resource.

## Opting out

Although Stalwart includes collaboration features (calendars, contacts, and file storage through WebDAV and JMAP), the implementation is modular. For deployments interested only in email, these services do not introduce performance or resource overhead unless explicitly used.

The collaboration features are optional. They do not interfere with mail delivery, IMAP, SMTP, or any other core mail server functionality. By default, WebDAV support is enabled when an HTTP listener is configured; if collaboration is not required, WebDAV access can be disabled entirely.

For deployments that run Stalwart strictly as a mail server, instructions for [disabling WebDAV access](/docs/http/webdav/#disabling-webdav) are provided in the WebDAV documentation. WebDAV can be disabled globally or on a per-user, group, or tenant basis using the permission system.
