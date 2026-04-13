---
sidebar_position: 4
---

# Console

When the `console` method is used, all tracing and logging information will be printed to the standard error. This method can be useful when Stalwart is run in a container environment like Docker. When the `console` method is selected, the following configuration options are available under the `tracer.<id>` key:

- `ansi`: Whether to use ANSI escape sequences to colorize the log output.
- `multiline`: Whether to log messages on multiple lines.

Example: 

```toml
[tracer.console]
type = "console"
level = "trace"
ansi = true
enable = true
```
