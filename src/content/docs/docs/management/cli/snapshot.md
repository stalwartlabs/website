---
sidebar_position: 9
title: "Exporting server state"
---

The `snapshot` command walks the live server and emits an NDJSON plan in the exact format that [`apply`](/docs/management/cli/apply) consumes. The plan is built from idempotent `upsert` operations (and `update` operations for singletons): it contains no destroys, so applying it reconciles a target in place rather than wiping and rebuilding it, and re-applying it converges. The same file can be used for:

* **Configuration backups** (stdout redirected to a versioned artifact, committed to a repository, or stored in a secrets manager).
* **Cross-environment migration** (snapshot a staging deployment, apply the plan to production).
* **Disaster-recovery rehearsals** (snapshot weekly, keep the plans, apply to a clean server to prove restorability).
* **Infrastructure-as-code round-tripping** (snapshot the hand-made initial state, commit it, then drive changes through `apply`).

Server-assigned ids are stripped from the payload and replaced with deterministic client-side references of the form `#<type>-<server-id>`, so the plan restores its own dependency graph regardless of what ids the destination server assigns.

## Synopsis

```text
stalwart-cli snapshot <OBJECT>...
                      [--output <PATH>]
                      [--include-secrets]
                      [--allow-unresolved <TYPES>]
                      [--quiet]
```

| Argument / option | Purpose |
|---|---|
| `<OBJECT>...` | One or more object type names (positional, required). Names are case-insensitive and the `x:` prefix is optional. Slash forms (`Account/User`) are rejected; for multi-variant types, listing the bare name includes every variant. |
| `--output <PATH>` | Write the plan to a file. If omitted, the plan is written to stdout. |
| `--include-secrets` | Keep secret field values as returned by the server. Default: strip them. |
| `--allow-unresolved <TYPES>` | Comma-separated list of object types that references may point to without those types being part of the snapshot. References to any listed type are dropped from the exported plan entirely (the field is omitted from the object's body). |
| `--quiet` | Suppress the per-type progress lines on stderr. |

## How the selection works

Selection is **explicit**: every type to snapshot must be named. There is no "all objects" mode. This is a deliberate design choice because many `x:` objects (for example `Log`, `ArchivedItem`, `Action`) represent runtime state rather than configuration, and including them in a configuration export would be actively harmful.

Running `snapshot` against a fresh server to capture a typical baseline configuration looks like this:

```sh
stalwart-cli snapshot \
    Tenant Domain DkimSignature AcmeProvider Certificate DnsServer Role \
    Account Directory \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
    --allow-unresolved PublicKey \
    --output plan.ndjson
```

Use [`describe`](/docs/management/cli/describe) to discover what types a deployment exposes.

### Multi-variant types

Multi-variant types are listed by the bare name. `Account` captures both `User` and `Group` variants in a single pass. The plan splits them into separate `upsert` operations, ordered so that variants referenced by other variants appear first. Each entry carries its `@type`, so `apply` matches it within the right variant.

### Singletons

Singletons are accepted anywhere in the positional list. The generated plan emits an `update` operation per singleton (with the current value), since singletons cannot be destroyed, created, or upserted. Because an `update` simply overwrites the singleton's fields, it is idempotent by nature.

## Match keys

Each non-singleton object is exported as an `upsert` whose `matchOn` is the type's **label property**: the field the WebUI lists objects by (for example `name` for `Domain`). On restore, [`apply`](/docs/management/cli/apply) uses this key to decide whether each object already exists (update it) or not (create it), which is what lets a snapshot be re-applied without duplicating or deleting anything.

If a type has no label property in the schema, `snapshot` omits `matchOn` for it and prints a warning. With no key, `apply` falls back to matching that type by comparing every non-secret scalar field, which is **not** convergent: changing any field makes the object look new and a duplicate is created instead of the original being updated. For such a type, edit the plan to add an explicit `matchOn` naming a stable identifying property before relying on re-applies. See [Matching](/docs/management/cli/apply#matching) for the full resolution order.

## Reference handling

Any field that references another object (`id<Type>`, `set<id<Type>>`, `map<id<Type>, ...>`, and any such reference nested inside an embedded object) is translated to the `#<prefix>-<server-id>` form during export.

* The prefix is the target type name with `x:` stripped and lowercased, up to the first `/` if the reference targets a specific view.
  * `x:Domain` → `domain-b`
  * `x:Account/Group` → `account-b`
  * `x:DkimSignature` → `dkimsignature-a`
* The mapping is deterministic and idempotent: two snapshots of the same state produce byte-identical plans (modulo server id churn in the fresh snapshot itself).

On the restore side, [`apply`](/docs/management/cli/apply) handles these references through JMAP's `createdIds` mechanism, so the client-ids never need to round-trip back to the source server.

## Static reference validation

Before any network request beyond the initial schema fetch, `snapshot` traverses the schema of every selected type (including every embedded object reachable through `object<>`, `objectList<>`, and `map<_, object<>>` fields) and collects the full set of reference targets. For every reference target that is neither selected nor listed in `--allow-unresolved`, the command fails with a message naming the missing type.

Example:

```sh
stalwart-cli snapshot Domain
```

```text
error: Domain references Tenant but Tenant is not in the snapshot selection; add it or use --allow-unresolved Tenant
```

The validator surfaces one missing type at a time (most relevant first). Adding `Tenant` to the selection resolves that reference; running again surfaces the next missing reference, and so on, until all references are either selected or allow-listed.

### Dropping references with `--allow-unresolved`

`--allow-unresolved` is for types that should explicitly be excluded from the snapshot, and whose references in the selected types are acceptable to **drop** (not translate) in the exported plan.

```sh
stalwart-cli snapshot Tenant Domain \
    --allow-unresolved Role,Directory,AcmeProvider,Certificate,DkimSignature,DnsServer
```

With the above, a `Domain` whose `acmeProviderId` points to a real ACME provider will have the `acmeProviderId` field **removed** from the exported `domain-*` body. The plan will still apply, but the restored Domain will lack that pointer. This is the intended behaviour when an operator snapshots a subset of a deployment and accepts that references leaving the subset will not be re-established on restore.

## Output format

The plan is **NDJSON**: one operation per line, no enclosing array. The same format [`apply`](/docs/management/cli/apply) consumes.

```text
# Upsert block: one entry per non-singleton shard (one per type, one per
# variant for multi-variant types), in forward dependency order so parents
# are applied before the objects that reference them. matchOn is the type's
# label property. Client-side ids are the map keys. Cross-object references
# use #<prefix>-<server-id>.
{"@type":"upsert","object":"Tenant","matchOn":["name"],"value":{"tenant-b":{"name":"acme-corp"}}}
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{"domain-b":{"name":"example.com","memberTenantId":"#tenant-b"}}}

# Singleton updates: one per singleton in the selection, emitted last so any
# references they carry point at objects upserted above.
{"@type":"update","object":"SystemSettings","value":{"defaultHostname":"mail.example.com","defaultDomainId":"#domain-b"}}
```

(The `#` lines above are annotations for clarity; the real output contains only the NDJSON records.) There is no destroy block: the plan reconciles a target in place. Applying it to a clean server creates everything; applying it to a populated one updates the matching objects and creates the rest.

### Streaming

The output is written incrementally. Each parent object type is fetched from the server in paginated batches (up to `maxObjectsInGet` per batch, the same value the JMAP session reports), transformed, and flushed before the next type is processed. Total memory is bounded to one type's worth of objects at a time. A `snapshot` over a type with tens of thousands of rows completes without the plan ever being fully buffered.

### How variants are fetched

For multi-variant types, snapshot does **not** rely on server-side filtering by `@type`, because Stalwart's `query` does not universally support that filter. Instead, it queries each parent type once unfiltered, fetches the full objects, and partitions them by `@type` client-side to assign each one to its variant's upsert block.

### What is stripped

* **Server-set fields** (fields whose schema declares `update: serverSet`, for example `createdAt` on Domain or `dnsZoneFile`) are dropped. The server would reject them in a create payload.
* **Secret fields** (`string<secret>`, `string<secretText>`) are dropped unless `--include-secrets` is passed. The Stalwart server by default masks these values as `"*****"`; exporting them verbatim would not round-trip on restore.
* Fields referencing a type listed in `--allow-unresolved` are dropped (see above).

## Secrets

The default is to **strip** every secret-typed field from the exported plan. A restored plan therefore has no credentials. Operators are expected to fill in real secrets through a separate channel (a secrets manager, a vaulted sidecar file, a post-apply `update` pass) before the deployment becomes usable.

Running with `--include-secrets` keeps the server's returned values verbatim. When the server is configured to mask secrets (the default), those values are the literal `"*****"`, which the restore will reject at apply time. `--include-secrets` is therefore useful only when the server has been configured to disable masking for administrative exports.

## Progress output

Per-type progress is written to stderr so that stdout contains only the plan:

```text
snapshot: 2 upserts, 1 singletons
  fetching Tenant...
    4 fetched
    Tenant: 4
  fetching Domain...
    127 fetched
    Domain: 127
  fetching singleton SystemSettings...
snapshot complete
```

For multi-variant parents, the `<count> fetched` line is followed by one
line per variant showing how the parent was partitioned client-side
(for example `Account (User): 12` and `Account (Group): 3`).

Pass `--quiet` to silence this output.

## Cyclic dependency detection

The topological sort emits the upsert block in dependency order (referenced types before their referrers; within multi-variant types, referenced variants before referring variants). If the selected types form a cycle the CLI refuses to emit a plan and names the participating shards:

```text
error: cannot snapshot: cyclic dependency between the selected types (Foo, Bar/Variant)
```

In practice this is rare for configuration objects and indicates either a schema issue or an unexpected embedded reference that should be escape-hatched via `--allow-unresolved`.

## Typical workflows

### Configuration backup

```sh
stalwart-cli snapshot \
    Tenant Domain Directory DkimSignature AcmeProvider Certificate DnsServer Role \
    Account \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
    --allow-unresolved PublicKey \
    --output "backup-$(date +%Y-%m-%d).ndjson"
```

Commit the resulting artifact to a private repository (redacting any operator-specific comments). Secrets are automatically excluded.

### Cross-environment promotion

```sh
# On staging
stalwart-cli --url https://staging.mail.example.com \
    snapshot Tenant Domain ... --output plan.ndjson

# On production
stalwart-cli --url https://prod.mail.example.com \
    apply --file plan.ndjson
```

The plan reconciles the selected types on production with staging's content: objects that already exist (matched by their key) are updated, objects that do not are created, and nothing on production is destroyed. Objects present on production but absent from the snapshot are left untouched; if a promotion needs to remove them, add explicit `destroy` operations to the plan. Use [`--dry-run` on `apply`](/docs/management/cli/apply) in the promotion CI step so the plan can be reviewed before taking effect.

### Round-trip validation

To prove a plan genuinely restores:

```sh
stalwart-cli snapshot Tenant --output /tmp/s1.ndjson
stalwart-cli apply --file /tmp/s1.ndjson
stalwart-cli snapshot Tenant --output /tmp/s2.ndjson
diff /tmp/s1.ndjson /tmp/s2.ndjson
```

Here the second `apply` is a no-net-change reconcile: every object in `s1.ndjson` already exists, so the run updates each in place. NDJSON files diff line-by-line, which makes round-trip validation easy. Because `upsert` preserves the id of a matched object, `s1.ndjson` and `s2.ndjson` carry the same client-id prefixes (no id churn across the round-trip); the only differences are field values that the apply legitimately reconciled. Sort the records by `name` (or any other stable field) for a cleaner diff.

## Operational considerations

* **Auto-created dependents**: some types (notably `DkimSignature` and `Certificate`) are created automatically by the server when a parent is created. Because the plan no longer destroys anything, a snapshot of `Domain` alone now restores cleanly onto a populated server (the domain is matched and updated, the auto-created dependents are left in place). For a faithful backup that captures those dependents' own configuration, still include the auto-created type in the selection.
* **Partial exports**: a selection does not have to be the whole world, but it should be a self-contained dependency closure. Use `--allow-unresolved` sparingly; every dropped reference is a piece of state the restore will not reconstruct.
* **Unique uniqueness**: client-ids are deterministic per source-server (prefix + original server id). Two snapshots taken from the same server produce the same client-ids; two snapshots from different servers produce disjoint client-id spaces. Merging plans from multiple sources is not supported and is not recommended.
* **Ordering stability**: server-returned object ordering is relied upon only for paging. Both `describe` and `apply` are insensitive to the map-key order inside each upsert op.

## See also

* [Declarative bulk operations](/docs/management/cli/apply): the consumer of the plan file.
* [Exploring the schema](/docs/management/cli/describe): to enumerate available types before composing a selection.
* [Overview](/docs/management/cli/): installation and connection setup.
