---
sidebar_position: 1
---

# Overview

Stalwart is configured through a small startup file called `config.json` and a database that holds everything else. When the server starts, it reads `config.json` to learn where the database is, connects to it, and loads the rest of its configuration from there. Every setting (domains, accounts, TLS certificates, SMTP rules, rate limits, and so on) lives in that database as a structured object.

Those objects are not edited by hand. The server exposes them over a JMAP API, and two tools make that API easy to use:

The [WebUI](/docs/management/webui/overview) is the browser-based administration console. It includes a setup wizard for first-time installations and forms for every configurable object. Most operators only ever need this.

The [CLI](/docs/management/cli/overview) (`stalwart-cli`) calls the same JMAP API from the command line. It is the right tool for scripting, automation, and declarative deployments on platforms such as NixOS, Ansible or Terraform.

This arrangement differs from the traditional model of a Unix daemon driven by a large configuration file. The trade-off is that changes take effect immediately across every node in a cluster, every setting is validated before it is saved, and backing up or cloning a deployment becomes a single operation against the API.

## Configuration file

The path to `config.json` is passed on the command line with `--config`:

```sh
stalwart --config /etc/stalwart/config.json
```

The file contains a single [DataStore](/docs/ref/object/data-store) object telling Stalwart where its database lives. A minimal file for a single-node installation backed by RocksDB looks like this:

```json
{"@type":"RocksDb","path":"/var/lib/stalwart/"}
```

RocksDB is the default backend variant and works well for most single-node deployments; PostgreSQL, MySQL, SQLite and FoundationDB are also supported. Each variant has its own set of fields, documented on the [DataStore](/docs/ref/object/data-store) reference page.

Once the server is running, `config.json` is rarely touched again. The datastore location is the only setting that cannot be changed through the API, because the API itself is served out of the datastore.

## Recovery & Bootstrap modes

If `config.json` is absent, Stalwart starts in [bootstrap mode](/docs/configuration/bootstrap-mode) and exposes an initial setup flow served from the browser. If `config.json` is present but the deployment requires maintenance, Stalwart can be started in [recovery mode](/docs/configuration/recovery-mode) to suspend all services and expose only the management API. Both modes, along with a few cluster-related behaviours, are controlled by a handful of [environment variables](/docs/configuration/environment-variables). For platforms such as NixOS, Ansible and Terraform, the [declarative deployments](/docs/configuration/declarative-deployments) page describes how to manage `config.json` and the rest of the configuration as code.
