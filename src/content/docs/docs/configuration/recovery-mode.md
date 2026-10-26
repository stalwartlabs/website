---
sidebar_position: 3
title: "Recovery mode"
description: "Start Stalwart with its services stopped to repair a configuration, regain access or load a configuration before going live, and use the recovery administrator."
---

Sometimes a server cannot be managed in the normal way. Its configuration may prevent it from operating, or no administrator may be able to sign in. Recovery mode handles these situations: it starts the server with its mail services stopped, and only the management interface available.

Recovery mode serves three purposes. It allows repairing a configuration that prevents normal operation. It allows regaining administrative access when no administrator can sign in, for example because the external directory is unreachable. And it allows loading a configuration with the CLI before the server accepts any mail.

The server enters recovery mode only when the environment variable `STALWART_RECOVERY_MODE` is set to `1` or `true` at startup.

## Behaviour in recovery mode

The configured listeners are not started. Instead, the server opens a single plain HTTP listener, bound to all interfaces, on port 8080 or on the port set by `STALWART_RECOVERY_MODE_PORT`. The WebUI and the full management API are available on it. The startup output names the port:

```text
Port <port> is open for troubleshooting and recovery.
```

Sign-in works differently from normal operation. In recovery mode, the WebUI accepts sign-in from the address and scheme that the request arrives with, so sign-in works over plain HTTP at `http://<host>:8080/admin`.

None of the background services run. The mail queue and delivery, report sending, scheduled tasks and the search index queue are stopped. The node does not exchange cache or configuration events with other cluster nodes either.

Logging changes as well. The configured log destinations are replaced by console output, at the level set by `STALWART_RECOVERY_MODE_LOG_LEVEL`.

The server also drops its protection against abuse. Auto-ban, stored IP blocks, rate limits and HTTP access control rules are not applied, and permissive CORS headers are sent. The listener therefore accepts administrator sign-in without brute-force protection, and it must stay unreachable from the internet while recovery mode is active. With Docker, publish it as `-p 127.0.0.1:8080:8080` and reach it through an SSH tunnel. On other hosts, restrict it with a firewall rule. [Protect the setup listener](/docs/install/security#protect-the-setup-listener) gives the details.

## Recovery administrator

Regaining access requires an account that does not depend on anything that may be broken. The recovery administrator is such an account. It is defined by the `STALWART_RECOVERY_ADMIN` environment variable, in the form `username:password`:

```sh
STALWART_RECOVERY_ADMIN=admin:correcthorsebatterystaple
```

The recovery administrator does not depend on the directory, so it works when the external directory is down or when every regular administrator is locked out. It holds every permission. It can also be used as a master user, to sign in as any account.

The credential is accepted for password authentication whenever the variable is set at startup. That includes recovery mode, bootstrap mode, where it replaces the generated temporary password, and normal operation.

Acceptance in normal operation is intended: tasks such as promoting the first administrator from an external directory then need no recovery mode. It also means, however, that a variable left in the environment is a permanent full-access credential. Set it only for the work that needs it. Afterwards, remove it from the environment and restart the server.

## Regain access

The following procedure restores administrative access to a server on which no administrator can sign in:

1. Set `STALWART_RECOVERY_ADMIN=<username>:<password>` and `STALWART_RECOVERY_MODE=1` in the service environment. That is the environment file `/etc/stalwart/stalwart.env` for installations made with the script, the container environment for Docker, and the NSSM environment on Windows.
2. Restart the server, and restrict access to port 8080 as described above.
3. Sign in at `http://<host>:8080/admin` with the recovery administrator, or use the [CLI](/docs/management/cli/) against that address with the same credentials.
4. Correct the problem: repair the directory settings, reset an administrator's password, or assign an administrator role to a working account.
5. Remove `STALWART_RECOVERY_MODE` and `STALWART_RECOVERY_ADMIN` from the environment and restart the server.

## Load a configuration before going live

A server that is provisioned automatically should not accept mail while its configuration is still incomplete. Recovery mode provides that state: the mail services are stopped, while the management API is available. It suits, for example, a server provisioned from a plan with `stalwart-cli apply`. Start the server in recovery mode with a recovery administrator, apply the plan, then restart without the recovery variables. [Declarative deployments](/docs/configuration/declarative-deployments) describes the procedure.

Recovery mode also helps when HTTPS on the server hostname does not work yet, because it is the way to reach the WebUI over plain HTTP. [Troubleshooting installation](/docs/install/troubleshooting#webui-does-not-open) lists the usual causes of the failure.
