---
sidebar_position: 2
title: "Preparation"
---

The migration relies on four components running alongside the existing deployment: the new Stalwart server, the Stalwart command-line interface, the migration proxy and Vandelay. This stage installs all four. None of them touches the live server, so the entire stage is performed without downtime and without any change visible to existing clients.

The guide assumes an existing, running Stalwart deployment of version 0.15 or below, referred to throughout as the old deployment, and that the goal is to move its accounts onto a fresh installation of the latest release, referred to as the new deployment.

## Planning the addresses

The proxy will eventually take over the public ports that the old server currently answers on, so the two Stalwart deployments need to be reachable at addresses of their own that the proxy can forward to. A common arrangement gives each deployment an internal hostname, for example `old.internal.example.org` and `new.internal.example.org`, while the public hostname that clients already use, such as `mail.example.org`, is repointed to the proxy at the cutover. Deciding on these addresses now makes the configuration that follows straightforward. No public DNS change is made yet; the public hostname continues to resolve to the old server until the cutover.

## Installing the new Stalwart deployment

The new deployment is installed as a normal, fresh Stalwart server following the standard [installation instructions](/docs/install/platform/) for the target platform. It is installed on its own host or address rather than over the existing server, because both deployments must run at the same time. The initial setup creates an administrator account, which the later steps use to create domains and accounts and to configure split delivery.

The configuration model, the administration interface and the storage layout changed substantially after version 0.15. Becoming familiar with the latest release before relying on it in production is strongly recommended. The [configuration](/docs/configuration/) and [management](/docs/management/) sections describe the current model, and the next step of this guide assumes a working understanding of how the new server is administered.

## Installing the command-line interface

The Stalwart command-line interface administers the new deployment and applies the account-creation plans produced during the migration. It is installed by following its [installation instructions](/docs/management/cli/#installation). The interface is schema-driven: it reads the server's schema on connection and derives its commands from it, so the version installed works against the new deployment without further configuration.

## Installing the migration proxy

The migration proxy is installed on the host that will front the public ports, following the proxy [installation instructions](/docs/migration/proxy/installation/). Installing it does not start it with a working configuration yet; the proxy is configured in a later step and is only started at the cutover. Until then its presence has no effect on the running system.

## Installing Vandelay

Vandelay performs the per-account data transfer. It is installed on an administrative host that can reach both deployments, following its [installation instructions](/docs/migration/import-export/installation/). Vandelay is a single self-contained binary and stores each account it processes in a local archive file, so the host it runs on needs enough disk space to hold the largest mailbox being migrated at any one time.

## Rollback

Nothing installed in this stage alters the old deployment or the path that clients take to it. Abandoning the migration here requires no rollback: the additional components can simply be left unused or removed, and the old server continues to operate exactly as before.
