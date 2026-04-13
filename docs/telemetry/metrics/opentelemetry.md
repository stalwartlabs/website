---
sidebar_position: 2
---

# OpenTelemetry

OpenTelemetry is an open-source observability framework designed to provide standardized methods for collecting, processing, and exporting telemetry data such as metrics, logs, and traces. OpenTelemetry aims to simplify the process of instrumenting applications to monitor their performance and behavior across distributed systems. It provides a set of APIs, libraries, agents, and instrumentation tools for collecting telemetry data from different programming languages and platforms.

OpenTelemetry aims to provide observability that lets developers and administrators inspect their applications' operations. By providing a consistent approach to telemetry, data can be integrated with multiple backend systems for analysis, visualization, and alerting.

Stalwart supports exporting metrics via push to OpenTelemetry. By integrating with OpenTelemetry, Stalwart can continuously send collected metrics to a centralized telemetry backend, providing real-time visibility into the server's performance and health. OpenTelemetry supports a wide range of telemetry backends, including Prometheus, Jaeger, and Zipkin, so you can choose the tools that suit your monitoring setup.

## Configuration

Configuring Stalwart to push metrics to OpenTelemetry involves setting up an exporter within the server's configuration. This exporter defines the endpoint for the OpenTelemetry collector or backend, along with any necessary authentication and connection settings. Once configured, the server will automatically handle the collection and transmission of metrics, minimizing the need for manual intervention.

The following options are available under `metrics.open-telemetry` for configuring the OpenTelemetry metrics push exporter:

- `transport`: The transport protocol to use for sending tracing information. It can be set to either `grpc`, `http` or `disable`.
- `endpoint`: The endpoint URL for the OpenTelemetry collector. This is where the metrics data will be sent.
- `interval`: The interval at which metrics are collected and sent to the OpenTelemetry collector. The default value is `1m`.
- `headers`: Additional headers to include in the HTTP request to the OpenTelemetry

## Example

Here is an example configuration snippet for setting up the OpenTelemetry metrics push exporter in Stalwart:

```toml
[metrics.open-telemetry]
transport = "grpc"
endpoint = "https://otel-collector.example.com/v1/metrics"
interval = "30s"
```
