---
sidebar_position: 5
title: "Declarative deployments"
description: "Deploy and maintain Stalwart from configuration management: template config.json, load the configuration with stalwart-cli apply in recovery mode, and converge later changes with the same plan."
---

Configuration management tools such as Ansible, Terraform, NixOS or Pulumi describe the desired state of a system in files, and bring the system to that state on every run. A server managed this way can be rebuilt from its description, and every change to it is reviewed and versioned like code.

Stalwart can be managed in this way, but its configuration is split in two parts, and each part is managed differently:

- `config.json` holds only the data store connection settings. It is a file, which the tool renders and writes to disk like any other configuration file.
- Everything else is stored in the data store, and is applied through the API with [`stalwart-cli apply`](/docs/management/cli/apply). That command reads a plan of operations in NDJSON format, which has one JSON object per line.

A configuration management tool applies its description again on every run, so whatever it applies must be idempotent: applying it twice must have the same effect as applying it once. A plan can be made idempotent. An `upsert` operation creates an object, or updates the existing one that matches a natural key, such as a domain's name. An `update` operation changes a singleton. A plan made only of these two operations can be applied any number of times, and always leads to the same state.

The plan does not have to be written from scratch. [`stalwart-cli snapshot`](/docs/management/cli/snapshot) produces a plan from a running server. A convenient starting point is therefore to configure a test server in the WebUI, take a snapshot, and turn it into the template that the tool renders. [Plan file format](/docs/management/cli/plan-format) describes the operations, and [Infrastructure as code](/docs/management/cli/infrastructure-as-code) gives examples for common tools.

## Deploy a new server

The first deployment loads the configuration in [recovery mode](/docs/configuration/recovery-mode). In that mode the management API is available but no mail services run, so the server accepts no mail before its configuration is complete:

1. Write `config.json` with the data store settings, for example to `/etc/stalwart/config.json`:

   ```json
   {"@type":"RocksDb","path":"/var/lib/stalwart/"}
   ```

2. Start the server in recovery mode, with a recovery administrator taken from the tool's secret store:

   ```sh
   STALWART_RECOVERY_MODE=1 \
   STALWART_RECOVERY_ADMIN=admin:<password> \
   stalwart --config /etc/stalwart/config.json
   ```

   The server opens only its plain HTTP management listener on port 8080, and no mail services run.
3. Render the plan, and apply it against that listener with the recovery administrator's credentials. The following plan, for example, creates a domain and sets the server's identity:

   ```text
   {"@type":"upsert","object":"Domain","matchOn":["name"],"value":{"dom-a":{"name":"example.com","certificateManagement":{"@type":"Manual"},"dkimManagement":{"@type":"Automatic"},"dnsManagement":{"@type":"Manual"},"subAddressing":{"@type":"Enabled"}}}}
   {"@type":"update","object":"SystemSettings","value":{"defaultHostname":"mail.example.com","defaultDomainId":"#dom-a"}}
   ```

   ```sh
   stalwart-cli --url http://127.0.0.1:8080 --user admin --password <password> \
     apply --file plan.ndjson
   ```

   [Plan file format](/docs/management/cli/plan-format) links a complete example plan.
4. Restart the server without `STALWART_RECOVERY_MODE` and `STALWART_RECOVERY_ADMIN`. It starts normally, with the listeners and services that the plan configured. When the plan defines no listener, the default listeners are created at this start.

## Apply later changes

Once the server runs normally, every change is another `apply` of the updated plan. It now runs against the server's HTTPS address, with the credentials of an administrator account or an [API key](/docs/auth/authentication/api-key). Objects that already match are updated in place, so nothing is duplicated.

Applying the plan stores the changes, but most server settings take effect only after a settings reload or a restart. The run should therefore end with `stalwart-cli create Action/ReloadSettings`, or with a restart of the service for settings that require one, as described in [Applying changes](/docs/configuration/#applying-changes).

Two features of `apply` fit it into a tool's run. It exits with a non-zero status when an operation fails, so the configuration management tool can report the step as failed. `apply --dry-run` validates the plan and prints it without sending any change to the server, which allows a plan to be checked before it is applied.
