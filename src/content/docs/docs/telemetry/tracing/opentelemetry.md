---
sidebar_position: 2
title: "OpenTelemetry"
description: "Export Stalwart's events as OpenTelemetry logs and spans to a collector over HTTP or gRPC."
---

Many organisations collect the logs and traces of all their systems in one observability backend. [OpenTelemetry](https://opentelemetry.io/) is the vendor-neutral standard that makes this possible: applications send their telemetry to a collector, and the collector forwards logs, traces and metrics to the backends in use. Exporting Stalwart's events to an OpenTelemetry collector places them alongside the telemetry of the rest of the infrastructure.

The export maps Stalwart's events onto the two OpenTelemetry signals that fit them. Each event becomes a log record. Each session, such as an SMTP connection, becomes a span, the OpenTelemetry unit for an operation with a start and an end, under the conditions described in [Spans](#spans). Exporting metrics is described separately in [OpenTelemetry metrics](/docs/telemetry/metrics/opentelemetry).

## Configuration

The exporter is a variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->). OTLP, the OpenTelemetry protocol, runs over two transports, and each has its own variant: `OtelHttp` for OTLP over HTTP and `OtelGrpc` for OTLP over gRPC. Both have the common tracer settings described in [Tracing](/docs/telemetry/tracing/#common-settings), and the following fields:

- [`url`](/docs/ref/object/tracer#url) is the address of the collector, which each transport reads differently, as described below.
- [`enableLogExporter`](/docs/ref/object/tracer#enablelogexporter) and [`enableSpanExporter`](/docs/ref/object/tracer#enablespanexporter) select whether log records and spans are exported. Both are <!-- default:Tracer.OtelHttp.enableLogExporter as=enabled -->enabled<!-- /default --> by default.
- [`throttle`](/docs/ref/object/tracer#throttle) is how long the tracer collects events before it sends them, <!-- default:Tracer.OtelHttp.throttle -->1 second<!-- /default --> by default, as described in [Batching](#batching).
- [`timeout`](/docs/ref/object/tracer#timeout) is the time allowed for one request, retries included, <!-- default:Tracer.OtelHttp.timeout -->10 seconds<!-- /default --> by default. A value below 100 milliseconds is raised to 100 milliseconds.
- [`httpAuth`](/docs/ref/object/tracer#httpauth) sets the authentication: `Unauthenticated`, `Basic` with `username` and `secret`, or `Bearer` with `bearerToken`.
- [`httpHeaders`](/docs/ref/object/tracer#httpheaders) adds other headers, such as a tenant identifier that the backend requires.
- [`allowInvalidCerts`](/docs/ref/object/tracer#allowinvalidcerts) accepts a TLS certificate that cannot be verified, such as a self-signed certificate on a collector in a private network.

Authentication, headers and the TLS setting apply to both transports. Over gRPC, the headers are sent as request metadata. Headers that the protocol sets itself, such as `Content-Type`, `Host` or any header whose name starts with `grpc-`, are ignored when they appear in `httpHeaders`; the complete list is in [OpenTelemetry metrics](/docs/telemetry/metrics/opentelemetry#configuration).

The resource attributes that identify the service to the backend, such as `service.name`, are not tracer settings. They are set once on the Metrics object and shared by every OpenTelemetry tracer and the metrics exporter, as described in [Resource attributes](/docs/telemetry/metrics/opentelemetry#resource-attributes). The standard `OTEL_*` environment variables, such as `OTEL_SERVICE_NAME` or `OTEL_EXPORTER_OTLP_ENDPOINT`, are not read.

## HTTP transport

With `OtelHttp`, `url` is required and is the base address of the collector, such as `https://otel.example.com:4318`. OTLP collectors receive spans and log records at different paths, `/v1/traces` and `/v1/logs`, and the tracer appends the path of each signal to the path of the base address. A single tracer therefore exports both signals.

A `url` that already ends in an OTLP signal path (`/v1/traces`, `/v1/logs` or `/v1/metrics`) is accepted as well: the tracer removes that suffix before it appends the path of each signal.

The following tracer exports spans and log records to a collector that requires a bearer token. It sends spans to `https://otel.example.com:4318/v1/traces` and log records to `https://otel.example.com:4318/v1/logs`:

```json
{
  "@type": "OtelHttp",
  "url": "https://otel.example.com:4318",
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {"@type": "EnvironmentVariable", "variableName": "OTEL_TOKEN"}
  },
  "level": "info"
}
```

## gRPC transport

With `OtelGrpc`, `url` gives the scheme, host and port of the collector's gRPC endpoint, such as `http://otel.example.com:4317`. A gRPC request names its service in the request itself, so any path in `url` is ignored. When `url` is not set, the tracer connects to `http://localhost:4317`, the standard OTLP gRPC port on the same host.

For both transports, the scheme decides whether the connection is encrypted: `https` connects over TLS, and `http` sends the data in clear text. gRPC over `http` uses HTTP/2 without TLS.

The following tracer exports to a collector on the same host, without encryption:

```json
{
  "@type": "OtelGrpc",
  "url": "http://127.0.0.1:4317",
  "level": "info"
}
```

The following tracer exports over TLS to a collector that requires Basic authentication and a tenant header:

```json
{
  "@type": "OtelGrpc",
  "url": "https://otel.example.com:4317",
  "httpAuth": {
    "@type": "Basic",
    "username": "stalwart",
    "secret": {"@type": "File", "filePath": "/run/secrets/otel-password"}
  },
  "httpHeaders": {"X-Scope-OrgID": "mail"},
  "level": "info"
}
```

## Spans

A span covers one session, from the event that starts it to the event that ends it. Stalwart records spans for SMTP, IMAP, POP3, ManageSieve and HTTP connections, and for outbound delivery attempts. Their start and end events, such as `smtp.connection-start` and `smtp.connection-end`, are logged at `debug`.

The tracer builds a span when it receives the end event of the session, so it exports spans only if the end events reach it. At the default `info` level they do not, and the tracer exports log records but no spans. A tracer that exports spans needs the level `debug` or `trace`, or the end events raised to a higher level as described in [Events](/docs/telemetry/events#event-levels). Its `events` selection must not exclude them either.

Each span contains, as span events, the events of the session that the tracer recorded. A session in which the tracer recorded no event besides its start and end is not exported.

## Batching

Sending each event in a request of its own would cost the collector one request per event. The tracer instead collects events into batches, one for log records and one for spans. The first event added to an empty batch starts the `throttle` period, and when the period ends, the batch is sent with every event that arrived in the meantime. Under a steady flow of events, each signal therefore produces about one request per `throttle` period. A batch that reaches 4 MiB is sent without waiting for the period to end.

Each signal has at most one request in flight. Batches completed while a request is in flight wait their turn, up to a total of 16 MiB per signal. Beyond that, the tracer discards new events and reports how many it discarded.

## Export failures

A request can fail because the collector cannot be reached, or because it answers that it cannot accept data for the moment: HTTP status 429, 502, 503 or 504, or a gRPC status that OTLP defines as retryable. The tracer then retries with increasing delays, waiting longer when the collector asks for a delay, until `timeout` expires. If the request still fails, it stays queued and is tried again later, no sooner than one `throttle` period later. A request that the collector refuses for any other reason, such as an authentication error, is dropped.

Failed requests, dropped requests, data the collector rejects in part and discarded events are reported as `telemetry.otel-exporter-error` events. These events are never sent to an OpenTelemetry tracer, so only a local tracer, such as a Log or console tracer, shows them. A server that exports only to OpenTelemetry should keep a local tracer for this reason.
