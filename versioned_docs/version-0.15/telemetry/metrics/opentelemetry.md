---
sidebar_position: 2
---

# OpenTelemetry

OpenTelemetry is an open-source observability framework designed to provide standardized methods for collecting, processing, and exporting telemetry data such as metrics, logs, and traces. OpenTelemetry aims to simplify the process of instrumenting applications to monitor their performance and behavior across distributed systems. It offers a comprehensive set of APIs, libraries, agents, and instrumentation tools, facilitating the collection of telemetry data from various programming languages and platforms.

The primary goal of OpenTelemetry is to enable seamless observability, allowing developers and system administrators to gain deep insights into their applications' operations. By providing a unified and consistent approach to telemetry, OpenTelemetry ensures that data can be easily integrated with multiple backend systems for analysis, visualization, and alerting. This flexibility and extensibility make OpenTelemetry a powerful tool for maintaining and optimizing the performance of complex, distributed applications.

Stalwart supports exporting metrics via push to OpenTelemetry, allowing users to leverage the powerful capabilities of this observability framework. By integrating with OpenTelemetry, Stalwart can continuously send collected metrics to a centralized telemetry backend, providing real-time insights into the server's performance and health. OpenTelemetry allows users to take advantage of a wide range of telemetry backends, including popular options like Prometheus, Jaeger, and Zipkin. This flexibility ensures that users can choose the best tools for their specific monitoring and observability needs.

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
