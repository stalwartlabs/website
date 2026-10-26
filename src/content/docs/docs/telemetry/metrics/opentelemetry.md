---
sidebar_position: 2
title: "OpenTelemetry"
description: "Push Stalwart's metrics to an OpenTelemetry collector over HTTP or gRPC."
---

An OpenTelemetry collector receives telemetry from many systems and forwards it to the monitoring backend in use. Where Prometheus pulls metrics from the server, OpenTelemetry works the other way round: Stalwart pushes its [metrics](/docs/telemetry/metrics/) to an [OpenTelemetry](https://opentelemetry.io/) collector at a fixed interval. This suits deployments that already route their telemetry through a collector.

The metrics are sent as OTLP data with cumulative temporality. Each export therefore contains the totals of each counter and histogram since the process started, not the change since the last export, and these totals reset when the server restarts.

## Configuration

The exporter is configured in the [`openTelemetry`](/docs/ref/object/metrics#opentelemetry) field of the [Metrics](/docs/ref/object/metrics) object (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). Its `@type` selects the transport: `Disabled`, `Http` or `Grpc`. Until `Http` or `Grpc` is chosen, no metrics are pushed.

Both transports have the following fields:

- `url` is the address of the collector. With `Http`, it is required and used as given, so it typically ends in `/v1/metrics`. With `Grpc`, it has no path, such as `http://otel.example.com:4317`. When it is empty, the standard `OTEL_EXPORTER_OTLP_ENDPOINT` environment variables apply, and `http://localhost:4317` if none is set.
- `interval` is the time between two exports, <!-- default:Metrics.MetricsOtelHttp.interval -->1 minute<!-- /default --> by default.
- `timeout` limits each export.

The transports differ in authentication. The `Http` variant also has `httpAuth` (`Unauthenticated`, `Basic` or `Bearer`), `httpHeaders` and `allowInvalidCerts`. The `Grpc` variant sends no authentication, so the collector must accept unauthenticated connections.

## Cluster and failures

Metrics are pushed only by nodes whose [cluster role](/docs/cluster/configuration/roles) includes the `metricsPush` task, or by every node when no roles are configured. Each node sends its own metrics. Export failures are reported as `telemetry.otel-metrics-exporter-error` events.

## Examples

The following value pushes metrics every 30 seconds to a collector over HTTP, with a bearer token:

```json
{
  "openTelemetry": {
    "@type": "Http",
    "url": "https://otel.example.com:4318/v1/metrics",
    "interval": 30000,
    "httpAuth": {
      "@type": "Bearer",
      "bearerToken": {"@type": "EnvironmentVariable", "variableName": "OTEL_TOKEN"}
    }
  }
}
```

The following value pushes metrics to a collector on the same host over gRPC:

```json
{
  "openTelemetry": {
    "@type": "Grpc",
    "url": "http://127.0.0.1:4317"
  }
}
```
