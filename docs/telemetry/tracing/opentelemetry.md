---
sidebar_position: 2
---

# OpenTelemetry

OpenTelemetry is an open-source standard for distributed tracing and metrics. It defines a common set of APIs, SDKs, and collector services that applications use to emit traces, logs, and metrics to an observability backend.

Directing Stalwart's traces and logs to an OpenTelemetry collector lets them be correlated with signals from the rest of the infrastructure in a single observability stack, which helps with diagnosing distributed issues and monitoring the health of the mail service.

OpenTelemetry output is represented by two variants of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><!-- /breadcrumb:Tracer -->): `OtelHttp` for the HTTP transport and `OtelGrpc` for the gRPC transport. Both variants share the same set of fields:

- [`endpoint`](/docs/ref/object/tracer#endpoint): endpoint URL of the collector. Required for `OtelHttp`; optional for `OtelGrpc` (when omitted, the SDK default endpoint is used).
- [`enableLogExporter`](/docs/ref/object/tracer#enablelogexporter): whether logs are exported. Default `true`.
- [`enableSpanExporter`](/docs/ref/object/tracer#enablespanexporter): whether spans are exported. Default `true`.
- [`throttle`](/docs/ref/object/tracer#throttle): minimum interval between batches. Default `"1s"`.
- [`timeout`](/docs/ref/object/tracer#timeout): maximum time to wait for a response. Default `"10s"`.
- [`httpAuth`](/docs/ref/object/tracer#httpauth): HTTP authentication used by the exporter. A nested type with variants `Unauthenticated`, `Basic`, and `Bearer`.
- [`httpHeaders`](/docs/ref/object/tracer#httpheaders): additional HTTP headers to include on each request.

The common tracer fields ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)) also apply.

## gRPC transport

The `OtelGrpc` variant sends traces and logs over gRPC. For example:

```json
{
  "@type": "OtelGrpc",
  "endpoint": "https://127.0.0.1/otel",
  "httpAuth": {"@type": "Unauthenticated"},
  "enable": true,
  "level": "info"
}
```

## HTTP transport

The `OtelHttp` variant sends traces and logs over HTTP. Use [`httpHeaders`](/docs/ref/object/tracer#httpheaders) for any custom headers the collector requires, and [`httpAuth`](/docs/ref/object/tracer#httpauth) for bearer or basic credentials. For example:

```json
{
  "@type": "OtelHttp",
  "endpoint": "https://tracing.mydomain.test/v1/otel",
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {"@type": "Value", "secret": "<token>"}
  },
  "enable": true,
  "level": "debug"
}
```

Authorization tokens are supplied through [`httpAuth`](/docs/ref/object/tracer#httpauth) rather than as an `Authorization` entry in [`httpHeaders`](/docs/ref/object/tracer#httpheaders); [`httpHeaders`](/docs/ref/object/tracer#httpheaders) is reserved for additional custom headers.
