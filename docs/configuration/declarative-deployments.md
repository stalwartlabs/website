---
sidebar_position: 5
---

# Declarative deployments

Operators who manage infrastructure with tools such as NixOS, Ansible, Terraform or Pulumi typically describe the desired state in a text file and let the tool converge the system toward it. Stalwart supports this workflow, with one notable detail: the declarative surface is split between the `config.json` file and the [CLI](/docs/management/cli/overview).

The `config.json` file is a plain text file that the configuration management tool can render and place on disk. It only needs to contain the [DataStore](/docs/ref/object/data-store) object, so it is small and rarely changes after the initial deployment. It can be templated from the platform's variables and written to `/etc/stalwart/config.json` (or wherever the `--config` flag points) with whichever file-writing primitive the tool offers.

Everything else lives in the database and is managed through the JMAP API. The CLI provides two commands designed specifically for this workflow. The [`apply`](/docs/management/cli/apply) command takes a JSON plan describing a batch of create, update and destroy operations and runs them against the server in dependency-aware order. It is the command invoked from an Ansible task, a Terraform `local-exec` provisioner, a NixOS systemd one-shot service, or a Pulumi `Command` resource. The [`snapshot`](/docs/management/cli/snapshot) command performs the inverse operation: it walks a live deployment and emits a plan in the same format, which is useful for configuration backups, promoting state from staging to production, and capturing a manually assembled initial configuration so that subsequent changes can be driven declaratively.

Both commands are documented in the CLI reference with worked examples for Ansible, Terraform, NixOS, Pulumi and common CI systems. The general pattern, regardless of the platform, remains the same: render a plan from the platform's templates, pass it to `stalwart-cli apply`, and surface the exit status as the step's result.

The typical sequence for a fully automated deployment is to template `config.json` onto the host, start Stalwart once with `STALWART_RECOVERY_MODE=1` and a `STALWART_RECOVERY_ADMIN` supplied from a secrets manager, run `stalwart-cli apply` against the recovery listener to load the initial configuration, and then restart Stalwart without the recovery variables to bring the server up normally. From that point onward, every subsequent change is another `apply` against the running server.
