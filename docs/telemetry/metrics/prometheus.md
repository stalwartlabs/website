---
sidebar_position: 3
---

# Prometheus

Prometheus is an open-source systems monitoring and alerting toolkit designed for reliability and scalability. Developed by SoundCloud in 2012 and now part of the Cloud Native Computing Foundation, Prometheus has become one of the most popular monitoring solutions in the industry. It provides a flexible data model, a query language (PromQL), and time-series data collection, making it suitable for monitoring dynamic, complex environments.

Prometheus works by scraping metrics from instrumented targets, which expose their metrics via HTTP endpoints. It then stores these metrics in a time-series database, allowing users to query and visualize the data using built-in tools or third-party integrations like Grafana. Prometheus also supports alerting, enabling users to define rules that trigger notifications when certain conditions are met, helping to ensure timely responses to potential issues.

Stalwart supports exporting metrics via pull to Prometheus. By enabling the Prometheus exporter, Stalwart makes its metrics available through a dedicated endpoint that Prometheus can scrape at regular intervals.

The Prometheus integration lets users create custom dashboards to visualize metrics, define alerting rules, and use PromQL to perform queries and analyses. Administrators can use this to monitor server performance, detect and resolve issues, and make decisions based on real-time data.

## Scraping Metrics 

When the Prometheus exporter is enabled, Stalwart exposes its metrics under the `/metrics/prometheus` scraping endpoint. This endpoint exposes metrics that cover server performance and health, including resource usage, request handling, and error rates.

Configuring Prometheus to scrape metrics from Stalwart involves adding a job definition to the Prometheus configuration file. This definition specifies the target endpoint (i.e., the `/metrics/prometheus` URL) and the scraping interval. Once configured, Prometheus will automatically query the endpoint at the defined intervals, collect the metrics, and store them in its time-series database.

## Configuration

The following options are available under `metrics.prometheus` for configuring the Prometheus metrics pull exporter:

- `enable`: Enables or disables the Prometheus metrics exporter. When set to `true`, Stalwart will expose metrics for scraping by Prometheus. The default value is `false`.
- `auth.username`: The username for basic authentication when accessing the Prometheus metrics endpoint. This option is optional.
- `auth.secret`: The password or secret token for basic authentication when accessing the Prometheus metrics endpoint. This option is optional.

## Example

Here is an example configuration snippet for setting up the Prometheus metrics pull exporter in Stalwart:

```toml
[metrics.prometheus]
enable = true

[metrics.prometheus.auth]
username = "prometheus"
secret = "password123"
```
