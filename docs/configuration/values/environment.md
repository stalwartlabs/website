---
sidebar_position: 11
---

# Environment Variables

Settings can also be retrieved from environment variables. This is particularly useful for sensitive data such as passwords, keys, or other credentials.
To reference an environment variable within the TOML configuration file, prefix the desired environment variable name with the `!` character. The server will automatically fetch the corresponding value from the set environment variables during runtime.

For example:

```toml
[oauth]
key = !OAUTH_KEY
```

In this example, `!OAUTH_KEY` looks for an environment variable named `OAUTH_KEY` and uses its value for the `key` field under the `oauth` section.

