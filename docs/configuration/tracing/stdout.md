---
sidebar_position: 4
---

# Standard output

When the `stdout` method is selected, all tracing and logging information will be printed to the standard output. This method can be useful when Stalwart Mail Server is run in a container environment like Docker.

Example: 

```toml
[global.tracing]
method = "stdout"
level = "trace"
```
