---
sidebar_position: 4
---

# Standard output

When the `stdout` method is used, all tracing and logging information will be printed to the standard output. This method can be useful when Stalwart Mail Server is run in a container environment like Docker. When the `stdout` method is selected, the following configuration options are available under the `tracer.<id>` key:

- `ansi`: Whether to use ANSI escape sequences to colorize the log output.

Example: 

```toml
[tracer.stdout]
type = "stdout"
level = "trace"
ansi = true
enable = true
```
