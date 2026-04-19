---
sidebar_position: 3
---

# Recovery mode

Recovery mode is intended for situations where a running deployment requires maintenance and the normal services must not be active. Typical reasons include a misconfigured external directory that is preventing any administrator from signing in, a faulty setting that is causing the MTA to loop, or a pre-deployment provisioning step where a large batch of objects must be loaded before any mail traffic reaches the server.

In this mode Stalwart starts with every background service disabled. The MTA does not accept or process messages, task workers do not run, cluster services do not join the coordinator, and scheduled jobs remain paused. The only active listener is the HTTP management endpoint on port `8080` (configurable with `STALWART_RECOVERY_MODE_PORT`), which serves the WebUI and the full JMAP management API. From there, administrators can use the WebUI or the [CLI](/docs/management/cli) to inspect the configuration, correct the problem, and then restart the server without the recovery flag to return it to normal operation.

Stalwart never enters recovery mode automatically. It is activated by setting the environment variable `STALWART_RECOVERY_MODE` to `1` or `true` before starting the server. When the variable is unset, or set to any other value, Stalwart starts normally.

## Recovery administrator

Recovery mode still requires a valid sign-in. If the regular administrator account is locked out, or if the external directory that normally handles authentication is unreachable, the ordinary credentials will not work. The recovery administrator is a built-in account that bypasses the directory and is valid only while the server is running in recovery or [bootstrap](/docs/configuration/bootstrap-mode) mode.

The recovery administrator is configured with the `STALWART_RECOVERY_ADMIN` environment variable, in the form `username:password`. For example:

```sh
STALWART_RECOVERY_ADMIN=admin:correcthorsebatterystaple
```

The same variable is used during bootstrap to pin a credential instead of relying on the randomly generated one, and it serves as the mechanism for regaining access after an incident.

:::danger
`STALWART_RECOVERY_ADMIN` must not be left permanently set on a production deployment. It is a backdoor credential intended to rescue a server that has lost normal access, not a primary login. It should be set only for the duration of the work that requires it, then removed from the environment before the server is restarted. For day-to-day administration, create regular administrator accounts with appropriately scoped roles.
:::
