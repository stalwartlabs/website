---
sidebar_position: 1
---

# Overview

Stalwart produces detailed tracing and logging output that can be directed to several destinations in parallel, each with its own severity threshold and event filters. Multiple tracers can be configured side by side; the destination and filter choices determine what each consumer receives.

Each tracer is an instance of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->). The object is multi-variant: the chosen variant selects the output method and the fields it carries, while a set of common fields ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)) apply to every variant.

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
