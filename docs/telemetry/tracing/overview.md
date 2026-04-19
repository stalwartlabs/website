---
sidebar_position: 1
---

# Overview

Stalwart produces detailed tracing and logging output that can be directed to several destinations in parallel, each with its own severity threshold and event filters. Multiple tracers can be configured side by side; the destination and filter choices determine what each consumer receives.

Each tracer is an instance of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><!-- /breadcrumb:Tracer -->). The object is multi-variant: the chosen variant selects the output method and the fields it carries, while a set of common fields ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)) apply to every variant.

The supported variants are:

- [OpenTelemetry](/docs/telemetry/tracing/opentelemetry): sends traces and logs to an OpenTelemetry collector over HTTP or gRPC. Two variants, `OtelHttp` and `OtelGrpc`, cover the two transports.
- [Log file](/docs/telemetry/tracing/log): writes entries to a text file with rotation (`Log` variant).
- [Journal](/docs/telemetry/tracing/journal): forwards entries to the systemd journal (`Journal` variant). Linux only.
- [Console](/docs/telemetry/tracing/console): prints entries to standard error (`Stdout` variant).

## Logging levels

The verbosity of a tracer is set through [`level`](/docs/ref/object/tracer#level). The available levels are:

- `error`: only critical errors that threaten normal operation.
- `warn`: warnings that indicate potential problems.
- `info`: general informational output.
- `debug`: detailed diagnostic information useful when troubleshooting.
- `trace`: the most verbose level, logging nearly every internal operation.

A tracer can be switched off without deleting it by setting [`enable`](/docs/ref/object/tracer#enable) to `false`.

## Event filters

Each tracer can be narrowed to a specific set of events through [`events`](/docs/ref/object/tracer#events) together with [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy). The policy is either `include` (only the listed events are emitted) or `exclude` (the listed events are suppressed and everything else is emitted). The list of event identifiers is documented on the [Events](/docs/telemetry/events) page.

## Backpressure

If a tracer cannot keep up with the emitted volume, the default behaviour is to apply backpressure. Setting [`lossy`](/docs/ref/object/tracer#lossy) to `true` lets the server drop entries instead, which is appropriate when loss of detail is preferable to slowing down the main event path.
