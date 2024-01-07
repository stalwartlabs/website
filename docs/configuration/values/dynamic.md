---
sidebar_position: 9
---

# Dynamic

Dynamic Values are an integral part of configuration that allows for more sophisticated and adaptable setups. Through dynamic values, Stalwart Mail Server provides administrators with a high degree of flexibility, allowing them to create configurations that adapt in real-time to the context of the server operation. They are essentially strings that are assembled at runtime using data from either environment variables or matching conditions defined in rules. These strings can include variables defined within `${}`, which can refer to data matched by a rule or from specific environment variables. 

Dynamic Values may reference either positional or environment variables. Positional variables refer to the data matched by a regex or other rules. Environment variables refer to the environment of the running application.

## Positional Variables

These variables refer to the data matched by a regex or other [rules](/docs/configuration/rules/syntax). They are denoted as `${n}`, where `n` is a number that represents the position of the matched group in a regular expression. For instance:

```toml
[session.rcpt]
rewrite = [ { if = "rcpt", matches = "^([^.]+)@([^.]+)\.(.+)$", then = "${1}+${2}@${3}" }, 
            { else = false } ]
```

In this configuration rule `${n}` would be replaced by the nth capture group from the regular expression match. Here, `${0}` would represent the entire matched string. 

It's worth noting that these positional variables can also be used with `eq`, `starts-with`, and `ends-with` comparators. However, in these cases, only the `${0}` variable is available, representing the entire matched string. An example for this scenario is: 

```toml
sign = [ { if = "rcpt-domain", eq = "example.org", then = "rsa_${0}" }, 
         { else = false } ]
```

## Environment Variables

Dynamic Values can also be generated using environment variables. Any of the supported [environment variables](/docs/configuration/variables) such as `remote-ip`, `local-ip`, or `listener` can be used. These variables can be referenced directly within the dynamic value string, making them incredibly useful for creating settings that adapt to the environment of the running application. For example:

```toml
directory = "sql_${listener}"
```

In this example, `${listener}` will be replaced at runtime by the value of the `listener` environment variable.


