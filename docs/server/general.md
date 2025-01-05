---
sidebar_position: 1
---

# General

This section of the configuration manual deals with some of the general settings of Stalwart Mail Server.

## Server Hostname

The default server hostname is utilized in SMTP `EHLO` commands, as well as included in message headers and reports.
This setting is configured using the `lookup.default.hostname` parameter in the configuration file:

```toml
[lookup.default]
hostname = "mail.example.org"
```

## Thread pool size

Stalwart Mail Server utilizes a thread pool for the execution of CPU-intensive tasks. The default size of the thread pool is equal to the number of CPUs available on the server. However, the size of the thread pool can be manually adjusted using the `global.thread-pool` parameter in the configuration file:

```toml
[global]
thread-pool = 16
```

It is important to keep in mind that setting the size of the thread pool to a value higher than the number of CPUs available on the server does not guarantee improved performance.

## IP address blocking

IP addresses and ranges can be blocked by the server to reject connections from specific sources. This is done by updating the `server.blocked-ip` setting in the configuration file, which accepts a list of IP addresses or network masks that should be blocked. For example:

```toml
[server]
blocked-ip = { "192.0.2.20", "203.0.113.0/24" }
```

Since sets are not supported in TOML, if you are using an editor that fails to parse the above syntax, you can use the following format instead:

```toml
[server.blocked-ip]
"192.0.2.20" = ""
"203.0.113.0/24" = ""
```

If [fail2ban](/docs/server/auto-ban) is enabled, the server will automatically block IP addresses that exceed the configured number of failed authentication attempts. The most practical way to manage blocked IPs in the `server.blocked-ip` setting is through the [web-admin](/docs/management/webadmin/overview) or the [command-line interface](/docs/management/cli/overview). 

## IP address allowlist

Conversely, IP addresses and ranges can be allowed by the server to accept connections from specific sources and do not enforce any restrictions such as fail2ban on them. This is done by updating the `server.allowed-ip` setting in the configuration file, which accepts a list of IP addresses or network masks that should be allowed. For example:

```toml
[server]
allowed-ip = { "192.0.2.30" }
```

By default the localhost IP address `127.0.0.1` and `::1` are on this list to prevent accidental lockouts.

## Run as user

On Linux systems, Stalwart Mail Server requires the `CAP_NET_BIND_SERVICE` capability to bind to privileged ports (ports below 1024). However, in older systems where this capability is not supported, Stalwart Mail Server can also be run as the `root` user and then drop privileges to a non-privileged user. The non-privileged account and group name can be configured using the `RUN_AS_USER` and `RUN_AS_GROUP` environment variables, respectively.
