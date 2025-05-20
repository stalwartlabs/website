---
sidebar_position: 1
---

# Overview

A **collaboration server** goes beyond traditional email functionality by providing tools and protocols that support shared access to calendars, contacts, documents, and other data across users and devices. These features are essential in modern organizations where teamwork, scheduling, and shared information are central to productivity. Stalwart is designed with these capabilities in mind, functioning not just as a mail server but as a full-featured, standards-based collaboration platform.

In addition to handling email, Stalwart supports **calendar management**, **contact synchronization**, and **file storage**, allowing users to access and manage their collaborative data through a single, integrated system. These features are exposed via the **WebDAV protocol**, ensuring broad compatibility with a wide range of client applications:

- **CalDAV** is a WebDAV extension for accessing and managing calendar data. It enables users to create events, manage recurring appointments, and synchronize calendars across devices and platforms.
- **CardDAV** is a similar WebDAV extension for managing contact data. It allows users to maintain address books and synchronize contact information in a consistent, interoperable way.
- **File storage via WebDAV** enables users to store, retrieve, and organize files on the server just like a remote file system. This allows easy sharing and remote access to documents from any compatible WebDAV client.

To manage access and permissions across these services, Stalwart also supports the **WebDAV ACL (Access Control List) extension**. This allows fine-grained, standards-compliant control over who can read, write, or manage each resource, providing both flexibility and security in collaborative environments.

By supporting CalDAV, CardDAV, file storage, and WebDAV ACL, Stalwart delivers a powerful and extensible collaboration platform that seamlessly integrates with modern tools and workflows.

## Opting Out

While Stalwart includes powerful collaboration features (such as calendars, contacts, and file storage via WebDAV) it is designed to remain lightweight and modular. If your organization is only interested in email functionality, rest assured that these additional services do **not** introduce any performance or resource overhead unless explicitly used.

The collaboration features are **completely optional**. They do not interfere with mail delivery, IMAP, SMTP, or any other core mail server functionality. By default, WebDAV support is enabled when an HTTP listener is configured, but if collaboration is not needed, you can easily disable WebDAV access entirely.

For administrators who want to run Stalwart strictly as a mail server, we provide clear instructions for [disabling WebDAV access](/docs/http/webdav/overview#disabling-webdav). This can be done globally or on a per-user, group, or tenant basis, allowing complete control over which services are exposed to clients.

This approach ensures that Stalwart remains efficient, focused, and adaptable, serving equally well as a high-performance mail server or a fully integrated communication and collaboration platform, depending on your needs.
