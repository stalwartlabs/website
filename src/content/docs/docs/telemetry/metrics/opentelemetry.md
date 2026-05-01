---
sidebar_position: 2
title: "OpenTelemetry"
---

OpenTelemetry is an open-source observability framework that standardises how metrics, logs, and traces are collected, processed, and exported. It defines a common wire format for telemetry data and provides SDKs and collector services for a wide range of programming languages and platforms.

Stalwart pushes metrics to an OpenTelemetry collector, from which they can be fanned out to backends such as Prometheus, Jaeger, or Zipkin. Pushing metrics through OpenTelemetry lets Stalwart fit into an existing observability stack with a single collector configuration.

## Configuration

The OpenTelemetry metrics exporter is configured through [`openTelemetry`](/docs/ref/object/metrics#opentelemetry) on the [Metrics](/docs/ref/object/metrics) singleton (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). The field is a multi-variant nested type:

- `Disabled` turns the exporter off.
- `Http` exports metrics over HTTP.
- `Grpc` exports metrics over gRPC.

Both active variants share the following fields:

- [`endpoint`](/docs/ref/object/metrics#metricsotelhttp): collector endpoint URL. Required for `Http`; optional for `Grpc` (when omitted, the SDK default endpoint is used).
- [`interval`](/docs/ref/object/metrics#metricsotelhttp): minimum interval between push requests. Default `"1m"`.
- [`timeout`](/docs/ref/object/metrics#metricsotelhttp): maximum time to wait for a response. Default `"10s"`.

The `Http` variant additionally carries:

- [`httpAuth`](/docs/ref/object/metrics#httpauth): HTTP authentication used by the exporter. A nested type with variants `Unauthenticated`, `Basic`, and `Bearer`.
- [`httpHeaders`](/docs/ref/object/metrics#metricsotelhttp): additional HTTP headers sent on each request.

## Example

The equivalent of pushing over gRPC every thirty seconds to a collector at `https://otel-collector.example.com/v1/metrics`:

```json
{
  "openTelemetry": {
    "@type": "Grpc",
    "endpoint": "https://otel-collector.example.com/v1/metrics",
    "interval": "30s"
  }
}
```
