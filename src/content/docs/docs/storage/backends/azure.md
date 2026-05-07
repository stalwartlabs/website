---
sidebar_position: 11
title: "Azure Blob Storage"
---

For distributed and larger-scale deployments, Stalwart supports Azure Blob Storage as a blob store. Azure Blob Storage is a cloud-based object storage service designed for scalable storage of unstructured data, and is well suited to large-scale storage management, replication, and backup of email bodies, Sieve scripts, and other blobs.

## Configuration

The Azure backend is selected by choosing the `Azure` variant on the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->). The variant exposes the following fields:

- [`storageAccount`](/docs/ref/object/blob-store#storageaccount): the Azure Storage Account used to hold blobs (required).
- [`container`](/docs/ref/object/blob-store#container): the container within the Storage Account where blobs are stored (required).
- [`accessKey`](/docs/ref/object/blob-store#accesskey): the access key for the Storage Account (required). The secret may be supplied inline, read from an environment variable, or loaded from a file.
- [`sasToken`](/docs/ref/object/blob-store#sastoken): shared access signature token, used instead of an access key for SAS-based authentication.
- [`timeout`](/docs/ref/object/blob-store#timeout): maximum time to wait for a response from the Azure service. Default: `"30s"`.
- [`maxRetries`](/docs/ref/object/blob-store#maxretries): maximum number of retries for a failed operation. Default: `3`.
- [`keyPrefix`](/docs/ref/object/blob-store#keyprefix): optional prefix prepended to every object key, useful for organising or segregating data within a container.
