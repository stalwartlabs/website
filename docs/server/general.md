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
hostname = "mail.mydomain.org"
```

## Cluster Node ID

When running Stalwart Mail server in a cluster, the `cluster.node-id` configuration attribute must be set to a unique identifier for each node. This is required for the server to function properly in a clustered environment. The node ID can be any integer value, but it must be unique across all nodes in the cluster.

For example:

```toml
[cluster]
node-id = 1
```

## Run as user

On Unix/Linux systems, Stalwart Mail Server requires the `root` user's privileges to bind to privileged ports. Afterward, these privileges are dropped, and Stalwart operates using the UID/GID of a non-privileged account. The non-privileged account's UID is configured with the `server.run-as.user` attribute, while the GID is configured with the `server.run-as.group` attribute. For example:

```toml
[server.run-as]
user = "stalwart-smtp"
group = "stalwart-smtp"
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
blocked-ip = { "192.168.0.20", "10.0.0.0/8" }
```

Since sets are not supported in TOML, if you are using an editor that fails to parse the above syntax, you can use the following format instead:

```toml
[server.blocked-ip]
"192.168.0.20" = ""
"10.0.0.0/8" = ""
```

If [fail2ban](/docs/auth/security#fail2ban) is enabled, the server will automatically block IP addresses that exceed the configured number of failed authentication attempts. The most practical way to manage blocked IPs in the `server.blocked-ip` setting is through the [web-admin](/docs/management/webadmin/overview) or the [command-line interface](/docs/management/cli/overview). 
