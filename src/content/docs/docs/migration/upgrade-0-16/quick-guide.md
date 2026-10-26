---
sidebar_position: 1.5
title: "Quick migration guide"
description: "The steps of a stalwart-migrate migration from Stalwart 0.16 to 1.0 in order, from installing the tool to starting Stalwart 1.0, with links to the details of each step."
---

This page lists the steps of a migration from Stalwart 0.16 to 1.0 with `stalwart-migrate`, in the order they are performed. It covers the common case: a deployment that copies its data while 0.16 keeps running, and stops 0.16 only for the final copy. Each step links to the page with the full details, options and failure cases.

The examples assume a single server installed with the default paths:

- The 0.16 configuration in `/etc/stalwart/config.json`
- The configuration of the new 1.0 store in `/etc/stalwart-v1/config.json`
- The tool's state in `/var/lib/stalwart-migrate`

## 1. Check the requirements

The source must run Stalwart 0.16.27, so upgrade an earlier 0.16 release first. The host also needs free space for a second copy of the data store. With an external blob store, only the data store itself is copied. The [requirements](/docs/migration/upgrade-0-16/#requirements) list the remaining conditions.

## 2. Install the tool

Install the tool in the same way as Stalwart itself. For a server installed with the install script, install the binary with its own install script, run as root so that the binary is placed in `/usr/local/bin`:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/stalwartlabs/stalwart-migrate/releases/latest/download/stalwart-migrate-installer.sh | sudo sh
```

The migration commands need root as well. The install script of Stalwart gives the configuration and data directories to the `stalwart` user, and makes them unreadable for other users, so the tool cannot read the 0.16 store as an ordinary user. Every `stalwart-migrate` command below therefore runs with `sudo`. A binary installed without root would go to `~/.local/bin`, which `sudo` does not search.

For a server running in Docker, run the tool from its image instead, as a Compose service that shares the volumes, network and environment of the Stalwart service. Every `stalwart-migrate` command below then becomes `docker compose run --rm migrate <command> <options>`. Such commands need neither `sudo` nor `--owner`, because the container runs as the same user as the Stalwart container.

[Installation](/docs/migration/upgrade-0-16/installation) describes both methods, the `-fdb` build for FoundationDB, the Compose service, and the options for hosts on which the paths of the stores differ from those of the server.

## 3. Create the new store

Create an empty store for 1.0, such as a new PostgreSQL database or a new RocksDB directory, together with a configuration file that defines it. For RocksDB, `/etc/stalwart-v1/config.json` contains:

```json
{
  "@type": "RocksDb",
  "path": "/var/lib/stalwart-v1/"
}
```

This file later becomes the configuration of the 1.0 server. [Configuration files](/docs/migration/upgrade-0-16/prepare#configuration-files) shows other backends.

## 4. Prepare the migration

Run `prepare`. It converts the 0.16 settings to 1.0, and asks about each conversion that needs a decision, such as reusing an external blob store and the data categories to copy:

```bash
sudo stalwart-migrate prepare \
  --source /etc/stalwart/config.json \
  --state /var/lib/stalwart-migrate
```

Then review `prepare-report.txt` in the state directory, which lists every dropped object and every changed setting. [Preparing the migration](/docs/migration/upgrade-0-16/prepare) explains each question, the data categories and the handling of a shared blob store.

## 5. Copy the data while 0.16 runs

Run the first copy while 0.16 serves users. It can take hours on a large deployment. It can also be interrupted, and resumed by running the same command again:

```bash
sudo stalwart-migrate run \
  --source /etc/stalwart/config.json \
  --target /etc/stalwart-v1/config.json \
  --state /var/lib/stalwart-migrate \
  --owner "$(id -u stalwart):$(id -g stalwart)"
```

`--owner` gives the files of the new store to the `stalwart` user, which the 1.0 service runs as. Without it, a run as root leaves them owned by root, and the 1.0 service fails to open its store.

Repeat the same command as often as needed. Each run copies only what changed since the previous one, so a run shortly before the maintenance window keeps the final copy short. To see the progress and any account in error, run `sudo stalwart-migrate status --state /var/lib/stalwart-migrate`. [Running the migration](/docs/migration/upgrade-0-16/migrate) covers the tuning options and the handling of errors.

## 6. Run the final copy

The maintenance window starts here. Stop every 0.16 node, then run the final copy:

```bash
sudo stalwart-migrate run --final \
  --source /etc/stalwart/config.json \
  --target /etc/stalwart-v1/config.json \
  --state /var/lib/stalwart-migrate \
  --owner "$(id -u stalwart):$(id -g stalwart)"
```

The command asks for `yes` to confirm that 0.16 is stopped, and checks for 30 seconds that nothing changes in the 0.16 store. It then copies the last changes, finalises the 1.0 store, and verifies a sample of accounts. [Final run](/docs/migration/upgrade-0-16/migrate#final-run) describes the steps, and what to do when the run reports errors.

## 7. Review the result

Before starting 1.0, check the result printed at the end of the final run, and review the errors and verification mismatches:

```bash
sudo stalwart-migrate report --state /var/lib/stalwart-migrate --severity error
```

When the window allows it, `stalwart-migrate verify --full` compares every account. [Verifying the migration](/docs/migration/upgrade-0-16/verify) explains the report and the verification.

## 8. Start Stalwart 1.0

Start the 1.0 server with the configuration of the new store, while 0.16 stays stopped. The method follows the installation:

- **Script installation.** Keep a copy of the 0.16 configuration, copy `/etc/stalwart-v1/config.json` over `/etc/stalwart/config.json`, then run the [1.0 install script](/docs/install/upgrade#upgrading-a-script-installation). Because the configuration file exists, the script replaces the binary, keeps the configuration and the environment file, and restarts the service on the new store.
- **Docker.** Start the `stalwartlabs/stalwart:v1` image with the new configuration as its `config.json` and the new data volume mounted at the path that configuration names, as described in [Mounting the new store in the 1.0 container](/docs/migration/upgrade-0-16/installation#mounting-the-new-store-in-the-10-container).

Stalwart 1.0 rebuilds the search index after it starts, so searches return incomplete results until the rebuild finishes. Users also sign in again in OAuth clients.

Keep the 0.16 store and the state directory until 1.0 has proved itself. [Rolling back](/docs/migration/upgrade-0-16/rollback) describes the return to 0.16, both before and after 1.0 has served users.
