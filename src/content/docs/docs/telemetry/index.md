---
sidebar_position: 1
title: "Overview"
---

Telemetry covers the collection, transmission, and analysis of data from a running system, used to monitor performance, diagnose issues, and guide operational decisions. In Stalwart, telemetry provides the signals administrators rely on to understand system behaviour, track performance, and validate reliability and security.

Stalwart exposes several mechanisms for capturing logs, traces, and metrics. The available telemetry facilities are:

- [Tracing and logging](/docs/telemetry/tracing/): detailed trace and log output, configured through the [Tracer](/docs/ref/object/tracer) object. Output can go to a log file, standard error, the systemd journal, or an OpenTelemetry collector.
- [Metrics](/docs/telemetry/metrics/): quantitative measurements of server activity and resource use, configured through the [Metrics](/docs/ref/object/metrics) singleton.
- [Webhooks](/docs/telemetry/webhooks): HTTP callbacks that deliver event notifications to external systems, configured through the [WebHook](/docs/ref/object/web-hook) object.
- [Live telemetry](/docs/telemetry/live): real-time streaming of events and metrics over HTTP using Server-Sent Events.
- [Alerts](/docs/telemetry/alerts): rules that fire when a metric condition is met, configured through the [Alert](/docs/ref/object/alert) object.
- [History](/docs/telemetry/history): persisted traces and metrics retained for later analysis, configured through the [TracingStore](/docs/ref/object/tracing-store) and [MetricsStore](/docs/ref/object/metrics-store) singletons together with the [DataRetention](/docs/ref/object/data-retention) object.

These mechanisms let administrators observe the operational state of Stalwart, identify and resolve issues, and tune performance.
