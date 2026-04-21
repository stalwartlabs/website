---
sidebar_position: 4
---

# Environment variables

A small number of environment variables influence how Stalwart starts. None of them are required for a normal installation; they exist for recovery, diagnostics, and clustering.

## Recovery and bootstrap

The following variables control the [recovery](/docs/configuration/recovery-mode) and [bootstrap](/docs/configuration/bootstrap-mode) modes:

- **`STALWART_RECOVERY_MODE`**: enables recovery mode when set to `1` or `true`. Defaults to off, so Stalwart starts normally when the variable is unset or set to any other value.
- **`STALWART_RECOVERY_MODE_PORT`**: HTTP port the recovery or bootstrap listener binds to. Defaults to `8080`.
- **`STALWART_RECOVERY_MODE_LOG_LEVEL`**: verbosity of the log output while the server is in recovery or bootstrap mode. Defaults to `info`.
- **`STALWART_RECOVERY_ADMIN`**: configures the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) in the form `username:password`. The same variable is also used during bootstrap to pin an administrator credential instead of relying on the randomly generated one.

## Clustering

When Stalwart runs as part of a cluster, additional variables influence how a given node participates. All are covered in detail in the clustering documentation and are listed here for completeness, so operators know which values the binary reads from the environment:

- **`STALWART_HOSTNAME`**: overrides the hostname obtained from the operating system. The resulting value is used to acquire the [node id](/docs/cluster/configuration/node-id) lease, so setting this variable is the recommended way to assign a distinct identity to a node whose system hostname cannot be changed or is not unique across the cluster.
- **`STALWART_ROLE`**: selects which [cluster role](/docs/cluster/configuration/roles) the node takes on, determining which tasks and listeners are active on that machine.
- **`STALWART_PUSH_SHARD`**: assigns the node to a specific push notification shard.
