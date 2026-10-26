---
sidebar_position: 2
title: "Bootstrap mode"
description: "The mode in which a server without a configuration file starts: the temporary administrator, the setup listener, what the wizard writes, and why the wizard can appear again on an existing server."
---

A newly installed server has no configuration, so it does not yet know where to store its data or which services to offer. Bootstrap mode is the state in which such a server waits to be configured.

The server enters bootstrap mode whenever the configuration file named by `--config` or `CONFIG_PATH` does not exist at startup. In this mode it starts no mail services. It serves only the [setup wizard](/docs/install/setup-wizard), which creates the configuration file and the initial configuration.

## Services in bootstrap mode

The listeners are part of the configuration, and since there is no configuration yet, they cannot be started. The server opens a single plain HTTP listener instead. It uses port 8080, or the port set by `STALWART_RECOVERY_MODE_PORT`, and it is bound to all interfaces: `[::]`, or `0.0.0.0` on hosts without IPv6. The startup output names the port:

```text
No configuration file was found. Port <port> is open for initial setup.
```

The listener has no protection against password guessing. Auto-ban, rate limits and HTTP access control rules are not applied, and permissive CORS headers are sent. The port must therefore stay unreachable from the internet while the server is in bootstrap mode, as described in [Protect the setup listener](/docs/install/security#protect-the-setup-listener).

The WebUI and the API are available on the listener, but only for the setup. The configuration API accepts only the [Bootstrap](/docs/ref/object/bootstrap) object. It refuses requests for any other object with the following error, which reads `can be accessed` in place of `can be modified` for reads:

```text
The server is in bootstrap mode. Only the 'Bootstrap' object type can be modified until the bootstrap process is complete.
```

No log destination is configured yet either, so log output goes to standard output and standard error, at the level set by `STALWART_RECOVERY_MODE_LOG_LEVEL`.

## Temporary administrator

The wizard requires a sign-in, but a new server has no accounts yet. To make the sign-in possible, the server creates a temporary administrator named `admin`, with a random 16-character password, and prints both once to standard error:

```text
════════════════════════════════════════════════════════════
🔑 Stalwart bootstrap mode - temporary administrator account

   username: admin
   password: iX8pG2uYq3vR7kNc

Use these credentials to complete the initial setup at the
/admin web UI. Once setup is done, Stalwart will provision a
permanent administrator and this temporary account will no
longer apply.

This password is shown only once. To pin a credential
instead, set STALWART_RECOVERY_ADMIN=admin:<password> in the
env file.
════════════════════════════════════════════════════════════
```

Because the output goes to standard error, a log collector that captures only standard output misses it. The platform pages show where to find it on each platform: [Linux and macOS](/docs/install/platform/linux#retrieve-the-administrator-credentials), [Windows](/docs/install/platform/windows#retrieve-the-administrator-credentials) and [Docker](/docs/install/platform/docker#retrieve-the-administrator-credentials). A new password is generated at every start in bootstrap mode, so a password printed before a restart no longer works.

A fixed credential can be used instead. When [`STALWART_RECOVERY_ADMIN`](/docs/configuration/recovery-mode#recovery-administrator) is set, its credential is used instead and no password is generated or printed.

The installation script ends with the address of the wizard, `Finish setup at: http://<host>:<port>/admin`, with the port from `STALWART_RECOVERY_MODE_PORT` when it is set in the environment file.

## Completing the setup

Submitting the wizard writes the configuration in two places. `config.json` receives the data store settings. The rest of the initial configuration is stored in the data store itself: the other stores, the default domain, the log destination, the ACME and DNS providers, and, with the internal directory, the first administrator account.

The server does not restart by itself. It keeps running in bootstrap mode, with the temporary administrator, until it is restarted. At the restart it reads `config.json` and starts normally, with the default listeners. From then on, port 8080 is a plain HTTP listener like any other, and the WebUI is used at `https://<hostname>/admin`. [Step 5 of the installation tutorials](/docs/install/platform/linux#step-5-sign-in-to-the-webui) describes the first sign-in.

The wizard is not the only way through bootstrap. For automated installations, the setup can also be done without it, by writing `config.json` and applying the configuration with the CLI in recovery mode, as described in [Declarative deployments](/docs/configuration/declarative-deployments).

## Setup wizard on an existing server

A server that has been running shows the setup wizard again when its configuration file is missing at startup. The server decides this from the file alone, and does not look at the data store. The wizard therefore appears even when the data store is intact. The typical causes are:

- In a container, `/etc/stalwart` is not a persistent volume, or the volume was not mounted when the container was recreated.
- The service is started with a `--config` path that differs from the one the wizard wrote to.
- The file was deleted or moved.

The opposite case has a different symptom. A configuration file that points at an empty or wrong data store does not start the wizard. The server starts normally with that store, and the existing accounts and settings seem to be gone. When that happens, check the data store settings in the file before anything else.

A file that exists but cannot be used does not start the wizard either. This covers a file that cannot be read, for example because of its permissions, and a file that is not valid JSON. The server stops instead, with `Startup failed: Failed to read data store settings at <path>: <error>` or `Startup failed: Failed to parse data store settings at <path>: <error>`.

Completing the wizard again does not recover the server. When the wizard is pointed at the existing data store, it refuses the store on the storage step with `The selected data store has already been initialized.`, and writes nothing to the store or to `config.json`. A store created by an older Stalwart version is refused as well. The wizard accepts only an empty store, or one for which the wizard was completed but the server never started normally.

The server is recovered instead by giving it its configuration file back:

1. Stop the server.
2. Restore `config.json` from a backup, or mount the volume that holds it. The file contains only the [DataStore](/docs/ref/object/data-store) object, so it can also be written by hand with the connection settings of the existing data store, for example `{"@type":"RocksDb","path":"/var/lib/stalwart/"}`.
3. Start the server. It reads the file and starts with the existing data and configuration.
