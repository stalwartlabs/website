---
sidebar_position: 4
---

# Database Migration

The **Database Import / Export** utility is a built-in feature of the Stalwart binary. It allows administrators to perform a full export or import of the system’s internal database. This functionality is primarily intended for **migrating data between different database backends**, such as moving from an embedded backend like **RocksDB** or **SQLite** to a more scalable one like **FoundationDB**, **PostgreSQL**, or **MySQL**.

## Usage Considerations

To ensure data integrity, Stalwart **must be stopped** before running any import or export operations. These actions directly access the raw data store and are not safe to perform while the server is running, as doing so may result in data inconsistency or corruption.

The utility works by generating a **binary dump** of the entire internal database. When exporting, the current database is serialized into a single file. This dump file can later be imported into a freshly initialized Stalwart instance that is configured to use a different backend. This makes the import/export utility an essential tool for administrators performing system upgrades, migrations, or major infrastructure changes.

:::tip Not a Backup Solution

It’s important to understand that the import/export utility is **not a substitute for proper backup procedures**. While it can be used to move data between systems, it is not designed for regular backup and recovery tasks. Users should continue to rely on their database backend’s native tools and best practices for routine backups, replication, and point-in-time recovery.

:::

## Export Procedure

The **export process** in Stalwart allows administrators to create a binary dump of the internal database for the purpose of system migration or data preservation. This feature is integrated into the main Stalwart binary and can be invoked using specific command-line arguments and environment variables.

To trigger an export, the Stalwart binary must be executed with the `--export` parameter, followed by the path to the directory where the exported database dump should be stored. Additionally, the `--config` argument must be used to specify the path to the Stalwart configuration file. This configuration file tells the export tool how to access the current database.

Here is the general syntax for the export command:

```bash
$ /opt/stalwart/bin/stalwart --config /path/to/config.toml --export /path/to/export-directory
```

Before running the export command, ensure that the **Stalwart server is stopped**, especially when using embedded backends like RocksDB or SQLite, to avoid data corruption.

### Choosing what to export

The export tool supports exporting either the full database or a specific set of [subspaces](/docs/development/database). This behavior is controlled by the `EXPORT_TYPES` environment variable.

- If `EXPORT_TYPES` is set, it must contain a **comma-separated list** of subspace letters (e.g., `j,k,t`) indicating which subspaces to include in the export.
- If `EXPORT_TYPES` is **unset or empty**, all subspaces are exported by default.

This allows for partial exports when only certain types of data (such as blobs or logs) need to be migrated or preserved.

### Example

The following command will export only the `j` (Blob Reserved), `k` (Blob Links), and `t` (Blobs) subspaces:

```bash
$ EXPORT_TYPES="j,k,t" /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.toml --export ~/stalwart-export
```

This will create a binary dump in the `~/stalwart-export` directory containing only the selected subspaces.

## Import Procedure

The **import process** in Stalwart allows administrators to restore a previously exported database dump into a newly configured backend. This functionality is designed primarily for migrating an entire system from one storage backend to another—for example, transitioning from RocksDB to PostgreSQL or FoundationDB.

Just like the export operation, the import process is built into the main Stalwart binary and must be executed while the server is **stopped** to ensure consistency and prevent conflicts with the running system.

To initiate an import, run the Stalwart binary with the `--import` argument pointing to the directory that contains the database dump. You must also include the `--config` argument to specify the configuration file that defines the new backend where the data will be imported.

Here is the basic syntax:

```bash
$ /opt/stalwart/bin/stalwart --config /path/to/config.toml --import /path/to/export-directory
```

This command reads the binary dump in the given directory and writes the data to the backend configured in the provided configuration file.

### Import behavior

Unlike the export utility, the import process **does not support selective subspace import**. When triggered, it will import **all subspaces present in the dump file** into the configured backend. This ensures a complete and consistent restoration of the system’s state.

As such, it is important to verify that the dump directory contains only the intended data before running the import. If the goal is to perform a partial import, it must be handled manually or during the export step by limiting the subspaces exported.

### Example

To import a previously exported database dump, you would use the following command:

```bash
$ /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.toml --import ~/stalwart-export
```



