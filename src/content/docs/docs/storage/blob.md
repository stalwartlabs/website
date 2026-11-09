---
sidebar_position: 3
title: "Blob store"
description: "The blob store holds message contents, attachments, Sieve scripts and files. What it holds, the available backends, compression, encryption, and the consequences of changing it."
---

Most of the bytes a mail server stores belong to a small number of large objects: messages with their attachments, and the files users upload. The blob store holds these large binary objects, or blobs, apart from the structured records in the [data store](/docs/storage/data). The separation keeps the data store small and fast, and it allows the bulk of the data to be placed on inexpensive object storage.

Each blob is identified by its content rather than by the item that uses it. Identical contents are therefore stored only once, which matters for a message delivered to several accounts on the same server: every account refers to the same blob.

## Contents

The blob store holds the following data:

- Raw email messages, including their attachments.
- Files stored by users through WebDAV and JMAP file storage.
- Sieve scripts.
- Spam classifier training samples and the trained model.
- Blobs uploaded by JMAP clients that have not yet been attached to a message. Unused uploads expire and are removed by the blob purge.
- Snapshots of account caches, when [cache swapping](/docs/storage/cache-swap) uses the `BlobStore` backend with its default store.

Account records, mailboxes, flags, calendar events and contacts are structured data, so they are kept in the data store rather than here.

## Backends

The backend is selected by the `@type` of the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->):

| `@type` | Where blobs are kept | Shared by cluster nodes |
|---|---|---|
| `Default` | In the data store (default) | When the data store is shared |
| `S3` | An [S3-compatible](/docs/storage/backends/s3) bucket | Yes |
| `Azure` | An [Azure Blob Storage](/docs/storage/backends/azure) container | Yes |
| `FileSystem` | A [directory](/docs/storage/backends/filesystem) on the local file system | Only on a shared file system |
| `PostgreSql`, `MySql`, `FoundationDb` | A database separate from the data store | Yes |
| `Sharded` | Several of the above, with blobs distributed among them ([composite stores](/docs/storage/backends/composite#sharded-blob-store), Enterprise) | Yes |

The `Default` variant is the simplest choice. Blobs then share the data store's backups, replication and scaling, and no other service is needed. A separate blob store becomes worthwhile in two situations. The first is when the volume of message contents makes the data store too large to back up or replicate within the available time. The second is when object storage costs less than database storage. The fields of each variant are described on its backend page and in the [BlobStore reference](/docs/ref/object/blob-store).

One combination needs care. The `FileSystem` backend cannot hold cache swap snapshots, so a server whose blob store is `FileSystem` uses the `LocalFile` or `InMemory` swap backend instead.

## Changing the blob store

A change to the BlobStore object selects where new blobs are written and where existing ones are looked up. It does not copy the blobs that are already stored. As a result, after a change the messages, files and scripts written before it can no longer be read. To change the blob store of a server that already holds data, migrate the data as described in [Database migration](/docs/management/maintenance/migration). Like any store change, the new setting takes effect after a restart.

## Compression

Blobs are compressed before they are written. Email messages, Sieve scripts, queued messages and JMAP uploads follow the [`compressionAlgorithm`](/docs/ref/object/email#compressionalgorithm) field of the [Email](/docs/ref/object/email) object (<!-- breadcrumb:Email/EmailStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email/EmailStorage -->), and files follow the field of the same name in the [FileStorage](/docs/ref/object/file-storage) object (<!-- breadcrumb:FileStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg> Files & Sharing › File Storage<!-- /breadcrumb:FileStorage -->). Out of the box both are <!-- default:Email.compressionAlgorithm -->`lz4`<!-- /default -->. Three values are available:

- `lz4` applies [LZ4](https://github.com/lz4/lz4) compression, which favours speed over compression ratio. It finds little to compress in base64-encoded attachments.
- `zstd` applies [Zstandard](https://github.com/facebook/zstd) compression. It compresses text more tightly than LZ4 and, unlike LZ4, also shrinks base64-encoded attachments, at the cost of slower compression and decompression.
- `none` stores blobs uncompressed.

A blob that compression would not shrink, such as an already compressed image, is stored uncompressed whatever the setting. A change of algorithm applies only to the blobs written afterwards. Existing blobs are read in the form in which they were written, so no conversion is needed; the `BlobRecode` task described in [Blob encryption](/docs/storage/blob-encryption#re-encode-stored-blobs) converts them when that is wanted.

## Encryption

The blob store can also encrypt blobs with keys held by the server, so that the storage backend only holds ciphertext. [Blob encryption](/docs/storage/blob-encryption) describes what it protects and how to set it up.

## Maintenance

A blob is deleted once nothing references it any more. This happens, for example, after the last message that uses it is expunged, or when an upload expires without being used. The deletion itself is performed by the blob purge, which runs <!-- default:DataRetention.blobCleanupSchedule -->daily at 04:00<!-- /default --> unless its schedule is changed. [Data retention and reclaiming disk space](/docs/storage/maintenance) describes the schedule, and when each backend returns the freed space.
