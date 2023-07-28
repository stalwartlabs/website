---
sidebar_position: 2
---

# OpenTelemetry

OpenTelemetry is an open-source standard for distributed tracing of applications. It provides a single set of APIs, libraries, agents, and collector services to capture distributed traces and metrics from applications.

By enabling OpenTelemetry in Stalwart Mail Server, administrators can gain insight into the performance and behavior of the system, which is useful for identifying and resolving issues. With OpenTelemetry, administrators can understand how messages are flowing through the system, where bottlenecks are occurring, and how the server is performing under different loads. This information can help to identify performance issues and make improvements to the system, ensuring that the server is operating at optimal levels and delivering the best possible experience to end-users.

Stalwart Mail Server is capable of sending tracing information to both gRPC and HTTP collectors. The transport protocol for sending tracing information is specified using the `global.tracing.transport` key, with options for either gRPC or HTTP transport:

- `grpc`: Tracing information is sent via gRPC.
- `http`: Tracing information is sent via HTTP.


## gRPC transport

The address of the gRPC OpenTelemetry collector can be defined using the optional `global.tracing.endpoint` argument, otherwise the default endpoint is used.

Example:

```toml
[global.tracing]
method = "open-telemetry"
transport = "grpc"
endpoint = "https://127.0.0.1/otel"
level = "info"
```

## HTTP transport

The endpoint URL for the HTTP OpenTelemetry collector is specified with the `global.tracing.endpoint` attribute, while the headers to be used can be defined with the `global.tracing.headers` attribute.

Example:

```toml
[global.tracing]
method = "open-telemetry"
transport = "http"
endpoint = "https://tracing.mydomain.net/v1/otel"
headers = ["Authorization: <place_auth_here>"]
level = "debug"
```
