---
sidebar_position: 7
---

# Filesystem

For single-node installations, Stalwart can store email bodies and other blobs directly on the local filesystem. A hashed directory layout distributes files into nested subdirectories to avoid the performance issues that arise when a single directory contains a very large number of files.

## Configuration

The filesystem backend is selected by choosing the `FileSystem` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->). The variant exposes the following fields:

- [`path`](/docs/ref/object/blob-store#path): filesystem path where blobs are stored (required).
- [`depth`](/docs/ref/object/blob-store#depth): maximum depth of the nested directory hierarchy. Default: `2`.
