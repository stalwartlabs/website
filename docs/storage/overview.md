---
sidebar_position: 1
---

# Overview

This section covers the configuration and management of the storage system. Stalwart offers maximum flexibility by supporting four distinct types of storage, each catering to different aspects of server operation. These are the data store, blob store, full-text search store, and lookup store:

- [Data store](/docs/storage/data): The core storage unit where email metadata, folders, and various settings are stored. Essentially, it contains all the data except for large binary objects (blobs).
- [Blob store](/docs/storage/blob): This store is used for storing large binary objects such as emails, sieve scripts, and other files.
- [Full-text search store](/docs/storage/fts): This store is dedicated to indexing for full-text search, enhancing the speed and efficiency of text-based queries
- [Lookup store](/docs/storage/lookup): A key-value storage used primarily by the SMTP server and anti-spam components. It stores sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

Each store can be configured to use a different backend, allowing you to choose the most suitable option for your needs. 

## Configuration

In the configuration file, each store is defined under the `store.<name>` section, where `<name>` is a unique identifier for the store. The following attributes are common to all stores:

- `type`: The type of store. This is the only required attribute.
- `purge.frequency`: The frequency at which the store's maintenance task runs. This is specified using a simplified [cron-like syntax](/docs/configuration/values/cron).

The following example shows the configuration for a data store using [RocksDB](/docs/storage/backends/rocksdb) as the backend:

```toml
[store."data"]
type = "rocksdb"
path = "/var/data/stalwart/data"

[store."data".purge]
frequency = "0 3 *"
```

## Un-deleting emails ⭐

Stalwart Mail Server Enterprise edition provides a powerful feature that allows the recovery of emails deleted by users, even after these emails have been expunged from the Deleted Items or Junk Mail folders. This ensures that crucial emails can be retrieved within a specified period, adding an extra layer of security and data recovery for your organization.

:::tip Enterprise feature

This feature is available exclusively in the Enterprise Edition of Stalwart Mail Server and not included in the Community Edition.

:::

### Configuration

The un-delete feature is controlled through the `storage.undelete.retention` setting in the server's configuration file. This setting determines the number of days that deleted emails will be retained and available for recovery. This feature can be disabled by setting the value to `false`.

For example, to enable the un-delete feature and retain deleted emails for 30 days:

```toml
[storage.undelete]
retention = "30d"
```

### Recovery

Administrators can easily restore deleted emails using the [web-based administration panel](/docs/management/webadmin/overview). This user-friendly interface provides a straightforward way to search for and recover emails within the retention period specified in the configuration.

For more advanced users or automated systems, the REST API provides a flexible method to recover deleted emails. Detailed documentation on the specific API endpoints and usage can be found in the [API documentation](/docs/api/management/overview).
