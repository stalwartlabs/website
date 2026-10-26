---
sidebar_position: 7
title: "File Storage"
---

Users often need a place to keep documents that they can reach from any device, without a separate file server. Stalwart gives every account a file storage area for this purpose, in which files can be stored, organised and accessed remotely. It is served over two protocols, JMAP for File Storage and WebDAV. This page describes how clients reach the files, the limits that apply, how files are charged to the quota and indexed, and how file storage is withdrawn from accounts.

## JMAP for File Storage

JMAP for File Storage, also known as JMAP for FileNode, is a JMAP-based replacement for WebDAV file storage. Clients upload, download, move, rename and share files and folders through the same JMAP framework that they use for Mail, Calendars and Contacts.

The difference from WebDAV lies in the data model. WebDAV relies on the XML-based `PROPFIND` and `REPORT` operations and on custom HTTP methods. JMAP for File Storage exposes a JSON data model for files and collections instead, and it integrates with JMAP Sharing and its access control.

## WebDAV

Over WebDAV, an account can be connected as a remote drive. Standard file managers on desktop and mobile devices can then browse, upload, download and manage its files. This offers a protocol-neutral way to share documents, reach files remotely or centralise data storage.

### Accessing files

Each account's file storage is located under `/dav/file/<account_name>`. The root directory of the account `jane`, for example, is `/dav/file/jane`.

File storage has no autodiscovery mechanism, so a client cannot find this path on its own. A WebDAV-compatible file manager or application must be configured with it. Once connected, the client handles files with the standard WebDAV methods, such as `GET`, `PUT`, `DELETE` and `MKCOL`.

## Limits

File storage limits are set on the [FileStorage](/docs/ref/object/file-storage) singleton, found in the WebUI under <!-- breadcrumb:FileStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg> Files & Sharing › File Storage<!-- /breadcrumb:FileStorage -->.

The first limit concerns single files. [`maxSize`](/docs/ref/object/file-storage#maxsize) is the largest file the server accepts, <!-- default:FileStorage.maxSize -->25 MiB<!-- /default --> by default, so a larger upload is refused until the limit is raised.

The other two limits cap the file resources of each account. [`maxFiles`](/docs/ref/object/file-storage#maxfiles) limits the number of files an account can create, and [`maxFolders`](/docs/ref/object/file-storage#maxfolders) the number of folders. Both are optional. They apply to every account unless they are overridden at the account or tenant level.

## Quota

File storage uses the same quota system as email. Files therefore count towards the account's disk quota together with its email, calendars and contacts, and total consumption can be controlled per account or per tenant.

A file is charged with its content size plus a small amount for its name and metadata. This applies over WebDAV and JMAP alike, so the charge is slightly higher than the size reported in `getcontentlength`.

Within one JMAP request, the quota is checked cumulatively. When two uploads in the same request do not both fit, one of them fails with `overQuota`. Two operations succeed even when the account is over quota: renaming a file, and replacing it with a smaller one.

Not every change counts as new content. Changing only properties of a file with `PROPPATCH`, such as its display name or a client's own properties, leaves its `ETag` and last-modified time unchanged. Uploading new content changes both.

## Searching files

File names are always searchable. File contents are added to the search index too, as long as [`indexFiles`](/docs/ref/object/search#indexfiles) on the Search object is enabled, and the field is <!-- default:Search.indexFiles as=enabled -->enabled<!-- /default --> by default. Text is extracted from documents such as PDF and office files. [Attachment text extraction](/docs/storage/text-extraction) describes the supported formats and the limits that apply.

## Disabling file storage

File storage is available to every account that holds the WebDAV file permissions (`davFile*`) or the JMAP file node permissions (`jmapFileNode*`). Removing those permissions from accounts, groups or tenants withdraws it from them, as described in [Permissions](/docs/auth/authorization/permissions).
