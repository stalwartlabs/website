---
sidebar_position: 4
title: "Environment variables"
description: "The environment variables Stalwart reads at startup: configuration file, recovery and bootstrap mode, public URL, cluster identity, privilege dropping, worker threads, exports and the container health check."
---

Almost all of Stalwart's configuration lives in its data store, but a few settings are needed before the data store can be read, or describe the environment the process runs in. Stalwart reads these from environment variables when it starts.

A normal installation needs none of them. They exist for specific situations: selecting the configuration file, switching to recovery mode, setting the public URL behind a proxy, identifying a cluster node and tuning the process. All of them are read only at startup, so a change takes effect after a restart.

Where the variables are set depends on how the server was installed. Installations made with the installation script read them from the environment file `/etc/stalwart/stalwart.env`, or `/usr/local/etc/stalwart/stalwart.env` on FreeBSD. That file lists the most common variables, commented out, as described in [Linux and macOS](/docs/install/platform/linux#installation-layout). Containers receive the variables through the container environment, and Windows services through the service wrapper.

## Reference

The server reads the following variables:

| Variable | Default | Effect |
|---|---|---|
| `CONFIG_PATH` | none | Path of the configuration file. When set, it is used instead of the command line, which is then not read at all. |
| `STALWART_RECOVERY_MODE` | off | `1` or `true` starts the server in [recovery mode](/docs/configuration/recovery-mode). Any other value is ignored. |
| `STALWART_RECOVERY_MODE_PORT` | `8080` | Port of the plain HTTP listener used in recovery and [bootstrap mode](/docs/configuration/bootstrap-mode). The listener always binds all interfaces, as explained in [Protect the setup listener](/docs/install/security#protect-the-setup-listener). |
| `STALWART_RECOVERY_MODE_LOG_LEVEL` | `info` | Level of the console log in recovery and bootstrap mode. |
| `STALWART_RECOVERY_ADMIN` | none | The [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator), as `username:password`. Accepted in every mode while set. |
| `STALWART_PUBLIC_URL` | built from the hostname | Base URL published in discovery documents; see [Public URLs](#public-urls). |
| `STALWART_HTTPS_PORT` | none | Port for the public URL when `STALWART_PUBLIC_URL` is not set; see [Public URLs](#public-urls). |
| `STALWART_HOSTNAME` | the machine's host name | Name of the node, used for its cluster [node id](/docs/cluster/configuration/node-id) and proposed as server hostname by the setup wizard. |
| `STALWART_ROLE` | none | The [cluster role](/docs/cluster/configuration/roles) of the node, which selects the tasks and listeners it runs. Must name a role defined in the configuration. |
| `STALWART_PUSH_SHARD` | `1` | The push notification shard the node serves in a cluster, counted from 1. |
| `RUN_AS_USER`, `RUN_AS_GROUP` | none | User and group to switch to after the listeners are bound, for a server started as root; see [Running as an unprivileged user](/docs/server/general#running-as-an-unprivileged-user). Not available on Windows. |
| `TOKIO_WORKER_THREADS` | one per CPU | Number of worker threads that run the server's network and protocol work. |
| `EXPORT_TYPES` | all | With `--export`, the families of data to export, as a comma-separated list; see [Backup and restore](/docs/management/maintenance/backup). |
| `STALWART_HEALTHCHECK_URL` | `https://127.0.0.1:443/healthz/live` | Container image only: the URL probed by the image's health check; see [Docker](/docs/install/platform/docker#health-check). |

## Recovery and bootstrap

Four variables control [recovery mode](/docs/configuration/recovery-mode) and [bootstrap mode](/docs/configuration/bootstrap-mode): `STALWART_RECOVERY_MODE`, `STALWART_RECOVERY_MODE_PORT`, `STALWART_RECOVERY_MODE_LOG_LEVEL` and `STALWART_RECOVERY_ADMIN`.

One of them needs particular care. `STALWART_RECOVERY_ADMIN` is also accepted in normal operation, where it acts as a full-access credential. It must therefore be removed from the environment once it is no longer needed, as described in [Retire the recovery administrator](/docs/install/security#retire-the-recovery-administrator).

## Clustering

In a [cluster](/docs/cluster/), every node reads the same configuration from the shared data store. What tells the nodes apart is set in the environment instead, through three variables.

`STALWART_HOSTNAME` gives a node a distinct identity where machine host names are not unique, as in containers. It does not change the published URLs. `STALWART_ROLE` selects the node's [role](/docs/cluster/configuration/roles). `STALWART_PUSH_SHARD` selects the push notification shard the node serves, counted from 1.

## Public URLs

Clients find the server's HTTP endpoints through the OAuth, OpenID Connect and JMAP discovery documents. These documents publish absolute URLs, all built from one base URL. The same URL also limits OAuth sign-in, which the server accepts only for its host and for the configured service host names.

The server takes the base URL from the first of these sources that is available:

1. `STALWART_PUBLIC_URL`, with a trailing slash removed, for example `https://mail.example.com` or `https://mail.example.com:8443`.
2. When `STALWART_HTTPS_PORT` is set, `https://<host>:<port>`, where the host is `STALWART_HOSTNAME` or the machine's host name.
3. `https://` followed by the host name of the JMAP entry in [`SystemSettings.services`](/docs/server/general#mail-exchangers-and-advertised-services) when it has one, or by [`SystemSettings.defaultHostname`](/docs/ref/object/system-settings#defaulthostname).

Set `STALWART_PUBLIC_URL` when clients reach the server at a URL other than `https://<hostname>`, for example through a reverse proxy or on another port. [Reverse proxy](/docs/server/reverse-proxy/#public-url) explains the consequences.

The variable changes only the published URLs. The ports the server listens on are set by its [listeners](/docs/server/listener), and the server hostname keeps its other uses, such as the SMTP greeting and certificate requests.

## Worker threads

`TOKIO_WORKER_THREADS` sets the size of the thread pool that runs the server's network connections and protocol processing. When the variable is unset, the pool has one thread per CPU. Disk operations are not part of this pool: the RocksDB and SQLite data stores run them on a separate pool, sized by their `poolWorkers` setting. [Worker threads](/docs/performance/connections#worker-threads) describes when changing the number of threads helps.
