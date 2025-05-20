---
sidebar_position: 3
---

# Blob store

The blob store is where large binary objects such as emails, sieve scripts, and other files are stored. All objects stored in the blob store are identified by a unique identifier known as a blob ID. This ID is used to reference the object in the data store and calculated using the [BLAKE3](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3) hash of the object's contents. This means that objects with the same content will have the same blob ID, allowing for efficient storage and deduplication.

The following backends can be utilized as a blob store:

- [S3-compatible storage](/docs/storage/backends/s3): Ideal for distributed storage systems, which could be Amazon S3, Google Cloud Storage (GCS), MinIO, or any other S3-compatible service.
- [File System](/docs/storage/backends/filesystem): Direct storage in the server’s file system, available only for single node installations.
- [Data store](/docs/storage/data): Use any of the supported data store backends as a blob store. This allows you to use the same database for both the data store and blob store, which is useful when you want to minimize the number of external dependencies.

## Configuration

To configure the blob store, you need to specify the ID of the store you wish to use under the `storage.blob` attribute in the configuration file. For example, to use the `s3` store as the blob store:

```toml
[storage]
blob = "s3"
```

## Compression

Stalwart supports the compression of blobs to reduce storage space and improve performance. The `compression` attribute in the blob store configuration can be set to either `none` to disable compression or `lz4` to enable [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) compression. The default value is `none`. 

For example, to enable LZ4 compression on the `s3` store:

```toml
[store."s3"]
compression = "lz4"
```

## Maintenance

Stalwart runs periodically an automated task on the blob store that removes temporary blobs, which are binary files uploaded by users to the JMAP server. In some instances, these uploaded files may not be used or accessed beyond a certain period of time, known as their [Time-To-Live (TTL)](/docs/jmap/protocol#upload-limits). When a temporary blob exceeds its TTL without being accessed, Stalwart identifies it as "expired". The blob purge task runs at a configurable interval, and during each run, it identifies and deletes these expired temporary blobs, freeing up storage space and reducing clutter in the storage system.

The schedule for these tasks is configured using a simplified [cron-like syntax](/docs/configuration/values/cron). The frequency of these tasks is determined by the `store.<id>.purge.frequency` attribute of the configuration file, where `<id>` is the ID of the store you wish to configure.

For example, to run the job every day at 5:30am local time on the `s3` store, you would add the following to your configuration file:

```toml
[store."s3".purge]
frequency = "30 5 *"
```
