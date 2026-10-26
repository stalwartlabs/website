---
title: "Infrastructure as code"
description: "Drive stalwart-cli apply from Ansible, Terraform, NixOS, Pulumi, GitHub Actions and GitLab CI."
sidebar_position: 11
---

Infrastructure as code keeps the configuration of a system in files under version control, and lets a tool apply those files whenever they change. A Stalwart deployment can be managed in the same way. The CLI is designed as the lowest-level building block for this, under whichever orchestration tool fits the platform.

Every integration on this page follows the same pattern. The platform renders an NDJSON [plan](/docs/management/cli/plan-format) from its templates and variables. It passes the plan to [`stalwart-cli apply`](/docs/management/cli/apply), as a file or on standard input. It then reports the exit status of the command as the result of the step. The examples build their plans from `upsert` operations, which update an object when it exists and create it otherwise. That makes them safe to re-apply, as explained in [Idempotent plans](/docs/management/cli/idempotent-plans).

## Ansible

An Ansible playbook needs two tasks: `ansible.builtin.template` renders the plan from a Jinja2 template, and `ansible.builtin.command` applies it. The following minimal playbook does both, and reads the summary record of the run to decide whether anything changed:

```yaml
- name: Deploy Stalwart configuration
  hosts: mail
  vars:
    stalwart_url: "https://mail.example.com"
    domains:
      - { name: "example.com", description: "Primary" }
      - { name: "example.net", description: "Transactional" }

  tasks:
    - name: Render plan
      ansible.builtin.template:
        src: stalwart-plan.ndjson.j2
        dest: /tmp/stalwart-plan.ndjson
      register: plan

    - name: Apply plan
      ansible.builtin.command: >
        stalwart-cli apply --file /tmp/stalwart-plan.ndjson --json
      environment:
        STALWART_URL: "{{ stalwart_url }}"
        STALWART_USER: "{{ stalwart_admin_user }}"
        STALWART_PASSWORD: "{{ stalwart_admin_password }}"
      register: result
      changed_when: >-
        (result.stdout_lines | last | from_json).done.created > 0 or
        (result.stdout_lines | last | from_json).done.destroyed > 0
      failed_when: result.rc != 0

    - name: Show summary
      ansible.builtin.debug:
        msg: "{{ result.stdout_lines | last | from_json }}"
```

The template `stalwart-plan.ndjson.j2` produces one JSON object per line, with no enclosing array, as NDJSON requires:

```jinja
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{
{%- for d in domains -%}
"dom-{{ loop.index }}":{"name":"{{ d.name }}","description":"{{ d.description }}"}{% if not loop.last %},{% endif %}
{%- endfor -%}
}}
```

The single `upsert` line is idempotent. The first apply creates the domains, and every later apply matches them by `name` and updates their fields, so the playbook needs no teardown loop.

The `changed_when` condition deserves a note. An `upsert` that matches an object always reports it as updated, even when no field changed. Counting updates would therefore mark every run as a change. The condition counts only created and destroyed objects instead, so that an unchanged run is not reported as a change.

Ansible's `--check` mode promises not to change anything. For runs in that mode, a `check` task that passes `--dry-run` validates the plan without changing the server.

## Terraform

Terraform can drive the CLI without a provider of its own. A `terraform_data` resource builds the plan from Terraform values and runs the apply whenever the plan changes:

```hcl
locals {
  ops = [
    {
      "@type" = "upsert"
      object  = "Domain"
      matchOn = ["name"]
      value = {
        for d in var.domains :
        "dom-${d.id}" => { name = d.name, description = d.description }
      }
    },
    {
      "@type" = "update"
      object  = "SystemSettings"
      value = {
        defaultDomainId = "#dom-${var.default_domain_id}"
        defaultHostname = var.hostname
      }
    },
  ]
  # Render as NDJSON: one JSON object per line, no enclosing array.
  plan = join("\n", [for op in local.ops : jsonencode(op)])
}

resource "terraform_data" "stalwart_apply" {
  triggers_replace = [local.plan]

  provisioner "local-exec" {
    command     = "printf '%s\\n' \"$STALWART_PLAN\" | stalwart-cli apply --stdin --json"
    interpreter = ["/bin/sh", "-c"]
    environment = {
      STALWART_URL      = var.stalwart_url
      STALWART_USER     = var.stalwart_admin_user
      STALWART_PASSWORD = var.stalwart_admin_password
      STALWART_PLAN     = local.plan
    }
  }
}
```

`local-exec` has no standard input of its own, so the plan travels in an environment variable and is piped to the CLI. `triggers_replace` ties the resource to the rendered plan, which makes the apply run again whenever the plan changes. Because the plan is built from `upsert` operations, a re-run updates the existing Stalwart objects in place. Re-applying after an unrelated change is therefore safe.

This approach treats the whole plan as one resource, so Terraform sees neither the individual objects nor their drift. A more idiomatic Terraform integration, with typed resources, real drift detection and partial applies, needs a small custom provider written in Go that calls `stalwart-cli` for the actual operations.

## NixOS

NixOS describes the whole system declaratively, which suits a plan well. A module turns the plan into a derivation, a file in the Nix store, and runs it from the `ExecStart` of a oneshot systemd service:

```nix
{ config, lib, pkgs, ... }:

let
  cfg = config.services.stalwart-bootstrap;
  # NDJSON: one operation per line, no enclosing array.
  planText = lib.concatMapStringsSep "\n"
    (op: builtins.toJSON op) cfg.plan;
  plan = pkgs.writeText "stalwart-plan.ndjson" planText;
in
{
  options.services.stalwart-bootstrap = {
    enable = lib.mkEnableOption "Stalwart configuration bootstrap";
    url = lib.mkOption { type = lib.types.str; };
    credentialsFile = lib.mkOption {
      type = lib.types.path;
      description = "EnvironmentFile with STALWART_USER and STALWART_PASSWORD (or STALWART_TOKEN).";
    };
    plan = lib.mkOption {
      type = lib.types.listOf lib.types.attrs;
      description = "List of stalwart-cli apply operations.";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.stalwart-bootstrap = {
      description = "Stalwart configuration bootstrap";
      wantedBy = [ "multi-user.target" ];
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ];
      serviceConfig = {
        Type = "oneshot";
        EnvironmentFile = cfg.credentialsFile;
        Environment = "STALWART_URL=${cfg.url}";
        ExecStart = "${pkgs.stalwart-cli}/bin/stalwart-cli apply --file ${plan}";
        RemainAfterExit = true;
      };
    };
  };
}
```

A host configuration then enables the module and declares its plan as Nix values:

```nix
services.stalwart-bootstrap = {
  enable = true;
  url = "https://mail.example.com";
  credentialsFile = "/run/secrets/stalwart-admin";
  plan = [
    { "@type" = "upsert";
      object  = "Domain";
      matchOn = [ "name" ];
      value   = { dom-a = { name = "example.com"; }; };
    }
    { "@type" = "update";
      object  = "SystemSettings";
      value   = { defaultDomainId = "#dom-a"; defaultHostname = "mail.example.com"; };
    }
  ];
};
```

The plan is regenerated and re-applied on every NixOS rebuild. Because it is built from `upsert` operations, each rebuild updates the existing objects in place. Repeated rebuilds therefore converge, where a `create` plan would fail on the second run.

The credentials file holds the administrator's secret, so it is best kept with `agenix` or `sops-nix`. A separate `nixos-test` that runs `--dry-run` validates plans in CI.

## Pulumi

In Pulumi, the `Command` resource from `@pulumi/command` maps directly to `apply`, because it runs a local command with a given standard input:

```typescript
import * as command from "@pulumi/command";
import { plan } from "./plan";

// `plan` is an array of operation objects; render as NDJSON.
const planNdjson = plan.map((op) => JSON.stringify(op)).join("\n");

new command.local.Command("stalwart-apply", {
    create:    `stalwart-cli apply --stdin --json`,
    triggers:  [planNdjson],
    stdin:     planNdjson,
    environment: {
        STALWART_URL:      stalwartUrl,
        STALWART_USER:     stalwartUser,
        STALWART_PASSWORD: stalwartPassword,
    },
});
```

The `triggers` array ties the resource to the content of the plan, so the command runs again whenever the plan changes.

## CI / CD pipelines

In a CI pipeline, the plan lives in a repository, and a change to it is applied when it is merged. Because `apply` reads its plan from a file or standard input and reports in NDJSON, it fits into any CI environment.

### GitHub Actions

The following workflow runs whenever the plan changes on `main`. It installs the CLI, checks the plan with a dry run, and then applies it, with the connection settings taken from repository secrets:

```yaml
name: Apply Stalwart plan

on:
  push:
    branches: [main]
    paths: ["stalwart/plan.ndjson"]

jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install CLI
        run: |
          curl --proto '=https' --tlsv1.2 -LsSf \
            https://github.com/stalwartlabs/cli/releases/latest/download/stalwart-cli-installer.sh | sh
      - name: Plan (dry-run on PRs would go here)
        run: stalwart-cli apply --file stalwart/plan.ndjson --dry-run
        env:
          STALWART_URL:      ${{ secrets.STALWART_URL }}
          STALWART_USER:     ${{ secrets.STALWART_USER }}
          STALWART_PASSWORD: ${{ secrets.STALWART_PASSWORD }}
      - name: Apply
        run: stalwart-cli apply --file stalwart/plan.ndjson --json
        env:
          STALWART_URL:      ${{ secrets.STALWART_URL }}
          STALWART_USER:     ${{ secrets.STALWART_USER }}
          STALWART_PASSWORD: ${{ secrets.STALWART_PASSWORD }}
```

### GitLab CI

The equivalent GitLab job installs the CLI in an Alpine image and applies the plan, with the credentials supplied as masked CI variables:

```yaml
apply:
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
    - curl --proto '=https' --tlsv1.2 -LsSf https://github.com/stalwartlabs/cli/releases/latest/download/stalwart-cli-installer.sh | sh
    - export PATH="${CARGO_HOME:-$HOME/.cargo}/bin:$PATH"
  script:
    - stalwart-cli apply --file stalwart/plan.ndjson --json
  variables:
    STALWART_URL: "https://mail.example.com"
  # STALWART_USER and STALWART_PASSWORD come from masked CI variables.
```
