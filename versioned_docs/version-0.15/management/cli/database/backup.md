---
sidebar_position: 1
---

# Backup

The backup procedure for Stalwart varies depending on the chosen [storage](/docs/storage/overview.md) backend. Ensuring regular backups of your data will minimize the risk of data loss and aid in recovery in case of accidental deletion or system failures.

## RocksDB

If you're using the [RocksDB](/docs/storage/backends/rocksdb) backend, ensure to regularly back up the directory specified in the `store.<name>.path` configuration attribute.

## FoundationDB

If [FoundationDB](/docs/storage/backends/foundationdb) is your chosen backend, please refer to the [Backup, Restore, and Replication for Disaster Recovery](https://apple.github.io/foundationdb/backups.html) section of the FoundationDB documentation.

## SQLite

If you're using the [SQLite](/docs/storage/backends/sqlite) backend, you have a couple of options. You could use [Litestream](https://litestream.io/), which is an external tool designed for automatic SQLite database replication. Alternatively, you can directly back up your SQLite database by executing the `.backup backup_file.sqlite3` command within the SQLite console.

## S3-compatible

If you're using [S3-compatible](/docs/storage/backends/s3) for blob storage, please refer to your S3 storage provider's instructions on backing up data. Different providers may offer various tools or methods for backing up data stored in their systems. 

## Filesystem

If you're utilizing [Filesystem](/docs/storage/backends/filesystem) for blob storage, ensure to regularly back up the directory specified in the `store.<name>.path` configuration attribute. This will store a copy of all the emails and other blobs.
 
## Other Storage Backends

If you're using a different storage backend, please refer to the documentation of the specific backend for instructions on backing up data.
