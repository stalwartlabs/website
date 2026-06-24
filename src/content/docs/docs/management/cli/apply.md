---
sidebar_position: 8
title: "Declarative bulk operations"
---

The `apply` command takes an NDJSON file describing a batch of `upsert`, `update`, `create`, and `destroy` operations, and applies them to the server in dependency-aware order. It is intended as the integration surface for infrastructure-as-code tooling (Ansible, Terraform, NixOS, Pulumi, ...) and for one-shot deployments / migrations performed by hand or by CI.

The primary operation is `upsert`: it matches each object in the plan against the live server (by a natural key such as a domain's `name`) and either updates the existing object in place or creates it if absent. A plan built from `upsert` operations is **idempotent**: applying it once or many times converges to the same server state, with no deletions and no duplicate objects. This is the operation [`snapshot`](/docs/management/cli/snapshot) emits, and the shape every infrastructure-as-code integration below uses.

For interactive use cases see the per-command pages: [Creating objects](/docs/management/cli/create), [Updating objects](/docs/management/cli/update), [Removing objects](/docs/management/cli/delete).

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
| `--progress` | Print one extra line per request batch during large `destroy`, `create`, and `upsert` operations. |

Exactly one of `--file` and `--stdin` must be supplied.

## How it works

The plan is **NDJSON**: one operation per line, no enclosing array. Blank lines are ignored; surrounding whitespace on a line is tolerated. Each operation is one of four types: `upsert`, `update`, `create`, or `destroy`. The CLI processes the plan in **two passes**:

1. **Destroy pass (reverse order).** Every `destroy` operation is executed in **reverse** of its position in the plan. All other operations are skipped during this pass. This is what makes dependency-aware teardowns possible: when a plan lists `Domain → Account → DkimSignature` (parents first), the reverse pass tears them down in `DkimSignature → Account → Domain` order, satisfying foreign-key constraints. Most plans contain no destroys at all; the pass is a no-op for them. See [Teardown with destroy](#teardown-with-destroy).

2. **Apply pass (plan order).** All `upsert`, `update`, and `create` operations run in the order they appear in the plan. Destroys are skipped during this pass. This ordering is what allows objects to reference each other: a `Domain` can be upserted in operation 1 and then referenced by an `Account` in operation 2.

The two passes let a single plan file describe a teardown followed by a rebuild, but for the common case (declaring desired state and re-applying it) the plan is a flat list of `upsert` and singleton `update` operations and only the second pass does any work.

### Stop on first error (default)

If any operation fails (HTTP error, JMAP method-level error, or any per-object SetError such as `validationFailed` or `objectIsLinked`), the CLI prints the error and exits non-zero. The remaining operations are not attempted.

This default is chosen deliberately for IaC contexts: a partially-applied plan is usually worse than no apply at all, and a failed step almost always indicates a bug in the plan or a server-side conflict that needs investigation before proceeding.

To override, pass `--continue-on-error`, in which case every operation is attempted and the final summary reports the count of successes and failures. The exit code is still non-zero when at least one failed.

### Idempotent re-runs

Use `upsert` operations to make a plan re-runnable. An `upsert` matches each object in its `value` map against the live server using a **match key** (see [Matching](#matching)); if a match is found the object is updated in place, otherwise it is created. Because nothing is destroyed and an existing object is never duplicated, applying the same `upsert` plan once or a hundred times converges to the same server state. This is the shape [`stalwart-cli snapshot`](/docs/management/cli/snapshot) emits, and the shape used in the [annotated example](#annotated-example) below.

This sidesteps the problems that a `create`-only or `destroy` + `create` plan has:

* A `create`-only plan succeeds on the first run and fails on the second: re-creating the same `Domain`, `AllowedIp`, `Certificate`, etc. trips the server's primary-key constraints, and re-creating types that have no such constraint produces duplicate rows.
* A `destroy` + `create` plan can be re-run, but it tears down and rebuilds the world on every apply. That cannot work for an object another object depends on: a `Domain` referenced by an `Account`, a `DkimSignature`, or the non-nullable `SystemSettings.defaultDomainId` cannot be destroyed while the reference exists (the destroy fails with `objectIsLinked`). `upsert` reconciles such an object in place instead, leaving its id and its dependents untouched.

`apply` does **not** diff the desired value against the current one. An `upsert` whose match key finds an existing object always issues the `update`, even when no field changed; the run reports it as updated and the resulting state is identical. Idempotency here means the end state converges, not that an unchanged re-run is a no-op.

A practical consequence worth noting: an `upsert` preserves the server-assigned id of a matched object, so external systems that cache Stalwart ids keep working across re-applies (unlike a `destroy` + `create`, which assigns fresh ids each time).

#### Matching

The match key for an `upsert` is resolved in this order:

1. **Explicit `matchOn`.** If the operation carries a `matchOn` list of property names, those properties are the key. An object in the `value` map matches an existing object when every listed property is equal. Every property in `matchOn` must be present in each object body, or the operation errors.
2. **The schema's label property.** If `matchOn` is omitted, the CLI uses the type's label property (the field the WebUI lists objects by, for example `name` on `Domain`). [`snapshot`](/docs/management/cli/snapshot) writes this `matchOn` explicitly so plans are self-describing.
3. **Value match (fallback).** If the type has no label property and no `matchOn` was given, the CLI matches by comparing every non-secret scalar field (string, number, boolean, enum, datetime) of the body against existing objects. A `warning` is printed, because this fallback is not convergent: changing any compared field means the body no longer matches the old object, so a **new** object is created instead of the old one being updated. For any type you re-apply, supply an explicit `matchOn` (or rely on a label property) rather than the value fallback.

If the match key matches **more than one** existing object the operation errors as ambiguous, rather than guessing which one to update. For [multi-variant types](/docs/management/cli/#multi-variant-objects), each body must carry its `@type`, and matching is done within that variant.

When an `upsert` updates a matched object, server-set and immutable fields in the body are dropped from the patch (the server would reject them); only mutable fields are sent.

#### Teardown with destroy

`destroy` remains available for the cases where deletion is the intent: removing objects a plan no longer owns, or wiping a type before a migration. It is not part of the idempotent re-run flow above. See [the `destroy` reference](#destroy) and [Operational guidance](#operational-guidance).

* **Server-assigned ids change** across a destroy-and-recreate, so external systems that cache Stalwart ids must look them up again afterwards.
* **Destroy filters scope the teardown.** `{"@type":"destroy","object":"Domain","value":{"name":"example.com"}}` only removes the named domain. `{"@type":"destroy","object":"Domain"}` (no `value`) removes every domain on the server. Choose the filter to match the slice of state the plan owns; an unfiltered destroy in a plan that only declares one domain will silently delete every other domain on the server.

### Cross-operation references

The plan can express references between objects that have not been created yet by using the JMAP `#<id>` reference syntax. Two distinct mechanisms cooperate:

* **Refs in values** (`"domainId": "#dom-a"`): the CLI never rewrites these. It collects them recursively from every string value and every object key, and forwards them to the server in the request-level `createdIds` map. The server resolves `#dom-a` to the real id assigned during the matching `create`. This works across separate JMAP requests, including across batches.

* **Refs as the `id` of an `update`** (`"id": "#dom-a"`): JMAP does not resolve `#`-prefixed update keys server-side. The CLI resolves these client-side from the id map populated during earlier `create` and `upsert` operations. If the reference does not match any prior create or upsert, the CLI errors before sending the request.

An `upsert` registers a client id (`#dom-a`) the same way a `create` does, whether the object was matched or freshly created, so later operations can reference an upserted object regardless of whether this run created it or reconciled an existing one. This is what lets a snapshot's singleton `update` set `"defaultDomainId": "#domain-b"` and have it resolve to the already-present domain on a re-apply.

Refs work in:

* String values, anywhere in the value tree (`"domainId": "#dom-a"`).
* Object **keys** (set-of-id and map-of-id forms): `{ "memberGroupIds": { "#grp-sales": true, "#grp-support": true } }`.
* The `id` field of an `update` operation (resolved client-side as described above).

Refs do **not** work for:

* The `id` field of an `update` operation when no matching `create` or `upsert` exists in the same plan (the CLI surfaces a clear error in this case).

### Dependency ordering

Because the CLI does not know the dependency graph in advance, plan authors are responsible for ordering operations correctly:

* **Upserts** (and **creates**) must be ordered parents-first. A `Domain` upsert must appear before an `Account` upsert that references the domain via `"domainId": "#..."`.
* **Updates** must come after the upsert or create of the object they patch (or reference an existing server id directly). Singleton updates that reference other objects (for example `SystemSettings` pointing at `defaultDomainId`) belong at the end, after the objects they point to.
* **Destroys**, when present, must be listed **in the same order as the creates/upserts**. The reverse pass will then take them down children-first, matching foreign-key constraints.

A common pitfall with teardowns: writing destroys in reverse-of-creates order (children-first) makes the apply *re-reverse* them at runtime to parents-first, which fails on `objectIsLinked`. The fix is to write destroys forwards (parents-first); the apply does the reversal.

### Batching

The CLI splits large operations into batches sized by the server's `maxObjectsInSet` (typically 500), so an `upsert` or `create` of 5,000 objects is sent in batches of 500. The first batch of a given object type sees only the previously-tracked `createdIds`. Each completed batch contributes its newly-assigned ids to the global tracker, so subsequent batches (and subsequent operations) can reference them.

To resolve matches, an `upsert` first reads the existing objects of the type once (paginated by `maxObjectsInGet`) and caches them for the run, then issues the `create` and `update` batches.

For destroys, ids are first collected by paginating the corresponding `query` (anchor-based, in `maxObjectsInGet` increments), then destroyed in `maxObjectsInSet` batches.

## File format

A plan is **NDJSON**: every non-blank line is a JSON object describing one operation. Each operation has a discriminator `@type` field and an `object` field; the remaining fields depend on `@type`. Lines are processed in file order; blank lines and surrounding whitespace are ignored. There is no enclosing array.

### Annotated example

A re-runnable plan: `upsert` the objects (parents first), then point the singleton at one of them. Applying it twice converges to the same state.

```text
# Upsert objects, parents-first. matchOn names the natural key.
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{"dom-a":{"name":"example.com","description":"Primary corporate domain"},"dom-b":{"name":"example.net"}}}
{"@type":"upsert","object":"Account","matchOn":["name"],"value":{"grp-sales":{"@type":"Group","name":"sales","domainId":"#dom-a"}}}

# Singleton update, last: it references a domain upserted above.
{"@type":"update","object":"SystemSettings","value":{"defaultDomainId":"#dom-a"}}
```

(Annotation lines starting with `#` are shown above for clarity; the actual NDJSON parser does **not** accept comments. Every non-blank line must be a JSON object.)

On the first apply, no `example.com`/`example.net` domain exists, so both are created and `#dom-a` resolves to the new `example.com`. On the second apply, the `matchOn: ["name"]` key finds the existing domains and they are updated in place; `#dom-a` resolves to the same id, so `defaultDomainId` stays valid and nothing is duplicated or destroyed.

A complete obfuscated example plan is included with these docs at [example-bulk-plan.ndjson](./example-bulk-plan.ndjson).

### Per-line JSON Schema

A machine-readable schema for **a single line** of the plan format:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Stalwart CLI bulk plan operation",
  "oneOf": [
    { "$ref": "#/$defs/upsertOp" },
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

    "upsertOp": {
      "type": "object",
      "required": ["@type", "object", "value"],
      "additionalProperties": false,
      "properties": {
        "@type": { "const": "upsert" },
        "object": { "$ref": "#/$defs/objectName" },
        "matchOn": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 1,
          "description": "Property names forming the match key. If omitted, the type's label property is used, falling back to a by-value match (with a warning). Cannot be empty."
        },
        "value": {
          "type": "object",
          "minProperties": 1,
          "description": "Map of user-assigned id -> object body. Each body must include every property named in matchOn (and @type for multi-variant types). References inside the body use #<id> syntax.",
          "additionalProperties": { "type": "object" }
        }
      }
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

#### `upsert`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"upsert"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). Singletons are rejected: use `update`. |
| `matchOn` | array of string | no | Property names forming the [match key](#matching). If omitted, the type's label property is used, falling back to a by-value match (with a warning). If present it must be non-empty. |
| `value` | object | yes | Map of client id -> object body. Each body must include every property named in `matchOn`, and `@type` for multi-variant objects. References use `#<id>`. |

For each object in `value`, the CLI looks for an existing object matching the [match key](#matching): if found it issues an `update` (server-set and immutable fields are dropped from the patch); if not, it issues a `create`. The map keys are client-assigned ids that may be referenced elsewhere as `#<key>`, whether the object ends up matched or created. As with `create`, a single leading `#` on a map key is stripped, so `{"dom-a": {...}}` and `{"#dom-a": {...}}` are equivalent.

An `upsert` reads the existing objects of the type once to resolve matches, then maps to JMAP `Object/set` requests with `create` and `update` populated. Batching is handled automatically. An ambiguous match (the key matches more than one existing object), a `matchOn` property missing from a body, an empty `value`, an empty `matchOn`, or an `upsert` of a singleton each fail the operation with a clear error.

#### `create`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"create"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). |
| `value` | object | yes | Map of client id -> object body. Each body must include `@type` for multi-variant objects. References use `#<id>`. |

The map keys are client-assigned ids. They may be referenced elsewhere as `#<key>`. As a convenience, the CLI strips a single leading `#` from create-map keys, so `{"dom-a": {...}}` and `{"#dom-a": {...}}` are equivalent.

A `create` operation maps directly to one or more JMAP `Object/set` requests with `create` populated. Batching is handled automatically. Unlike `upsert`, a `create` is not re-runnable: a second apply trips a primary-key violation or produces duplicate rows. Reach for `create` only in one-shot plans; prefer `upsert` for anything re-applied.

#### `update`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"update"` | yes | |
| `object` | string | yes | |
| `id` | string or null | required for non-singletons | **Top-level sibling of `value`, not a key inside `value`.** May be a `#<id>` reference to an object created earlier in the plan. May be `null` or omitted for singletons. |
| `value` | object | yes | JMAP patch object. Top-level keys may be JSON pointers (`"aliases/2/name"`). |

`update` corresponds to a single JMAP `Object/set` with `update` populated. Patches use the JMAP semantics: only changed fields are sent; sub-fields can be addressed with `/`-separated paths; `null` removes a value.

A singleton update omits the top-level `id` field (or sets it to `null`):

```text
{"@type":"update","object":"SystemSettings","value":{"defaultDomainId":"#dom-a"}}
```

A non-singleton update sets the top-level `id` field to the id of the object being patched. The id may be a `#<id>` reference to an object created earlier in the same plan:

```text
{"@type":"update","object":"Domain","id":"#dom-a","value":{"description":"Renamed"}}
```

Or a literal server-assigned id, for patching an existing object the plan does not create:

```text
{"@type":"update","object":"Domain","id":"k1234abcd","value":{"description":"Renamed"}}
```

Note that `id` is a top-level field of the operation, alongside `@type`, `object`, and `value`. It is not a key inside `value`. (The map-keyed shape, where ids are keys of `value`, is the `create` convention; conflating the two is a common mistake when writing the first non-singleton update.)

For multi-variant changes (where the entire variant is being switched), pass the new variant's body as a single value rather than patching individual sub-paths (see [Updating objects](/docs/management/cli/update) for the rationale).

#### `destroy`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"destroy"` | yes | |
| `object` | string | yes | Singletons cannot be destroyed. |
| `value` | object or null | no | JMAP filter object. `{}` or `null` matches every instance of the type. |

Destroys are *filter-based*, not id-based: the CLI runs a paginated `Object/query` with the supplied filter, then destroys every returned id in batches. To delete a specific known id, use a filter that matches it (e.g. `{"name": "..."}`) or the standalone [`delete`](/docs/management/cli/delete) command.

The set of filterable properties is whatever the server's `Object/query` accepts for the type. Most user-facing properties (`name`, `domainId`, etc.) are universally supported. Filtering on the `@type` discriminator works for some multi-variant types (notably `Account`) but not all. If a destroy fails with `unsupportedFilter: Filter on property @type is not supported or invalid`, drop the `@type` clause and either destroy all variants of the parent (omit `value`) or filter on a regular property.

## Output

### Human (default)

```text
Plan: 0 destroy, 1 update, 0 create, 3 upsert (7 objects)
✓ upserted Domain (2)
✓ upserted Account (2)
✓ upserted DkimSignature (3)
✓ updated SystemSettings (1)
Done: 0 destroyed, 4 updated, 4 created (0 failed)
```

An `upsert` line shows the total objects handled; in the `Done:` summary those split into `created` (no existing match) and `updated` (matched and reconciled). Here the seven upserted objects landed as four creates and three updates, plus the one singleton update. The `Plan:` line and the `Done:` line are written to **stderr** so that `--json` output stays clean for downstream tools.

### NDJSON (`--json`)

One record per completed operation, plus a `summary` record:

```text
{"op":"upsert","object":"Domain","index":0,"count":2,"status":"ok"}
{"op":"upsert","object":"Account","index":1,"count":2,"status":"ok"}
{"op":"update","object":"SystemSettings","index":2,"count":1,"status":"ok"}
{"op":"summary","plan":{"destroys":0,"updates":1,"creates":0,"create_objects":0,"upserts":2,"upsert_objects":4},"done":{"destroyed":0,"updated":3,"created":2,"failed":0}}
```

This is the recommended mode for CI pipelines and IaC providers. The plan header and any progress lines remain on stderr; only the records above appear on stdout. The summary's `plan` block counts the planned operations (`upserts` and `upsert_objects` alongside the create/update/destroy counts); the `done` block counts the actual outcome, where an upsert's objects are tallied under `created` or `updated`.

### Dry run

```sh
stalwart-cli apply --file plan.ndjson --dry-run
```

```text
Plan: 0 destroy, 1 update, 0 create, 3 upsert (7 objects)
(dry run: no changes will be made)
```

`--dry-run` validates that the plan parses, that every referenced object type exists in the schema, and that the structural rules are respected (singleton / id rules, no `upsert` of a singleton, non-empty `value` and `matchOn`). It does not contact the server beyond fetching the schema (which is normally cached), so match resolution (whether an object exists, whether a match is ambiguous) is only checked at apply time.

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
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{
{%- for d in domains -%}
"dom-{{ loop.index }}":{"name":"{{ d.name }}","description":"{{ d.description }}"}{% if not loop.last %},{% endif %}
{%- endfor -%}
}}
```

The single `upsert` line is idempotent: the first apply creates the domains, every later apply matches them by `name` and reconciles their fields. No teardown loop is needed.

Use `--dry-run` in a `check` task for `--check` Ansible runs.

### Terraform

Two patterns are supported.

**As an `external` data source** (read-only views of state) and a `terraform_data` resource that runs the apply on changes:

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

`triggers_replace` ensures the apply re-runs whenever the rendered plan changes. Because the plan is built from `upsert` operations, a re-run reconciles the existing Stalwart objects in place rather than recreating them, so re-applying after an unrelated change is safe.

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

The plan is regenerated and re-applied on every NixOS rebuild. Because it is built from `upsert` operations, each rebuild reconciles the existing objects in place rather than recreating them, so repeated rebuilds converge instead of failing on the second run. Combine with `agenix` or `sops-nix` for the credentials file. Use `--dry-run` in a separate `nixos-test` to validate plans in CI.

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

* **Prefer `upsert` for anything re-applied.** A plan of `upsert` and singleton `update` operations converges on every run. Reserve `create` for one-shot plans and `destroy` for deliberate teardowns.
* **Give each re-applied type a stable match key.** Rely on the type's label property or set an explicit `matchOn`; avoid the by-value fallback for anything you re-apply, since a changed field there creates a duplicate instead of updating. See [Matching](#matching).
* **Generate, review, apply.** Treat the plan file as an artifact: render it from templates, commit the rendered version (or its diff) for review, then apply.
* **Use `--dry-run` in pull requests.** Every plan change should pass a `--dry-run` before merging.
* **Never embed real secrets in committed plans.** Use placeholders that the renderer substitutes from a secrets manager (Vault, sops, SSM, ...). Plans containing private keys, password hashes, or license tokens should never be checked in unencrypted.
* **For teardowns, keep the destroy list in creates order.** When a plan does include `destroy` operations, list them parents-first (the same order as the corresponding upserts/creates); the reverse pass takes them down children-first. If a destroy fails with `objectIsLinked`, an earlier entry is too far down the tree (children-first ordering): re-order so parents come first.

## See also

* [Exporting server state](/docs/management/cli/snapshot) for the inverse operation (generating an apply plan from a live deployment).
* [Overview](/docs/management/cli/) for installation and connection setup.
* [Exploring the schema](/docs/management/cli/describe) to discover what objects, fields, and filters are available.
* [Creating objects](/docs/management/cli/create) and [Updating objects](/docs/management/cli/update) for the single-shot equivalents.
* [Removing objects](/docs/management/cli/delete) for id-based deletes outside a plan.
