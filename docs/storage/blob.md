---
sidebar_position: 3
---

# Blob store

The blob store holds the large binary objects managed by the server: raw email messages, Sieve scripts, and other files. Every blob is addressed by a content hash (BLAKE3) derived from the object's bytes, so two uploads with identical content share a single physical object. This content-addressed model enables straightforward deduplication across users and mailboxes.

Backend selection is made on the [BlobStore](/docs/ref/object/blob-store) singleton (found in the WebUI under <!-- breadcrumb:BlobStore --><!-- /breadcrumb:BlobStore -->). The object is a multi-variant type; each variant carries its own fields. The supported variants are:

- [S3-compatible storage](/docs/storage/backends/s3): for Amazon S3, Google Cloud Storage, MinIO, and other S3-compatible services.
- [Azure Blob Storage](/docs/storage/backends/azure): for the Azure-native object storage service.
- [Filesystem](/docs/storage/backends/filesystem): direct storage on the server's local filesystem, suitable for single-node installations.
- The `Default` variant, which reuses the configured data store as the blob store; useful for installations that prefer to minimise the number of external dependencies.
- For distributed installations, FoundationDB, PostgreSQL, and MySQL are also available as blob store variants; configuration mirrors the equivalent DataStore variants.

## Configuration

To change the blob store backend, update the BlobStore singleton and select the appropriate variant. Variant-specific fields such as [`bucket`](/docs/ref/object/blob-store#bucket), [`region`](/docs/ref/object/blob-store#region), and [`secretKey`](/docs/ref/object/blob-store#secretkey) apply to the S3 variant; [`path`](/docs/ref/object/blob-store#path) and [`depth`](/docs/ref/object/blob-store#depth) apply to the FileSystem variant; and so on. See the [BlobStore reference](/docs/ref/object/blob-store) for the full field list per variant.

## Compression

Blob compression is controlled through the [Email](/docs/ref/object/email) object (found in the WebUI under <!-- breadcrumb:Email --><!-- /breadcrumb:Email -->) via the [`compressionAlgorithm`](/docs/ref/object/email#compressionalgorithm) field. The setting applies to every blob written to the store (messages, attachments, Sieve scripts, and any other stored binary). The default is LZ4. Setting the field to `"none"` disables compression; setting it to `"lz4"` enables [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) compression.

## Maintenance

Temporary blobs uploaded through the JMAP [upload endpoint](/docs/http/jmap/protocol.md#upload-limits) are retained for a limited period (their Time-To-Live). Once the TTL expires without the blob being referenced, the server's scheduled clean-up task removes them, reclaiming storage.

The clean-up schedule is managed through the [DataRetention](/docs/ref/object/data-retention) object (found in the WebUI under <!-- breadcrumb:DataRetention --><!-- /breadcrumb:DataRetention -->) via the [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule) field, which accepts a cron expression. The default runs daily at 04:00.
