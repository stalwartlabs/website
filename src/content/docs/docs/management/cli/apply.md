---
sidebar_position: 8
title: "Declarative bulk operations"
description: "Apply a plan of create, update, upsert, reconcile and destroy operations with stalwart-cli apply: options, execution, output and exit codes."
---

The commands that change one object at a time suit an administrator at a terminal, but they do not scale to a deployment whose configuration is kept in files and applied on every change. For that, the CLI offers `apply`. It reads a plan, a file that lists operations on configuration objects, and applies the whole plan to the server in an order that respects the dependencies between objects.

A plan is written in NDJSON (newline-delimited JSON), with one operation per line. It can combine five kinds of operation: `upsert`, `reconcile`, `update`, `create` and `destroy`. The command is the integration surface for infrastructure-as-code tools such as Ansible, Terraform, NixOS and Pulumi. It serves equally for one-shot deployments and migrations, run by hand or from CI.

Most plans are built from `upsert`. An `upsert` looks up each object of the plan on the live server by a natural key, such as a domain's `name`. When it finds a match, it updates the existing object in place, and when it finds none, it creates the object. Because an `upsert` never deletes and never duplicates an object, a plan made of `upsert` operations is idempotent: applying it once or many times converges to the same server state. This is the operation that [`snapshot`](/docs/management/cli/snapshot) emits, and the [infrastructure-as-code](/docs/management/cli/infrastructure-as-code) integrations use the same shape.

What `upsert` cannot do is remove an object that the plan no longer describes, so a renamed or dropped object stays behind on the server. `reconcile` closes that gap. It does everything `upsert` does, and then destroys every existing object of the type that the plan did not match, so the type converges to exactly the set that the plan describes. [Reconciling to exact state](/docs/management/cli/idempotent-plans#reconciling-to-exact-state) explains how to use it safely.

The plan file itself is specified in [Plan file format](/docs/management/cli/plan-format). [Idempotent plans](/docs/management/cli/idempotent-plans) covers re-runs, matching and reconciliation, and [Infrastructure as code](/docs/management/cli/infrastructure-as-code) shows integrations with Ansible, Terraform, NixOS, Pulumi and CI pipelines. Interactive changes to individual objects are better made with [Creating objects](/docs/management/cli/create), [Updating objects](/docs/management/cli/update) and [Removing objects](/docs/management/cli/delete).

## Synopsis

```text
stalwart-cli apply ( --file <path> | --stdin )
                   [--dry-run]
                   [--continue-on-error]
                   [--quiet]
                   [--json]
                   [--progress]
```

The plan comes from exactly one source, so either `--file` or `--stdin` must be passed. The remaining options decide two things: whether the plan is actually applied, and how the run is reported.

| Option | Effect |
|---|---|
| `--file <path>` | Reads the plan from an NDJSON file. |
| `--stdin` | Reads the plan, as NDJSON, from standard input. |
| `--dry-run` | Parses and validates the plan and prints its operation counts. No requests are sent. |
| `--continue-on-error` | Keeps going after a failed operation, reports all errors at the end and exits non-zero. |
| `--quiet` | Suppresses the per-operation log lines and prints only the final summary. |
| `--json` | Writes one NDJSON record per completed operation to stdout, followed by a summary record. The plan header and any progress lines stay on stderr. |
| `--progress` | Prints one extra line per request batch during large `destroy`, `create`, `upsert` and `reconcile` operations. |

## Execution passes

A plan is NDJSON: one operation per line, with no enclosing array. Blank lines are ignored, and whitespace around a line is tolerated.

The order in which the operations run matters, because objects refer to each other. An account refers to its domain, for example, so the domain must exist before the account is created, and the account must be gone before the domain can be deleted. The CLI handles both directions by processing the plan in three passes, each of which runs a different subset of the operations:

1. **Destroy pass, in reverse order.** Every `destroy` operation runs, starting from the last one in the plan and working back to the first, and all other operations are skipped. Reversing the order is what makes dependency-aware teardowns possible. When a plan lists `Domain`, then `Account`, then `DkimSignature`, parents first, this pass removes them as `DkimSignature`, `Account`, `Domain`, which satisfies the foreign-key constraints between them. Most plans contain no destroys, and for them this pass does nothing. See [Teardown with destroy](/docs/management/cli/idempotent-plans#teardown-with-destroy).

2. **Apply pass, in plan order.** Every `upsert`, `reconcile`, `update` and `create` operation runs in the order in which it appears in the plan. Destroys are skipped, and the delete half of each `reconcile` is held back for the third pass. Running in plan order is what lets objects reference each other: a `Domain` upserted in the first operation can be referenced by an `Account` in the second.

3. **Reconcile cleanup pass, in reverse order.** During the apply pass, each `reconcile` marked for deletion the existing objects that the plan did not match. Those objects are destroyed now, with the reconciles processed from the last to the first. The deletes wait until the whole apply pass has finished, and they then run children first. By the time an object is deleted, any dependent has therefore already been repointed or removed, so a leftover child does not block the deletion of a leftover parent. A plan with no `reconcile` operations skips this pass.

Together, the three passes let a single plan describe a teardown followed by a rebuild, and let a `reconcile` add, update and delete in one declarative sweep. The common case is simpler. A plan that declares the desired state with `upsert` and re-applies it is a flat list of `upsert` and singleton `update` operations, and only the second pass does any work.

### Stop on first error (default)

By default, the CLI stops at the first failure. Any failed operation counts: an HTTP error, a JMAP method-level error, or a per-object SetError such as `validationFailed` or `objectIsLinked`. The CLI prints the error, does not attempt the remaining operations and exits non-zero.

Stopping keeps a plan from being applied any further past a failure. In automated deployments, a failure usually points to an error in the plan or to a conflict on the server, and either one needs investigating before the rest of the plan runs.

When the goal is to see every failure in one run, pass `--continue-on-error`. Every operation is then attempted, and the final summary reports how many succeeded and how many failed. The exit code is still non-zero when at least one operation failed.

### Dependency ordering

The passes reverse the order where necessary, but the CLI does not know the dependency graph between objects in advance. The plan must therefore list the operations in a workable order, and each kind of operation has its own rule:

* **Upserts, reconciles and creates** go parents first. A `Domain` upsert must appear before an `Account` upsert that references the domain through `"domainId": "#..."`. The same applies to a reference in a `reconcile` match key, where the parent must be produced before the operation that keys on it. The delete half of a `reconcile` needs no care, because it is deferred to the final pass, which runs children first.
* **Updates** come after the upsert or create of the object they patch, unless they reference an existing server id directly. A singleton update that references other objects, such as `SystemSettings` pointing at `defaultDomainId`, belongs at the end, after the objects it points to.
* **Destroys**, when a plan has any, are listed in the same order as the creates and upserts. The reverse pass then removes them children first, which matches the foreign-key constraints.

The destroy rule is a common pitfall in teardowns. It is tempting to write the destroys children first, in the reverse of the creates. The apply then reverses them again at runtime, so they run parents first and fail with `objectIsLinked`. List destroys in the same order as the creates and let the apply do the reversal.

### Batching

The server limits how many objects a single request may change, so the CLI splits large operations into batches. The batch size is the server's `maxObjectsInSet` limit, which the `maxSetObjects` field of the [Jmap](/docs/ref/object/jmap) settings controls. At its default of <!-- default:Jmap.maxSetObjects -->500<!-- /default -->, an `upsert` or `create` of 5,000 objects is split into batches of that size.

Batching also affects which objects a reference can reach. Each completed batch adds the ids that the server assigned to its objects to the ids already known, so later batches and later operations can reference those objects. The first batch of an object type, however, can reference only ids that were known before it was sent.

An `upsert` or `reconcile` has to know what already exists before it can match anything. It therefore first reads the existing objects of the type once, paginated by `maxObjectsInGet`, and caches them for the rest of the run. It then sends the `create` and `update` batches. A `reconcile` reuses the same cached read to work out which existing objects were not matched, and destroys them in `maxObjectsInSet` batches during the cleanup pass.

A `destroy` works in two steps as well. It first collects the ids it will remove, by paginating the corresponding query in `maxObjectsInGet` increments and starting each page from the last id of the previous one. It then destroys them in `maxObjectsInSet` batches.

## Output

`apply` reports a run in one of two forms: a human-readable log for an administrator watching the run, and NDJSON records for the tools that drive it.

### Human (default)

Without `--json`, the CLI prints the plan, one line per completed operation and a final summary. For a plan that upserts domains, accounts and DKIM signatures and then updates `SystemSettings`, the output looks like this:

```text
Plan: 0 destroy, 1 update, 0 create, 3 upsert, 0 reconcile (7 objects)
✓ upserted Domain (2)
✓ upserted Account (2)
✓ upserted DkimSignature (3)
✓ updated SystemSettings (1)
Done: 0 destroyed, 4 updated, 4 created (0 failed)
```

An `upsert` or `reconcile` line shows the total number of objects that the operation handled. The `Done:` summary splits that total by outcome: `created` counts the objects that had no existing match, and `updated` counts the objects that were matched and reconciled. In this example, the seven upserted objects became four creates and three updates, and the singleton update brings `updated` to four. A `reconcile` that deletes objects also prints a cleanup line during the final pass, for example `✓ reconcile removed Domain (2)`, and the summary counts those deletions under `destroyed`.

The `Plan:` and `Done:` lines are written to stderr. They therefore never mix with the records that `--json` writes to stdout for downstream tools.

### NDJSON (`--json`)

For CI pipelines and infrastructure-as-code providers, `--json` is the recommended mode, because each result is a record that a program can parse. Stdout then carries one record per completed operation, followed by a `summary` record, while the plan header and any progress lines stay on stderr:

```text
{"op":"upsert","object":"Domain","index":0,"count":2,"status":"ok"}
{"op":"upsert","object":"Account","index":1,"count":2,"status":"ok"}
{"op":"update","object":"SystemSettings","index":2,"count":1,"status":"ok"}
{"op":"summary","plan":{"destroys":0,"updates":1,"creates":0,"create_objects":0,"upserts":2,"upsert_objects":4,"reconciles":0,"reconcile_objects":0},"done":{"destroyed":0,"updated":3,"created":2,"failed":0}}
```

The summary record has two blocks. The `plan` block counts what the plan contained: the `destroys`, `updates` and `creates`, plus `upserts`, `upsert_objects`, `reconciles` and `reconcile_objects`. The `done` block counts what actually happened, and the objects of an upsert or reconcile appear there under `created` or `updated`.

A `reconcile` writes its record for the matched and created objects during the apply pass. If it then deletes anything, it writes a second record during the cleanup pass. That record is marked with `"stage":"cleanup"` and carries the number of objects destroyed:

```text
{"op":"reconcile","object":"Domain","index":0,"count":1,"status":"ok"}
{"op":"reconcile","stage":"cleanup","object":"Domain","index":0,"destroyed":2,"status":"ok"}
```

### Dry run

A dry run answers whether a plan is valid before anything is applied. `--dry-run` performs the checks without changing anything on the server:

```sh
stalwart-cli apply --file plan.ndjson --dry-run
```

```text
Plan: 0 destroy, 1 update, 0 create, 3 upsert, 0 reconcile (7 objects)
(dry run: no changes will be made)
```

A dry run checks that the plan parses, that every object type it names exists in the schema, and that it follows the structural rules. These rules cover singletons and ids, the ban on an `upsert` or `reconcile` of a singleton, a non-empty `value` and `matchOn` where they are required, and a usable match key on every `reconcile`.

A dry run also resolves the `#<id>` references in match keys offline, walking the operations in plan order. A `matchOn` reference to an id that no earlier operation produces is therefore rejected before anything is applied.

The limits of a dry run follow from what it sends. Its only request fetches the schema, which is normally cached. Anything that depends on live data is consequently checked only when the plan is applied: whether an object exists, whether a match is ambiguous, and what a `reconcile` would delete.

## Exit status

`apply` exits with status 0 when every operation succeeded. It exits with status 1 on any error, including a failed operation, an invalid plan and a connection or authentication failure. With `--json`, a failed operation is also reported as a record with `"status":"error"`, and the final `summary` record counts the failures under `done.failed`.

## Operational guidance

The following practices keep plans safe to re-apply and easy to review:

* **Prefer `upsert` for anything re-applied.** A plan of `upsert` and singleton `update` operations converges on every run. Reserve `create` for one-shot plans and `destroy` for deliberate teardowns.
* **Reach for `reconcile` only when the plan owns the whole type.** `reconcile` deletes every object of the type that the plan does not list. It therefore suits a type for which the plan is the single source of truth, where entries removed from the plan are meant to be deleted. If other tools or administrators also manage objects of the type, use `upsert` with explicit `destroy` operations, so that only objects the plan owns are deleted. Whenever `reconcile` is used, give it an explicit `matchOn` and review a `--dry-run` before applying.
* **Give each re-applied type a stable match key.** Rely on the type's label property or set an explicit `matchOn`. Avoid the by-value fallback for anything applied repeatedly, because a changed field then creates a duplicate where an update was intended. See [Matching](/docs/management/cli/idempotent-plans#matching).
* **Generate, review, apply.** Treat the plan file as an artifact: render it from templates, commit the rendered version or its diff for review, and then apply it.
* **Run `--dry-run` in pull requests.** Every change to a plan should pass a dry run before it is merged.
* **Never embed real secrets in committed plans.** Use placeholders that the renderer fills in from a secrets manager such as Vault, sops or SSM. A plan that contains private keys, password hashes or license tokens must never be checked in unencrypted.
* **Keep a tenant's objects self-contained.** A tenanted object can reference only objects in its own tenant, so each tenant needs its own copy of any configuration that its objects point at. See [References and tenants](/docs/management/cli/idempotent-plans#references-and-tenants).
* **Keep the destroy list in creates order.** When a plan includes `destroy` operations, list them parents first, in the same order as the corresponding upserts and creates, and let the reverse pass remove them children first. A destroy that fails with `objectIsLinked` means that the list is in children-first order, which places an earlier entry too far down the tree. Reorder it so that parents come first.

## See also

* [Exporting server state](/docs/management/cli/snapshot) for the inverse operation, which generates an apply plan from a live deployment.
* [Overview](/docs/management/cli/) for installation and connection setup.
* [Exploring the schema](/docs/management/cli/describe) to discover which objects, fields and filters are available.
* [Creating objects](/docs/management/cli/create) and [Updating objects](/docs/management/cli/update) for the single-shot equivalents.
* [Removing objects](/docs/management/cli/delete) for id-based deletes outside a plan.
