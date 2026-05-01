---
sidebar_position: 7
title: "File Storage"
---

Stalwart includes support for file storage and remote file management through the JMAP for File Storage and WebDAV protocols, allowing accounts to store, organise, and access files directly.

## JMAP for File Storage

JMAP for File Storage (also known as JMAP for FileNode) is a JMAP-based replacement for traditional WebDAV file storage. It allows clients to manage files and folders (upload, download, move, rename, share) using the same JMAP framework as Mail, Calendars, and Contacts.

Instead of WebDAV's XML-based PROPFIND/REPORT operations and custom HTTP methods, JMAP for File Storage exposes a JSON data model for files and collections. It integrates with JMAP Sharing and access-control mechanisms.

## WebDAV

With WebDAV, an account can be connected as a remote drive, so that files can be browsed, uploaded, downloaded, and managed from standard file manager applications on desktop and mobile devices. This provides a protocol-neutral way to share documents, access files remotely, or centralise data storage.

File storage is integrated with the server's existing resource management features. The same quota system used for email storage also applies to WebDAV file storage, so usage policies remain consistent across services. Total storage consumption can be controlled per account or per tenant.

### Accessing files

Accounts access file storage through the WebDAV protocol at a consistent URL path. Each account's file storage area is located under `/dav/file/<account_name>`. For example, the account `jane` has its root file storage directory at `/dav/file/jane`.

Clients connect to this path using any WebDAV-compatible file manager or application to browse directories, upload and download files, and organise content. There is no autodiscovery mechanism for file storage, so clients must be configured with the correct path. Once connected, file operations are handled using standard WebDAV methods such as `GET`, `PUT`, `DELETE`, and `MKCOL`.

## Limits

File storage limits are configured on the [FileStorage](/docs/ref/object/file-storage) singleton (found in the WebUI under <!-- breadcrumb:FileStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg> Files & Sharing › File Storage<!-- /breadcrumb:FileStorage -->).

The [`maxSize`](/docs/ref/object/file-storage#maxsize) field defines the maximum accepted size of a single file submitted to the server. The default is `"25mb"`. Raise or lower the limit to match deployment-specific needs.

The singleton also sets default caps on per-account file resources: [`maxFiles`](/docs/ref/object/file-storage#maxfiles) caps the number of files an account can create, and [`maxFolders`](/docs/ref/object/file-storage#maxfolders) caps the number of folders. Both are optional and apply unless overridden at the account or tenant level.
