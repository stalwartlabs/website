---
sidebar_position: 3
---

# Log file

Stalwart provides the ability to log information to a text file that can be rotated at a specified interval. When the `log` method is selected, the following configuration options are available under the `tracer.<id>` key:

- `path`: The path to the directory where the log files will be stored.
- `prefix`: The prefix to be used for each log file.
- `ansi`: Whether to use ANSI escape sequences to colorize the log output.
- `rotate`: The frequency of log file rotation. Acceptable values are `daily`, `hourly`, `minutely`, or `never`.
- `multiline`: Whether to log messages on multiple lines.
- `lossy`: Whether to drop log messages when the queue is full.

Example:

```toml
[tracer.log]
type = "log"
path = "/opt/stalwart/logs"
prefix = "stalwart.log"
rotate = "daily"
level = "info"
ansi = true
enable = true
```

