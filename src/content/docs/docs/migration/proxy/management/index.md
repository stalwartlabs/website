---
sidebar_position: 1
title: "Overview"
description: "How a running proxy is managed: process lifecycle, configuration reload and what it resets, and environment overrides."
---

The proxy is managed through two channels. The configuration file defines the deployment, and is read at startup. The optional management API is an authenticated HTTP interface for observing and changing a running proxy.

Each channel has its own kind of work. Migration work, such as moving an account to another destination and disconnecting its sessions, is done through the API. Structural changes, such as adding a destination, are made in the configuration file, and applied with a reload or a restart.

The other management pages describe [observability](/docs/migration/proxy/management/observability), [cache invalidation](/docs/migration/proxy/management/cache), the [management API](/docs/migration/proxy/management/api) and [troubleshooting](/docs/migration/proxy/management/troubleshooting).

## Lifecycle

At startup, the proxy reads and validates its configuration, and exits with an error when validation fails. A configuration problem is therefore reported before any connection is served. The proxy then binds its listeners and the management API, and starts accepting connections.

On `SIGINT` or `SIGTERM`, the proxy stops accepting connections and waits for established sessions to finish, for at most `server.shutdown_grace`. Sessions still open when the grace period ends are closed, and the process exits.

Choosing `shutdown_grace` is a tradeoff. A long grace period avoids interrupting long transfers during a planned restart, while a short one bounds how long a restart takes. The service manager matters as well. The systemd unit of the install script stops the proxy with `SIGINT`, so a service restart lets sessions finish. The init.d script waits 30 seconds after `SIGINT` before it kills the process, so a `shutdown_grace` above 30 seconds is cut short there.

## Configuration reload

`POST /config/reload` on the management API reads the configuration file again, without a restart. The new file is validated in full, and the running configuration is replaced only when it is valid. An invalid file is rejected, the response names the error, and the proxy keeps its previous configuration. A reload is therefore safe on a live deployment, and it is also a way to check an edited file.

A reload applies destinations, routing, mappings and the mapping cache settings, capabilities, certificates and HTTP routes, and it reads the mapping file again. It also resets some state: it starts with an empty lookup cache, resets the statistics of `GET /stats`, and resets the health state of every destination. Open sessions are kept, and so is the registry of connections that kick and delay act on.

Settings that are read at startup need a restart instead. They are all settings of `[listener.*]`, the whole `[admin]` table including the management token, and `server.threads`, `server.log_level` and `server.shutdown_grace`. To change them, edit the file and restart the service.

## Environment overrides

Three environment variables affect the proxy:

- `PROXY_CONFIG` supplies the path of the configuration file, when none is given on the command line.
- `RUST_LOG` overrides the log level with a tracing filter expression, which is convenient for raising the verbosity temporarily.
- `PROXY_ADMIN_TOKEN` supplies the management token, and takes precedence over the token in the file, so that a secret manager can provide it.

The install script places these variables in an environment file that the service reads before starting.
