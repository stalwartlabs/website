---
sidebar_position: 2
title: "OpenTelemetry"
description: "Push Stalwart's metrics to an OpenTelemetry collector over HTTP or gRPC."
---

An OpenTelemetry collector receives telemetry from many systems and forwards it to the monitoring backend in use. Where Prometheus pulls metrics from the server, OpenTelemetry works the other way round: Stalwart pushes its [metrics](/docs/telemetry/metrics/) to an [OpenTelemetry](https://opentelemetry.io/) collector at a fixed interval. This suits deployments that already route their telemetry through a collector.

The metrics are sent as OTLP data with cumulative temporality. Each export therefore contains the totals of each counter and histogram since the process started, not the change since the last export, and these totals reset when the server restarts. Metric names start with `stalwart.` and units follow the OpenTelemetry conventions, with durations in seconds; [Exported names](/docs/telemetry/metrics/#exported-names) describes how they are derived from the metric identifiers.

## Configuration

The exporter is configured in the [`openTelemetry`](/docs/ref/object/metrics#opentelemetry) field of the [Metrics](/docs/ref/object/metrics) object (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). Its `@type` selects the transport: `Disabled`, `Http` or `Grpc`. Until `Http` or `Grpc` is chosen, no metrics are pushed.

Both transports have the same fields:

- `url` is the address of the collector, which each transport reads differently, as described in [Collector address](#collector-address).
- `interval` is the time between two exports, <!-- default:Metrics.MetricsOtelHttp.interval -->1 minute<!-- /default --> by default.
- `timeout` is the time allowed for one export, retries included, <!-- default:Metrics.MetricsOtelHttp.timeout -->10 seconds<!-- /default --> by default. A value below 100 milliseconds is raised to 100 milliseconds, and an export never runs longer than `interval`, so that it ends before the next one is due.
- `httpAuth` sets the authentication: `Unauthenticated`, `Basic` with `username` and `secret`, or `Bearer` with `bearerToken`.
- `httpHeaders` adds other headers, such as a tenant identifier that the backend requires.
- `allowInvalidCerts` accepts a TLS certificate that cannot be verified, such as a self-signed certificate on a collector in a private network.

Authentication, headers and the TLS setting apply to both transports. Over gRPC, the headers are sent as request metadata. Some headers are set by the protocol itself and would break the request if replaced, so they are ignored when they appear in `httpHeaders`: `Content-Type`, `Content-Length`, `Host`, `User-Agent`, `TE`, `Connection`, `Keep-Alive`, `Proxy-Connection`, `Transfer-Encoding`, `Upgrade`, and every header whose name starts with `grpc-`.

### Collector address

With `Http`, `url` is required and is the base address of the collector, such as `https://otel.example.com:4318`. OTLP collectors receive metrics at the path `/v1/metrics`, and the exporter appends that path to the path of the base address, so that a collector behind a gateway at `https://gateway.example.com/otlp` receives the metrics at `https://gateway.example.com/otlp/v1/metrics`. A `url` that already ends in `/v1/metrics` is accepted as well: the exporter removes that suffix before it appends the path.

With `Grpc`, `url` gives the scheme, host and port of the collector, such as `http://otel.example.com:4317`. A gRPC request names its service in the request itself, so any path in `url` is ignored. When `url` is not set, the exporter connects to `http://localhost:4317`, the standard OTLP gRPC port on the same host.

For both transports, the scheme decides whether the connection is encrypted: `https` connects over TLS, and `http` sends the data in clear text. gRPC over `http` uses HTTP/2 without TLS.

The standard `OTEL_*` environment variables, such as `OTEL_EXPORTER_OTLP_ENDPOINT`, are not read: the collector address and the [resource attributes](#resource-attributes) come only from the configuration.

## Resource attributes

Each export carries resource attributes, which tell the backend which service and which process sent the data. Three fields of the [Metrics](/docs/ref/object/metrics) object set them, and they apply to the metrics exporter and to every [OpenTelemetry tracer](/docs/telemetry/tracing/opentelemetry) alike:

- [`serviceName`](/docs/ref/object/metrics#servicename) is sent as `service.name`, and is <!-- default:Metrics.serviceName -->`stalwart`<!-- /default --> by default.
- [`serviceNamespace`](/docs/ref/object/metrics#servicenamespace) is sent as `service.namespace`, and is omitted when it is not set. Backends use it to group the services of one deployment, such as `mail-prod`.
- [`resourceAttributes`](/docs/ref/object/metrics#resourceattributes) adds further attributes, such as `deployment.environment.name`.

The exporter also adds `service.version` (the Stalwart version), `service.instance.id`, `telemetry.sdk.name`, `telemetry.sdk.language` and `telemetry.sdk.version`. The value of `service.instance.id` is a random identifier chosen when the server process starts, so each node, and each run of a node, appears as a separate instance. An entry in `resourceAttributes` with the name of one of these attributes, or of `service.name` or `service.namespace`, is ignored.

## Cluster and failures

Metrics are pushed only by nodes whose [cluster role](/docs/cluster/configuration/roles) includes the `metricsPush` task, or by every node when no roles are configured. Each node sends its own metrics.

An export can fail because the collector cannot be reached, or because it answers that it cannot accept data for the moment: HTTP status 429, 502, 503 or 504, or a gRPC status that OTLP defines as retryable. The exporter then retries with increasing delays, waiting longer when the collector asks for a delay, until `timeout` expires. An export that still fails is dropped and not sent again. Little is lost this way: counters and histograms carry cumulative totals, so the next successful export brings them up to date, and only the gauge values of the failed interval are missing. When an export is still running at the next interval, that interval is skipped.

Failed exports, data the collector rejects in part and skipped intervals are reported as `telemetry.otel-metrics-exporter-error` events.

## Examples

The following value pushes metrics every 30 seconds to a collector over HTTP, with a bearer token. The exporter sends them to `https://otel.example.com:4318/v1/metrics`:

```json
{
  "openTelemetry": {
    "@type": "Http",
    "url": "https://otel.example.com:4318",
    "interval": 30000,
    "httpAuth": {
      "@type": "Bearer",
      "bearerToken": {"@type": "EnvironmentVariable", "variableName": "OTEL_TOKEN"}
    }
  }
}
```

The following value pushes metrics to a collector on the same host over gRPC, without encryption:

```json
{
  "openTelemetry": {
    "@type": "Grpc",
    "url": "http://127.0.0.1:4317"
  }
}
```

The following value pushes metrics over gRPC with TLS to a collector that requires Basic authentication, and identifies the deployment through the resource attributes:

```json
{
  "openTelemetry": {
    "@type": "Grpc",
    "url": "https://otel.example.com:4317",
    "httpAuth": {
      "@type": "Basic",
      "username": "stalwart",
      "secret": {"@type": "File", "filePath": "/run/secrets/otel-password"}
    }
  },
  "serviceNamespace": "mail-prod",
  "resourceAttributes": {"deployment.environment.name": "production"}
}
```
