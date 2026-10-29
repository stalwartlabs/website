---
sidebar_position: 3
title: "Prometheus"
description: "Expose Stalwart's metrics on an HTTP endpoint for Prometheus and compatible scrapers, with optional Basic authentication."
---

[Prometheus](https://prometheus.io/) is a monitoring system that pulls its data: it requests metrics from each monitored server at a regular interval, a process called scraping. To take part, Stalwart serves its [metrics](/docs/telemetry/metrics/) in the Prometheus text format. Prometheus itself can read them, and so can compatible collectors such as VictoriaMetrics or the OpenTelemetry Collector's Prometheus receiver.

## Endpoint

When the exporter is enabled, the metrics are served at `/metrics/prometheus`, on every HTTP listener of the server. The endpoint answers only `GET` requests, and responds to any other method with `405 Method Not Allowed`.

Metric names follow the Prometheus conventions: they start with `stalwart_`, end in a unit suffix such as `_bytes` or `_seconds` where the metric has a unit, and counters end in `_total`. The histogram `delivery.attempt-time`, for example, is scraped as `stalwart_delivery_attempt_time_seconds`, with the usual `_bucket`, `_sum` and `_count` series. [Exported names](/docs/telemetry/metrics/#exported-names) describes the rules and the few exceptions. Histogram buckets are cumulative, as Prometheus expects: each `_bucket` series counts the observations at or below its `le` bound, and the `+Inf` bucket equals `_count`.

In a cluster, each node serves only its own metrics. Prometheus must therefore be configured to collect from every node.

## Formats

The endpoint serves two exposition formats, which carry the same metrics and differ in their metadata:

- The Prometheus text format, version 0.0.4, sent with `Content-Type: text/plain; version=0.0.4; charset=utf-8`. Every Prometheus-compatible scraper understands it.
- OpenMetrics text, version 1.0.0, sent with `Content-Type: application/openmetrics-text; version=1.0.0; charset=utf-8; escaping=underscores`. It adds a `# UNIT` line to metrics that have a unit, names counter families without the `_total` suffix that their samples carry, and ends with `# EOF`. Prometheus asks for this format first in its default configuration.

The scraper's `Accept` header selects the format. The endpoint takes the media type with the highest quality value (`q`), and the first one listed when several are equal. It recognises `application/openmetrics-text` without a version or with version 1.0.0, `text/plain` without a version or with version 0.0.4, and the wildcards `text/*` and `*/*`, which select the Prometheus text format. A request for `text/plain; version=1.0.0`, the text format that Prometheus 3 can ask for, receives the same body as version 0.0.4, labelled as version 1.0.0. When the header is missing or names nothing the endpoint recognises, it answers in the Prometheus text format 0.0.4. Metric names contain only letters, digits and underscores, so the name escaping that Prometheus 3 negotiates never changes the output. The response is not compressed.

## Configuration

The exporter is configured in the [`prometheus`](/docs/ref/object/metrics#prometheus) field of the [Metrics](/docs/ref/object/metrics) object (found in the WebUI under <!-- breadcrumb:Metrics --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › OpenTelemetry, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Metrics › Prometheus<!-- /breadcrumb:Metrics -->). Its `@type` is `Disabled` or `Enabled`, and the endpoint is served only with `Enabled`.

The main decision is whether to require authentication. Without credentials, anyone who can reach an HTTP listener can read the metrics, which include message counts, queue sizes and error rates. Set credentials when the HTTP listeners are reachable from untrusted networks.

The `Enabled` variant has two optional fields for this, `authUsername` and `authSecret`. When both are set, the endpoint requires HTTP Basic authentication. The two fields must be set together: when only one is set, the endpoint is disabled, and the configuration reports one of these messages:

```text
Prometheus authUsername is set but authSecret is not, Prometheus endpoint disabled
Prometheus authSecret is set but authUsername is not, Prometheus endpoint disabled
```

A request with wrong or missing credentials is refused and logged as an `auth.failed` event. That event is logged at `debug`, so a tracer at the usual `info` level does not show it.

Without credentials, the endpoint is a public endpoint like any other, so the anonymous HTTP rate limit, [`rateLimitAnonymous`](/docs/ref/object/http#ratelimitanonymous), applies to it per client address. A scrape over the limit receives `429 Too Many Requests`. The default of <!-- default:Http.rateLimitAnonymous -->100 per minute<!-- /default --> leaves ample room for a scraper, but the limit counts every anonymous request from the same address, including those of other scrapers that run there. The exemptions described in [Rate limiting](/docs/http/settings#rate-limiting) apply, so a scraper's address can be added to the allowed IP list. With credentials configured, scrapes are not rate limited.

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
