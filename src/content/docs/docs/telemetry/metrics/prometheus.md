---
sidebar_position: 3
title: "Prometheus"
description: "Expose Stalwart's metrics on an HTTP endpoint for Prometheus and compatible scrapers, with optional Basic authentication."
---

[Prometheus](https://prometheus.io/) is a monitoring system that pulls its data: it requests metrics from each monitored server at a regular interval, a process called scraping. To take part, Stalwart serves its [metrics](/docs/telemetry/metrics/) in the Prometheus text format. Prometheus itself can read them, and so can compatible collectors such as VictoriaMetrics or the OpenTelemetry Collector's Prometheus receiver.

## Endpoint

When the exporter is enabled, the metrics are served at `/metrics/prometheus`, on every HTTP listener of the server. Metric names are converted to Prometheus conventions by replacing dots and hyphens with underscores, so `delivery.attempt-time` becomes `delivery_attempt_time`.

In a cluster, each node serves only its own metrics. Prometheus must therefore be configured to collect from every node.

## Configuration

The exporter is configured in the [`prometheus`](/docs/ref/object/metrics#prometheus) field of the [Metrics](/docs/ref/object/metrics) object (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). Its `@type` is `Disabled` or `Enabled`, and the endpoint is served only with `Enabled`.

The main decision is whether to require authentication. Without credentials, anyone who can reach an HTTP listener can read the metrics, which include message counts, queue sizes and error rates. Set credentials when the HTTP listeners are reachable from untrusted networks.

The `Enabled` variant has two optional fields for this, `authUsername` and `authSecret`. When both are set, the endpoint requires HTTP Basic authentication. The two fields must be set together: when only one is set, the endpoint is disabled, and the configuration reports one of these messages:

```text
Prometheus authUsername is set but authSecret is not, Prometheus endpoint disabled
Prometheus authSecret is set but authUsername is not, Prometheus endpoint disabled
```

A request with wrong or missing credentials is refused and logged as an `auth.failed` event. That event is logged at `debug`, so a tracer at the usual `info` level does not show it.

## Example

The following value enables the endpoint with Basic authentication, reading the password from a file:

```json
{
  "prometheus": {
    "@type": "Enabled",
    "authUsername": "prometheus",
    "authSecret": {"@type": "File", "filePath": "/run/secrets/prometheus-password"}
  }
}
```

The matching Prometheus job collects from two nodes, with the same credentials:

```yaml
scrape_configs:
  - job_name: stalwart
    scheme: https
    metrics_path: /metrics/prometheus
    basic_auth:
      username: prometheus
      password_file: /etc/prometheus/stalwart-password
    static_configs:
      - targets: ["mail1.example.com:443", "mail2.example.com:443"]
```
