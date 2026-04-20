---
sidebar_position: 10
---

# Management

Traces, metrics, and log entries are runtime telemetry records produced by the server and retained according to the configured telemetry history. The existing [Live telemetry](/docs/telemetry/live) page covers real-time streaming, and the [History](/docs/telemetry/history) page covers the backends and retention windows that persist this data. Once persisted, the records themselves are accessible as management objects through the [WebUI](/docs/management/webui/overview), the [CLI](/docs/management/cli/overview), and the JMAP API.

## Traces

A [Trace](/docs/ref/object/trace) (found in the WebUI under <!-- breadcrumb:Trace --><!-- /breadcrumb:Trace -->) represents a single message-delivery trace with its associated events: inbound reception, queueing, outbound delivery attempts, and the outcome of each hop. Traces are retrievable by id, filterable by account, remote host, domain, and time range, and are primarily surfaced through the `History` view of the WebUI. Retention is governed by [`holdTracesFor`](/docs/ref/object/data-retention#holdtracesfor) on the [DataRetention](/docs/ref/object/data-retention) object.

:::tip Enterprise feature

This object is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Metrics

A [Metric](/docs/ref/object/metric) is a single sampled data point of a server metric (counter, gauge, or histogram variants). Samples are collected on the schedule defined by [`metricsCollectionInterval`](/docs/ref/object/data-retention#metricscollectioninterval) and retained for the duration given by [`holdMetricsFor`](/docs/ref/object/data-retention#holdmetricsfor). Queries support filtering by metric name and time range and drive the Dashboard charts in the WebUI.

Individual samples are consumed by the Dashboard in the WebUI and do not have a dedicated inspection surface; administrators who need raw samples can fetch them through the [CLI](/docs/management/cli/overview) or the JMAP API.

:::tip Enterprise feature

This object is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Logs

A [Log](/docs/ref/object/log) (found in the WebUI under <!-- breadcrumb:Log --><!-- /breadcrumb:Log -->) is a server log entry captured by the tracing subsystem and persisted to the history store. Unlike traces and metrics, log access is available in the Community Edition. Entries carry a timestamp, level, and the structured keys documented on the [Events](/docs/telemetry/events) page, and can be queried through the same management surfaces.
