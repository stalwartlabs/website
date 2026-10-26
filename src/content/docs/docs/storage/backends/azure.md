---
sidebar_position: 11
title: "Azure Blob Storage"
description: "Store message contents and other blobs in an Azure Blob Storage container, with shared key, SAS token, service principal, managed identity or workload identity authentication."
---

[Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/) is Microsoft's object storage service. It can serve as the [blob store](/docs/storage/blob), holding message contents, files and other blobs in a container of an Azure Storage Account. Stalwart talks to it through the native Blob Storage API. All the nodes of a cluster can share the same container.

## Configuration

The backend is selected with the `Azure` variant of the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Blob Store<!-- /breadcrumb:BlobStore -->). [`storageAccount`](/docs/ref/object/blob-store#storageaccount) names the Storage Account and [`container`](/docs/ref/object/blob-store#container) the container, which must already exist. [`keyPrefix`](/docs/ref/object/blob-store#keyprefix) prepends a fixed prefix to every blob name, so that several servers can share one container.

Stalwart derives the address of the service from the storage account and the [`environment`](/docs/ref/object/blob-store#environment), which names the Azure cloud: `public` for the global Azure cloud, `china` for Azure China, or `us-government` for Azure Government. The environment also selects the Microsoft Entra ID authority that the token-based authentication methods use. When the derived address is not the right one, [`url`](/docs/ref/object/blob-store#url) replaces it, for example for a private endpoint or for the Azurite emulator.

[`timeout`](/docs/ref/object/blob-store#timeout) limits the duration of each request. A failed request is retried up to [`maxRetries`](/docs/ref/object/blob-store#maxretries) times, and 0 disables retries. When the retries are exhausted, the operation that needed the blob fails.

## Authentication

Azure offers several ways for an application to prove its identity, and the right one depends on where Stalwart runs. The [`auth`](/docs/ref/object/blob-store#auth) field selects the method. Secrets can be given as a value, read from an environment variable or read from a file.

| `@type` | Fields | Used when |
|---|---|---|
| `SharedKey` | `accountKey` | The Storage Account's access key is available to the server. |
| `SasToken` | `sasToken` | Access is granted by a shared access signature. The token must allow reading, writing and deleting blobs in the container; the leading `?` is optional. |
| `ClientSecret` | `tenantId`, `clientId`, `clientSecret` | The server authenticates as a Microsoft Entra ID service principal (an application registration) with a client secret. |
| `ManagedIdentity` | `clientId` (optional) | The server runs on an Azure resource with a managed identity, such as a virtual machine. Without `clientId`, the system-assigned identity is used; with it, the user-assigned identity of that client ID. |
| `WorkloadIdentity` | `tenantId`, `clientId`, `tokenFile` (all optional) | The server runs in Kubernetes with Microsoft Entra Workload ID. Empty fields are read from the `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` and `AZURE_FEDERATED_TOKEN_FILE` environment variables that the workload identity webhook injects into the pod. |

The token-based methods (`ClientSecret`, `ManagedIdentity` and `WorkloadIdentity`) authenticate an identity, and that identity must hold a role that permits reading, writing and deleting blobs in the container, such as Storage Blob Data Contributor.

## Examples

The following blob store authenticates with the Storage Account's access key, read from an environment variable:

```json
{
  "@type": "Azure",
  "storageAccount": "examplemail",
  "container": "stalwart",
  "auth": {
    "@type": "SharedKey",
    "accountKey": {"@type": "EnvironmentVariable", "variableName": "AZURE_STORAGE_KEY"}
  }
}
```

The following blob store runs in an Azure Kubernetes Service cluster with workload identity, and takes the tenant, the client and the token file from the pod environment:

```json
{
  "@type": "Azure",
  "storageAccount": "examplemail",
  "container": "stalwart",
  "auth": {"@type": "WorkloadIdentity"}
}
```

The following blob store uses the user-assigned managed identity of a virtual machine:

```json
{
  "@type": "Azure",
  "storageAccount": "examplemail",
  "container": "stalwart",
  "auth": {
    "@type": "ManagedIdentity",
    "clientId": "00000000-0000-0000-0000-000000000000"
  }
}
```
