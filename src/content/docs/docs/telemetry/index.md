---
sidebar_position: 1
title: "Overview"
description: "The telemetry facilities of Stalwart: events and tracers, metrics, webhooks, alerts, live telemetry and stored history, and a recommended production setup."
---

Telemetry is how an administrator finds out what the server is doing: why a message was rejected, whether the outbound queue is growing, or when a database started returning errors. Stalwart reports its activity as events. An event is a single thing that happened, such as an accepted connection, a delivered message, a failed authentication or a rebuilt cache.

Every event has a name, a severity level and a set of key-value pairs that describe it. From these events the server also derives metrics: counters and other measurements that summarise activity over time, such as the number of messages delivered.

The telemetry facilities decide where events and metrics go, and each serves a different purpose:

- [Tracers](/docs/telemetry/tracing/) write events to a log file, the console, the systemd journal or an OpenTelemetry collector. Each tracer has its own level and event filter. The events and their levels are described in [Events](/docs/telemetry/events).
- [Metrics](/docs/telemetry/metrics/) are exported to Prometheus or an OpenTelemetry collector, for an existing monitoring system.
- [Webhooks](/docs/telemetry/webhooks) post selected events to an HTTP endpoint, so that other systems can react to them.
- [Alerts](/docs/telemetry/alerts) evaluate conditions on metrics and send an email or emit an event when they hold (Enterprise).
- [Live telemetry](/docs/telemetry/live) streams events and metrics to the WebUI or another HTTP client in real time (Enterprise).
- [History](/docs/telemetry/history) stores message delivery traces and metrics in a database, for the WebUI's delivery history and dashboard (Enterprise).

Logs, stored traces and stored metrics can be read back from the WebUI, the CLI and the API. [Telemetry management](/docs/telemetry/management) describes the objects through which this is done.

## Recommended setup

A production server typically needs four things.

First, one tracer at level `info`. It writes to a log file, or to the console when the container runtime or systemd collects the output. A log file has an extra advantage: the WebUI's log viewer reads the files of a [Log tracer](/docs/telemetry/tracing/tracers#log-file), so a Log tracer is needed to view logs there.

Some details that administrators often look for are logged at `debug`, below that level: per-attempt delivery details, authentication failures and spam filter verdicts, as listed in [Events](/docs/telemetry/events). Raising those individual events to `info` is preferable to running a whole tracer at `debug`, because the log stays readable.

Second, metrics exported to the monitoring system in use, through the [Prometheus](/docs/telemetry/metrics/prometheus) endpoint or an [OpenTelemetry](/docs/telemetry/metrics/opentelemetry) collector.

Third, monitoring of a few signals that indicate trouble:

- The size of the outbound queue (`queue.count`).
- Store errors, such as `store.postgresql-error` or `store.s3-error`.
- The memory used by the server (`server.memory`).
- The `telemetry.events-dropped` event, which reports that tracers could not keep up and that the logs are incomplete.

With the Enterprise edition, the same conditions can be configured as [alerts](/docs/telemetry/alerts), without an external monitoring system.

Fourth, for the WebUI dashboard and delivery history, the [MetricsStore and TracingStore](/docs/telemetry/history) (Enterprise). A new installation keeps both in the data store, where they take up space. Plan for that space, or set them to `Disabled`.

[Measuring performance](/docs/performance/measuring) describes which metrics to watch when investigating performance.
