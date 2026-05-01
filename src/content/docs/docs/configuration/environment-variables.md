---
sidebar_position: 4
title: "Environment variables"
---

A small number of environment variables influence how Stalwart starts. None of them are required for a normal installation; they exist for recovery, diagnostics, public URL composition, and clustering.

## Recovery and bootstrap

The following variables control the [recovery](/docs/configuration/recovery-mode) and [bootstrap](/docs/configuration/bootstrap-mode) modes:

- **`STALWART_RECOVERY_MODE`**: enables recovery mode when set to `1` or `true`. Defaults to off, so Stalwart starts normally when the variable is unset or set to any other value.
- **`STALWART_RECOVERY_MODE_PORT`**: HTTP port the recovery or bootstrap listener binds to. Defaults to `8080`.
- **`STALWART_RECOVERY_MODE_LOG_LEVEL`**: verbosity of the log output while the server is in recovery or bootstrap mode. Defaults to `info`.
- **`STALWART_RECOVERY_ADMIN`**: configures the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) in the form `username:password`. The same variable is also used during bootstrap to pin an administrator credential instead of relying on the randomly generated one.

## Public URLs

The URLs published in Stalwart's OAuth, OIDC, and JMAP discovery documents are built from a single base URL. By default that base is `https://<defaultHostname>` on port `443`, where [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) is the hostname defined in the [SystemSettings](/docs/ref/object/system-settings) object. When the public-facing URL differs (a reverse proxy on a non-standard port, a path-prefixed mount, or a different scheme during local testing), the variable below overrides the base in full:

- **`STALWART_PUBLIC_URL`**: the full base URL clients reach the server on, for example `https://mail.example.com`, `https://mail.example.com:8443`, or `https://example.com/mail`. When set, this value replaces the scheme, host, port, and optional path prefix in every published discovery URL. Trailing slashes are stripped. The variable does not change Stalwart's internal listener bindings; those are configured through the [NetworkListener](/docs/ref/object/network-listener) objects.

`defaultHostname` is still used independently of `STALWART_PUBLIC_URL`: it appears in SMTP greetings, outgoing message headers, and TLS certificate SANs, and serves as the URL fallback when `STALWART_PUBLIC_URL` is unset. Update it through the WebUI under Settings › Network › Services or with the [CLI](/docs/management/cli/).

## Clustering

When Stalwart runs as part of a cluster, additional variables influence how a given node participates. All are covered in detail in the clustering documentation and are listed here for completeness, so operators know which values the binary reads from the environment:

- **`STALWART_HOSTNAME`**: overrides the hostname obtained from the operating system. The override is used in two places: at runtime to acquire and renew the cluster [node id](/docs/cluster/configuration/node-id) lease, so that each node in a cluster has a distinct identity even when the underlying system hostnames are not unique or cannot be changed; and at setup time to pre-fill the server hostname field in Step 1 of the wizard. The variable does **not** affect the URLs published in OAuth, OIDC, or JMAP discovery documents; those come from [`STALWART_PUBLIC_URL`](#public-urls) when set, or from [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) otherwise.
- **`STALWART_ROLE`**: selects which [cluster role](/docs/cluster/configuration/roles) the node takes on, determining which tasks and listeners are active on that machine.
- **`STALWART_PUSH_SHARD`**: assigns the node to a specific push notification shard.
