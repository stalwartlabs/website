---
sidebar_position: 11
---

# Azure Blob Storage

For distributed and larger-scale deployments, Stalwart supports Azure Blob Storage as a blob store. Azure Blob Storage is a cloud-based object storage service designed for scalable storage of unstructured data, and is well suited to large-scale storage management, replication, and backup of email bodies, Sieve scripts, and other blobs.

## Configuration

The Azure backend is selected by choosing the `Azure` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><!-- /breadcrumb:BlobStore -->). The variant exposes the following fields:

- [`storageAccount`](/docs/ref/object/blob-store#storageaccount): the Azure Storage Account used to hold blobs (required).
- [`container`](/docs/ref/object/blob-store#container): the container within the Storage Account where blobs are stored (required).
- [`accessKey`](/docs/ref/object/blob-store#accesskey): the access key for the Storage Account (required). The secret may be supplied inline, read from an environment variable, or loaded from a file.
- [`sasToken`](/docs/ref/object/blob-store#sastoken): shared access signature token, used instead of an access key for SAS-based authentication.
- [`timeout`](/docs/ref/object/blob-store#timeout): maximum time to wait for a response from the Azure service. Default: `"30s"`.
- [`maxRetries`](/docs/ref/object/blob-store#maxretries): maximum number of retries for a failed operation. Default: `3`.
- [`keyPrefix`](/docs/ref/object/blob-store#keyprefix): optional prefix prepended to every object key, useful for organising or segregating data within a container.
