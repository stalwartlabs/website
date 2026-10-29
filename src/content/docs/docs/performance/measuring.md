---
title: "Measuring performance"
description: "Find the bottleneck before changing settings: the metrics, events and traces that show where time and memory go."
sidebar_position: 1
---

Tuning without measurement is guesswork, because a setting that looks too small may not be the one that limits the server. Every tuning decision in this section therefore starts from a signal: a counter that rises, a gauge that reaches its limit, or an event that names the account involved and the time spent. This page sets up those signals and explains how to read them.

The signals are only useful when they can be compared. Record a baseline before changing any setting, change one setting at a time, and compare the same signal afterwards, so that each change can be judged by its own effect.

Stalwart provides two kinds of signal, which differ in cost and in detail. Metrics are counters, gauges and histograms that the server exports to Prometheus or OpenTelemetry. They are cheap to collect, so they suit graphs and alerts, but they aggregate: a counter says that cache misses rose, not which account missed. Events are individual occurrences recorded by a tracer, and they carry the detail behind a metric, such as which account missed the cache and how long its rebuild took. Start with the metrics, and add events only when the metrics point to a problem that needs more detail.

## Enable metrics

The server makes its metrics available in two ways. A [Prometheus](/docs/telemetry/metrics/prometheus) server can scrape them from an endpoint that Stalwart exposes, or Stalwart can push them to an [OpenTelemetry](/docs/telemetry/metrics/opentelemetry) collector. Both exporters are configured on the [Metrics](/docs/ref/object/metrics) singleton, and a change to the exporter settings takes effect after a settings reload (see [Applying a change](/docs/performance/#applying-a-change)).

The exporters publish each metric under a name derived from its identifier, as described in [Exported names](/docs/telemetry/metrics/#exported-names). The counter `cache.hit`, for example, is scraped by Prometheus as `stalwart_cache_hit_total`, and the queries on these pages use the scraped names. The tables on these pages list the identifiers, which are also the names that alerts and the WebUI dashboard use.

The following metrics are the ones the pages in this section refer to. The complete list is on the [Metrics](/docs/ref/metrics) reference page.

| Metric | Type | What a change means |
|---|---|---|
| `cache.hit`, `cache.miss`, `cache.stale` | counter | Lookups served from memory, built from the data store, or rebuilt after the change log, the per-account history of changes, was truncated. The account, access token and directory caches share one counter of each kind, and the DNS caches are not counted. |
| `cache.entry-too-large` | counter | An account did not fit in its cache. All caches share one counter. |
| `cache.messages-size` | gauge, bytes | Memory held by the email data cache. |
| `cache.messages-large-size` | gauge, bytes | Memory held by the caches of accounts too large for the email data cache. |
| `cache.size` | gauge, bytes | Memory held by all other caches together, including the large-account tier for groupware. |
| `cache.swap-hit`, `cache.swap-miss`, `cache.swap-write`, `cache.swap-error` | counter | Cache snapshots loaded, not found, written, and failed (see [Tune cache swapping](/docs/performance/caches#tune-cache-swapping)). |
| `cache.swap-pending` | gauge | Cache snapshots with changes not yet written. |
| `server.memory` | gauge, bytes | Resident memory of the process (Working Set on Windows), refreshed every five minutes. |
| `server.buffered-memory-smtp`, `server.buffered-memory-read` | gauge, bytes | Memory reserved from the [memory budget](/docs/performance/memory#set-the-memory-budget) by inbound SMTP and by messages and blobs served to clients. |
| `limit.memory-budget` | counter | A request was refused because the memory budget was exhausted. |
| `limit.concurrent-connection` | counter | A listener refused a connection at its connection limit. |
| `limit.concurrent-request` | counter | An account reached a concurrent request or connection limit. |
| `limit.too-many-requests` | counter | A client reached a rate limit. |
| `store.pool-error` | counter | The data store could not provide a database connection. |
| `queue.back-pressure` | counter | A delivery queue was at its thread limit while messages were waiting. |
| `queue.concurrency-limit-exceeded`, `smtp.concurrency-limit-exceeded` | counter | An outbound or inbound concurrency throttle was reached. |
| `queue.count` | gauge | Messages in the outbound queue. |
| `delivery.active-connections` | gauge | Outbound delivery attempts in progress. |
| `imap.active-connections`, `http.active-connections`, `smtp.active-connections`, `pop3.active-connections`, `sieve.active-connections` | gauge | Open client connections per protocol. |
| `search-index.pending-email`, `-calendar`, `-contacts`, `-file`, `-tracing` | gauge | Documents waiting to be indexed, by index type. |
| `search-index.batch-indexed`, `search-index.partition-retry`, `search-index.document-truncated` | counter | Index batches written, index partitions scheduled for retry, and documents indexed only in part. |
| `task-manager.pending`, `task-manager.due` | gauge | Background tasks queued, and tasks due that have not run yet. Failed tasks are not counted. |
| `task-manager.task-retry`, `task-manager.task-stalled`, `task-manager.task-failed`, `task-manager.task-expired` | counter | Background tasks rescheduled after a failure, marked as stalled after repeated failures, failed permanently, or discarded because they expired. |
| `telemetry.events-dropped` | counter | A tracer could not keep up and events were lost. |
| `search-index.index-time` | histogram | Time to build and write one batch of documents to the search index. |
| `store.data-read-time`, `store.data-write-time`, `store.blob-read-time`, `store.blob-write-time` | histogram | Data store and blob store latency. `store.data-read-time` measures range reads (iterations), not single-key lookups. |
| `message-ingest.time` | histogram | Time to store one incoming message. |
| `delivery.total-time` | histogram | Time from submission to delivery. |
| `dns.lookup-time` | histogram | DNS lookup latency. |
| `imap.request-time`, `http.request-time`, `smtp.request-time` and the other `*.request-time` histograms | histogram | Connection duration, from accept to close. These histograms do not measure the latency of individual requests. |

Gauges are sampled, and the sampling interval decides what they can show. The gauges `cache.messages-size`, `cache.messages-large-size`, `cache.size` and `server.memory`, the `search-index.pending-*` gauges and the task manager gauges are refreshed every five minutes. A short spike can therefore fall between two samples and never appear in a graph. The memory budget gauges are refreshed more often, at every Prometheus scrape and every OpenTelemetry push.

## Log cache and limit events

The cache counters add up the account, access token and directory caches into one figure. When a counter shows a problem, only the events can say which cache and which account caused it. Each account cache event names the collection it belongs to: `email`, `calendar`, `addressBook`, `fileNode`, or `calendarEventNotification` for scheduling. The email events also carry the account, the time spent and the number of messages and mailboxes involved.

The cache events are not logged by default. They are emitted at the `debug` level, while a tracer records events at <!-- default:Tracer.Log.level -->`info`<!-- /default --> and above unless its level is changed. Raising the main tracer to `debug` would record them, but it also records every other debug event, which produces a large volume of output and can make the tracer fall behind and drop events (reported as `telemetry.events-dropped`). A dedicated [tracer](/docs/telemetry/tracing/) that records only the cache and limit events avoids both problems. The following [Tracer](/docs/ref/object/tracer) (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->) writes those events to a separate log file at the `debug` level:

```json
{
  "@type": "Log",
  "path": "/var/log/stalwart",
  "prefix": "cache.log",
  "rotate": "daily",
  "level": "debug",
  "eventsPolicy": "include",
  "events": {
    "cache.hit": true,
    "cache.miss": true,
    "cache.stale": true,
    "cache.update": true,
    "cache.entry-too-large": true,
    "cache.swap-hit": true,
    "cache.swap-miss": true,
    "cache.swap-metrics": true,
    "limit.memory-budget": true,
    "limit.concurrent-connection": true,
    "limit.concurrent-request": true,
    "limit.too-many-requests": true
  }
}
```

The event filter has no wildcard for a whole group of events, so the example lists each event individually. The tracer takes effect after a settings reload. It is meant for a limited measurement only: `cache.hit` is emitted on almost every request, so the log grows quickly. Once the measurement is complete, disable the tracer by setting `enable` to `false`.

Each cache event describes one step in the life of a cached account, and the following table lists what each one means for tuning:

| Event | Fields | Meaning for tuning |
|---|---|---|
| `cache.hit` | account, collection, change id, elapsed | The account was served from memory. |
| `cache.update` | the same, plus totals and the number of changes applied | The cached account was brought up to date from the change log. This is the normal path once the five seconds during which a cached account is used unchecked have passed. |
| `cache.miss` | the same, plus totals | The account was not cached and was built from the data store. `elapsed` is the cost of the build. |
| `cache.stale` | the same, plus totals | The change log no longer reached back to the cached state, so the account was rebuilt in full. |
| `cache.entry-too-large` | cache name, size, limit | The account's data is larger than its cache can admit, so it was not cached. `size` is the value to compare with the cache setting. |
| `cache.swap-hit`, `cache.swap-miss`, `cache.swap-metrics` | see [Cache swapping](/docs/storage/cache-swap) | Snapshot activity, described in [Tune cache swapping](/docs/performance/caches#tune-cache-swapping). |

The totals differ by collection. On email events they are the number of messages and the number of mailboxes in the account, while calendar, contact and file events carry a single count.

Events for the directory and access token caches carry less: only the key and an internal cache name. That name differs from the field name on the Cache object, so `email` stands for `emailAddresses` and `list` for `mailingLists`, for example. The full descriptions are in the [Cache](/docs/ref/events#cache) section of the events reference.

## Cache hit rates

The hit rate is the share of lookups served from memory over a time window. A high rate means that most requests avoid the data store, and a falling rate means that more requests have to build or rebuild cached data. The following Prometheus query computes the overall rate over five minutes:

```text
rate(stalwart_cache_hit_total[5m]) / (rate(stalwart_cache_hit_total[5m]) + rate(stalwart_cache_miss_total[5m]) + rate(stalwart_cache_stale_total[5m]))
```

The counters include all account, token and directory caches. A falling rate therefore shows that some cache is missing more often, but not which one, and the events from the dedicated tracer then show which cache and which accounts are involved.

The gauges answer a different question: whether a cache is full. When `cache.messages-size` stays at the configured [`messages`](/docs/ref/object/cache#messages) size, the email data cache is full and is evicting accounts to make room for others. No such conclusion is possible for `cache.size`, because it adds up all the other caches and so cannot show that one particular cache is full.

## Watch the index queue

The server does not index messages, calendar events, contacts and files at the moment they are stored. It adds them to the search index in the background, through the index queue described in [Search indexing](/docs/storage/indexing), and the length of that queue shows whether indexing keeps up.

The `search-index.pending-*` gauges report how many documents of each index type are waiting. They are computed every five minutes by a scan that stops at 250000 entries, so a gauge at that value means at least that many, not exactly that many. The [IndexQueueStatus](/docs/ref/object/index-queue-status) object gives the same information per partition, together with the partitions that failed and the time of their next retry. Its counts stop at 10000 items per request, so they are lower bounds in the same way.

A growing queue is not always a problem. A queue that grows after a large import and then drains needs no action. A queue that keeps growing under normal load means that indexing is slower than the incoming data, which is covered in [Speeding up search indexing](/docs/performance/search-indexing).
