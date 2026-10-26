---
sidebar_position: 12
title: "Exporting server state"
description: "Export configuration objects of a running server as an apply plan with stalwart-cli snapshot: selection, references, secrets and typical workflows."
---

A configuration built by hand in the WebUI lives only on the server. The `snapshot` command turns it into a file. It reads configuration objects from a running server and writes them as an NDJSON plan, in the format that [`apply`](/docs/management/cli/apply) executes, so the same configuration can be reviewed, stored and applied elsewhere.

The plan consists of `upsert` operations, which update an object when it exists and create it otherwise, and `update` operations for singletons, the objects that have exactly one instance per server. These operations are idempotent, and the plan contains no deletions. Applying it therefore changes a target server in place, and applying it again changes nothing further. A snapshot serves the following purposes:

* Versioned copies of the configuration, kept in a repository.
* Promotion of a configuration from a staging server to production.
* Restore tests on a clean server.
* Capturing a configuration made by hand as the starting point of [infrastructure as code](/docs/management/cli/infrastructure-as-code).

A snapshot has two limits. It covers configuration objects only, and it leaves out secrets unless asked to keep them. It therefore complements a [backup](/docs/management/maintenance/backup) of the stores and does not replace it.

The ids that the source server assigned mean nothing on another server. The snapshot therefore replaces them with deterministic references of the form `#<type>-<server-id>`, so the plan recreates the references between its objects whatever ids the target server assigns.

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
| `<OBJECT>...` | One or more object type names (positional, required). Names are case-insensitive and the `x:` prefix is optional. Slash forms such as `Account/User` are rejected, and the bare name of a multi-variant type includes every variant. |
| `--output <PATH>` | Writes the plan to a file. Without it, the plan is written to stdout. |
| `--include-secrets` | Keeps secret field values as the server returns them. Without it, secret fields are removed. |
| `--allow-unresolved <TYPES>` | Comma-separated list of object types that references may point to without those types being part of the snapshot. References to any listed type are dropped from the exported plan, and the field is omitted from the object's body. |
| `--quiet` | Suppresses the per-type progress lines on stderr. |

## Selecting types

A snapshot exports only the types it is given, so every type to export must be named. There is no mode that exports all objects, because many `x:` objects, such as `Log`, `ArchivedItem` and `Action`, hold runtime state and not configuration. The following command captures a typical baseline configuration:

```sh
stalwart-cli snapshot \
    Tenant Domain DkimSignature AcmeProvider Certificate DnsServer Role \
    Account Directory \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
    --allow-unresolved PublicKey \
    --output plan.ndjson
```

[`describe`](/docs/management/cli/describe) lists the types that a deployment exposes.

### Multi-variant types

A multi-variant type has several variants that share a type name but carry different fields, such as the `User` and `Group` variants of `Account`. Such a type is listed by its bare name, and `Account` captures both variants. The plan contains a separate `upsert` operation per variant, ordered so that variants referenced by other variants come first, and each entry carries its `@type`.

### Singletons

Singletons can be named anywhere in the list. A singleton cannot be created or deleted, so the plan contains one `update` operation per singleton, with its current values. Applying the update again leaves the singleton unchanged.

## Match keys

An `upsert` needs a match key, the properties by which it recognises an existing object on the target. Each object that is not a singleton is exported as an `upsert` whose `matchOn` is the label property of its type, which is the field by which the WebUI lists the objects, for example `name` for `Domain`.

When the plan is applied, [`apply`](/docs/management/cli/apply) uses this key to decide whether an object already exists. If it does, the object is updated, and if not, it is created. A snapshot can therefore be applied repeatedly without creating duplicates.

If a type has no label property, `snapshot` omits `matchOn` and prints a warning. Without a key, `apply` matches objects of that type by comparing all their non-secret scalar fields. A change to any field then makes the object look new, and applying the plan again creates a duplicate. For such a type, add to the plan a `matchOn` that names a stable identifying property ([Matching](/docs/management/cli/idempotent-plans#matching)).

## Reference handling

Objects refer to each other by id, and those ids are specific to the source server. During export, every field that references another object is therefore translated to the `#<prefix>-<server-id>` form. This covers `id<Type>`, `set<id<Type>>` and `map<id<Type>, ...>` fields, and any such reference nested inside an embedded object. The prefix is the target type name with `x:` stripped and lowercased, cut at the first `/` when the reference targets a specific view:

| Target type | Example reference |
|---|---|
| `x:Domain` | `domain-b` |
| `x:Account/Group` | `account-b` |
| `x:DkimSignature` | `dkimsignature-a` |

The mapping is deterministic, so two snapshots of the same state produce identical plans. On the restore side, [`apply`](/docs/management/cli/apply) resolves these references through the JMAP `createdIds` mechanism, which maps each client id to the id that the target server assigns. The client ids therefore never need to travel back to the source server.

## Static reference validation

A reference to a type that the snapshot does not contain could not be restored, so `snapshot` checks for such references before it exports anything. Before it sends any request beyond the initial schema fetch, it walks the schema of every selected type, including every embedded object reachable through `object<>`, `objectList<>` and `map<_, object<>>` fields, and collects the full set of reference targets. When a reference target is neither selected nor listed in `--allow-unresolved`, the command fails with a message that names the missing type. A snapshot of `Domain` alone shows this:

```sh
stalwart-cli snapshot Domain
```

```text
error: Domain references Tenant but Tenant is not in the snapshot selection; add Tenant to the selection, or use --allow-unresolved Tenant
```

The validator reports one missing type at a time, the most relevant first. Adding `Tenant` to the selection resolves that reference, and the next run reports the next missing type. Repeating this builds up the selection until every reference is either selected or allow-listed.

### Dropping references with `--allow-unresolved`

`--allow-unresolved` names types that are deliberately left out of the snapshot, and references to them from the selected types are removed from the plan:

```sh
stalwart-cli snapshot Tenant Domain \
    --allow-unresolved Role,Directory,AcmeProvider,Certificate,DkimSignature,DnsServer
```

With this command, a `Domain` whose `acmeProviderId` refers to an ACME provider is exported without the `acmeProviderId` field. The plan applies, but the restored domain has no ACME provider, because references to objects outside the selection are not restored.

## Output format

The plan is NDJSON (newline-delimited JSON), with one operation per line and no enclosing array, which is the format that [`apply`](/docs/management/cli/apply) reads:

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

The `#` lines above are annotations for this page, and the real output contains only the NDJSON records. The plan has no destroy block, so it changes a target in place. Applied to a clean server, it creates everything. Applied to a populated server, it updates the matching objects and creates the rest.

### Streaming

The output is written as it is produced, so a large configuration does not have to fit in memory at once. Each type is read in batches of at most `maxObjectsInGet` objects, the limit that the JMAP session reports. The objects of one type are converted and written before the next type is read, so memory use is bounded by the objects of one type.

### Variants

Objects of a multi-variant type are read in one query, and each object is assigned to its variant by its `@type`.

### Removed fields

* Server-set fields, such as `createdAt` of a Domain or `dnsZoneFile`, are removed, because the server refuses them in a creation.
* Secret fields are removed unless `--include-secrets` is given, as described in [Secrets](#secrets).
* Fields that refer to a type listed in `--allow-unresolved` are removed.

## Secrets

Secrets, such as passwords, keys and client secrets, need special treatment, because the management API does not normally reveal them. It masks them as `****` in its responses.

Without `--include-secrets`, `snapshot` removes every secret field from the plan, so the restored objects have no credentials. Where the secret is a required field, such as the password of a credential or the private key of a DkimSignature, the plan cannot be applied as it is. The values must then be supplied in the plan before it is applied, for example from a secrets manager. Optional secrets can also be set with `update` commands after the apply. When the server returns masked values, the CLI prints a warning such as `<Object> has secret field(s) the server returns anonymized (****); their values cannot be captured and must be supplied in the plan before applying.`

A plan that restores secrets needs two things:

1. The server must return the secrets. Enable [`includeSecrets`](/docs/ref/object/system-settings#includesecrets) on the [SystemSettings](/docs/ref/object/system-settings) singleton for the duration of the export, and disable it again afterwards. The field is "Include secrets in responses", found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->. Both changes take effect after the `ReloadSettings` [action](/docs/management/tasks-actions/actions). While it is enabled, every management API response returns secrets in clear text to every caller allowed to read the object, not only to the CLI. Account passwords are returned as their stored hashes, which the server accepts again on input.
2. The snapshot must run with `--include-secrets`, which writes the secret values as the server returns them.

With `--include-secrets` but without `includeSecrets` on the server, the plan contains the mask `****` in place of each secret and does not restore them. A plan that contains secrets must be protected like the secrets themselves.

## Progress output

While it runs, `snapshot` reports its progress per type. The progress lines go to stderr, so that stdout contains only the plan:

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

For a multi-variant type, the `<count> fetched` line is followed by one line per variant. These lines show how the CLI divided the objects among the variants, for example `Account (User): 12` and `Account (Group): 3`. `--quiet` suppresses this output.

## Cyclic dependencies

The plan lists the types in dependency order, so that every object exists before another object refers to it. Referenced types come before the types that refer to them and, within a multi-variant type, referenced variants come first.

That order cannot exist when the selected types refer to each other in a cycle, so the snapshot breaks the cycle itself. It leaves the references that can be changed after creation out of the `upsert` operations, and restores them with `update` operations at the end of the plan. Only when a field that cannot be changed after creation closes the cycle does the snapshot fail, with a message such as:

```text
error: cannot snapshot: cyclic dependency between selected types: Foo, Bar (immutable field closes the cycle: <field>)
```

To break such a cycle, remove one of the types from the selection, or name it in `--allow-unresolved`.

## Typical workflows

### Configuration backup

A dated snapshot of the configuration types makes a versioned copy of the configuration:

```sh
stalwart-cli snapshot \
    Tenant Domain Directory DkimSignature AcmeProvider Certificate DnsServer Role \
    Account \
    SystemSettings DataRetention BlobStore InMemoryStore SearchStore \
    --allow-unresolved PublicKey \
    --output "backup-$(date +%Y-%m-%d).ndjson"
```

Without `--include-secrets`, the resulting file contains no secrets, and is suited to a private repository.

### Cross-environment promotion

A snapshot taken on staging and applied on production promotes the configuration:

```sh
# On staging
stalwart-cli --url https://staging.mail.example.com \
    snapshot Tenant Domain ... --output plan.ndjson

# On production
stalwart-cli --url https://prod.mail.example.com \
    apply --file plan.ndjson
```

The plan brings the selected types on production in line with staging. Objects that exist, matched by their key, are updated, missing objects are created, and nothing is deleted. Objects on production that the snapshot does not contain are therefore left in place. Removing them takes `destroy` operations in the plan, or a change of the `upsert` operations to [`reconcile`](/docs/management/cli/idempotent-plans#reconciling-to-exact-state), which deletes the objects of the type that the plan does not list. Running [`apply --dry-run`](/docs/management/cli/apply) in the promotion pipeline shows the plan to be valid before it takes effect.

### Round-trip validation

Snapshotting, applying and snapshotting again confirms that a plan restores the state it describes:

```sh
stalwart-cli snapshot Tenant --output /tmp/s1.ndjson
stalwart-cli apply --file /tmp/s1.ndjson
stalwart-cli snapshot Tenant --output /tmp/s2.ndjson
diff /tmp/s1.ndjson /tmp/s2.ndjson
```

Every object in `s1.ndjson` already exists, so the apply writes back the values that the server already holds. Because `upsert` keeps the id of a matched object, both snapshots use the same references. The two files should therefore match. Any difference marks a value that the server normalised on write, or an object that changed between the two snapshots. Sorting the records by `name`, or another stable field, gives a cleaner diff.

## Operational considerations

* Some types, notably `DkimSignature` and `Certificate`, are created by the server when their parent is created. A snapshot of `Domain` alone applies to a populated server without conflict, because the domain is matched and updated and the generated objects are left in place. Capturing the configuration of those objects too requires their types in the selection.
* A selection need not cover the whole server, but it should include every type its objects refer to. Each reference removed with `--allow-unresolved` is state that the restore does not recreate.
* References are derived from the source server's ids, so two snapshots of the same server use the same references, and snapshots of different servers use different ones. Merging plans from several servers is not supported.
* The order of the entries within an `upsert` operation has no effect on `apply`.

## See also

* [Declarative bulk operations](/docs/management/cli/apply): the consumer of the plan file.
* [Exploring the schema](/docs/management/cli/describe): to enumerate available types before composing a selection.
* [Overview](/docs/management/cli/): installation and connection setup.
