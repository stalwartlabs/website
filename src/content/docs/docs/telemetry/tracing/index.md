---
sidebar_position: 1
title: "Overview"
description: "Send Stalwart's events to log files, the console, the systemd journal or OpenTelemetry with tracers, and read the resulting logs."
---

Events are only useful once they are recorded somewhere an administrator can read them. A tracer does that job: it takes Stalwart's [events](/docs/telemetry/events) and sends them to one destination, such as a log file or an OpenTelemetry collector. Each tracer is a [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->), whose `@type` selects the destination:

| `@type` | Destination | Page |
|---|---|---|
| `Log` | Text files in a directory, with a new file started at a set interval | [Log file](/docs/telemetry/tracing/tracers#log-file) |
| `Stdout` | The console (standard error) | [Console](/docs/telemetry/tracing/tracers#console) |
| `Journal` | The systemd journal | [Journal](/docs/telemetry/tracing/tracers#journal) |
| `OtelHttp`, `OtelGrpc` | An OpenTelemetry collector, over HTTP or gRPC | [OpenTelemetry](/docs/telemetry/tracing/opentelemetry) |

Several tracers can be active at the same time, each with its own settings, so one destination can receive a detailed record while another receives only problems. A new installation has one `Log` tracer at level `info`.

## Common settings

Whatever its destination, every tracer answers the same questions: how severe an event must be to be recorded, which events to record, and what to do under load. The following fields express these choices:

- [`level`](/docs/ref/object/tracer#level) is the least severe level recorded: `error`, `warn`, `info`, `debug` or `trace`, with <!-- default:Tracer.level -->`info`<!-- /default --> by default. The levels are described in [Events](/docs/telemetry/events#event-levels).
- [`events`](/docs/ref/object/tracer#events) and [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy) include or exclude events by name. With the default policy, <!-- default:Tracer.eventsPolicy -->`exclude`<!-- /default -->, and an empty list, every event at or above the level is recorded.
- [`lossy`](/docs/ref/object/tracer#lossy) selects how the tracer behaves when it cannot keep up, as described below.
- [`enable`](/docs/ref/object/tracer#enable) turns the tracer off without deleting it.

Level and event selection combine. The following tracer, meant for a troubleshooting session, writes four SMTP and delivery events to the console. Its level is `debug`, because one of the events, `delivery.attempt-start`, is logged at that level:

```json
{
  "@type": "Stdout",
  "level": "debug",
  "eventsPolicy": "include",
  "events": {
    "smtp.mail-from": true,
    "smtp.rcpt-to": true,
    "delivery.attempt-start": true,
    "delivery.delivered": true
  }
}
```

## Event loss under load

The server passes events from its threads to the tracers through bounded queues, so that a slow destination cannot stall mail processing. The price of that design is that events can be lost. When a tracer falls behind, its backlog grows up to a limit, and past that limit events are dropped.

Which events are lost depends on `lossy`, which is <!-- default:Tracer.lossy as=enabled -->disabled<!-- /default --> by default:

- A tracer with `lossy` set to `false` keeps a large backlog, and drops the newest events only when the backlog is exceeded.
- A tracer with `lossy` set to `true` keeps a smaller backlog and, once it is exceeded, records only `error` events.

Events can also be dropped before they reach any tracer, regardless of `lossy`, when the server produces them faster than it can distribute them.

For every 60 seconds in which events were dropped, the server logs a `telemetry.events-dropped` event at `warn` level, with the number of events lost in `total`. Its presence means that the logs of that period are incomplete. The usual cause is a high event volume, typically from a tracer at `debug` or `trace`.

## Reading the logs

### Line format

The `Log` and `Stdout` tracers write one line per event, in the following format:

```text
<timestamp> <LEVEL> <description> (<event>) <key> = <value>, <key> = <value>, ...
```

The timestamp is in UTC, with a precision of one second. The following line illustrates the format, although the keys shown vary from event to event:

```text
2026-01-14T09:12:44Z INFO Message delivered (delivery.delivered) queueId = 1834620912, from = "alice@example.org", to = "bob@example.net", hostname = "mx.example.net", code = 250, elapsed = 812ms
```

With the `multiline` option, each key is written on its own line instead. Each event also includes the keys of the session in which it occurred, such as the remote address and the listener, so a line can be understood without looking for the start of its session.

### Related lines

A single message or connection produces many lines. Two keys connect them:

- `queueId` identifies a message in the outbound queue, from the moment it is queued to its final delivery or bounce. Searching the log for the queue identifier shows the life of one message.
- `spanId` identifies a session, such as one SMTP connection. The text format omits it, but the journal, OpenTelemetry and webhooks include it, and the stored delivery history uses it.

### Missing events

Several frequently searched events are logged at `debug`, so they do not appear at the default level. Authentication failures and spam filter verdicts are among them. [Events](/docs/telemetry/events#event-levels) lists them and shows how to raise individual events to `info`. Database queries are logged at `trace`.

### Parsing logs

The log format is designed for people reading logs, not for programs. Event names, keys, levels and the line layout can change between releases, so tools that parse the logs, such as fail2ban or CrowdSec filters, may need to be adjusted after an upgrade. Stalwart's own [automatic IP blocking](/docs/server/auto-ban) covers authentication failures and similar abuse without log parsing.
