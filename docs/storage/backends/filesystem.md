---
sidebar_position: 7
---

# Filesystem

For single-node installations, Stalwart can store email bodies and other blobs directly on the local filesystem. A hashed directory layout distributes files into nested subdirectories to avoid the performance issues that arise when a single directory contains a very large number of files.

## Configuration

The filesystem backend is selected by choosing the `FileSystem` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><!-- /breadcrumb:BlobStore -->). The variant exposes the following fields:

- [`path`](/docs/ref/object/blob-store#path): filesystem path where blobs are stored (required).
- [`depth`](/docs/ref/object/blob-store#depth): maximum depth of the nested directory hierarchy. Default: `2`.
