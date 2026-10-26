---
sidebar_position: 2
title: "Events"
description: "How Stalwart events are named and levelled, how to change the level of an event, and where the complete list of events and keys is found."
---

Everything that Stalwart reports about its activity takes the form of an event. Events are the raw material of all telemetry: tracers, webhooks, live telemetry and the stored history all receive the same events, and they differ only in where they send them and which ones they select. Knowing how events are named and levelled is therefore the starting point for finding anything in the logs.

An event has three parts:

- A name made of a group and an action, such as `auth.success`, `delivery.delivered` or `smtp.mail-from`.
- A default severity level, which decides whether a given tracer records the event.
- A set of keys that describe the event, such as `remoteIp`, `accountId` or `queueId`.

## Event types

Events are organised in groups named after the part of the server that produces them, such as `smtp`, `imap`, `delivery`, `queue`, `auth`, `store`, `cache` or `search-index`. The group therefore tells the reader where an event comes from.

The generated reference pages list every event and key, and they are the place to look up a particular one. The [event reference](/docs/ref/events) gives each event with its default level and description. The [key reference](/docs/ref/enum/key) lists the keys that events carry, and the [metrics reference](/docs/ref/metrics) lists the metrics derived from events.

## Event levels

Each event has one of five levels, from the most to the least severe:

- `error`: a failure that typically requires attention.
- `warn`: an unusual situation that may indicate a problem.
- `info`: a normal operation of interest, such as an accepted connection or a delivered message.
- `debug`: detail for troubleshooting.
- `trace`: the most detailed level, including protocol exchanges and database queries.

The level works as a threshold. A [tracer](/docs/telemetry/tracing/) records the events whose level is at or above its own [`level`](/docs/ref/object/tracer#level), so a tracer at `info` records `info`, `warn` and `error` events. Because several tracers can run side by side, each can use a different threshold: for example, a log file at `debug` and a journal tracer at `warn`. A [webhook](/docs/telemetry/webhooks) applies its own `level` in the same way.

One consequence of the threshold matters in practice. Several events that administrators commonly look for are logged at `debug`, so a tracer at `info` does not show them:

- Authentication failures (`auth.failed`).
- Spam filter verdicts, including messages rejected at the end of the SMTP `DATA` phase (`spam.classify`).
- The individual steps of outbound delivery: `delivery.attempt-start`, `delivery.connect`, `delivery.start-tls`, `delivery.domain-delivery-start`, `delivery.completed` and `delivery.dsn-success`, and the MTA-STS, DANE and TLS reporting lookups made during delivery (`mta-sts.authorized`, `mta-sts.policy-fetch`, `mta-sts.policy-not-found`, `dane.tlsa-record-not-dnssec-signed`, `tls-rpt.record-fetch`, `tls-rpt.record-not-found`). The outcome of each delivery, `delivery.delivered`, is logged at `info`.
- Cache activity (the `cache` group), search indexing (the `search-index` group) and SQL queries (`store.sql-query`, at `trace`).

## Changing the level of an event

When one of these events is needed in a log at `info`, the better approach is to change the level of that event rather than the level of the tracer. Raising the few events that matter to `info` keeps logs readable, whereas a tracer at `debug` records every protocol step of every session.

The default level of an event is changed with an [EventTracingLevel](/docs/ref/object/event-tracing-level) object (found in the WebUI under <!-- breadcrumb:EventTracingLevel --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Event Levels<!-- /breadcrumb:EventTracingLevel -->). Each object names one event in [`event`](/docs/ref/object/event-tracing-level#event) and sets its new [`level`](/docs/ref/object/event-tracing-level#level). The same mechanism silences an event: the level `disable` suppresses the event on every tracer.

The change applies to tracers and webhooks only. The stored [history](/docs/telemetry/history) still receives the event, whatever its level.

The following object raises authentication failures to `info`, so that they appear in a log at the default level:

```json
{
  "event": "auth.failed",
  "level": "info"
}
```

The following object suppresses a noisy event:

```json
{
  "event": "smtp.ehlo",
  "level": "disable"
}
```

## Selecting events

Besides the level, each tracer and webhook can include or exclude events by name, with the `events` and `eventsPolicy` fields. This selects events for one destination only, while a changed level applies to all of them.

The policy decides how the list is read. With `eventsPolicy` set to `include`, only the listed events are recorded. With `exclude`, all events except the listed ones are recorded. The policy is <!-- default:Tracer.eventsPolicy -->`exclude`<!-- /default --> by default, so an empty list records every event at or above the level.

Events are listed individually by their full name, because wildcards and group names are not accepted.
