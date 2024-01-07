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
- `disable`: A boolean value that determines whether the store is enabled or disabled. The default value is `false`.
- `purge.frequency`: The frequency at which the store's maintenance task runs. This is specified using a simplified [cron-like syntax](/docs/configuration/values/cron).

The following example shows the configuration for a data store using [RocksDB](/docs/storage/backends/rocksdb) as the backend:

```toml
[store."data"]
type = "rocksdb"
path = "/var/data/stalwart/data"
disable = false

[store."data".purge]
frequency = "0 3 *"
```

