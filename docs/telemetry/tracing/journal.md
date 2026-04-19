---
sidebar_position: 5
---

# Journal

The journal is the logging facility provided by the `systemd` suite, managed by the `systemd-journald` service. Unlike text-file logging (for example `/var/log/syslog` or `/var/log/messages`), the journal captures system and service messages in a binary format, which supports indexed queries and integrity checks.

Journal data is stored in journal files. By default these live at:

- `/run/log/journal/` for volatile logs, which are held in memory and lost on reboot.
- `/var/log/journal/` for persistent logs, which are written to disk and survive reboots.

If `/var/log/journal/` exists, logs are persistent; otherwise they remain volatile. The binary format means the content cannot be read with tools such as `cat` or `less`; the `journalctl` command is used to query and display entries.

Journal output is represented by the `Journal` variant of the [Tracer](/docs/ref/object/tracer) object (found in the WebUI under <!-- breadcrumb:Tracer --><!-- /breadcrumb:Tracer -->). The variant carries no variant-specific fields; only the common tracer fields apply ([`enable`](/docs/ref/object/tracer#enable), [`level`](/docs/ref/object/tracer#level), [`lossy`](/docs/ref/object/tracer#lossy), [`events`](/docs/ref/object/tracer#events), [`eventsPolicy`](/docs/ref/object/tracer#eventspolicy)).

For example:

```json
{
  "@type": "Journal",
  "enable": true,
  "level": "info"
}
```

The `Journal` variant is only available on Linux systems running `systemd`.
