---
sidebar_position: 7
---

# Rate

Rates are represented as strings that consist of an integer value followed by the symbol `/` and a duration. The duration specifies the time interval over which the integer value is to be distributed. For example:

```toml
rate1 = "20 / 5m"  # 20 every 5 minutes
rate2 = "1 / 1d"  # 1 per day
```

In the first example, `20 / 5m` represents a rate of 20 occurrences per 5 minutes. In the second example, `1 / 1d` represents a rate of 1 occurrence per day. The integer value, the `/` symbol, and the duration must be enclosed in quotes or string literals in order to be treated as a string in the TOML file.

