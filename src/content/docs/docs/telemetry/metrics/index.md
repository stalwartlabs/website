---
sidebar_position: 1
title: "Overview"
description: "The metrics Stalwart collects, how they are exported to Prometheus or OpenTelemetry, how to select them, and what the WebUI dashboard needs."
---

Events describe individual occurrences. Metrics summarise them: they are numeric measurements of the server's activity, which make trends visible, such as a growing queue or a rising error rate, and which a monitoring system can chart and alert on. Stalwart collects its metrics continuously in memory and exports them to a monitoring system.

There are three kinds of metric, each suited to a different kind of measurement:

- Counters count events since the server started, such as `delivery.delivered` (messages delivered) or `auth.failed` (failed authentications). Many events have a counter of the same name.
- Gauges report a current value, such as `queue.count` (messages in the outbound queue), `server.memory` (memory used by the server) or `cache.size`.
- Histograms record the distribution of a duration or size, such as `delivery.attempt-time` or `store.data-read-time`.

Counters are kept per process, so they start from zero when the server restarts. The complete list of metrics, with their units, is in the [metrics reference](/docs/ref/metrics).

## Exporting metrics

Metrics are configured on the [Metrics](/docs/ref/object/metrics) object (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). It supports two exporters, which differ in which side starts the transfer, and both can be used at the same time:

- [Prometheus](/docs/telemetry/metrics/prometheus): Stalwart serves the metrics on an HTTP endpoint, and the Prometheus server collects them at its own interval.
- [OpenTelemetry](/docs/telemetry/metrics/opentelemetry): Stalwart sends the metrics to an OpenTelemetry collector at a fixed interval.

In a cluster, each node exports its own metrics, and the monitoring system sums or compares them across nodes. Only nodes whose [cluster role](/docs/cluster/configuration/roles) includes the `metricsPush` task push metrics to an OpenTelemetry collector. Metrics that require queries against the stores are calculated every five minutes by the nodes with the `metricsCalculate` task.

## Exported names

Inside Stalwart, each metric is known by its identifier, such as `delivery.attempt-time`. Alerts, the `metric` expression function, the WebUI dashboard and the [metrics reference](/docs/ref/metrics) all use these identifiers. Monitoring systems have naming conventions of their own, however, so the exporters do not send the identifiers unchanged. Each exporter derives the name of a metric from its identifier by fixed rules, which means that a metric always has the same exported name and the name can be worked out from the reference.

OpenTelemetry names follow the OpenTelemetry semantic conventions. The exporter prepends `stalwart.` to the identifier and replaces each hyphen with an underscore, so `delivery.attempt-time` is exported as `stalwart.delivery.attempt_time`. The unit is not part of the name: it travels in a separate field, written in the UCUM notation that OpenTelemetry uses, such as `By` for bytes, `s` for seconds, and a word in braces for counted items, such as `{connection}` or `{message}`. Event counters have the unit `{event}`.

Prometheus names carry the unit in the name instead. Starting from the OpenTelemetry name, every dot becomes an underscore, a unit suffix is appended (`_bytes` for bytes and `_seconds` for durations), and counters end in `_total`. Units written in braces are annotations, and add no suffix. These are the names that Prometheus itself produces when it receives OpenTelemetry metrics through its OTLP receiver with the default translation, so a metric keeps its name whether Prometheus scrapes it or receives it from a collector.

Both exporters report durations in seconds, the base unit that both ecosystems expect. The server records durations in milliseconds, which is the unit the metrics reference lists, and the exporters convert them: a delivery attempt of 250 milliseconds is exported as 0.25.

The following examples show one metric of each kind:

| Identifier | Kind | OpenTelemetry name and unit | Prometheus name |
|---|---|---|---|
| `cache.hit` | counter | `stalwart.cache.hit`, `{event}` | `stalwart_cache_hit_total` |
| `server.memory` | gauge | `stalwart.server.memory`, `By` | `stalwart_server_memory_bytes` |
| `imap.active-connections` | gauge | `stalwart.imap.active_connections`, `{connection}` | `stalwart_imap_active_connections` |
| `delivery.attempt-time` | histogram | `stalwart.delivery.attempt_time`, `s` | `stalwart_delivery_attempt_time_seconds` |

Three gauges are exceptions to these rules. Their names would end in `_count`, a suffix that Prometheus reserves for the sample count of histograms, so they are exported under different names: `queue.count` as `stalwart.queue.messages` (`stalwart_queue_messages`), `user.count` as `stalwart.users` (`stalwart_users`) and `domain.count` as `stalwart.domains` (`stalwart_domains`).

## Selecting metrics

[`metrics`](/docs/ref/object/metrics#metrics) and [`metricsPolicy`](/docs/ref/object/metrics#metricspolicy) restrict the metrics exported, for example to keep unneeded series out of the monitoring system. With `metricsPolicy` set to `exclude`, the listed metrics are omitted and all others are exported. With `include`, only the listed metrics are exported. The policy is <!-- default:Metrics.metricsPolicy -->`exclude`<!-- /default --> by default, so every metric is exported until some are listed.

The following value omits two counters:

```json
{
  "metrics": {"auth.error": true, "smtp.error": true},
  "metricsPolicy": "exclude"
}
```

## Cache metrics

The cache metrics show how well the caches serve their purpose of answering requests from memory instead of the data store. Four counters cover all caches together:

- `cache.hit`: a request served from memory.
- `cache.miss`: a cache built from the data store.
- `cache.stale`: a cache rebuilt because its change history was no longer available.
- `cache.entry-too-large`: an entry too large to be cached.

Three gauges report the memory the caches use: `cache.messages-size` for the message cache, `cache.messages-large-size` for the caches of large accounts and `cache.size` for all other caches. Details for individual caches are available only in the events of the `cache` group. [Sizing the caches](/docs/performance/caches) explains how to interpret these values.

## Search indexing metrics

Messages and other items are indexed for full-text search after they are stored, and these metrics show whether indexing keeps up. The work itself is reported by the histogram `search-index.index-time` and the counters `search-index.batch-indexed`, `search-index.partition-retry` and `search-index.document-truncated`. The backlog is reported by the gauges `search-index.pending-email`, `search-index.pending-calendar`, `search-index.pending-contacts`, `search-index.pending-file` and `search-index.pending-tracing`, which count the items waiting to be indexed. [Search indexing](/docs/storage/indexing#signals) describes what each one means.

## WebUI dashboard

The WebUI dashboard shows charts of the server's metrics over time. Its history comes from a metrics store, in which each node records its metrics at a regular interval.

A new installation keeps the metrics store in the data store. With the [MetricsStore](/docs/telemetry/history) set to `Disabled`, nothing is recorded and the dashboard is empty. [Measuring performance](/docs/performance/measuring) describes which metrics to watch and how they relate to performance problems.

:::tip[Enterprise feature]
The metrics dashboard and the metrics store are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::
