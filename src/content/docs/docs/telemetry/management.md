---
sidebar_position: 10
title: "Management"
---

Traces, metrics, and log entries are runtime telemetry records produced by the server and retained according to the configured telemetry history. The existing [Live telemetry](/docs/telemetry/live) page covers real-time streaming, and the [History](/docs/telemetry/history) page covers the backends and retention windows that persist this data. Once persisted, the records themselves are accessible as management objects through the [WebUI](/docs/management/webui/), the [CLI](/docs/management/cli/), and the JMAP API.

## Traces

A [Trace](/docs/ref/object/trace) (found in the WebUI under <!-- breadcrumb:Trace --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Inbound Delivery, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Outbound Delivery<!-- /breadcrumb:Trace -->) represents a single message-delivery trace with its associated events: inbound reception, queueing, outbound delivery attempts, and the outcome of each hop. Traces are retrievable by id, filterable by account, remote host, domain, and time range, and are primarily surfaced through the `History` view of the WebUI. Retention is governed by [`holdTracesFor`](/docs/ref/object/data-retention#holdtracesfor) on the [DataRetention](/docs/ref/object/data-retention) object.

:::tip[Enterprise feature]

This object is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Metrics

A [Metric](/docs/ref/object/metric) is a single sampled data point of a server metric (counter, gauge, or histogram variants). Samples are collected on the schedule defined by [`metricsCollectionInterval`](/docs/ref/object/data-retention#metricscollectioninterval) and retained for the duration given by [`holdMetricsFor`](/docs/ref/object/data-retention#holdmetricsfor). Queries support filtering by metric name and time range and drive the Dashboard charts in the WebUI.

Individual samples are consumed by the Dashboard in the WebUI and do not have a dedicated inspection surface; administrators who need raw samples can fetch them through the [CLI](/docs/management/cli/) or the JMAP API.

:::tip[Enterprise feature]

This object is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Logs

A [Log](/docs/ref/object/log) (found in the WebUI under <!-- breadcrumb:Log --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg> Observability › Logs<!-- /breadcrumb:Log -->) is a server log entry captured by the tracing subsystem and persisted to the history store. Unlike traces and metrics, log access is available in the Community Edition. Entries carry a timestamp, level, and the structured keys documented on the [Events](/docs/telemetry/events) page, and can be queried through the same management surfaces.
