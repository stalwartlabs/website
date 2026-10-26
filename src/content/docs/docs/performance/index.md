---
title: "Performance tuning"
description: "Diagnose slowness, find the signal that points to the cause, and choose what to tune."
---

A Stalwart server works well on its default settings in most single-node installations. Some of those defaults are not fixed numbers but follow the host: the RocksDB block cache and the memory budget are both sized from the memory available to the server, so a larger host gets larger limits without any change to the configuration. Tuning therefore starts from a symptom rather than from the settings. The usual symptoms are mailboxes that open slowly, memory that keeps growing, temporary errors returned to clients, and outbound mail or search indexing that falls behind the incoming load.

This section is organised around those symptoms. This page helps identify which part of the server causes a symptom, and points to the page that describes how to fix it. The other pages cover one area each: measuring, caches, memory, the data store, search indexing, mail throughput, connection limits, cluster deployments and the CPU.

Two habits make tuning reliable. The first is to change one setting at a time, because two changes made together cannot be told apart in the results. The second is to compare the same signal before and after the change, so that the effect is measured rather than assumed. Many settings take effect only after a restart, and [Applying a change](#applying-a-change) lists which ones.

## Recognising a server-side problem

When a server is the bottleneck, its own signals show it. The first step is therefore to check those signals, and when clients are slow while the server's signals stay quiet, the cause more likely lies in the client, the network or a proxy in between. The following signals cover the usual bottlenecks:

- The `*.active-connections` gauges, which show the open connections per protocol
- The `server.memory` gauge, which shows the resident memory of the process
- The `limit.*` counters, which count requests refused by a limit
- The `store.pool-error` counter, which counts requests that could not get a database connection
- The `queue.back-pressure` and `queue.concurrency-limit-exceeded` counters for outbound mail

Some temporary errors are themselves a sign of overload. The server holds messages in memory while they are in transit, and the [memory budget](/docs/performance/memory#set-the-memory-budget) limits how much memory they may hold at the same time. When the budget is exhausted, the server refuses further work with a temporary error instead of running out of memory. Clients then receive `452 4.3.1 Insufficient system storage, try again later.` over SMTP, HTTP status 503 with `Retry-After: 5`, IMAP `[UNAVAILABLE]` or POP3 `[SYS/TEMP]`, as described in [Errors returned when the budget is full](/docs/performance/memory#errors-returned-when-the-budget-is-full). These errors indicate load: the server is working as designed, and the question is whether the budget suits the load.

## Establish a baseline

A reading taken after a change means little unless there is an earlier reading to compare it with. Record a baseline before changing anything:

1. Enable a metrics exporter, Prometheus or OpenTelemetry, as described in [Measuring performance](/docs/performance/measuring#enable-metrics).2. When a metric points to the caches or the limits and more detail is needed, add a tracer that records the `cache.*` and `limit.*` events at the `debug` level for a limited time, as described in [Log cache and limit events](/docs/performance/measuring#log-cache-and-limit-events).
3. Record the values of the relevant signals under normal load.

The cache counters illustrate why the events are sometimes needed. The `cache.hit`, `cache.miss` and `cache.stale` counters give the hit rate of the account, access token and directory caches together. A falling rate therefore shows that some cache misses more often, but not which one. The cache events then show which cache and which account are involved.

## Find the cause from the symptom

Each symptom has a signal that confirms or rules out its most likely cause. The following table lists the common symptoms, most frequent first, with the signal to check first and the page that covers the fix:

| Symptom | First signal to check | Likely cause | Page |
|---|---|---|---|
| One large mailbox is slow, or every mailbox is slow after a restart | `cache.miss`, `cache.stale` and `cache.entry-too-large` counters; `cache.miss` events for collection `email` with a high `elapsed` | Email data cache too small, or large accounts rebuilt | [Caches](/docs/performance/caches#size-the-message-cache); for restarts, [cache swapping](/docs/performance/caches#tune-cache-swapping) |
| Memory grows or the process is killed for lack of memory | `server.memory`, `cache.messages-size`, `cache.messages-large-size`, `cache.size`, `server.buffered-memory-smtp`, `server.buffered-memory-read`, `limit.memory-budget` | Caches, RocksDB block cache and memory budget together exceed the host's memory | [Memory](/docs/performance/memory#default-limits-by-host-size) |
| Clients receive temporary errors (SMTP `452 4.3.1`, HTTP 503) | `limit.memory-budget`, `server.buffered-memory-smtp`, `server.buffered-memory-read` | Memory budget too small for the load | [Memory](/docs/performance/memory#set-the-memory-budget) |
| Calendars, contacts or files are slow for one large account | `cache.entry-too-large` events naming the `events`, `contacts` or `files` cache | Account larger than its groupware cache | [Caches](/docs/performance/caches#calendars-contacts-and-files) |
| Search results lag or are incomplete | `search-index.pending-*` gauges; failed partitions in the IndexQueueStatus view of the index queue | Indexing slower than the incoming load, or failed partitions | [Search indexing](/docs/performance/search-indexing); failures in [Search indexing](/docs/storage/indexing) |
| Database timeouts or errors | `store.pool-error`; configuration warnings on `poolMaxConnections` | Connection pool too small, or database server limits too low | [Data store](/docs/performance/data-store) |
| Outbound mail backs up | `queue.back-pressure`, `queue.count`, `delivery.active-connections` | Too few delivery threads, or slow remote hosts | [Mail throughput](/docs/performance/mail-throughput#outbound-queue-throughput) |
| Inbound mail is accepted slowly or CPU is high during intake | `message-ingest.time`, `ai.request-time` | Spam filter, URL redirect or AI classification cost | [Mail throughput](/docs/performance/mail-throughput#inbound-processing-cost) |
| CPU use per message is high on x86_64 | `avx2` missing from the processor flags seen by the server | Old processor, or a virtual CPU model that hides AVX2 | [CPU instruction sets](/docs/performance/cpu) |
| Connections are refused or clients are throttled | `limit.concurrent-connection`, `limit.concurrent-request`, `limit.too-many-requests` | Listener or per-account limit reached | [Connections](/docs/performance/connections) |
| Problems appear only on a cluster | `cluster.*` error events; accounts slow on whichever node serves them | Per-node caches, coordinator delays | [Cluster](/docs/performance/cluster) |
| Log entries go missing under load | `telemetry.events-dropped` | A tracer cannot keep up | Lower the tracer level or narrow its event filters (see [Tracing](/docs/telemetry/tracing/)) |

## Applying a change

Saving an object stores the new value, but it does not reload the server. The WebUI also does not mark which settings need a restart, so a saved change can appear to have no effect when the server has not read it yet.

Settings fall into two groups. Most tuning settings take effect after a settings reload, which includes the memory budget, the protocol limits, the spam filter and the tracers. A reload is started with the `ReloadSettings` action from the WebUI, or with the CLI:

```sh
stalwart-cli create Action/ReloadSettings
```

The second group is read only when the server starts, so its settings take effect only after a restart. It contains the cache, store and listener settings and the search indexing concurrency. [Applying changes](/docs/configuration/#applying-changes) lists the settings in each group, and [Tuning a cluster](/docs/performance/cluster#applying-changes-on-every-node) describes how to apply them on every node of a cluster.

## Settings that cannot be tuned

Two values that affect performance have no setting in the registry, so no change to the configuration alters them:

- The freshness window is fixed at five seconds. During this window a cached account is used without checking the data store for changes.
- The number of worker threads is one per CPU core. Only the `TOKIO_WORKER_THREADS` environment variable changes it, as described in [Worker threads](/docs/performance/connections#worker-threads) and [Environment variables](/docs/configuration/environment-variables).
