---
sidebar_position: 1
---

# RocksDB

RocksDB is an embeddable, high-performance, persistent key-value store originally developed at Facebook. It is well suited to fast storage devices such as SSDs, and its efficient use of CPU and memory makes it a popular choice for embedded workloads. RocksDB is the recommended backend for single-node installations of Stalwart because of its speed and reliability.

## Configuration

The RocksDB backend is selected by choosing the `RocksDb` variant on the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The variant exposes the following fields:

- [`path`](/docs/ref/object/data-store#path): filesystem path where the RocksDB data directory is stored (required).
- [`blobSize`](/docs/ref/object/data-store#blobsize): minimum size, in bytes, for an object to be stored in the blob store rather than inline in the metadata store. Default: `16834`.
- [`bufferSize`](/docs/ref/object/data-store#buffersize): size of the in-memory write buffer, in bytes. A larger buffer improves write throughput at the cost of memory. Default: `134217728` (128 MB).
- [`poolWorkers`](/docs/ref/object/data-store#poolworkers): number of worker threads dedicated to database operations. Defaults to the number of CPU cores available on the host.

RocksDB is also available as a backend for other stores (blob, search, in-memory) through the `Default` variant of the [BlobStore](/docs/ref/object/blob-store), [SearchStore](/docs/ref/object/search-store), and [InMemoryStore](/docs/ref/object/in-memory-store) objects, in which case they reuse the configured data store.
