---
sidebar_position: 7
---

# File Storage

Stalwart includes support for **file storage and remote file management** through the **WebDAV protocol**, allowing users to store, organize, and access files directly from their account.

With WebDAV, users can **connect to their Stalwart account as a remote drive**, enabling them to browse, upload, download, and manage files using standard file manager applications on desktop and mobile devices. This provides a convenient and secure way to share documents, access files on the go, or centralize data storage—without the need for additional software or proprietary protocols.

File storage in Stalwart is tightly integrated with the server's existing resource management features. **The same quota system used for email storage also applies to WebDAV file storage**, ensuring consistent usage policies across services. This allows administrators to control total storage consumption per user or tenant, simplifying resource planning and enforcement.

By supporting WebDAV-based file storage, Stalwart extends its functionality beyond communication and scheduling, offering a unified platform for collaborative work and secure data access.

## Accessing Files

Users can access their file storage on Stalwart using the WebDAV protocol at a predictable and consistent URL path. Each user’s file storage area is located under `/dav/file/<account_name>`. For example, if the user’s account name is `jane`, her root file storage directory will be accessible at `/dav/file/jane`.

Clients can connect to this path using any standard WebDAV-compatible file manager or application to browse directories, upload and download files, and organize content. This allows users to interact with their Stalwart-hosted files as they would with a remote drive or shared network folder. There is no autodiscovery mechanism for file storage, so users or client applications must be configured with the correct path to access their file space. Once connected, file operations are handled using standard WebDAV methods such as `GET`, `PUT`, `DELETE`, and `MKCOL`.

## Limits

To ensure optimal performance and protect server resources, Stalwart allows administrators to define limits on file-related operations. These settings help prevent abuse or misconfiguration from clients that may attempt to create excessively large files. 

The `file-storage.max-size` setting defines the maximum allowed size (in bytes) of a single file submitted to the server. By default, this limit is set to **25 MB**. This helps prevent clients from uploading unreasonably large files that could impact memory usage or processing performance. If needed, this value can be increased or decreased depending on your deployment’s use case and client behavior.

Example:

```toml
[file-storage]
max-size = 26214400
```
