---
sidebar_position: 1
---

# Overview

Metrics are quantitative measurements of the server's operation, resource use, and workload. They let administrators see how the server behaves over time, spot trends, and react to anomalies. Metric collection in Stalwart is controlled by the [Metrics](/docs/ref/object/metrics) singleton (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->).

## Push and pull exporters

Two export models are supported:

- Push: the server actively sends metric samples to a collection system at regular intervals. Push is simple to configure, and metrics arrive at the collector as they are produced.
- Pull: the collection system queries an HTTP endpoint on the server at a cadence it controls. Pull lets the collector manage the scraping load and is the model used by tools such as Prometheus.

## Supported backends

Stalwart supports both models through a single configuration surface:

- [OpenTelemetry](/docs/telemetry/metrics/opentelemetry) is used for push. It is configured through [`openTelemetry`](/docs/ref/object/metrics#opentelemetry) on the `Metrics` singleton, which is a nested type with variants `Disabled`, `Http`, and `Grpc`.
- [Prometheus](/docs/telemetry/metrics/prometheus) is used for pull. It is configured through [`prometheus`](/docs/ref/object/metrics#prometheus) on the `Metrics` singleton, which is a nested type with variants `Disabled` and `Enabled`.

Both exporters can be configured at the same time when two independent collectors need the same signal.

## Selecting metrics

The set of metrics exported is controlled by [`metrics`](/docs/ref/object/metrics) and [`metricsPolicy`](/docs/ref/object/metrics#metricspolicy) on the `Metrics` singleton. With [`metricsPolicy`](/docs/ref/object/metrics#metricspolicy) set to `exclude` (the default), the listed metrics are suppressed and everything else is emitted; with `include`, only the listed metrics are emitted.

For example, to suppress the noise of `auth.error` and `smtp.error` while leaving every other metric enabled:

```json
{
  "metrics": ["auth.error", "smtp.error"],
  "metricsPolicy": "exclude"
}
```
