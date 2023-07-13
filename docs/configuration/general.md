---
sidebar_position: 3
---

# General settings

This section of the configuration manual deals with some of the general settings of Stalwart Mail Server.

## Server Hostname

The server hostname is utilized in SMTP `EHLO` commands, as well as included in message headers and reports.
This setting is configured using the `server.hostname` parameter in the configuration file:

```toml
[server]
hostname = "mail.mydomain.org"
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

## Shared map

The shared map is an in-memory data structure that is accessible to multiple threads and serves as the storage location for the various rate, concurrency, and quota limiters. The default number of shards for the shared map is controlled by the `global.shared-map.shard` parameter, while the default capacity of each shard can be adjusted using the `global.shared-map.capacity` parameter in the configuration file:

```toml
[global]
shared-map = {shard = 32, capacity = 10}
```

