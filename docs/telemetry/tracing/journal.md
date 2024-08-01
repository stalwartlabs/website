---
sidebar_position: 5
---

# Journal

**Journal** is the logging system provided by the `systemd` suite, specifically managed by the `systemd-journald` service. Unlike traditional logging methods in Linux which rely on plain-text log files (e.g., `/var/log/syslog` or `/var/log/messages`), the journal captures system and service messages in a binary format. This format ensures better indexing, querying, and verification capabilities.

The journal logs are stored in **journal files**. By default, these files are located at:

- `/run/log/journal/`: For volatile logs, meaning they're stored in memory and will be lost after a reboot.
- `/var/log/journal/`: For persistent logs, which are saved to disk and will persist across reboots.

If the directory `/var/log/journal/` exists, logs will be stored persistently; otherwise, they will remain volatile.
It's important to note that, due to its binary nature, the content of the journal cannot be read using regular text tools like `cat` or `less`. Instead, you would use the `journalctl` command to access, read, and query the logs.

To enable journal logging, set the `tracer.<id>.type` attribute to `journal` in the configuration file. For example:

```toml
[tracer.journal]
type = "journal"
level = "info"
enable = true
```

