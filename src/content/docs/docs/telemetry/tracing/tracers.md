---
title: "Tracers"
description: "Write events to log files, the console or the systemd journal: file naming and rotation, console output in containers, and journald fields."
sidebar_position: 3
---

Three tracers write events on the server's own host: to log files, to the console and to the systemd journal. Which one fits depends mostly on how the server runs: log files are what the WebUI log viewer reads, the console is the usual choice in containers and foreground runs, and the journal integrates with a server that runs under systemd.

Each is a variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers<!-- /breadcrumb:Tracer -->) and has the common settings described in [Tracing](/docs/telemetry/tracing/#common-settings). Exporting to an OpenTelemetry collector is described in [OpenTelemetry](/docs/telemetry/tracing/opentelemetry).

## Log file

The `Log` tracer writes events as text to files in a directory, starting a new file at a fixed interval. A new installation has one `Log` tracer.

This tracer matters for the WebUI as well. The [WebUI log viewer](/docs/telemetry/management#logs) reads every file in the directory of the first enabled `Log` tracer, so logs can be viewed in the WebUI only when such a tracer exists. For the same reason, that directory should contain only Stalwart's log files.

### File names and rotation

[`path`](/docs/ref/object/tracer#path) is the directory in which the files are written. The server does not create it, so it must exist and be writable by the server's user.

[`prefix`](/docs/ref/object/tracer#prefix) is the beginning of each file name, <!-- default:Tracer.Log.prefix -->`stalwart.log`<!-- /default --> by default. [`rotate`](/docs/ref/object/tracer#rotate) sets how often a new file is started, <!-- default:Tracer.Log.rotate -->`daily`<!-- /default --> by default. The date and time of the start of each file, in UTC, are appended to the prefix:

| `rotate` | File name |
|---|---|
| `daily` | `stalwart.log.2026-01-14` |
| `hourly` | `stalwart.log.2026-01-14T09` |
| `minutely` | `stalwart.log.2026-01-14T09:12` |
| `never` | `stalwart.log` |

Rotation only starts new files. Stalwart does not delete old log files, so they accumulate until something removes them. Use a scheduled job or `logrotate` for this, configured to delete files only, not to rename or truncate the file being written.

### Output format

[`ansi`](/docs/ref/object/tracer#ansi) adds colour codes to the output, which `less -R` and terminal viewers display. It is <!-- default:Tracer.Log.ansi as=enabled -->enabled<!-- /default --> by default for log files. Other tools see the codes as stray characters, so disable it for files that other tools read.

[`multiline`](/docs/ref/object/tracer#multiline) writes each key of an event on its own line. The WebUI log viewer reads the single-line format and shows only the first line of multiline entries, so leave `multiline` off on the tracer whose files the WebUI reads.

### Write failures

If the directory does not exist or cannot be written, the events are discarded, and a `telemetry.log-error` event is emitted with the reason. That event is never written to any `Log` tracer. On a server whose only tracer is a `Log` tracer, the failure is therefore not visible anywhere.

A `Stdout` or `Journal` tracer at level `warn`, alongside the Log tracer, makes such errors visible. When writing resumes, a second `telemetry.log-error` event reports the number of events lost.

The following tracer writes `info` events to `/var/log/stalwart`, starting a new file every day:

```json
{
  "@type": "Log",
  "path": "/var/log/stalwart",
  "prefix": "stalwart.log",
  "rotate": "daily",
  "ansi": false,
  "level": "info"
}
```

## Console

The `Stdout` tracer writes events to the console. Despite the name of the variant, the output goes to standard error. It is the usual choice in containers, where the container runtime collects the output, and when the server runs in the foreground. Only one console tracer can exist.

Three settings shape the output. [`buffered`](/docs/ref/object/tracer#buffered) collects the events of each batch before writing them, which reduces the number of writes. [`ansi`](/docs/ref/object/tracer#ansi) adds colour codes. [`multiline`](/docs/ref/object/tracer#multiline) writes each key on its own line.

The following tracer writes `info` events to the console:

```json
{
  "@type": "Stdout",
  "level": "info"
}
```

Under systemd, console output carries two timestamps. The journal captures console output with its own timestamp, in addition to the timestamp in each line. The `Journal` tracer avoids this duplication and adds structured fields.

## Journal

The `Journal` tracer sends events to the systemd journal, on Linux systems running systemd. It has only the common settings, and only one journal tracer can exist. The tracer needs the journal socket: if the socket is not available, the tracer cannot be created, and the server reports `Failed to create journald subscriber`.

The advantage over console output is that each entry carries structured fields:

- `MESSAGE`: the description of the event, such as `Authentication failed`.
- `PRIORITY`: the level, mapped to syslog priorities: `error` to 3, `warn` to 4, `info` to 5, `debug` to 6 and `trace` to 7.
- `SYSLOG_IDENTIFIER`: the name of the executable, normally `stalwart`.
- One field per key of the event, named after the key in upper case, such as `REMOTEIP`, `ACCOUNTID`, `QUEUEID` or `SPANID`.

The event name is not included. The fields allow entries to be filtered with `journalctl`, by priority or by any key, for example:

```bash
journalctl -t stalwart -p warning
journalctl -t stalwart REMOTEIP=203.0.113.9
journalctl -t stalwart QUEUEID=1834620912
```

The following tracer sends `info` events to the journal:

```json
{
  "@type": "Journal",
  "level": "info"
}
```
