---
title: "Idempotent plans"
description: "Write apply plans that can be re-run safely: matching, teardown, reconciliation, scoping and cross-operation references."
sidebar_position: 10
---

Configuration management tools apply the same plan over and over, often on every run, whether or not anything changed. A [plan](/docs/management/cli/plan-format) used this way has to be idempotent: it must leave the server in the same state each time, without duplicating objects and without failing on objects that already exist.

This page describes how the operations of a plan achieve that. It covers how a plan finds the existing objects it describes, how it reduces a type to exactly the objects it lists, how an operation is limited to part of a type, and how operations refer to objects that other operations create.

## Idempotent re-runs

A re-runnable plan is built from `upsert` operations. An `upsert` compares each object in its `value` map with the objects on the live server, using a match key, the set of properties that identify an object (see [Matching](#matching)). When it finds a match, it updates the existing object in place. When it finds none, it creates the object. Nothing is destroyed and an existing object is never duplicated, so applying the same `upsert` plan once or a hundred times converges to the same server state. [`stalwart-cli snapshot`](/docs/management/cli/snapshot) emits this shape, and so does the [annotated example](/docs/management/cli/plan-format#annotated-example).

The two obvious alternatives both break on a second run, which is the problem `upsert` avoids:

* A `create`-only plan succeeds on the first run and fails on the second. Re-creating the same `Domain`, `AllowedIp` or `Certificate` trips the server's primary-key constraints, and re-creating a type that has no such constraint produces duplicate rows.
* A `destroy` + `create` plan can be re-run, but it tears down and rebuilds everything on every apply. That cannot work for an object that another object depends on. A `Domain` referenced by an `Account`, by a `DkimSignature` or by the non-nullable `SystemSettings.defaultDomainId` cannot be destroyed while the reference exists, and the destroy fails with `objectIsLinked`. An `upsert` updates such an object in place and leaves its id and its dependents untouched.

Updating in place has a further benefit. An `upsert` preserves the server-assigned id of a matched object, so external systems that cache Stalwart ids keep working across re-applies. A `destroy` + `create` assigns fresh ids each time.

Idempotency here means that the end state converges, not that an unchanged re-run does nothing. `apply` does not compare the desired value with the current one. An `upsert` whose match key finds an existing object always issues the `update`, even when no field changed. The run then reports the object as updated, although the resulting state is identical.

### Matching

Matching decides whether an entry of the plan describes an object that already exists, so everything an `upsert` does depends on it. The CLI resolves the match key of an `upsert` in the following order:

1. Explicit `matchOn`. When the operation carries a `matchOn` list of property names, those properties form the key. An object in the `value` map matches an existing object when every listed property is equal. Every property in `matchOn` must be present in each object body, or the operation fails.
2. The schema's label property. When `matchOn` is omitted, the CLI uses the label property of the type, which is the field by which the WebUI lists the objects, such as `name` on `Domain`. [`snapshot`](/docs/management/cli/snapshot) writes this `matchOn` explicitly, so that its plans are self-describing.
3. Value match. When the type has no label property and no `matchOn` is given, the CLI compares every non-secret scalar field of the body (string, number, boolean, enum and datetime) with the existing objects, and prints a `warning`. This match does not converge. Once any compared field changes, the body no longer matches the old object, so a new object is created and the old one is left as it was. Any type that is applied repeatedly therefore needs an explicit `matchOn` or a label property.

`reconcile` never selects value matching on its own, because under `reconcile` a by-value non-match deletes the old object. Value matching has to be requested there with `"matchOn": "*"`, which also overrides the label property on a type that has one.

Absent and `null` properties are compared leniently. Stalwart returns unset nullable fields as explicit `null` values, and without this leniency an unchanged plan would look as if it had drifted on re-apply. A property that the body sets to `null` therefore compares equal to one that the server omits, and the reverse also holds. Under value matching and `scope` comparison, a property that the body omits entirely also compares equal to a server `null`. Under an explicit `matchOn` the question does not arise, because omitting a match property from a body is an error.

A match key must identify one object. When it matches more than one existing object, the operation fails as ambiguous and updates none of them. The same applies to value matching, because taking the first of several identical candidates would make a `reconcile` destroy the others. For [multi-variant types](/docs/management/cli/#multi-variant-objects), each body must carry its `@type`, and matching is done within that variant.

A `matchOn` may include a reference field, which makes composite natural keys possible, such as an account name within a domain. When a match-key property is a reference, such as the `ObjectId` field `Account.domainId`, and its value in the body is a `#<id>` reference, the CLI resolves the reference to the real server id before comparing. Matching an `Account` on `["name", "domainId"]` with `domainId` set to `#dom-a` therefore compares against the domain's actual id, whether the domain was created earlier in the plan or matched on the live server.

Only reference fields are resolved in this way. A `#`-shaped value in a field that is not a reference is treated as a literal. A `#<id>` in a match key that no earlier operation produced is an error, and because it is caught before anything is sent, `--dry-run` reports it too.

When an `upsert` updates a matched object, the CLI drops the server-set and immutable fields of the body from the patch, since the server would reject them, and sends only the mutable fields.

### Teardown with destroy

Some plans are meant to delete, for example to remove objects that a plan no longer owns or to wipe a type before a migration. `destroy` serves these cases. It sits outside the idempotent re-run flow described above. The operation is specified in [the `destroy` reference](/docs/management/cli/plan-format#destroy), and [Operational guidance](/docs/management/cli/apply#operational-guidance) covers its safe use. Two consequences matter when planning a teardown:

* Server-assigned ids change across a destroy and re-create, so external systems that cache Stalwart ids must look them up again afterwards.
* The filter decides how much is torn down. `{"@type":"destroy","object":"Domain","value":{"name":"example.com"}}` removes only the named domain, while `{"@type":"destroy","object":"Domain"}`, with no `value`, removes every domain on the server. The filter must match the slice of state that the plan owns, because an unfiltered destroy in a plan that declares one domain deletes every other domain on the server without warning.

## Reconciling to exact state

An `upsert` plan states which objects must exist, but it cannot state that they are the only ones. Because `upsert` never deletes, re-applying a plan after removing an entry leaves the old object in place. When a domain is renamed from `example.org` to `example.net` in the plan and the plan is applied again, the server ends up with both.

`reconcile` closes that gap. It performs the same match, update or create as `upsert`, and then destroys every existing object of the type that no entry in the plan matched. The type therefore converges to exactly the plan:

```text
{"@type":"reconcile","object":"Domain","matchOn":["name"],"value":{"dom-a":{"name":"example.net"}}}
```

Applying this operation leaves `example.net` as the only domain. It is created, or matched and updated, and every other domain is destroyed. Re-applying it is idempotent. For the same reason, an empty `value` (`"value":{}`) is valid for `reconcile`, where it means that the type should have no objects, whereas `upsert` rejects it.

Because `reconcile` deletes, the following rules keep it safe:

* A match key is required. `reconcile` does not fall back to the by-value matching that `upsert` allows, so an operation with no `matchOn`, on a type that also has no label property, is rejected when the plan is checked. Value matching treats any drifted field as a non-match, which under `reconcile` means deleting the existing object and recreating it under a new id. `"matchOn": "*"` requests value matching explicitly, at a cost. On a type with a unique constraint, the recreated object collides with the old one, whose deletion waits for the cleanup pass, and the operation fails with `primaryKeyViolation`. Value matching is dependable for re-applying an unchanged plan and unreliable for absorbing drift, so an explicit `matchOn` is almost always the better choice.
* A reconcile covers the whole type unless it is scoped. Without a `scope`, every unmatched object of the type is deleted, including variants that the plan does not mention. A `scope` narrows what the operation owns, as described in the next section.
* A rename is a delete and a re-create. The match key is the object's identity, so when the value of a match-key property changes, the old object no longer matches any entry. It is deleted, and a new object is created with a fresh server id. Keying on a property that stays stable preserves the id across a rename.
* A blocked delete fails the run. When an object that the plan wants to delete is still referenced elsewhere, such as a `Domain` used by an `Account`, the destroy fails with `objectIsLinked`, and the operation is reported as failed, exactly as a `destroy` would be. `reconcile` does not force deletions.

### Scoping an operation with `scope`

A plan does not always own a whole type. It may manage only the local routes, or only one namespace of a lookup table, while other objects of the same type belong to someone else. A `scope` makes `upsert` and `reconcile` usable on such a type.

A scope is a flat map of property and value pairs that declares the slice of the type the operation is responsible for. An object belongs to the operation only when it matches all of them. The scope governs both halves of that responsibility: an entry may match only an existing object inside the scope, and a `reconcile` deletes only unmatched objects inside the scope. Objects outside the scope are neither matched nor deleted.

A scope is therefore useful on `upsert` too, even though `upsert` never deletes, because it stops an entry from matching, and so updating, an object in a slice that the operation does not own. `MemoryLookupKey` shows why. Its label property is `key` alone, so a plan without `matchOn` matches on `key` across every namespace, and it can update a row that belongs to another namespace without any warning. A scope prevents this whatever the match key.

A scope compares property values for equality only. It has no negation, set membership or comparison operators, so ownership has to be expressible as "every object whose listed properties equal the listed values".

The scope is evaluated by the CLI, against the objects that the operation has already fetched to resolve matches. The filter of a `destroy`, by contrast, is evaluated by the server. The difference is deliberate. Stalwart rejects server-side filters on `@type` for several multi-variant types, including `MtaRoute`, `SpamTag` and `Tracer`, which are the types that most need per-variant scoping. Evaluating the scope locally makes `@type` work for every type.

The following operation converges only the `Local` routes and leaves every `Mx` route alone:

```text
{"@type":"reconcile","object":"MtaRoute","matchOn":["name"],"scope":{"@type":"Local"},"value":{"r-a":{"@type":"Local","name":"internal.example.com"}}}
```

Combined with an empty `value`, a scope states that the slice should be empty:

```text
{"@type":"reconcile","object":"MtaRoute","matchOn":["name"],"scope":{"@type":"Mx"},"value":{}}
```

A scope on several properties requires all of them to match. This is how a plan converges one namespace of a keyed lookup table without touching the others:

```text
{"@type":"reconcile","object":"MemoryLookupKey","matchOn":["namespace","key"],"scope":{"namespace":"spam-traps"},"value":{"lk-a":{"namespace":"spam-traps","key":"foo@*","isGlobPattern":true},"lk-b":{"namespace":"spam-traps","key":"bar@*","isGlobPattern":true}}}
```

A `destroy` followed by an `upsert` reaches the same final set, but at a cost. The pair deletes every row in the namespace and creates it again, so unchanged rows receive new server ids on every apply. `reconcile` updates the matching rows in place and deletes only the rows that the plan no longer lists.

Scope values on reference properties resolve `#<id>` references, so a scope can name an object that an earlier operation produced, as in `{"domainId": "#dom-a"}`. It cannot name an object that the same operation creates, because the scope is resolved before the operation matches or creates anything. Both `--dry-run` and the real run reject such a reference.

The CLI is strict about where a scope may appear. A `scope` on any operation other than `upsert` or `reconcile` is rejected. So is any unrecognised key at the top level of an operation, because a misspelled `scope` would otherwise be dropped and widen a `reconcile` to the whole type.

A scope that matches nothing looks exactly like a successful reconcile, so a mistake in one would go unnoticed. The CLI therefore checks scopes when it reads the plan:

* Keys and `@type` values are validated. A key must be `@type` or a property that the type declares in any of its variants, and an `@type` value must name a declared variant of a multi-variant type. A typo in either is an error. So is an operator-form key borrowed from the `destroy` filter, such as `{"nameContains": "spam-"}`, which is rejected because the `destroy` filter and `scope` are different languages.
* `null` values are rejected. A comparison treats an absent property and a `null` one as equal, so `{"description": null}` would match every object that leaves the property unset, and widen the scope where it was meant to narrow it. A scope belongs on a property that is set.
* Entries must lie inside their own scope. An entry that contradicts the scope, such as an `Mx` body under `"scope":{"@type":"Local"}`, could never match an existing object and would be created again on every apply. It is rejected, and belongs in an operation of its own.

An entry may leave out a scoped property, in which case it inherits the value from the scope. The CLI fills the scope into each entry before the duplicate-entry check, before matching and before creation, so an object created by a scoped operation lands inside that scope. For example, `{"scope":{"namespace":"spam-traps"},"value":{"lk":{"key":"foo@*"}}}` creates the key in `spam-traps` without repeating the namespace in every entry. A server-derived (`ServerSet`) property cannot be scoped on, because the create path strips it, and the new object would land outside the scope it was declared under.

The deletions of a `reconcile` are computed while the operation runs, but carried out later, in the cleanup pass. Two rules keep this deferred list correct. First, an object is removed from the list when any other operation in the plan created, matched or updated it, before or after the `reconcile`, so a plan never deletes an object that it also wrote. Second, an object that an earlier `reconcile` in the same run already destroyed is not destroyed a second time.

[`snapshot`](/docs/management/cli/snapshot) never emits `reconcile`. It writes only `upsert` operations, so that restoring a snapshot never deletes objects that the snapshot happened to omit. A `reconcile` is written by hand, when the intent is to converge a type to an exact set that the plan owns.

## Cross-operation references

Objects in a plan often refer to objects that do not exist yet: an account refers to a domain that an earlier line of the same plan creates. The server has not assigned that domain an id when the plan is written, so the plan refers to it by the client id it gave the domain, using the JMAP `#<id>` reference syntax. The CLI handles these references by two separate mechanisms, depending on where they appear:

* References in values, such as `"domainId": "#dom-a"`, are never rewritten by the CLI. It collects them recursively from every string value and every object key, and forwards them to the server in the request-level `createdIds` map. The server then resolves `#dom-a` to the real id assigned by the matching `create`. This works across separate JMAP requests, including across batches.
* A reference used as the `id` of an `update`, such as `"id": "#dom-a"`, is not resolved by JMAP on the server. The CLI resolves it itself, from the id map filled during earlier `create` and `upsert` operations. When the reference matches no earlier create or upsert in the plan, the CLI reports an error before sending any request.

An `upsert` or `reconcile` registers its client id, such as `#dom-a`, in the same way as a `create`, whether the object was matched or newly created. Later operations can therefore reference it whether this run created the object or matched an existing one. This is what lets a snapshot's singleton `update` set `"defaultDomainId": "#domain-b"` and have it resolve to the domain that already exists on a re-apply.

References are accepted in the following places:

* String values, anywhere in the value tree, as in `"domainId": "#dom-a"`.
* Object keys, in the set-of-id and map-of-id forms: `{ "memberGroupIds": { "#grp-sales": true, "#grp-support": true } }`.
* The `id` field of an `update` operation, resolved by the CLI as described above, provided that an earlier `create` or `upsert` in the same plan produced the reference.

### References and tenants

A reference that resolves can still be refused by the server, because tenants isolate their objects from each other. An object that belongs to a tenant, meaning that it sets `memberTenantId`, may reference only other objects in the same tenant. This applies to every tenant-scoped type, including `DnsServer`, `AcmeProvider`, `Directory`, `Role`, `DkimSignature`, `MailingList`, `OAuthClient` and `Account`.

Tenanted objects cannot borrow a global resource either. A `DnsServer` with no `memberTenantId` is visible to administrators, but a `Domain` that sets a `memberTenantId` cannot reference it. A plan that mixes the two is rejected when it is applied, with `invalidForeignKey`:

```text
✗ upsert Domain: Domain: create failed for `domain-a` (operation #3): error: invalidForeignKey |   Object id:   DnsServer#i1nk7i22boqc (plan reference #dnsserver-ovh)
```

The `(plan reference #...)` suffix names the plan reference that produced the rejected server id, so the offending line can be found without looking the id up on the server. The CLI annotates ids in this way in the `Object id`, `Existing id` and `Linked by` lines of any `set` failure whose value referenced them.

The fix is to place the referenced object in the same tenant as the objects that use it, so that each tenant has its own copy:

```text
{"@type":"upsert","object":"Tenant","matchOn":["name"],"value":{"tenant-a":{"name":"a"}}}
{"@type":"upsert","object":"DnsServer","matchOn":["description"],"value":{"dnsserver-ovh":{"@type":"Ovh","memberTenantId":"#tenant-a","description":"ovh (tenant a)","applicationKey":"...","ovhEndpoint":"ovh-eu"}}}
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{"domain-a":{"memberTenantId":"#tenant-a","name":"a.com","dnsManagement":{"@type":"Automatic","dnsServerId":"#dnsserver-ovh"}}}}
```

When several tenants each need a copy of a shared configuration, each copy gets its own client id and a natural key that is unique per tenant. A [`scope`](#scoping-an-operation-with-scope) such as `{"memberTenantId": "#tenant-a"}` then makes the operation of each tenant match and converge only its own slice.
