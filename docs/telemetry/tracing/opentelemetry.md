---
sidebar_position: 2
---

# OpenTelemetry

OpenTelemetry is an open-source standard for distributed tracing of applications. It provides a single set of APIs, libraries, agents, and collector services to capture distributed traces and metrics from applications.

By enabling OpenTelemetry in Stalwart, administrators can gain insight into the performance and behavior of the system, which is useful for identifying and resolving issues. With OpenTelemetry, administrators can understand how messages are flowing through the system, where bottlenecks are occurring, and how the server is performing under different loads. This information can help to identify performance issues and make improvements to the system, ensuring that the server is operating at optimal levels and delivering the best possible experience to end-users.

The following options are available under `tracer.<id>` for configuring an OpenTelemetry tracer:

- `transport`: The transport protocol to use for sending tracing information.
- `enable.log-exporter`: A boolean value that determines whether to enable the log exporter. If set to `true`, the log exporter will be enabled. If set to `false`, the log exporter will be disabled. The default value is `false`.
- `enable.span-exporter`: A boolean value that determines whether to enable the span exporter. If set to `true`, the span exporter will be enabled. If set to `false`, the span exporter will be disabled. The default value is `true`.
- `throttle`: How long to wait before sending the next batch of spans or logs. The default value is `1s`.
- `lossy`: A boolean value that determines whether to drop spans when the queue is full. If set to `true`, spans will be dropped when the queue is full. If set to `false`, spans will be buffered until the queue is no longer full. The default value is `false`.

## Transports

Stalwart is capable of sending tracing information to both gRPC and HTTP collectors. The transport protocol for sending tracing information is specified using the `tracer.<id>.transport` key, with options for either gRPC or HTTP transport:

- `grpc`: Tracing information is sent via gRPC.
- `http`: Tracing information is sent via HTTP.

### gRPC

The address of the gRPC OpenTelemetry collector can be defined using the optional `tracer.<id>.endpoint` argument, otherwise the default endpoint is used.

Example:

```toml
[tracer.otel]
type = "open-telemetry"
transport = "grpc"
endpoint = "https://127.0.0.1/otel"
level = "info"
enable = true
```

### HTTP

The endpoint URL for the HTTP OpenTelemetry collector is specified with the `tracer.<id>.endpoint` attribute, while the headers to be used can be defined with the `tracer.<id>.headers` attribute.

Example:

```toml
[tracer.otel]
type = "open-telemetry"
transport = "http"
endpoint = "https://tracing.mydomain.test/v1/otel"
headers = ["Authorization: <place_auth_here>"]
level = "debug"
enable = true
```
