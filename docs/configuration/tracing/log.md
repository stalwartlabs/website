---
sidebar_position: 3
---

# Log file

Stalwart Mail Server provides the ability to log information to a text file that can be rotated at a specified interval. When the `log` method is selected, the following configuration options are available under the global.tracing key:

- `path`: The path to the directory where the log files will be stored.
- `prefix`: The prefix to be used for each log file.
- `rotate`: The frequency of log file rotation. Acceptable values are `daily`, `hourly`, `minutely`, or `never`.

Example:

```toml
[global.tracing]
method = "log"
path = "/opt/stalwart-mail/logs"
prefix = "stalwart-mail.log"
rotate = "daily"
level = "info"
```

