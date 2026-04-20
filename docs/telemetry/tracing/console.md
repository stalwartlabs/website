---
sidebar_position: 4
---

# Console

The console output writes every log and trace entry to standard error. This is convenient when Stalwart runs in a container environment such as Docker, where the container runtime captures `stderr` directly.

The console output is represented by the `Stdout` variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->). Alongside the common tracer fields ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)), the variant carries:

- [`ansi`](/docs/ref/object/tracer#ansi): whether ANSI escape sequences are used to colour the output. Default `false`.
- [`multiline`](/docs/ref/object/tracer#multiline): whether each entry spans multiple lines. Default `false`.
- [`buffered`](/docs/ref/object/tracer#buffered): whether entries are buffered before being written. Default `true`.

For example:

```json
{
  "@type": "Stdout",
  "ansi": true,
  "multiline": false,
  "buffered": true,
  "enable": true,
  "level": "trace"
}
```
