---
sidebar_position: 9
---

# Exporting server state

The `snapshot` command walks the live server and emits an NDJSON plan in the exact format that [`apply`](./apply.md) consumes. The same file can be used for:

* **Configuration backups** (stdout redirected to a versioned artifact, committed to a repository, or stored in a secrets manager).
* **Cross-environment migration** (snapshot a staging deployment, apply the plan to production).
* **Disaster-recovery rehearsals** (snapshot weekly, keep the plans, apply to a clean server to prove restorability).
* **Infrastructure-as-code round-tripping** (snapshot the hand-made initial state, commit it, then drive changes through `apply`).

Server-assigned ids are stripped from the payload and replaced with deterministic client-side references of the form `#<type>-<server-id>`, so the plan restores its own dependency graph regardless of what ids the destination server assigns.

## Synopsis

```text
stalwart-cli snapshot <OBJECT>...
                      [--output <PATH>]
                      [--no-destroys]
                      [--include-secrets]
                      [--allow-unresolved <TYPES>]
                      [--quiet]
```

| Argument / option | Purpose |
|---|---|
| `<OBJECT>...` | One or more object type names (positional, required). Names are case-insensitive and the `x:` prefix is optional. Slash forms (`Account/User`) are rejected; for multi-variant types, listing the bare name includes every variant. |
| `--output <PATH>` | Write the plan to a file. If omitted, the plan is written to stdout. |
| `--no-destroys` | Skip the teardown prelude at the top of the plan. |
| `--include-secrets` | Keep secret field values as returned by the server. Default: strip them. |
| `--allow-unresolved <TYPES>` | Comma-separated list of object types that references may point to without those types being part of the snapshot. References to any listed type are dropped from the exported plan entirely (the field is omitted from the object's body). |
| `--quiet` | Suppress the per-type progress lines on stderr. |

## How the selection works

Selection is **explicit**: every type to snapshot must be named. There is no "all objects" mode. This is a deliberate design choice because many `x:` objects (for example `Log`, `ArchivedItem`, `Action`) represent runtime state rather than configuration, and including them in a configuration export would be actively harmful.

Running `snapshot` against a fresh server to capture a typical baseline configuration looks like this:

```sh
stalwart-cli snapshot \
    Tenant Domain DkimSignature AcmeProvider Certificate DnsServer Role \
    Account Directory Credential \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
    --output plan.ndjson
```

Use [`describe`](./describe.md) to discover what types a deployment exposes.

### Multi-variant types

Multi-variant types are listed by the bare name. `Account` captures both `User` and `Group` variants in a single pass. The plan splits them into separate `create` operations, ordered so that variants referenced by other variants appear first.

### Singletons

Singletons are accepted anywhere in the positional list. The generated plan emits an `update` operation per singleton (with the current value), since singletons cannot be destroyed or created.

## Reference handling

Any field that references another object (`id<Type>`, `set<id<Type>>`, `map<id<Type>, ...>`, and any such reference nested inside an embedded object) is translated to the `#<prefix>-<server-id>` form during export.

* The prefix is the target type name with `x:` stripped and lowercased, up to the first `/` if the reference targets a specific view.
  * `x:Domain` → `domain-b`
  * `x:Account/Group` → `account-b`
  * `x:DkimSignature` → `dkimsignature-a`
* The mapping is deterministic and idempotent: two snapshots of the same state produce byte-identical plans (modulo server id churn in the fresh snapshot itself).

On the restore side, [`apply`](./apply.md) handles these references through JMAP's `createdIds` mechanism, so the client-ids never need to round-trip back to the source server.

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

The plan is **NDJSON**: one operation per line, no enclosing array. The same format [`apply`](./apply.md) consumes.

```text
# Destroy block (unless --no-destroys): one entry per non-singleton parent
# type in the selection, in forward dependency order so apply's reverse
# pass executes children-first at restore time. Multi-variant types emit
# a single destroy for the parent (no per-variant filter); destroying all
# variants is equivalent to destroying every instance of the type.
{"@type":"destroy","object":"Tenant"}
{"@type":"destroy","object":"Domain"}
{"@type":"destroy","object":"Account"}

# Create block: one entry per non-singleton shard (one per type, one per
# variant for multi-variant types). Client-side ids are the map keys.
# Cross-object references use #<prefix>-<server-id>.
{"@type":"create","object":"Tenant","value":{"tenant-b":{"name":"acme-corp"}}}
{"@type":"create","object":"Domain","value":{"domain-b":{"name":"example.com","memberTenantId":"#tenant-b"}}}

# Singleton updates: one per singleton in the selection.
{"@type":"update","object":"SystemSettings","value":{"defaultHostname":"mail.example.com"}}
```

(The `#` lines above are annotations for clarity; the real output contains only the NDJSON records.)

### Streaming

The output is written incrementally. Each parent object type is fetched from the server in paginated batches (up to `maxObjectsInGet` per batch, the same value the JMAP session reports), transformed, and flushed before the next type is processed. Total memory is bounded to one type's worth of objects at a time. A `snapshot` over a type with tens of thousands of rows completes without the plan ever being fully buffered.

### How variants are fetched

For multi-variant types, snapshot does **not** rely on server-side filtering by `@type`, because Stalwart's `query` does not universally support that filter. Instead, it queries each parent type once unfiltered, fetches the full objects, and partitions them by `@type` client-side to assign each one to its variant's create block.

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
snapshot: 2 creates, 1 singletons
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

The topological sort emits the create block in dependency order (referenced types before their referrers; within multi-variant types, referenced variants before referring variants). If the selected types form a cycle the CLI refuses to emit a plan and names the participating shards:

```text
error: cannot snapshot: cyclic dependency between the selected types (Foo, Bar/Variant)
```

In practice this is rare for configuration objects and indicates either a schema issue or an unexpected embedded reference that should be escape-hatched via `--allow-unresolved`.

## Typical workflows

### Configuration backup

```sh
stalwart-cli snapshot \
    Tenant Domain Directory DkimSignature AcmeProvider Certificate DnsServer Role \
    Account Credential \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
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

The plan's destroy block wipes the relevant types on production, then recreates them with staging's content. Use [`--dry-run` on `apply`](./apply.md) in the promotion CI step so the diff can be reviewed before taking effect.

### Round-trip validation

To prove a plan genuinely restores:

```sh
stalwart-cli snapshot Tenant --output /tmp/s1.ndjson
stalwart-cli apply --file /tmp/s1.ndjson
stalwart-cli snapshot Tenant --output /tmp/s2.ndjson
diff /tmp/s1.ndjson /tmp/s2.ndjson
```

NDJSON files diff line-by-line, which makes round-trip validation easy. The only legitimate differences between `s1.ndjson` and `s2.ndjson` are the opaque client-ids (new server-assigned ids produce new prefixes). Sort the records by `name` (or any other stable field) for a cleaner diff.

## Operational considerations

* **Auto-created dependents**: some types (notably `DkimSignature` and `Certificate`) are created automatically by the server when a parent is created. A snapshot that includes `Domain` but not `DkimSignature` will fail to *restore* cleanly, because `apply`'s destroy block cannot remove a Domain while auto-created DkimSignatures still link to it. Either include the auto-created type in the snapshot, or cascade-delete it manually before running `apply`.
* **Partial exports**: a selection does not have to be the whole world, but it should be a self-contained dependency closure. Use `--allow-unresolved` sparingly; every dropped reference is a piece of state the restore will not reconstruct.
* **Unique uniqueness**: client-ids are deterministic per source-server (prefix + original server id). Two snapshots taken from the same server produce the same client-ids; two snapshots from different servers produce disjoint client-id spaces. Merging plans from multiple sources is not supported and is not recommended.
* **Ordering stability**: server-returned object ordering is relied upon only for paging. Both `describe` and `apply` are insensitive to the map-key order inside each create op.

## See also

* [Declarative bulk operations](./apply.md): the consumer of the plan file.
* [Exploring the schema](./describe.md): to enumerate available types before composing a selection.
* [Overview](./overview.md): installation and connection setup.
