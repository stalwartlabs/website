---
sidebar_position: 7
---

# Backup

The backup procedure for Stalwart Mail Server varies depending on the chosen [database](/docs/storage/database/overview) and [blob storage](/docs/storage/blob/overview) backend. Ensuring regular backups of your data will minimize the risk of data loss and aid in recovery in case of accidental deletion or system failures.

## Database backup

The database primarily stores settings, indexes, and various forms of metadata. To backup your database:

- If you're using the [SQLite](/docs/storage/database/sqlite) backend, you have a couple of options. You could use [Litestream](https://litestream.io/), which is an external tool designed for automatic SQLite database replication. Alternatively, you can directly back up your SQLite database by executing the `.backup backup_file.sqlite3` command within the SQLite console.
- If [FoundationDB](/docs/storage/database/foundationdb) is your chosen backend, please refer to the [Backup, Restore, and Replication for Disaster Recovery](https://apple.github.io/foundationdb/backups.html) section of the FoundationDB documentation.

## Blob storage backups

The blob store is where emails and other binary data, such as Sieve scripts, are stored. To backup your blob store:

- If you're utilizing [local](/docs/storage/blob/local) storage, ensure to regularly back up the directory specified in the `blob.store.local.path` configuration attribute. This will store a copy of all the emails and other blobs.
- If you're using [S3-compatible](/docs/storage/blob/s3) storage, please refer to your S3 storage provider's instructions on backing up data. Different providers may offer various tools or methods for backing up data stored in their systems. 
