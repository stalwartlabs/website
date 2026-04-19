---
sidebar_position: 3
---

# Prometheus

Prometheus is an open-source monitoring and alerting toolkit developed originally at SoundCloud and now part of the Cloud Native Computing Foundation. It uses a time-series data model, a dedicated query language (PromQL), and a pull-based scraping model where the server collects metrics from each monitored target at regular intervals.

Stalwart exposes a Prometheus-compatible scraping endpoint so that a Prometheus instance (or any Prometheus-format scraper) can collect metrics directly. From there, metrics can be queried with PromQL, visualised in Grafana, or used to drive alerting rules.

## Scraping endpoint

When the Prometheus exporter is enabled, metrics are exposed under `/metrics/prometheus`. A Prometheus job definition should point at this path on the Stalwart host and set the scrape interval required by the monitoring setup.

## Configuration

The Prometheus exporter is configured through [`prometheus`](/docs/ref/object/metrics#prometheus) on the [Metrics](/docs/ref/object/metrics) singleton (found in the WebUI under <!-- breadcrumb:Metrics --><!-- /breadcrumb:Metrics -->). The field is a multi-variant nested type with two variants:

- `Disabled` turns the endpoint off.
- `Enabled` exposes `/metrics/prometheus` and accepts optional Basic authentication credentials.

The `Enabled` variant carries:

- [`authUsername`](/docs/ref/object/metrics#metricsprometheusproperties): optional username for Basic authentication.
- [`authSecret`](/docs/ref/object/metrics#metricsprometheusproperties): optional secret for Basic authentication. A `SecretKeyOptional` with variants `None`, `Value`, `EnvironmentVariable`, and `File`.

Leaving both credentials unset exposes the endpoint without authentication.

## Example

The equivalent of enabling the endpoint with Basic authentication credentials `prometheus` / `password123`:

```json
{
  "prometheus": {
    "@type": "Enabled",
    "authUsername": "prometheus",
    "authSecret": {"@type": "Value", "secret": "password123"}
  }
}
```
