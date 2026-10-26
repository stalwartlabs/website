---
sidebar_position: 2
title: "Preparation"
description: "Plan the addresses of the source, the new deployment and the proxy, and install Stalwart, the command-line interface, the migration proxy and Vandelay."
---

The migration needs four components besides the existing server, which this guide calls the source: the new Stalwart deployment, the Stalwart command-line interface, the migration proxy and Vandelay. This first stage plans the addresses that they use, and installs them. None of the components touches the source, so the stage causes no downtime and no change that clients can observe.

The migration proxy and Vandelay are separate products, with their own 1.x release series. Use the current release of each. Neither needs to match the release of Stalwart.

## Planning the addresses

At the cutover, the proxy takes over the public hostname and ports that the source answers on today. From then on, the proxy has to forward connections to both servers, so the source and the new deployment each need an address of their own that the proxy can reach.

A common arrangement gives each server an internal hostname, for example `source.internal.example.org` and `new.internal.example.org`. The public hostname that clients use, for example `mail.example.org`, keeps resolving to the source until the cutover, and is repointed to the proxy at that point. The examples in this guide use these names.

The proxy host also needs a stable address on the network that reaches the servers. The proxy forwards client connections from that address, and both servers are later configured to trust it. The examples use the following addresses:

- `203.0.113.10` for the proxy
- `203.0.113.20` for the new deployment
- `203.0.113.30` for the source
- `203.0.113.40` for the host that runs Vandelay

## Installing the new Stalwart deployment

The new deployment is a fresh Stalwart server, installed by following the [installation instructions](/docs/install/platform/) for the target platform. The source and the new deployment run at the same time for the whole migration, so the new deployment runs on its own host or address.

The setup wizard creates an administrator account. The later steps use it to create domains and accounts and to configure split delivery. The [configuration](/docs/configuration/) and [management](/docs/management/) sections describe how the new deployment is administered.

Before any real account depends on the new deployment, exercise it with a test account: sign in with a mail client, send and receive a message, and open the WebUI.

## Installing the command-line interface

The Stalwart command-line interface administers the new deployment, and the following steps use it to create domains and accounts and to configure split delivery. Install it by following its [installation instructions](/docs/management/cli/#installation).

The interface does not need to match the server's release. It reads the schema of the server it connects to and derives its commands from it, so any release of the interface works against the new deployment.

## Installing the migration proxy

The migration proxy is installed on the host that will take over the public ports, by following the proxy [installation instructions](/docs/migration/proxy/installation/). The proxy is configured in a later step and started only at the cutover, so installing it has no effect on the running system.

When the proxy runs as a container, pin the image to a specific release tag. An image that changed when the container was recreated would change the proxy's behaviour in the middle of the migration.

## Installing Vandelay

Vandelay is the tool that copies each account's data. Install it on an administrative host that can reach both servers, by following its [installation instructions](/docs/migration/import-export/installation/).

Vandelay writes each account it copies to a local archive file, one file per account. Within an archive, identical message bodies and file contents are stored only once. The guide keeps each archive until the account it holds has been validated on the new deployment. The host therefore needs free disk space for every archive kept at the same time, not only for the largest mailbox. Two practices raise this requirement further: copying accounts in parallel, and keeping archives as a fallback copy until the source is decommissioned.

## Rollback

Nothing installed in this stage alters the source or the path that clients take to it. Abandoning the migration at this point therefore requires no rollback. The new components can be left unused or removed, and the source continues to operate as before.
