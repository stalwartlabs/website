---
sidebar_position: 3
---

# Prometheus

Prometheus is an open-source monitoring and alerting toolkit developed originally at SoundCloud and now part of the Cloud Native Computing Foundation. It uses a time-series data model, a dedicated query language (PromQL), and a pull-based scraping model where the server collects metrics from each monitored target at regular intervals.

Stalwart exposes a Prometheus-compatible scraping endpoint so that a Prometheus instance (or any Prometheus-format scraper) can collect metrics directly. From there, metrics can be queried with PromQL, visualised in Grafana, or used to drive alerting rules.

## Scraping endpoint

When the Prometheus exporter is enabled, metrics are exposed under `/metrics/prometheus`. A Prometheus job definition should point at this path on the Stalwart host and set the scrape interval required by the monitoring setup.

## Configuration

The Prometheus exporter is configured through [`prometheus`](/docs/ref/object/metrics#prometheus) on the [Metrics](/docs/ref/object/metrics) singleton (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). The field is a multi-variant nested type with two variants:

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
