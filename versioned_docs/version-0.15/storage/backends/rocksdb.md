---
sidebar_position: 1
---

# RocksDB

RocksDB is an embeddable, high performance, and persistent key-value store originally built by Facebook. It is particularly well-suited for storing data on fast storage devices, such as SSDs. With its efficient use of CPU and RAM, RocksDB is designed for fast data retrieval, making it a popular choice for various applications.

RocksDB is the recommended backend for single-node setups of Stalwart due to its speed and robustness, which are essential for a reliable mail server operation.

## Configuration

The following configuration settings are available for RocksDB, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store to be used. For RocksDB, this is set to `"rocksdb"`.
- `path`: Defines the file system path where the RocksDB data will be stored. Example: `"/var/lib/data"`.
- `min-blob-size`: This setting determines the minimum size of a blob (Binary Large OBject) in RocksDB. It affects how data is stored and retrieved. The value is set in bytes.
- `write-buffer-size`: Defines the size of the in-memory write buffer. A larger buffer can improve write performance but consumes more memory. The value is set in bytes.
- `pool.workers`: Specifies the number of worker threads in the pool. This setting controls the level of concurrency for database operations, with a higher number potentially leading to better performance, especially on systems with multiple cores. The default value is the number of CPU cores available on the system.

## Example

```toml
[store."rocksdb"]
type = "rocksdb"
path = "/opt/stalwart/data"
min-blob-size = 16834
write-buffer-size = 134217728

[store."rocksdb".pool]
workers = 10
```
