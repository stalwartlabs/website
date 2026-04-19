---
sidebar_position: 7
---

# Live Telemetry

Live telemetry exposes an HTTP endpoint that streams structured logs, traces, and metrics to the client in real time. The stream is delivered using Server-Sent Events (SSE), so any HTTP client capable of consuming an event stream can subscribe. The feature is suited to live diagnostics, short-lived performance investigations, and dashboards that need a continuous update path.

Filters can be applied on the URL to narrow the stream to specific spans, metrics, or event keys. This is important on busy servers, where the unfiltered stream can be too large to process interactively.

The [WebUI](/docs/management/webui/overview) is the recommended consumer: its Dashboard formats the live stream and provides controls for filtering and visualising activity.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Tracing endpoint

Real-time tracing and log data is available at `/api/telemetry/traces/live`. The endpoint returns a continuous SSE stream; each event is a JSON object describing a server [event](/docs/telemetry/events), carrying structured keys that identify the affected accounts, connections, protocols, and other context.

### Parameters

Filters narrow the stream by matching on event keys. They can be applied broadly or per key:

- `filter`: matches the given value across every structured key. Useful for a quick search. For example, `/api/telemetry/traces/live?filter=error`.
- Per-key parameters: any structured [key](/docs/telemetry/events#key-types) can be used as a query parameter to match on that key only. Multiple constraints combine. For example, `/api/telemetry/traces/live?remote-ip=192.168.1.1&domain=example.org`.

### Response format

Each line is a JSON object. The available keys depend on the event type; the full key catalogue is documented on the [Events](/docs/telemetry/events#key-types) page.

## Metrics endpoint

Real-time metrics are available at `/api/telemetry/metrics/live`. The endpoint returns a continuous SSE stream of metric samples, each encoded as a JSON object that describes a single data point.

### Parameters

- `metrics`: comma-separated list of metric names to include in the stream. For example, `/api/telemetry/metrics/live?metrics=server.memory,queue.count`.
- `interval`: sampling interval in seconds. For example, `/api/telemetry/metrics/live?interval=30` samples every thirty seconds.

### Response format

Each line is a JSON object with structured keys describing the metric and its current value.
