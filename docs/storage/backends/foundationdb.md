---
sidebar_position: 2
---

# FoundationDB

FoundationDB is a distributed database designed to handle large volumes of data across a network of machines. It combines the power of ACID (Atomicity, Consistency, Isolation, Durability) transactions with the scalability of NoSQL databases. FoundationDB is engineered to provide high performance, fault tolerance, and easy scalability, making it an ideal choice for distributed systems.

FoundationDB is the recommended backend for distributed setups of Stalwart Mail Server due to its ability to manage large-scale, distributed data storage and processing needs effectively.

:::tip Note

Make sure you have the FoundationDB client library installed on your system before using it as a backend for Stalwart Mail Server. 

:::

## Configuration

The following configuration settings are available for FoundationDB, which are specified under the `store.<name>` section of the configuration file:

- `type`: Indicates the type of store being used. For FoundationDB, this is set to `"foundationdb"`.
- `path`: Specifies the file system path to the FoundationDB cluster configuration file. This file contains necessary information for the server to connect and interact with the FoundationDB cluster. If left unspecified, the default path `/etc/foundationdb/fdb.cluster` is used.

## Transaction Configuration

The following configuration settings are available for FoundationDB transactions, which are specified under the `store.<name>.transaction` section of the configuration file:

- `timeout`: Defines the duration after which a transaction will time out if not completed. This is set as a string representing time, such as `"5s"` for 5 seconds.
- `retry-limit`: Specifies the maximum number of times a transaction will be retried in case of failure before giving up. Example: `10`.
- `max-retry-delay`: Sets the maximum delay between retries for a transaction. This delay is specified as a string representing time, like `"1s"` for 1 second.
- `machine-id`: A unique identifier for the machine. This can be used for logging or for customizing the behavior of the database on a per-machine basis. Example: `"stalwart"`.
- `data-center-id`: Identifies the data center where the machine is located. This can be important for configuring and optimizing cross-data-center replication and other distributed behaviors. Example: `"my-datacenter"`.

## Example

```toml
[store."foundationdb"]
type = "foundationdb"
path = "/etc/foundationdb/fdb.cluster"

[store."foundationdb".transaction]
timeout = "5s"
retry-limit = 10
max-retry-delay = "1s"
machine-id = "stalwart"
data-center-id = "my-datacenter"
```
