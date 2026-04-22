---
sidebar_position: 4
---

# Environment variables

A small number of environment variables influence how Stalwart starts. None of them are required for a normal installation; they exist for recovery, diagnostics, public URL composition, and clustering.

## Recovery and bootstrap

The following variables control the [recovery](/docs/configuration/recovery-mode) and [bootstrap](/docs/configuration/bootstrap-mode) modes:

- **`STALWART_RECOVERY_MODE`**: enables recovery mode when set to `1` or `true`. Defaults to off, so Stalwart starts normally when the variable is unset or set to any other value.
- **`STALWART_RECOVERY_MODE_PORT`**: HTTP port the recovery or bootstrap listener binds to. Defaults to `8080`.
- **`STALWART_RECOVERY_MODE_LOG_LEVEL`**: verbosity of the log output while the server is in recovery or bootstrap mode. Defaults to `info`.
- **`STALWART_RECOVERY_ADMIN`**: configures the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) in the form `username:password`. The same variable is also used during bootstrap to pin an administrator credential instead of relying on the randomly generated one.

## Public URLs

In normal operation, Stalwart composes the URLs published in its OAuth, OIDC, and JMAP discovery documents from the [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) value stored on the [SystemSettings](/docs/ref/object/system-settings) singleton (the hostname entered in Step 1 of the setup wizard) and the standard HTTPS port `443`. When the public HTTPS port is not `443`, the variable below adjusts the port that appears in those URLs without affecting which port the server itself binds to:

- **`STALWART_HTTPS_PORT`**: the HTTPS port included in published discovery URLs (for example `https://mail.example.com:8443/.well-known/openid-configuration`). Set this when the public-facing HTTPS port (typically the port a reverse proxy listens on) differs from `443`. The variable does not change Stalwart's internal listener bindings; those are configured through the [NetworkListener](/docs/ref/object/network-listener) objects.

The hostname itself is always taken from `defaultHostname` and never from an environment variable. When the public hostname needs to change after the initial setup, update `defaultHostname` through the WebUI under Settings › Network › Services or with the [CLI](/docs/management/cli/overview).

## Clustering

When Stalwart runs as part of a cluster, additional variables influence how a given node participates. All are covered in detail in the clustering documentation and are listed here for completeness, so operators know which values the binary reads from the environment:

- **`STALWART_HOSTNAME`**: overrides the hostname obtained from the operating system. The override is used in two places: at runtime to acquire and renew the cluster [node id](/docs/cluster/configuration/node-id) lease, so that each node in a cluster has a distinct identity even when the underlying system hostnames are not unique or cannot be changed; and at setup time to pre-fill the server hostname field in Step 1 of the wizard. The variable does **not** affect the hostname published in OAuth, OIDC, or JMAP discovery documents at runtime; that always comes from [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) (see [Public URLs](#public-urls) above).
- **`STALWART_ROLE`**: selects which [cluster role](/docs/cluster/configuration/roles) the node takes on, determining which tasks and listeners are active on that machine.
- **`STALWART_PUSH_SHARD`**: assigns the node to a specific push notification shard.
