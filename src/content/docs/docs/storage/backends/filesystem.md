---
sidebar_position: 7
title: "Filesystem"
description: "Store message contents and other blobs as files in a local directory."
---

The filesystem backend stores each blob of the [blob store](/docs/storage/blob) as a file in a directory. It serves single-node installations that want to keep the database small by placing message contents on a separate volume. Because the blobs are ordinary files, ordinary file system tools can also back them up.

## Configuration

The backend is selected with the `FileSystem` variant of the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->). [`path`](/docs/ref/object/blob-store#path) is the directory in which blobs are written, and it is created if it does not exist.

A single directory holding every blob would grow to an unmanageable number of files. The files are therefore distributed among nested subdirectories, named after the leading bytes of each blob's identifier. [`depth`](/docs/ref/object/blob-store#depth) sets the number of directory levels, at most 5. Each level has up to 256 subdirectories, so two levels already spread the blobs over up to 65,536 directories.

The depth must not change once blobs have been written. The location of every existing blob is derived from the depth in force when it was written, so after a change the server would look for those blobs in the wrong place and no longer find them.

The following blob store keeps blobs under `/var/lib/stalwart/blobs`:

```json
{
  "@type": "FileSystem",
  "path": "/var/lib/stalwart/blobs",
  "depth": 2
}
```

## Restrictions

The directory belongs to one node. Several nodes can share a filesystem blob store only when the directory is on a shared file system that every node mounts at the same path. Without one, a cluster uses an [S3-compatible](/docs/storage/backends/s3) or [Azure](/docs/storage/backends/azure) blob store.

A filesystem blob store also cannot hold the snapshots of [cache swapping](/docs/storage/cache-swap). On a server with this blob store, cache swapping uses either the `LocalFile` backend, which writes snapshots to a local directory, or Redis.
