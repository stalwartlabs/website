---
sidebar_position: 1
---

# Overview

Telemetry is the process of collecting, transmitting, and analyzing data from remote or inaccessible points to monitor the performance, health, and usage of systems. In the context of server applications like Stalwart Mail Server, telemetry involves gathering various metrics that provide insights into the server's operation, resource usage, and overall health. This information is crucial for system administrators and developers to ensure the server runs efficiently, identify and troubleshoot issues, and optimize performance.

## Push vs. Pull Metrics Exporters

In the realm of telemetry, there are two primary methods for exporting metrics: push and pull. Understanding the difference between these two approaches is essential for configuring and utilizing metrics exporters effectively.

Push metrics exporters involve the monitored system actively sending (or "pushing") data to a designated metrics collection system at regular intervals. This method is advantageous because it ensures that metrics are transmitted as soon as they are collected, providing near real-time monitoring. Push-based systems can also be simpler to configure, as the metrics source only needs to know where to send the data.

On the other hand, pull metrics exporters work by having the metrics collection system actively request (or "pull") data from the monitored system. This is typically done via a scrapping endpoint that the monitoring system queries at defined intervals. The pull approach allows the monitoring system to control the frequency of data collection, which can be beneficial for managing load and avoiding overloading the monitored system. However, it requires the monitored system to expose an endpoint that the monitoring system can query.

## Supported backends

Stalwart Mail Server supports both push and pull metrics export methods, providing flexibility to integrate with different monitoring solutions based on organizational needs and preferences.

For push metric exports, Stalwart Mail Server integrates seamlessly with [OpenTelemetry](/docs/telemetry/metrics/opentelemetry). OpenTelemetry is a set of APIs, libraries, agents, and instrumentation that provides a standard way to collect and export telemetry data. By supporting OpenTelemetry, Stalwart Mail Server allows metrics to be pushed to a centralized telemetry collection system, enabling real-time monitoring and analysis.

In addition to push metrics exports, Stalwart Mail Server also supports pull metrics exports to [Prometheus](/docs/telemetry/metrics/prometheus). Prometheus is a popular open-source monitoring and alerting toolkit designed for reliability and scalability. Stalwart Mail Server exposes a scraping endpoint that Prometheus can query at regular intervals to collect metrics. This allows for flexible and efficient monitoring, with the ability to adjust the scraping frequency to match the desired level of detail and performance impact.

## Disabling metrics

In some cases, users may want to disable the connection of certain metrics. This can be done by adding the [event name](/docs/telemetry/events#event-types) to the `metrics.disabled-events` array in the configuration file. When a metric is disabled, it will not be collected or exported by the metrics exporter, reducing the amount of data transmitted and stored. This can be useful for optimizing performance, reducing storage costs, or focusing on specific metrics of interest.

Example:

```toml
[metrics]
disabled-events = ["auth.error", "smtp.error"]
```
