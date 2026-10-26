---
sidebar_position: 7
title: "Live telemetry"
description: "Stream Stalwart's events and metrics in real time over HTTP with Server-Sent Events: endpoints, authentication, filters and stream format."
---

Tracers and exporters have to be configured before they record anything, and they record continuously. Live telemetry serves the opposite need: it streams the server's events and metrics to an HTTP client as they occur, with no tracer or exporter to set up. It suits short investigations, such as following the SMTP sessions of one sender while a problem is reproduced, and real-time dashboards. The WebUI uses it for its live log and live metrics views.

The streams use [Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html) (SSE), a standard in which the client keeps an HTTP response open and the server writes events to it as they happen. Any SSE client, including `curl`, can therefore consume them.

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Authentication

Each stream requires its own [permission](/docs/ref/permissions): `liveTracing` for events and `liveMetrics` for metrics. A client that can set headers authenticates in the usual way, with an `Authorization` header.

Some clients cannot set headers, such as the browser `EventSource` API. They authenticate in two steps instead:

1. Obtain a token with an authenticated request to `GET /api/token/tracing` or `GET /api/token/metrics`.
2. Open the stream with the token in the `token` query parameter.

The token is valid for 60 seconds, and only for the stream it was issued for.

## Event stream

`GET /api/live/tracing` streams events. Without parameters, it streams every event that at least one configured [tracer](/docs/telemetry/tracing/), [webhook](/docs/telemetry/webhooks) or [history](/docs/telemetry/history) store records. The stream cannot see events that nothing records, so it carries `debug` events only while a tracer at `debug` exists.

### Filters

Query parameters narrow the stream to the events of interest:

- `filter=<text>` keeps the events in which any text value, address or timestamp contains the given text, or any numeric value equals it.
- `<key>=<text>` keeps the events whose key contains the given text, for example `remoteIp=203.0.113.9` or `from=alice@example.org`. A numeric value matches when it equals the given number, and a list when one of its elements matches. Several key parameters must all match.

Key names are those of the [key reference](/docs/ref/enum/key), and they are case-sensitive. `remoteIp` is recognised, while `remoteip` is ignored, as is any other parameter that does not name a key.

A filter selects sessions as well as single events. Once an event matches, the following events of the same session are included too, so a filter on a sender address shows the complete SMTP session in which that address appears.

### Stream format

The stream starts with a `ping` event, which announces the interval at which pings are sent while there is no traffic: 30 seconds. Events are then sent in batches, at most once per second. Each batch is a `trace` event whose data is a JSON array of event objects:

```text
event: ping
data: {"interval": 30000}

event: trace
data: [{"event":"smtp.mail-from","timestamp":"2026-01-14T09:12:44Z","keyValues":[{"key":"from","value":{"@type":"String","value":"alice@example.org"}}]}]
```

Each event object has three members:

- `event`: the event name, as listed in the [event reference](/docs/ref/events).
- `timestamp`: the time of the event, in RFC 3339 format.
- `keyValues`: the keys of the event itself, without those of the session, as a list of objects with a `key` (a name from the [key reference](/docs/ref/enum/key)) and a `value`. Each value is typed by its `@type`: `String`, `UnsignedInt`, `Integer`, `Boolean`, `Float`, `UTCDateTime`, `Duration` (in milliseconds), `IpAddr`, `List`, a nested `Event`, or `Null`. All but `Null` carry the value in `value`.

This is the same structure as the events of a stored [Trace](/docs/ref/object/trace#traceevent). The following command follows the sessions of one sender:

```bash
curl -N -H "Authorization: Bearer $TOKEN" \
  "https://mail.example.com/api/live/tracing?from=alice@example.org"
```

## Metrics stream

`GET /api/live/metrics` streams the current values of the server's metrics. Two parameters control what is sent and how often:

- `metrics=<name>,<name>,...` selects the metrics to send, by the names in the [metrics reference](/docs/ref/metrics). Unknown names are ignored. Without the parameter, all metrics are sent.
- `interval=<seconds>` sets the time between two updates, at least 1 second. Without it, updates are sent every 30 seconds.

The first update is sent at once. Each update is a `metrics` event whose data lists one object per metric, with the counter value, the gauge value, or the count and sum of a histogram:

```text
event: metrics
data: [{"metric":"queue.count","@type":"Gauge","count":12},{"metric":"delivery.attempt-time","@type":"Histogram","count":340,"sum":182000}]
```

The values are those of the node that serves the request.
