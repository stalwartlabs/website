---
sidebar_position: 8
title: "History"
description: "Store message delivery traces and metrics in a database for the WebUI delivery history and dashboard: stores, retention and storage cost."
---

Logs and metric exporters show what the server is doing now, or send it elsewhere. Telemetry history instead keeps records of past activity in the server's own database, so that an administrator can examine them after the fact, for example to find out what happened to a message that a user reported missing. Two kinds of record are kept:

- Delivery traces: the events of each SMTP session that received a message and of each outbound delivery attempt, kept together as one trace per session. They drive the WebUI's inbound and outbound delivery history, in which an administrator can follow what happened to a message.
- Metrics: the values of the server's [metrics](/docs/telemetry/metrics/), recorded by each node at a regular interval. They drive the WebUI dashboard.

The stored records are read through the objects described in [Telemetry management](/docs/telemetry/management).

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Delivery traces

### Tracing store

Delivery traces are kept in the store selected by the [TracingStore](/docs/ref/object/tracing-store) object (found in the WebUI under <!-- breadcrumb:TracingStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Tracing Store<!-- /breadcrumb:TracingStore -->). The choice is about where the write load and the space of the traces should fall:

- `Default` uses the [data store](/docs/storage/data), so no further database is needed.
- `FoundationDb`, `PostgreSql` or `MySql` selects a separate database, with the same fields as the corresponding [storage backends](/docs/storage/backends/).
- `Disabled` turns recording off.

A new installation uses `Default`. With an Enterprise license, traces are therefore recorded in the data store from the start.

### Contents of a trace

A trace is recorded for each SMTP session and delivery attempt that involves a queued message. It contains the session's protocol, authentication, filtering and delivery events, up to 2048 events per trace, and leaves out protocol data and other low-level events. Other sessions are not recorded: neither IMAP, POP3, JMAP and HTTP sessions, nor SMTP sessions that end without a message being queued.

### Searching traces

So that the history can be searched by queue identifier, event type and keywords such as addresses, each trace is also added to the [search index](/docs/storage/indexing). The indexed fields are fixed and cannot be configured.

This indexing is controlled by [`indexTelemetry`](/docs/ref/object/search#indextelemetry) on the Search object. With `indexTelemetry` disabled, traces are still stored but not indexed, so a search of the history finds nothing. A change to the setting takes effect after the `ReloadSettings` [action](/docs/management/tasks-actions/actions) and needs no restart.

### Retention

Traces are kept for the period set by [`holdTracesFor`](/docs/ref/object/data-retention#holdtracesfor) on the [DataRetention](/docs/ref/object/data-retention) object (found in the WebUI under <!-- breadcrumb:DataRetention --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry<!-- /breadcrumb:DataRetention -->), <!-- default:DataRetention.holdTracesFor -->30 days<!-- /default --> by default. The daily data purge then deletes them, as described in [Data retention](/docs/storage/maintenance).

## Metrics

Metrics are kept in the store selected by the [MetricsStore](/docs/ref/object/metrics-store) object (found in the WebUI under <!-- breadcrumb:MetricsStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Metrics Store<!-- /breadcrumb:MetricsStore -->). It offers the same variants as TracingStore and has the same default, `Default`.

Each node records a fixed set of metrics on the schedule set by [`metricsCollectionInterval`](/docs/ref/object/data-retention#metricscollectioninterval), <!-- default:DataRetention.metricsCollectionInterval -->hourly, on the hour<!-- /default --> by default. The records are kept for [`holdMetricsFor`](/docs/ref/object/data-retention#holdmetricsfor), <!-- default:DataRetention.holdMetricsFor -->90 days<!-- /default --> by default.

## Storage cost

The histories are written continuously and grow with the server's activity, so they need planning on a busy server.

Delivery traces take most of the space. Each message received or delivered adds a trace with its events, and an entry in the search index. The space they use is therefore proportional to the mail volume multiplied by `holdTracesFor`. Metrics, by contrast, add one record per metric, node and interval, which is small and nearly constant.

Two settings keep the cost under control. A separate TracingStore keeps the write load and growth of the traces away from the data store, and a shorter `holdTracesFor` reduces the space they use. The space taken by deleted traces is returned according to the rules of the backend, described in [Disk space by backend](/docs/storage/maintenance#disk-space-by-backend).

The following TracingStore keeps delivery traces in a separate PostgreSQL database:

```json
{
  "@type": "PostgreSql",
  "host": "telemetry-db.example.com",
  "database": "stalwart_traces",
  "authUsername": "stalwart",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "TRACES_DB_PASSWORD"}
}
```

The following change to DataRetention shortens the retention of delivery traces to 14 days:

```json
{
  "holdTracesFor": 1209600000
}
```
