---
sidebar_position: 2
title: "Bootstrap mode"
---

The first time Stalwart is started without a `config.json`, it enters bootstrap mode. No mail services are started. The server listens on HTTP port `8080` (configurable with `STALWART_RECOVERY_MODE_PORT`) and serves only the [WebUI](/docs/management/webui/) and the management API, with the JMAP API restricted to a single object type: [Bootstrap](/docs/ref/object/bootstrap).

To enable the initial sign-in, Stalwart generates a temporary administrator account and prints the credentials to standard output:

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

:::caution
The password is regenerated on every bootstrap start and is only printed once. It must be captured from the console before it scrolls out of view, or a credential can be pinned in advance through the [`STALWART_RECOVERY_ADMIN`](/docs/configuration/recovery-mode#recovery-administrator) environment variable. When `STALWART_RECOVERY_ADMIN` is set, no temporary password is generated and the provided value is used instead.
:::

With those credentials, `http://<host>:8080/admin` can be opened in a browser. The WebUI presents a setup wizard backed by the `Bootstrap` object, which collects the server hostname, the default domain, the storage backends, the directory used to authenticate users, and a handful of related settings. On completion of the wizard, Stalwart writes `config.json`, creates the permanent administrator account, provisions the remainder of the configuration, and restarts into normal operation. The temporary bootstrap account no longer applies after that point.

After the restart, the WebUI is reached at `https://<hostname>/admin` on the configured server hostname, and HTTP access on port `8080` is no longer available for administration. The change of protocol is required because OAuth sign-in is now bound to the configured hostname over HTTPS; the path-relative issuer served during bootstrap is no longer in use. When HTTPS on the configured hostname is not yet reachable (for example while DNS is still being set up, or before a TLS certificate has been issued), the server can be restarted in [recovery mode](/docs/configuration/recovery-mode) to keep the WebUI available over HTTP until the TLS side of the deployment is ready.

The setup wizard is the recommended path for new deployments because it validates every choice interactively and supplies sensible defaults. For deployments that must avoid the wizard, for example when installation is automated across many hosts, `config.json` can be written manually with the required datastore settings, and Stalwart can then be started in [recovery mode](/docs/configuration/recovery-mode) to provision the remaining configuration through the CLI. The [declarative deployments](/docs/configuration/declarative-deployments) page describes this workflow in more detail.
