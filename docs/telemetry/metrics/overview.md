---
sidebar_position: 1
---

# Overview

Metrics are quantitative measurements of the server's operation, resource use, and workload. They let administrators see how the server behaves over time, spot trends, and react to anomalies. Metric collection in Stalwart is controlled by the [Metrics](/docs/ref/object/metrics) singleton (found in the WebUI under <!-- breadcrumb:Metrics --><!-- /breadcrumb:Metrics -->).

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

The set of metrics exported is controlled by [`metrics`](/docs/ref/object/metrics#metrics) and [`metricsPolicy`](/docs/ref/object/metrics#metricspolicy) on the `Metrics` singleton. With [`metricsPolicy`](/docs/ref/object/metrics#metricspolicy) set to `exclude` (the default), the listed metrics are suppressed and everything else is emitted; with `include`, only the listed metrics are emitted.

For example, to suppress the noise of `auth.error` and `smtp.error` while leaving every other metric enabled:

```json
{
  "metrics": ["auth.error", "smtp.error"],
  "metricsPolicy": "exclude"
}
```

<!-- review: The previous docs used a `metrics.disabled-events` array to turn specific metrics off. The current Metrics singleton exposes `metrics` + `metricsPolicy` (`include`/`exclude`). Confirm that this is the correct one-to-one replacement, and that the enum values accepted in `metrics` match the old event-name entries. -->
