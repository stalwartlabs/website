---
sidebar_position: 10
---

# Azure Blob Storage

For distributed and larger-scale implementations, Stalwart supports Azure Blob Storage as a backend for storing blobs (e-mail messages, Sieve scripts, etc.). Azure Blob Storage is a cloud-based object storage service that provides scalable storage for large amounts of unstructured data. By using Azure Blob Storage, Stalwart can store blobs on remote servers, facilitating large-scale storage management, easy data replication, and backup, making it a viable option for businesses seeking robustness and scalability.

## Configuration

The Azure Blob Storage service is configured under the `store.<name>` section of the configuration file. The following attributes are supported:

- `type`: Specifies the type of storage, set to `"azure"` for Azure Blob Storage.
- `storage-account`: This option is used to specify the Azure Storage Account name where blobs (e-mail messages, Sieve scripts, etc.) will be stored.
- `container`: This option is used to specify the Azure Blob Storage container where blobs will be stored.
- `azure-access-key`: This option is used for authentication with the Azure Blob Storage service. The `azure-access-key` serves as a password for the Azure Storage Account.
- `sas-token`: This option is used for authentication with the Azure Blob Storage service. The `sas-token` is a shared access signature token that provides secure access to the Azure Storage Account.
- `max-retries`: This option specifies the maximum number of times the server will retry a failed operation before giving up.
- `timeout`: This option defines the maximum amount of time the server will wait for a response from the Azure service before it gives up. 
- `key-prefix`: This option is used to specify a prefix that will be added to the keys of all objects stored in the Azure container. This can be useful for organizing and segregating data within the bucket.

## Example

```toml
[store."azure"]
type = "azure"
storage-account = "stalwart"
container = "mail"
azure-access-key = "your-access-key"
timeout = "30s"
key-prefix = "stalwart/"
```

