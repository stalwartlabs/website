---
sidebar_position: 2
---

# FoundationDB

FoundationDB is a distributed database designed to handle large volumes of data across multiple machines. It combines ACID transactions with the scalability of NoSQL systems, providing high performance, fault tolerance, and straightforward horizontal scaling. It is the recommended backend for distributed deployments of Stalwart.

:::tip Note

The FoundationDB client library must be installed on the host before Stalwart can connect to a FoundationDB cluster.

:::

## Configuration

The FoundationDB backend is selected by choosing the `FoundationDb` variant on the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The variant exposes the following fields:

- [`clusterFile`](/docs/ref/object/data-store#clusterfile): filesystem path to the FoundationDB cluster configuration file. If unset, the default `/etc/foundationdb/fdb.cluster` is used.
- [`transactionTimeout`](/docs/ref/object/data-store#transactiontimeout): duration after which a transaction times out if not completed.
- [`transactionRetryLimit`](/docs/ref/object/data-store#transactionretrylimit): maximum number of transaction retries before giving up.
- [`transactionRetryDelay`](/docs/ref/object/data-store#transactionretrydelay): maximum delay between transaction retries.
- [`machineId`](/docs/ref/object/data-store#machineid): optional identifier for the machine, useful for logging and cluster-aware behaviour.
- [`datacenterId`](/docs/ref/object/data-store#datacenterid): optional identifier for the data centre hosting the machine, used when tuning cross-datacentre replication.

FoundationDB is also available as a backend for the blob store, search store, and in-memory store; the same set of cluster-file and transaction fields is exposed on each of those objects under the `FoundationDb` variant.
