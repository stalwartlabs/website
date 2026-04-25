---
sidebar_position: 8
---

# Declarative bulk operations

The `apply` command takes an NDJSON file describing a batch of `create`, `update`, and `destroy` operations, and applies them to the server in dependency-aware order. It is intended as the integration surface for infrastructure-as-code tooling (Ansible, Terraform, NixOS, Pulumi, ...) and for one-shot deployments / migrations performed by hand or by CI.

For interactive use cases see the per-command pages: [Creating objects](./create.md), [Updating objects](./update.md), [Removing objects](./delete.md).

## Synopsis

```text
stalwart-cli apply ( --file <path> | --stdin )
                   [--dry-run]
                   [--continue-on-error]
                   [--quiet]
                   [--json]
                   [--progress]
```

| Option | Effect |
|---|---|
| `--file <path>` | Read the plan from an NDJSON file. |
| `--stdin` | Read the plan from standard input (NDJSON). |
| `--dry-run` | Parse and validate the plan, then print it; no requests are sent. |
| `--continue-on-error` | Do not abort on the first failed operation; report all errors at the end and exit non-zero. |
| `--quiet` | Suppress per-operation log lines; print only the final summary. |
| `--json` | Emit one NDJSON record per completed operation to stdout, plus a summary record at the end. The plan header and any progress lines remain on stderr. |
| `--progress` | Print one extra line per request batch during large `destroy` and `create` operations. |

Exactly one of `--file` and `--stdin` must be supplied.

## How it works

The plan is **NDJSON**: one operation per line, no enclosing array. Blank lines are ignored; surrounding whitespace on a line is tolerated. Each operation is one of three types: `update`, `destroy`, or `create`. The CLI processes the plan in **two passes**:

1. **Destroy pass (reverse order).** Every `destroy` operation is executed in **reverse** of its position in the plan. Update and create operations are skipped during this pass. This is what makes dependency-aware teardowns possible: when a plan creates `Domain → Account → DkimSignature` (parents first), the same plan, when teardown is needed, can be applied with destroys in the same order, and the reverse pass will undo them in `DkimSignature → Account → Domain` order, satisfying foreign-key constraints.

2. **Create / update pass (plan order).** All `update` and `create` operations run in the order they appear in the plan. Destroys are skipped during this pass. This ordering is what allows objects to reference each other: a `Domain` can be created in operation 5 and then referenced by an `Account` in operation 7.

The two-pass model lets a single plan file describe a complete state transition (destroy old state, then create / update new state) without the author needing to interleave operations manually.

### Stop on first error (default)

If any operation fails (HTTP error, JMAP method-level error, or any per-object SetError such as `validationFailed` or `objectIsLinked`), the CLI prints the error and exits non-zero. The remaining operations are not attempted.

This default is chosen deliberately for IaC contexts: a partially-applied plan is usually worse than no apply at all, and a failed step almost always indicates a bug in the plan or a server-side conflict that needs investigation before proceeding.

To override, pass `--continue-on-error`, in which case every operation is attempted and the final summary reports the count of successes and failures. The exit code is still non-zero when at least one failed.

### Cross-operation references

The plan can express references between objects that have not been created yet by using the JMAP `#<id>` reference syntax. Two distinct mechanisms cooperate:

* **Refs in values** (`"domainId": "#dom-a"`): the CLI never rewrites these. It collects them recursively from every string value and every object key, and forwards them to the server in the request-level `createdIds` map. The server resolves `#dom-a` to the real id assigned during the matching `create`. This works across separate JMAP requests, including across batches.

* **Refs as the `id` of an `update`** (`"id": "#dom-a"`): JMAP does not resolve `#`-prefixed update keys server-side. The CLI resolves these client-side from the `created_ids` map populated during earlier `create` operations. If the reference does not match any prior create, the CLI errors before sending the request.

Refs work in:

* String values, anywhere in the value tree (`"domainId": "#dom-a"`).
* Object **keys** (set-of-id and map-of-id forms): `{ "memberGroupIds": { "#grp-sales": true, "#grp-support": true } }`.
* The `id` field of an `update` operation (resolved client-side as described above).

Refs do **not** work for:

* The `id` field of an `update` operation when no matching `create` exists in the same plan (the CLI surfaces a clear error in this case).

### Dependency ordering

Because the CLI does not know the dependency graph in advance, plan authors are responsible for ordering operations correctly:

* **Creates** must be ordered parents-first. A `Domain` create must appear before an `Account` create that references the domain via `"domainId": "#..."`.
* **Updates** must come after the create of the object they patch (or reference an existing server id directly).
* **Destroys** must be listed **in the same order as the creates**. The reverse pass will then take them down children-first, matching foreign-key constraints.

A common pitfall: writing destroys in reverse-of-creates order (children-first) makes the apply *re-reverse* them at runtime to parents-first, which fails on `objectIsLinked`. The fix is to write destroys forwards (parents-first); the apply does the reversal.

### Batching

The CLI splits large operations into batches sized by the server's `maxObjectsInSet` (typically 500), so a `create` of 5,000 objects is sent in 10 requests. The first batch of a given object type sees only the previously-tracked `createdIds`. Each completed batch contributes its newly-assigned ids to the global tracker, so subsequent batches (and subsequent operations) can reference them.

For destroys, ids are first collected by paginating the corresponding `query` (anchor-based, in `maxObjectsInGet` increments), then destroyed in `maxObjectsInSet` batches.

## File format

A plan is **NDJSON**: every non-blank line is a JSON object describing one operation. Each operation has a discriminator `@type` field and an `object` field; the remaining fields depend on `@type`. Lines are processed in file order; blank lines and surrounding whitespace are ignored. There is no enclosing array.

### Annotated example

```text
# Destroy pass: written parents-first, executed children-first.
{"@type":"destroy","object":"Domain","value":{"name":"example.com"}}
{"@type":"destroy","object":"Domain","value":{"name":"example.net"}}
{"@type":"destroy","object":"Account","value":{"@type":"Group"}}
{"@type":"destroy","object":"DkimSignature"}

# Create / update pass: parents-first.
{"@type":"create","object":"Domain","value":{"dom-a":{"name":"example.com"},"dom-b":{"name":"example.net"}}}
{"@type":"create","object":"Account","value":{"grp-sales":{"@type":"Group","name":"sales","domainId":"#dom-a"}}}
{"@type":"update","object":"SystemSettings","value":{"defaultDomainId":"#dom-a"}}
```

(Annotation lines starting with `#` are shown above for clarity; the actual NDJSON parser does **not** accept comments. Every non-blank line must be a JSON object.)

A complete obfuscated example plan is included with these docs at [example-bulk-plan.ndjson](./example-bulk-plan.ndjson).

### Per-line JSON Schema

A machine-readable schema for **a single line** of the plan format:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Stalwart CLI bulk plan operation",
  "oneOf": [
    { "$ref": "#/$defs/createOp" },
    { "$ref": "#/$defs/updateOp" },
    { "$ref": "#/$defs/destroyOp" }
  ],
  "$defs": {
    "objectName": {
      "type": "string",
      "description": "Object type name. The 'x:' prefix is optional and case-insensitive."
    },
    "userId": {
      "type": "string",
      "description": "Client-assigned id. May be referenced elsewhere in the plan as `#<userId>`."
    },
    "ref": {
      "type": "string",
      "pattern": "^#.+",
      "description": "Reference to a client-assigned id earlier in the plan."
    },

    "createOp": {
      "type": "object",
      "required": ["@type", "object", "value"],
      "additionalProperties": false,
      "properties": {
        "@type": { "const": "create" },
        "object": { "$ref": "#/$defs/objectName" },
        "value": {
          "type": "object",
          "minProperties": 1,
          "description": "Map of user-assigned id -> object body. References inside the body use #<id> syntax.",
          "additionalProperties": { "type": "object" }
        }
      }
    },

    "updateOp": {
      "type": "object",
      "required": ["@type", "object", "value"],
      "additionalProperties": false,
      "properties": {
        "@type": { "const": "update" },
        "object": { "$ref": "#/$defs/objectName" },
        "id": {
          "oneOf": [
            { "type": "string" },
            { "type": "null" }
          ],
          "description": "Required for normal objects; may be null or omitted for singletons. May be a #<id> reference to an object created earlier in the plan."
        },
        "value": {
          "type": "object",
          "description": "JMAP patch object. Top-level keys may be JSON pointers."
        }
      }
    },

    "destroyOp": {
      "type": "object",
      "required": ["@type", "object"],
      "additionalProperties": false,
      "properties": {
        "@type": { "const": "destroy" },
        "object": { "$ref": "#/$defs/objectName" },
        "value": {
          "oneOf": [
            { "type": "object", "description": "JMAP filter object. {} or null matches all." },
            { "type": "null" }
          ]
        }
      }
    }
  }
}
```

### Per-operation field reference

#### `create`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"create"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). |
| `value` | object | yes | Map of client id -> object body. Each body must include `@type` for multi-variant objects. References use `#<id>`. |

The map keys are client-assigned ids. They may be referenced elsewhere as `#<key>`. As a convenience, the CLI strips a single leading `#` from create-map keys, so `{"dom-a": {...}}` and `{"#dom-a": {...}}` are equivalent.

A `create` operation maps directly to one or more JMAP `Object/set` requests with `create` populated. Batching is handled automatically.

#### `update`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"update"` | yes | |
| `object` | string | yes | |
| `id` | string or null | required for non-singletons | May be a `#<id>` reference to an earlier create. May be `null` or omitted for singletons. |
| `value` | object | yes | JMAP patch object. Top-level keys may be JSON pointers (`"aliases/2/name"`). |

`update` corresponds to a single JMAP `Object/set` with `update` populated. Patches use the JMAP semantics: only changed fields are sent; sub-fields can be addressed with `/`-separated paths; `null` removes a value.

For multi-variant changes (where the entire variant is being switched), pass the new variant's body as a single value rather than patching individual sub-paths (see [Updating objects](./update.md) for the rationale).

#### `destroy`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"destroy"` | yes | |
| `object` | string | yes | Singletons cannot be destroyed. |
| `value` | object or null | no | JMAP filter object. `{}` or `null` matches every instance of the type. |

Destroys are *filter-based*, not id-based: the CLI runs a paginated `Object/query` with the supplied filter, then destroys every returned id in batches. To delete a specific known id, use a filter that matches it (e.g. `{"name": "..."}`) or the standalone [`delete`](./delete.md) command.

The set of filterable properties is whatever the server's `Object/query` accepts for the type. Most user-facing properties (`name`, `domainId`, etc.) are universally supported. Filtering on the `@type` discriminator works for some multi-variant types (notably `Account`) but not all. If a destroy fails with `unsupportedFilter: Filter on property @type is not supported or invalid`, drop the `@type` clause and either destroy all variants of the parent (omit `value`) or filter on a regular property.

## Output

### Human (default)

```text
Plan: 4 destroy, 5 update, 3 create (8 objects)
✓ destroyed Domain (1)
✓ destroyed Domain (1)
✓ destroyed Account (2)
✓ destroyed DkimSignature (8)
✓ created Domain (2)
✓ created Account (2)
✓ created DkimSignature (3)
✓ updated SystemSettings (1)
✓ updated Enterprise (1)
✓ updated BlobStore (1)
✓ updated InMemoryStore (1)
✓ updated SearchStore (1)
Done: 12 destroyed, 5 updated, 7 created (0 failed)
```

The `Plan:` line and the `Done:` line are written to **stderr** so that `--json` output stays clean for downstream tools.

### NDJSON (`--json`)

One record per completed operation, plus a `summary` record:

```text
{"op":"destroy","object":"Domain","index":0,"count":1,"status":"ok"}
{"op":"create","object":"Domain","index":4,"count":2,"status":"ok"}
{"op":"create","object":"Account","index":5,"status":"error","error":"Account: create failed for `grp-sales` (operation #6): error: invalidPatch | ..."}
{"op":"summary","plan":{"destroys":4,"updates":5,"creates":3,"create_objects":8},"done":{"destroyed":1,"updated":0,"created":2,"failed":1}}
```

This is the recommended mode for CI pipelines and IaC providers. The plan header and any progress lines remain on stderr; only the records above appear on stdout.

### Dry run

```sh
stalwart-cli apply --file plan.ndjson --dry-run
```

```text
Plan: 4 destroy, 5 update, 3 create (8 objects)
(dry run: no changes will be made)
```

`--dry-run` validates that the plan parses, that every referenced object type exists in the schema, and that singleton / id rules are respected. It does not contact the server beyond fetching the schema (which is normally cached).

## Integrating with infrastructure-as-code

The CLI is designed to work as the lowest-level building block under whatever orchestration tool fits the platform. The pattern in every case is the same: render a JSON plan from the platform's templates / variables, pipe or pass it to `stalwart-cli apply`, and surface the exit status.

### Ansible

Use `ansible.builtin.template` to render a plan from a Jinja2 template, then `ansible.builtin.command` to apply it. A minimal playbook:

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
      changed_when: result.rc == 0 and ('"created":' in result.stdout or '"updated":' in result.stdout)
      failed_when: result.rc != 0

    - name: Show summary
      ansible.builtin.debug:
        msg: "{{ result.stdout_lines | last | from_json }}"
```

`stalwart-plan.ndjson.j2` (one JSON object per line, no enclosing array):

```jinja
{% for d in domains %}
{"@type":"destroy","object":"Domain","value":{"name":"{{ d.name }}"}}
{% endfor %}
{"@type":"create","object":"Domain","value":{
{%- for d in domains -%}
"dom-{{ loop.index }}":{"name":"{{ d.name }}","description":"{{ d.description }}"}{% if not loop.last %},{% endif %}
{%- endfor -%}
}}
```

Use `--dry-run` in a `check` task for `--check` Ansible runs.

### Terraform

Two patterns are supported.

**As an `external` data source** (read-only views of state) and a `terraform_data` resource that runs the apply on changes:

```hcl
locals {
  ops = [
    {
      "@type" = "create"
      object  = "Domain"
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
    command     = "stalwart-cli apply --stdin --json"
    interpreter = ["/bin/sh", "-c"]
    environment = {
      STALWART_URL      = var.stalwart_url
      STALWART_USER     = var.stalwart_admin_user
      STALWART_PASSWORD = var.stalwart_admin_password
    }
    stdin = local.plan
  }
}
```

`triggers_replace` ensures the apply re-runs whenever the rendered plan changes. The resource is destroyed-and-recreated on plan changes, which keeps Terraform's drift detection meaningful.

For a more idiomatic Terraform integration (typed resources, real drift detection, partial applies), wrap the CLI in a small custom provider written in Go that shells out to `stalwart-cli` for the actual operations.

### NixOS

Define a NixOS module that materialises the plan as a derivation and runs it via a `systemd.services.<name>.serviceConfig.ExecStart`:

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

Consumers then write:

```nix
services.stalwart-bootstrap = {
  enable = true;
  url = "https://mail.example.com";
  credentialsFile = "/run/secrets/stalwart-admin";
  plan = [
    { "@type" = "create";
      object  = "Domain";
      value   = { dom-a = { name = "example.com"; }; };
    }
    { "@type" = "update";
      object  = "SystemSettings";
      value   = { defaultDomainId = "#dom-a"; defaultHostname = "mail.example.com"; };
    }
  ];
};
```

The plan is regenerated and re-applied on every NixOS rebuild. Combine with `agenix` or `sops-nix` for the credentials file. Use `--dry-run` in a separate `nixos-test` to validate plans in CI.

### Pulumi

Pulumi's `Command` resource (from `@pulumi/command`) maps cleanly to `apply`:

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

The `triggers` array forces a re-run when the plan content changes.

### CI / CD pipelines

`apply` reads from stdin and emits NDJSON, so it slots into any CI environment.

#### GitHub Actions

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

#### GitLab CI

```yaml
apply:
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
    - curl --proto '=https' --tlsv1.2 -LsSf https://github.com/stalwartlabs/cli/releases/latest/download/stalwart-cli-installer.sh | sh
  script:
    - stalwart-cli apply --file stalwart/plan.ndjson --json
  variables:
    STALWART_URL: "https://mail.example.com"
  # STALWART_USER and STALWART_PASSWORD come from masked CI variables.
```

## Operational guidance

* **Generate, review, apply.** Treat the plan file as an artifact: render it from templates, commit the rendered version (or its diff) for review, then apply.
* **Use `--dry-run` in pull requests.** Every plan change should pass a `--dry-run` before merging.
* **Never embed real secrets in committed plans.** Use placeholders that the renderer substitutes from a secrets manager (Vault, sops, SSM, ...). Plans containing private keys, password hashes, or license tokens should never be checked in unencrypted.
* **Keep the destroy and create lists in the same order.** The reverse pass relies on this. If the destroy list and the create list match position-for-position (parents first), the apply round-trips cleanly.
* **Watch out for `objectIsLinked`.** If a destroy fails with `objectIsLinked`, an earlier object in the destroy list is too far up the tree (i.e. children-first ordering). Re-order so parents come first.

## See also

* [Exporting server state](./snapshot.md) for the inverse operation (generating an apply plan from a live deployment).
* [Overview](./overview.md) for installation and connection setup.
* [Exploring the schema](./describe.md) to discover what objects, fields, and filters are available.
* [Creating objects](./create.md) and [Updating objects](./update.md) for the single-shot equivalents.
* [Removing objects](./delete.md) for id-based deletes outside a plan.
