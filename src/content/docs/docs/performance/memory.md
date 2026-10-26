---
title: "Sizing memory"
description: "Estimate the memory a Stalwart node needs and configure the memory budget."
sidebar_position: 3
---

A Stalwart node needs enough memory for everything it holds at the same time, and running out has a hard consequence: when the process uses more memory than the host has, the operating system kills it. Sizing memory means knowing what the node keeps in memory, adding up the limits that bound it, and checking that the total fits the host.

The node uses memory for four things: the caches, the data store, the memory budget and per-connection state. The first three have limits, but not all of these limits are fixed numbers. The defaults of the RocksDB block cache and of the memory budget scale with the memory available to the server, while the cache sizes are fixed. On a small host, the fixed cache sizes and the scaled limits together can exceed the physical memory. Nothing goes wrong while the caches are still empty, but once enough of them fill up, the process is killed.

This page adds up the defaults for a given host, explains the memory budget that protects the server from bursts of large messages, and lists what to lower on small hosts.

:::note[Estimates]
Figures marked as estimates on this page are calculated from the defaults or measured in benchmarks on x86_64 virtual machines with 16 vCPUs and 64 GB of memory, loaded with synthetic mail. Hosts with less memory were not benchmarked, so the figures for small hosts are calculated only.
:::

## Memory use of a node

The memory of a node falls into four parts, each bounded in its own way:

- **Caches.** Each cache has a fixed maximum size and fills as accounts are used, as described in [Sizing the caches](/docs/performance/caches).
- **Data store memory.** RocksDB uses a block cache and write buffers, and SQLite a page cache of 32 MiB per connection. PostgreSQL, MySQL and FoundationDB keep their memory in their own processes, so it does not count towards the Stalwart process.
- **Memory budget.** Messages received over SMTP, and messages and attachments served to clients, are held in memory while they are in transit. The budget limits how much they may hold together, as described in [Set the memory budget](#set-the-memory-budget).
- **Everything else.** Connections, protocol sessions and allocator overhead have no fixed limit. As an estimate, with thousands of connections open, each IMAP or POP3 connection uses about 65 to 80 KB of resident memory, and each HTTP keep-alive connection used by JMAP or WebDAV about 35 to 40 KB. Each JMAP EventSource subscriber uses about 28 KB, and each WebSocket connection about 145 KB. With few connections open, the cost per connection is higher, up to about 230 KB, so these figures are a guide for large numbers of connections only.

The derived defaults depend on how much memory the server considers available. This is the smaller of two values: the physical memory and, on Linux, the memory limit of the control group (cgroup v1 or v2) that the process runs in, including limits set on parent groups. In a container, the derived defaults therefore follow the container's limit, such as `docker run --memory` or a Kubernetes memory limit, rather than the memory of the whole host. On other platforms, only the physical memory is used.

## Default limits by host size

The following worksheet adds up the maximum of each limit with every setting at its default and RocksDB as the data store. The cache figure is the sum of the default sizes listed in the [Cache reference](/docs/ref/object/cache) for every cache except the two for large accounts, which have rows of their own. It is calculated from those defaults, so it changes when they change.

| Limit | 2 GiB host | 8 GiB host | 32 GiB host |
|---|---|---|---|
| Caches except large accounts, at their default sizes | 509 MiB | 509 MiB | 509 MiB |
| Large-account email cache ([`messagesLarge`](/docs/ref/object/cache#messageslarge)) | <!-- default:Cache.messagesLarge -->512 MiB<!-- /default --> | <!-- default:Cache.messagesLarge -->512 MiB<!-- /default --> | <!-- default:Cache.messagesLarge -->512 MiB<!-- /default --> |
| Large-account groupware cache ([`groupwareLarge`](/docs/ref/object/cache#groupwarelarge)) | <!-- default:Cache.groupwareLarge -->512 MiB<!-- /default --> | <!-- default:Cache.groupwareLarge -->512 MiB<!-- /default --> | <!-- default:Cache.groupwareLarge -->512 MiB<!-- /default --> |
| RocksDB block cache ([`cacheSize`](/docs/ref/object/data-store#cachesize), one eighth of memory) | 256 MiB | 1024 MiB | 4096 MiB |
| RocksDB write buffers ([`bufferSize`](/docs/ref/object/data-store#buffersize)) | <!-- default:DataStore.bufferSize -->128 MiB<!-- /default --> | <!-- default:DataStore.bufferSize -->128 MiB<!-- /default --> | <!-- default:DataStore.bufferSize -->128 MiB<!-- /default --> |
| Memory budget ([`maxBufferedMemory`](/docs/ref/object/system-settings#maxbufferedmemory), one quarter of memory) | 512 MiB | 2048 MiB | 8192 MiB |
| **Total of the limits at the defaults** | **2429 MiB** | **4733 MiB** | **13949 MiB** |

On the 2 GiB host, the limits add up to more than the host's memory before connections and sessions are even counted. Whether this matters depends on the two large-account caches, which are filled only by accounts too large for the main caches. At the default [`messages`](/docs/ref/object/cache#messages) size, such an account holds about 5.6 million messages or more. On the groupware side, it has a calendar, address book or file tree too large for its cache, such as about 270000 events at the default [`events`](/docs/ref/object/cache#events) size.

On a small host these caches normally stay empty, and the other limits then add up to 1405 MiB at the defaults. A small host that does hold such accounts needs lower [`messagesLarge`](/docs/ref/object/cache#messageslarge) and [`groupwareLarge`](/docs/ref/object/cache#groupwarelarge) values and an explicit `maxBufferedMemory`.

The limits are maximums, not resident memory. The caches fill only as accounts are used, and the memory budget is reserved only while messages are in transit. As an estimate of how close a busy server comes to the limits, a RocksDB node serving 500 accounts with 1.6 million messages settled at about 12 GiB of resident memory on a 64 GB host during six hours of mixed load. Most of it was the RocksDB block cache, which at one eighth of the memory is 8 GiB, while the message cache held only about 100 MiB. A node running the same load against PostgreSQL stayed at about 650 MiB, because PostgreSQL keeps its cache in its own processes. On both nodes, resident memory grew by less than one percent per hour over the six hours.

Several gauges show where a running node's memory is. The `server.memory` gauge shows the resident memory of the process as a whole. The `cache.messages-size`, `cache.messages-large-size` and `cache.size` gauges show how much of it the caches hold, and `server.buffered-memory-smtp` and `server.buffered-memory-read` show how much the memory budget holds.

## Set the memory budget

Messages in transit can drive memory use up quickly during a burst of large messages, because each one is held in memory while it is received or sent. The memory budget prevents this by limiting the memory that messages in transit may hold. It is set by [`maxBufferedMemory`](/docs/ref/object/system-settings#maxbufferedmemory) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->), and it covers two uses:

- **Inbound SMTP.** Receiving and processing a message holds about two and a half to three times its size from the budget (an estimate) until the message is stored or queued.
- **Reads.** Serving a large message or attachment to an IMAP, JMAP, POP3 or WebDAV client holds about its size, and up to twice that, while it is sent.

The two uses share the budget. Each always has a guaranteed share, and each may also use whatever the other is not using, so neither can starve the other. A single message larger than the budget is never refused for that reason alone. The server also refuses new SMTP transactions before the SMTP share is completely used, so that the transactions already in progress can finish rather than fail halfway.

When `maxBufferedMemory` is not set, the budget is one quarter of the available memory. It cannot be set below 16777216 bytes (16 MiB). [Memory budget](/docs/server/general#memory-budget) describes how the available memory is determined and how clients are refused when the budget is exhausted.

The signals for the budget show which way to adjust it. The gauges `server.buffered-memory-smtp` and `server.buffered-memory-read` report the memory reserved by each use. The configured budget itself is not exported as a metric, so compare the gauges with the configured or derived value. Each refusal increments the `limit.memory-budget` counter and emits a `limit.memory-budget` event at the `warn` level. Together, these signals lead to one of two adjustments:

- Lower the budget when the process is killed for lack of memory while `limit.memory-budget` stays at zero. The budget never refused anything, so it is larger than the memory the host can spare.
- Raise it when `limit.memory-budget` keeps counting while the host has free memory. The budget is then refusing work that the host could handle.

The following command sets the budget to 1073741824 bytes (1 GiB):

```sh
stalwart-cli update SystemSettings --field maxBufferedMemory=1073741824
```

The new value takes effect after a settings reload (see [Applying a change](/docs/performance/#applying-a-change)).

## Errors returned when the budget is full

When a request cannot reserve memory from the budget, the server does not fail it permanently. The client receives a temporary error, whose form depends on the protocol:

| Protocol | Response |
|---|---|
| SMTP | `452 4.3.1 Insufficient system storage, try again later.` in reply to `MAIL FROM`, or after the message data when the message cannot be processed |
| JMAP | HTTP status 503 with `Retry-After: 5` |
| WebDAV, CalDAV, CardDAV | HTTP status 503 with `Retry-After: 5` |
| IMAP | `NO [UNAVAILABLE]`, including on FETCH |
| POP3 | `-ERR [SYS/TEMP]` |

All these responses are temporary, so clients and MTAs that follow the protocols retry the request later, and no data is lost. Occasional refusals during bursts of large messages are therefore expected. Refusals that persist mean one of two things: the budget is too small for the load, or an unusual volume of large messages is arriving.

## Lowering memory use on small hosts

On a small host, the default limits can add up to more than the host's memory, as the worksheet above shows. The following changes bring them down, ordered by how much memory they free on a typical small host:

1. Lower [`messagesLarge`](/docs/ref/object/cache#messageslarge) and [`groupwareLarge`](/docs/ref/object/cache#groupwarelarge), or their idle times [`messagesLargeTtl`](/docs/ref/object/cache#messageslargettl) and [`groupwareLargeTtl`](/docs/ref/object/cache#groupwarelargettl), or set either to 0. Large accounts are then rebuilt more often, and [cache swapping](/docs/performance/caches#tune-cache-swapping) reduces the cost of those rebuilds. The change takes effect after a restart.
2. Set the RocksDB [`cacheSize`](/docs/ref/object/data-store#cachesize) explicitly, as described in [Tuning the data store](/docs/performance/data-store#rocksdb). The change takes effect after a restart.
3. Lower [`messages`](/docs/ref/object/cache#messages), keeping it large enough for the accounts active at the same time. The change takes effect after a restart.
4. With SQLite, lower [`poolMaxConnections`](/docs/performance/data-store#sqlite), since each connection has a 32 MiB page cache. The change takes effect after a restart.
5. Lower [`maxBufferedMemory`](/docs/ref/object/system-settings#maxbufferedmemory). The change takes effect after a settings reload.

Lowering the budget alone is not enough to keep the process within the host's memory. The budget covers only messages in transit, and the caches, the RocksDB block cache and write buffers, the SQLite page caches and the per-connection memory all lie outside it.
