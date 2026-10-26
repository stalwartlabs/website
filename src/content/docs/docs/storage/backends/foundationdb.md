---
sidebar_position: 2
title: "FoundationDB"
description: "Use a FoundationDB cluster as the data store of a large Stalwart cluster: requirements and client settings."
---

In a large Stalwart cluster, every node reads and writes the same data store, so the data store must grow with the cluster and must stay available when hardware fails. [FoundationDB](https://www.foundationdb.org/) is built for that situation. It is a distributed, transactional key-value database that replicates its data across machines and tolerates the loss of some of them, and it scales horizontally by adding machines. Besides the data store, it can also hold the blob store and the search store.

## Requirements

A FoundationDB data store has three requirements:

- The official binaries and Docker images do not include FoundationDB support. A separate FoundationDB build of Stalwart is published for Linux, and the installation script installs it with its `--fdb` option. A Docker image can be built from the `Dockerfile.fdb` in the Stalwart repository.
- The FoundationDB client library (`libfdb_c`) must be installed on every Stalwart node, in a version compatible with the FoundationDB servers.
- Every node needs the cluster file of the FoundationDB cluster, which lists its coordination servers. FoundationDB's [administration guide](https://apple.github.io/foundationdb/administration.html) describes how to distribute it.

FoundationDB also places limits on what a single operation may do. Each transaction may last at most five seconds and carry at most 10 MB of data, and each value is limited to 100 KB. Stalwart splits large values and blobs into chunks and writes large blobs over several transactions, so no configuration is needed for large messages.

## Configuration

The backend is selected with the `FoundationDb` variant of the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The same fields apply to the `FoundationDb` variants of the [BlobStore](/docs/ref/object/blob-store) and [SearchStore](/docs/ref/object/search-store) objects. Every field is optional, and a field left unset keeps the FoundationDB client default.

The first setting tells the client how to find the cluster. [`clusterFile`](/docs/ref/object/data-store#clusterfile) is the path of the cluster file. When it is unset, the client looks in its default location, which on Linux is `/etc/foundationdb/fdb.cluster`.

The next settings bound how long the client keeps trying. [`transactionTimeout`](/docs/ref/object/data-store#transactiontimeout) is the time a transaction may take, in milliseconds. A transaction that fails with a retryable error is retried by the client, and [`transactionRetryLimit`](/docs/ref/object/data-store#transactionretrylimit) and [`transactionRetryDelay`](/docs/ref/object/data-store#transactionretrydelay) limit how often it is retried and the maximum delay between attempts.

The last two settings matter only in deployments that span several data centres. [`machineId`](/docs/ref/object/data-store#machineid) and [`datacenterId`](/docs/ref/object/data-store#datacenterid) are locality options passed to the FoundationDB client. They tell FoundationDB on which machine and in which data centre the client runs, and FoundationDB uses this information to route requests in multi-data-centre deployments.

The following data store uses a cluster file in a non-default location:

```json
{
  "@type": "FoundationDb",
  "clusterFile": "/etc/stalwart/fdb.cluster"
}
```
