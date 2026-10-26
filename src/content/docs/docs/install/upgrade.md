---
sidebar_position: 11
title: "Upgrading"
description: "Upgrade a Stalwart 1.x server to a newer release: version numbering, backups, and the upgrade procedure for script, container and Windows installations."
---

A mail server runs for years, and over that time it receives fixes, new features and, now and then, changes to how it stores data. Some of these releases can go in without a second thought, while others change behaviour that users or other systems depend on. The administrator needs to tell the two apart before installing a release.

Stalwart releases follow [semantic versioning](https://semver.org/), which makes this possible: the version number shows what kind of change a release contains, and therefore how much review it needs before it is installed. This page describes the release types and how to install a newer 1.x release on each platform.

## Release types

| Release type | Example | Contents |
|---|---|---|
| Patch | `1.0.1`, `1.0.2` | Fixes only |
| Minor | `1.1.0` | New features, possibly new settings or changed defaults |
| Major | `2.0.0` | Possible changes to the data format or removed settings |

A patch release contains only fixes and needs no further review. A minor release can change how an existing installation behaves, so read its release notes first: they state any change that requires action, such as a default that behaves differently. A major release may change the data format, and its release notes give an upgrade procedure that may differ from the steps below, which then takes precedence.

Stalwart publishes release notes with each release on the [releases page](https://github.com/stalwartlabs/stalwart/releases) and in the `CHANGELOG.md` file of the repository.

## Before upgrading

Back up the data stores and `config.json` before every minor or major upgrade, as described in [Backup and restore](/docs/management/maintenance/backup). A newer release can write data that an older release cannot read, so a backup is the only way back if the upgrade has to be reverted.

## Upgrading a script installation

An installation made with the script is upgraded with the same script. Rerun it on the host, and it replaces the binary, keeps `config.json` and the environment file, and restarts the service:

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://get.stalw.art/install.sh -o install.sh
$ sudo sh install.sh
```

Pass the same arguments as for the original installation, such as the prefix directory or `--fdb`, because otherwise the script installs the binary to the default location. Because `config.json` already exists, the script ends with `Upgrade complete! The service was restarted with the new binary.` and prints no bootstrap instructions.

## Upgrading a container

The image is published with the following tags:

| Tag | Follows |
|---|---|
| `v1` | The newest 1.x release |
| `v1.0`, `v1.1`, ... | The newest patch release of one minor release |
| `v1.0.0`, ... | One release exactly |
| `latest` | The newest release, including future major releases |

Use `stalwartlabs/stalwart:v1`: it receives fixes and minor releases but never a major release that may need a different upgrade procedure. Avoid `latest` for the same reason. Pin a minor or exact tag where every change, including minor releases, has to go through a test environment first. To upgrade, pull the image and recreate the container:

```bash
$ docker pull stalwartlabs/stalwart:v1
$ docker stop stalwart && docker rm stalwart
$ docker run -d --name stalwart ... stalwartlabs/stalwart:v1
```

With Docker Compose, `docker compose pull` followed by `docker compose up -d` does the same. The configuration and data live in volumes, so recreating the container does not affect them.

## Upgrading on Windows

The Windows installation consists of a single executable, so an upgrade replaces that file. Stop the service, replace `stalwart.exe` with the binary from the new release archive, and start the service again.

## Moving from another server

Upgrading in place covers 1.x releases of the same installation. A server from a release before 1.0 cannot be upgraded in place, because Stalwart 1.0 does not open data stores created by earlier releases and stops with `The data store was created by a Stalwart version prior to 1.0 (schema version <N>) and cannot be opened by this version.` The [migration section](/docs/migration/) describes the procedures for such servers, for data that comes from another mail system, and for a release whose notes state that its data store cannot be upgraded in place.
