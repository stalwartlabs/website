---
sidebar_position: 1
title: "Overview"
description: "How Stalwart is configured: the config.json file, configuration objects in the data store, the WebUI, CLI and API, the command line, and when changes take effect."
---

Many servers are configured through text files that the administrator edits on disk. Stalwart works differently: it keeps almost all of its configuration in its own data store, the database that also holds its accounts and mail. A small local file, `config.json`, says only where that data store is.

Everything else is stored in the data store as configuration objects, from domains and accounts to listeners, TLS certificates, SMTP rules and spam filter settings, and it is changed through an API. This page explains that model, the command line of the server, and the point at which a change takes effect.

## Configuration objects

Each part of the configuration is an object with a type, such as [Domain](/docs/ref/object/domain), [NetworkListener](/docs/ref/object/network-listener) or [SystemSettings](/docs/ref/object/system-settings). Types come in two kinds. Most can have any number of objects, for example one per domain or one per listener. Others, such as SystemSettings, are singletons, with exactly one object.

Many types also have variants, which select a backend or a mode. A data store, for example, is either RocksDB or PostgreSQL, and each needs different fields. The variant is written as `@type` in JSON. The [schema reference](/docs/ref/) documents every type, its fields and their defaults.

The objects are read and changed through a JMAP API at `/jmap/`. JMAP is the JSON-over-HTTP protocol that Stalwart also offers to mail clients. The configuration API adds one method family per type to it, for example `x:Domain/get` and `x:Domain/set`. Three tools use the API:

- The [WebUI](/docs/management/webui/), the browser-based administration console, which has a form for every type.
- The [CLI](/docs/management/cli/), `stalwart-cli`, for the command line, scripts and [declarative deployments](/docs/configuration/declarative-deployments).
- Any JMAP client, for integrations that call the API directly.

Every value is validated when it is saved. An invalid setting is therefore refused with an error, and never stored. [Object encoding](/docs/configuration/object-encoding) describes how values are written in JSON.

Keeping the configuration in the data store has two consequences for operations. Every node of a [cluster](/docs/cluster/) reads the same configuration, so there are no per-node files to keep in step. A backup of the data store also includes the configuration.

Every field has a default chosen for a secure server. A new installation therefore needs only the settings that the setup wizard asks for. The defaults are listed on the reference page of each object.

## Configuration file

`config.json` contains a single [DataStore](/docs/ref/object/data-store) object, which holds the connection settings of the data store. The setup wizard writes it. The following file is a minimal one for RocksDB:

```json
{"@type":"RocksDb","path":"/var/lib/stalwart/"}
```

The data store is the only setting that cannot be changed through the API. The API itself reads the configuration from the data store, so it cannot be used to say where the data store is. Moving to another data store therefore means editing the file and restarting the server. The data is not moved with it, as described in [Changing a backend later](/docs/install/store#changing-a-backend-later).

When the file does not exist at startup, the server has no data store to read from. It then starts in [bootstrap mode](/docs/configuration/bootstrap-mode) and shows the setup wizard.

## Command line

The server binary takes a small number of command-line options, because almost everything else is configured in the data store:

| Option | Effect |
|---|---|
| `-c <path>`, `--config <path>` | Starts the server with the given configuration file. |
| `-e <path>`, `--export <path>` | Exports all data of the data store to a directory, then exits. See [Database migration](/docs/management/maintenance/migration). |
| `-i <path>`, `--import <path>` | Imports data exported with `--export`, then exits. |
| `-o`, `--console` | Opens the store console. It takes no value, so it must follow the other options: `stalwart --config <path> --console`. |
| `-h`, `--help` | Prints the options. |
| `-V`, `--version` | Prints the version. |

The configuration file is required, so a server started without `--config` prints the options and exits. `--export`, `--import` and `--console` need the file too, because it is how they find the data store.

The environment variable `CONFIG_PATH` can name the file instead. When it is set, however, the command line is not read at all. `--export`, `--import` and `--console` are then ignored, and the server starts normally. [Environment variables](/docs/configuration/environment-variables) lists the other variables the server reads.

## Making a change

The WebUI, the CLI and the API all make the same change, because the first two are built on the third. The following examples show each of them setting the server's default hostname. In the WebUI, open <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->, change **Default Hostname** and save. With the CLI, the change is one command:

```sh
stalwart-cli update SystemSettings --field defaultHostname=mail.example.com
```

Through the API, the same change is an `x:SystemSettings/set` call sent to `/jmap/` and authenticated as an administrator:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -u admin@example.com:<password> \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:SystemSettings/set", {"update": {"singleton": {"defaultHostname": "mail.example.com"}}}, "c1"]
    ]
  }'
```

## Applying changes

Saving an object stores it, but the running server does not always use the new value at once. Each setting takes effect at one of four points. The WebUI does not show which point applies to a field, so the following table is the reference:

| Takes effect | Settings |
|---|---|
| Immediately | Accounts, groups, domains, DKIM keys, mailing lists, roles and tenants. |
| After their own reload action, or a restart | TLS certificates and blocked IP addresses. |
| After a settings reload | Every other object that is not read only at startup. |
| After a restart | Stores, caches, listeners and search indexing concurrency. |

Certificates and blocked addresses have reload actions of their own. Certificates are loaded again by the `ReloadTlsCertificates` action, and blocked IP addresses by the `ReloadBlockedIps` action. Neither action is needed for certificates renewed by ACME or for bans added by the server itself, since the server applies those on its own.

Most server settings are compiled into the running configuration, which is rebuilt only when the settings are reloaded. This group covers MTA rules and expressions, limits, the spam filter, the DNS resolver, directories, telemetry and the allowed IP addresses. Changes to them take effect when the `ReloadSettings` [action](/docs/management/tasks-actions/actions) runs:

```sh
stalwart-cli create Action/ReloadSettings
```

The same action is available in the WebUI under Management › Actions. A reload is safe to attempt. If it finds an error in the configuration, it changes nothing: the running configuration stays in force, and the errors are returned with the action, in `notCreated` when it is created through the API.

Some settings are read only at startup, so they change only after a restart:

- The data store set in `config.json`, the blob, in-memory and search stores, the coordinator, and the metrics and tracing stores.
- Every field of the [Cache](/docs/ref/object/cache) object, including cache swapping.
- Every NetworkListener field, including bind addresses, TLS options, `maxConnections` and `socketBacklog`, together with `maxConnections` and `proxyTrustedNetworks` on SystemSettings.
- The search indexing concurrency, `maxConcurrentIndexTasks` and `indexBatchSize`.

A settings reload still checks the listener settings for errors, but it does not open or close ports, and it does not rebuild stores or caches.

When a saved change seems to have no effect, the setting usually belongs to one of the last three groups, and the change is waiting for a reload or a restart. In a cluster, a reload reaches the other nodes only when a [coordinator](/docs/cluster/coordination/) is configured. Without one, it applies only to the node that received the action, as described in [Applying configuration changes](/docs/cluster/configuration/#applying-configuration-changes).
