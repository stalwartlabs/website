---
sidebar_position: 2
title: "OpenTelemetry"
description: "Export Stalwart's events as OpenTelemetry logs and spans to a collector over HTTP or gRPC."
---

Many organisations collect the logs and traces of all their systems in one observability backend. [OpenTelemetry](https://opentelemetry.io/) is the vendor-neutral standard that makes this possible: applications send their telemetry to a collector, and the collector forwards logs, traces and metrics to the backends in use. Exporting Stalwart's events to an OpenTelemetry collector places them alongside the telemetry of the rest of the infrastructure.

The export maps Stalwart's events onto the two OpenTelemetry signals that fit them. Each event becomes a log record. Each session, such as an SMTP connection, becomes a span, the OpenTelemetry unit for an operation with a start and an end. Exporting metrics is described separately in [OpenTelemetry metrics](/docs/telemetry/metrics/opentelemetry).

## Configuration

The exporter is a variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->). OTLP, the OpenTelemetry protocol, runs over two transports, and each has its own variant: `OtelHttp` for OTLP over HTTP and `OtelGrpc` for OTLP over gRPC. Both have the common tracer settings described in [Tracing](/docs/telemetry/tracing/#common-settings), and the following fields:

- [`url`](/docs/ref/object/tracer#url) is the address of the collector.
- [`enableLogExporter`](/docs/ref/object/tracer#enablelogexporter) and [`enableSpanExporter`](/docs/ref/object/tracer#enablespanexporter) select whether log records and spans are exported. Both are <!-- default:Tracer.OtelHttp.enableLogExporter as=enabled -->enabled<!-- /default --> by default.
- [`throttle`](/docs/ref/object/tracer#throttle) is the minimum interval between two requests to the collector. Events produced in the meantime are sent together.
- [`timeout`](/docs/ref/object/tracer#timeout) limits each request.

## HTTP transport

With `OtelHttp`, `url` is required, and the tracer uses it as given, with no path appended. This matters because OTLP collectors receive log records and spans at different paths, `/v1/logs` and `/v1/traces`, while one tracer has only one URL. To export both signals, define two tracers, each with its own URL: one with only `enableLogExporter`, and one with only `enableSpanExporter`.

[`httpAuth`](/docs/ref/object/tracer#httpauth) sets the authentication: `Unauthenticated`, `Basic` with `username` and `secret`, or `Bearer` with `bearerToken`. [`httpHeaders`](/docs/ref/object/tracer#httpheaders) adds other headers, such as a tenant identifier that the backend requires. [`allowInvalidCerts`](/docs/ref/object/tracer#allowinvalidcerts) accepts an invalid TLS certificate.

The following pair of tracers exports spans and log records to a collector that requires a bearer token. The first sends spans to `/v1/traces`:

```json
{
  "@type": "OtelHttp",
  "url": "https://otel.example.com:4318/v1/traces",
  "enableLogExporter": false,
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {"@type": "EnvironmentVariable", "variableName": "OTEL_TOKEN"}
  },
  "level": "info"
}
```

The second sends log records to `/v1/logs`:

```json
{
  "@type": "OtelHttp",
  "url": "https://otel.example.com:4318/v1/logs",
  "enableSpanExporter": false,
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {"@type": "EnvironmentVariable", "variableName": "OTEL_TOKEN"}
  },
  "level": "info"
}
```

## gRPC transport

With `OtelGrpc`, `url` is the address of the collector's gRPC endpoint, without a path, such as `http://otel.example.com:4317`. When `url` is empty, the tracer falls back to the standard `OTEL_EXPORTER_OTLP_ENDPOINT` environment variables, and to `http://localhost:4317` if none is set. `httpAuth` and `httpHeaders` apply as with the HTTP transport, and are sent as gRPC request metadata.

The following tracer exports to a collector on the same host:

```json
{
  "@type": "OtelGrpc",
  "url": "http://127.0.0.1:4317",
  "httpAuth": {"@type": "Unauthenticated"},
  "level": "info"
}
```

## Export failures

Export failures are reported as `telemetry.otel-exporter-error` events. These events are never sent to an OpenTelemetry tracer, so only a local tracer, such as a Log or console tracer, shows them. A server that exports only to OpenTelemetry should keep a local tracer for this reason.
