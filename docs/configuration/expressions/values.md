---
sidebar_position: 4
---

# Values

Dynamic Values are an integral part of configuration that allows for more sophisticated and adaptable setups. Through dynamic values, Stalwart Mail Server provides administrators with a high degree of flexibility, allowing them to create configurations that adapt in real-time to the context of the server operation.

Dynamic Values are essentially expressions that are evaluated at runtime using data from either environment variables or matching conditions defined within an `if` clause. These expressions can reference any of the supported environment [variables](/docs/configuration/variables) or positional variables captured by a regular expression.

## Positional Variables

These variables refer to the data matched by a regex or other [expressions](/docs/configuration/expressions/overview). They are denoted as `$n`, where `n` is a number that represents the position of the matched group in a regular expression. For instance:

```toml
[session.rcpt]
rewrite = [ { if = "listener != 'smtp' & matches('^([^.]+)@([^.]+)\.(.+)$', rcpt)", then = "$1 + '@' + $3" }, 
            { else = false } ]
```

In this configuration expression `$n` would be replaced by the nth capture group from the regular expression match. Here, `$0` would represent the entire matched string. 

## Environment Variables

Dynamic Values can also be generated using environment variables. Any of the supported [environment variables](/docs/configuration/variables) such as `remote_ip`, `local_ip`, or `listener` can be used. These variables can be referenced directly within the dynamic value string, making them incredibly useful for creating settings that adapt to the environment of the running application. For example:

```toml
directory = "'sql_' + listener"
```

In this example, `listener` will be replaced at runtime by the value of the `listener` environment variable.

