---
sidebar_position: 3
title: "Log file"
---

Log-file output writes entries to a text file on disk. The file can be rotated at a fixed frequency so that long-running installations do not accumulate a single unbounded log.

Log-file output is represented by the `Log` variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->). Alongside the common tracer fields ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)), the variant carries:

- [`path`](/docs/ref/object/tracer#path): directory in which the log files are written. Required.
- [`prefix`](/docs/ref/object/tracer#prefix): filename prefix for each log file. Default `"stalwart"`.
- [`rotate`](/docs/ref/object/tracer#rotate): rotation frequency. One of `daily`, `hourly`, `minutely`, or `never`. Default `daily`.
- [`ansi`](/docs/ref/object/tracer#ansi): whether ANSI escape sequences are used to colour the output. Default `true`.
- [`multiline`](/docs/ref/object/tracer#multiline): whether each entry spans multiple lines. Default `false`.

For example:

```json
{
  "@type": "Log",
  "path": "/opt/stalwart/logs",
  "prefix": "stalwart.log",
  "rotate": "daily",
  "ansi": true,
  "multiline": false,
  "enable": true,
  "level": "info"
}
```
