---
sidebar_position: 1
title: "Overview"
---

The proxy is managed through two channels: the configuration file, which defines the static shape of the deployment and is read at startup, and an optional authenticated HTTP API, which allows an operator to observe and adjust a running instance without a restart. Routine migration work, such as moving an account from one destination to another and forcing it to re-resolve, is done through the API, while structural changes, such as adding a listener, are done by editing the configuration and reloading or restarting.

This page covers the process lifecycle, configuration reload semantics and environment overrides. The remaining management topics have dedicated pages: [observability](/docs/migration/proxy/management/observability), [cache invalidation](/docs/migration/proxy/management/cache), the [management API](/docs/migration/proxy/management/api) reference, and [troubleshooting](/docs/migration/proxy/management/troubleshooting).

## Lifecycle

At startup the proxy reads and validates its configuration, and exits with an error if validation fails, so a configuration problem is caught before any connection is served. Once validation succeeds it binds every configured listener and the management listener and begins accepting connections.

On receiving `SIGINT` or `SIGTERM`, the proxy begins a graceful shutdown: it stops accepting new connections and waits for established sessions to finish, up to `server.shutdown_grace`. Sessions still active when the grace period elapses are terminated so the process can exit. Setting a generous grace period avoids cutting off long-running transfers during a planned restart, while a shorter one bounds how long a restart takes. The supplied service units send `SIGINT` on stop, so an ordinary service restart drains cleanly.

## Configuration reload

A running proxy can re-read its configuration file without a restart by issuing a `POST /config/reload` request to the [management API](/docs/migration/proxy/management/api). The new file is parsed and fully validated, and the running state is swapped to it only if validation succeeds; an invalid file is rejected and the proxy keeps running on its previous configuration. This makes reload safe to use against a live deployment, since a mistake in the new file cannot take the service down.

Reload applies to most of the configuration, including destinations, mappings, routing rules, capabilities, certificates and HTTP routes, so new backends and updated routing take effect immediately. A few settings are bound at startup and require a full restart to change: the set of listener sockets and their protocols, the management listener's bind address and token, and the cache's capacity and time-to-live settings. The reload response notes this. When such a setting must change, edit the configuration and restart the service.

## Environment overrides

Three environment variables influence a running or starting proxy. `PROXY_CONFIG` provides the configuration file path when none is given on the command line. `RUST_LOG` overrides the configured log level using the tracing filter syntax, which is convenient for temporarily raising verbosity. `PROXY_ADMIN_TOKEN` supplies the management API bearer token and takes precedence over the token configured in the file, which allows the token to be injected by a secret manager rather than written to disk. The install script places these in an environment file that the service sources before starting.
