---
sidebar_position: 10
title: "Management"
description: "Read log entries, stored delivery traces and stored metrics through the WebUI, the CLI and the JMAP API."
---

Once the server has recorded telemetry, an administrator needs a way to read it back: to search the log for an error, to look up how a message was delivered, or to retrieve raw metric values for a report. Three objects give this access, one for each kind of record:

- [Log](/docs/ref/object/log) for log entries.
- [Trace](/docs/ref/object/trace) for stored delivery traces.
- [Metric](/docs/ref/object/metric) for stored metrics.

These objects can be listed and read in the WebUI, with the [CLI](/docs/management/cli/) and through the JMAP API. They cannot be created, changed or deleted, because the records belong to the server: the server writes them, and it removes stored traces and metrics when their retention period ends.

:::tip[Enterprise feature]
Stored traces and metrics, and the TracingStore and MetricsStore that hold them, are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart. Log entries are available in both editions.
:::

## Logs

A Log object (found in the WebUI under <!-- breadcrumb:Log --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg> Observability › Logs<!-- /breadcrumb:Log -->) is one line of a log file. Each entry has a `timestamp`, a `level`, the `event` name and the `details` of the line. The WebUI log viewer and `stalwart-cli query Log` search the entries for a text.

The entries are not kept in a database. They are read from the files themselves, so no TracingStore is needed to view them. The server reads every file in the directory of the first enabled [Log tracer](/docs/telemetry/tracing/tracers#log-file), on the node that serves the request. That directory should therefore contain only Stalwart's log files.

Two further points concern the files. Without an enabled Log tracer there are no files to read, and the request fails with `No log tracers configured on the server`. Entries written in the multiline format show only their first line, so the Log tracer used for viewing logs should write single-line entries.

In a cluster, each node reads its own files. The WebUI therefore shows the log of the node that served the WebUI request, not a combined log of the cluster.

## Traces

A Trace object (found in the WebUI under <!-- breadcrumb:Trace --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Inbound Delivery, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Outbound Delivery<!-- /breadcrumb:Trace -->) is a stored delivery trace. It holds the events of one SMTP session that received a message, or of one outbound delivery attempt, together with the `timestamp`, the sender (`from`), the recipients (`to`) and the message `size`.

Traces are recorded unless the TracingStore is `Disabled`, as described in [History](/docs/telemetry/history). They can be searched by queue identifier, event type and keywords. The WebUI shows them as the inbound and outbound delivery history.

## Metrics

A Metric object is one stored data point of a metric. A node records one at each collection interval, unless the MetricsStore is `Disabled`. Its `@type` is `Counter`, `Gauge` or `Histogram`, and it carries the `metric` name, the `timestamp` and the `nodeId` of the cluster node that recorded it (0 on a single node).

The WebUI dashboard draws its charts from these records, and shows the node in its list view. Raw data points can also be queried directly, with `x:Metric/query` or with the CLI, which can filter by node: `stalwart-cli query Metric --where nodeId=1`.

Values are stored as changes since the previous data point of the same node, not as running totals. What `count` means depends on the type:

- For a `Counter`, `count` is the number of events in the interval.
- For a `Histogram`, `count` is the number of observations in the interval and `sum` their total, so `sum` divided by `count` is the average for the interval.
- For a `Gauge`, `count` is the value at the time of recording.

Because each data point covers only its own interval, a total over a period is obtained by summing the data points of each node in that period. The first data point after a node restarts covers the time since the process started.

The metrics store holds a fixed selection of metrics, including the cache, memory, search indexing and task metrics. The `cache.swap-pending` gauge is not among them.
