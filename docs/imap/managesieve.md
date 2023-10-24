---
sidebar_position: 3
---

# ManageSieve

Sieve ([RFC5228](https://www.rfc-editor.org/rfc/rfc5228.html)) is a scripting language for filtering email messages at or around the time of final delivery. It is suitable for running on a mail server where users may not be allowed to execute arbitrary programs as it has no user-controlled loops or the ability to run external programs. Sieve is a data-driven programming language, similar to earlier email filtering languages such as procmail and maildrop, and earlier line-oriented languages such as sed and AWK: it specifies conditions to match and actions to take on matching.

Stalwart IMAP includes support for [ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) which allows users to upload and manage their Sieve scripts.

## Enabling ManageSieve

In order to enable ManageSieve, a [listener](/docs/configuration/listener) has to be created with the `protocol` attribute set to `managesieve`.

For example:

```toml
[server.listener."sieve"]
bind = ["[::]:4190"]
protocol = "managesieve"
tls.implicit = true
```

## Configuration

To configure the Sieve compiler and interpreter please refer to the [Sieve scripting](/docs/sieve/overview) section.
