---
sidebar_position: 6
---

# Duration

Durations are represented as a string that consists of an integer value and a unit of measurement. The following units of measurement are available for representing durations:

- `ms`: Milliseconds
- `s`: Seconds
- `m`: Minutes
- `h`: Hours
- `d`: Days 

For example:

```toml
timeout = "30s"
```

In this example, the duration `30s` represents 30 seconds. The integer value and the unit are separated by the unit symbol, and the entire string must be enclosed in quotes or string literals in order to be treated as a string in the TOML file.

