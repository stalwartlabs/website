---
title: "Plan file format"
description: "The NDJSON plan format read by stalwart-cli apply: operations, value encoding, JSON Schema and per-operation fields."
sidebar_position: 9
---

A plan describes a set of changes to the configuration of a Stalwart server, in a file that [`stalwart-cli apply`](/docs/management/cli/apply) reads and executes. Because it is a plain text file, a plan can be generated from templates, reviewed in a pull request and kept under version control like any other configuration. This page specifies its format.

The file is NDJSON (newline-delimited JSON). Every non-blank line is a JSON object that describes one operation, and there is no enclosing array around them. Each operation has two fields in common: `@type` names the kind of operation, and `object` names the object type that it works on. The remaining fields depend on the `@type`. The lines are read in file order, and blank lines and surrounding whitespace are ignored.

## Annotated example

The following plan is written to be re-run. It upserts two domains and a group, parents first, and then points a singleton at one of the domains. Applying it twice therefore converges to the same state:

```text
# Upsert objects, parents-first. matchOn names the natural key.
{"@type":"upsert","object":"Domain","matchOn":["name"],"value":{"dom-a":{"name":"example.com","description":"Primary corporate domain"},"dom-b":{"name":"example.net"}}}
{"@type":"upsert","object":"Account","matchOn":["name"],"value":{"grp-sales":{"@type":"Group","name":"sales","domainId":"#dom-a"}}}

# Singleton update, last: it references a domain upserted above.
{"@type":"update","object":"SystemSettings","value":{"defaultDomainId":"#dom-a"}}
```

The lines that start with `#` are annotations for this page only. The NDJSON parser accepts no comments, so every non-blank line of a real plan must be a JSON object.

The keys of each `value` map, such as `dom-a`, are ids that the plan assigns itself, and other operations refer to an object by such an id written as `#dom-a`. On the first apply, neither `example.com` nor `example.net` exists, so both domains are created, and `#dom-a` resolves to the new `example.com`. On the second apply, the `matchOn: ["name"]` key finds the existing domains by name, and they are updated in place. `#dom-a` then resolves to the same id as before. `defaultDomainId` therefore stays valid, and nothing is duplicated or destroyed.

A complete example plan, with obfuscated values, is published with this documentation at [example-bulk-plan.ndjson](/docs/management/cli/example-bulk-plan.ndjson).

## Encoding of values

The `value` of each operation holds the bodies of configuration objects, encoded as described in [Object encoding](/docs/configuration/object-encoding). Two parts of that encoding differ from what plain JSON might suggest: list and set fields are JSON objects where arrays might be expected, and durations and sizes are integers.

A payload that gets the encoding wrong is rejected with `invalidPatch | Invalid value for object property`, and the error names the offending property. Running [`snapshot`](/docs/management/cli/snapshot) against a configured server prints a plan in the canonical encoding, which makes it a reliable reference for the shape of each field.

## Per-line JSON Schema

The following JSON Schema describes a single line of the plan format. A validator can use it to check plans before they are applied:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Stalwart CLI bulk plan operation",
  "oneOf": [
    { "$ref": "#/$defs/upsertOp" },
    { "$ref": "#/$defs/reconcileOp" },
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
          "oneOf": [
            { "type": "array", "items": { "type": "string" }, "minItems": 1 },
            { "const": "*" }
          ],
          "description": "Property names forming the match key, or \"*\" to match by value explicitly. If omitted, the type's label property is used, falling back to a by-value match (with a warning). A list cannot be empty."
        },
        "scope": {
          "type": "object",
          "description": "Flat property/value map restricting the slice of the type this operation owns. An entry may only match an existing object inside the scope. Same rules as the reconcile scope, minus the deletion half.",
          "additionalProperties": { "not": { "type": "null" } }
        },
        "value": {
          "type": "object",
          "minProperties": 1,
          "description": "Map of user-assigned id -> object body. Each body must include every property named in matchOn (and @type for multi-variant types). References inside the body use #<id> syntax.",
          "additionalProperties": { "type": "object" }
        }
      }
    },

    "reconcileOp": {
      "type": "object",
      "required": ["@type", "object", "value"],
      "additionalProperties": false,
      "properties": {
        "@type": { "const": "reconcile" },
        "object": { "$ref": "#/$defs/objectName" },
        "matchOn": {
          "oneOf": [
            { "type": "array", "items": { "type": "string" }, "minItems": 1 },
            { "const": "*" }
          ],
          "description": "Property names forming the match key, or \"*\" to match by value explicitly. If omitted, the type's label property is used; unlike upsert, reconcile does not fall back to a by-value match silently, so a type with no label property must supply matchOn or \"*\". A list cannot be empty."
        },
        "scope": {
          "type": "object",
          "description": "Flat property/value map restricting the slice of the type this operation owns. An object must match every property to be matched or destroyed. Evaluated client-side, so scoping on @type works for every multi-variant type. Keys must be @type or a property declared by the type; values may not be null, and may use #<id> syntax on reference properties (resolvable from earlier operations only). Every entry in value must itself satisfy the scope. If omitted, the whole type is in scope.",
          "additionalProperties": { "not": { "type": "null" } }
        },
        "value": {
          "type": "object",
          "description": "Map of user-assigned id -> object body. Same shape as upsert. Existing objects in scope that no entry matched are destroyed. An empty object ({}) means the scope should contain no objects.",
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

## Per-operation field reference

### `upsert`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"upsert"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). Singletons are rejected: use `update`. |
| `matchOn` | array of string, or `"*"` | no | Property names forming the [match key](/docs/management/cli/idempotent-plans#matching), or `"*"` to match by value explicitly. If omitted, the type's label property is used, falling back to a by-value match (with a warning). A list must be non-empty. |
| `scope` | object | no | Flat property/value map restricting which existing objects an entry may match. See [Scoping an operation](/docs/management/cli/idempotent-plans#scoping-an-operation-with-scope). Since `upsert` never deletes, it only narrows matching. If omitted, the whole type is in scope. |
| `value` | object | yes | Map of client id -> object body. Each body must include every property named in `matchOn`, and `@type` for multi-variant objects. References use `#<id>`. |

An `upsert` makes the plan describe the desired state, whatever the server holds at the time. For each object in `value`, the CLI looks for an existing object that matches the [match key](/docs/management/cli/idempotent-plans#matching), the set of properties that identify the object. When it finds one, it issues an `update`, with the server-set and immutable fields dropped from the patch. Otherwise, it issues a `create`.

The map keys are client-assigned ids, which can be referenced elsewhere in the plan as `#<key>`. The reference works whether the object ends up matched or created. As with `create`, a single leading `#` on a map key is stripped, so `{"dom-a": {...}}` and `{"#dom-a": {...}}` are equivalent.

To resolve the matches, an `upsert` reads the existing objects of the type once. It then sends JMAP `Object/set` requests with `create` and `update` populated, which the CLI splits into batches.

The errors of an `upsert` surface at two different moments, and the difference matters for a plan that fails halfway. Some errors are caught before any operation in the plan runs: an empty `value`, an empty `matchOn`, an entry outside the operation's own `scope` and an `upsert` of a singleton. Others are detected only while the operation runs. These are an ambiguous match, where the key matches more than one existing object, and a `matchOn` property missing from a body. When one of these fails, the earlier operations in the plan have already been applied.

### `reconcile`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"reconcile"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). Singletons are rejected: use `update`. |
| `matchOn` | array of string, or `"*"` | no | Property names forming the [match key](/docs/management/cli/idempotent-plans#matching), or `"*"` to match by value explicitly. If omitted, the type's label property is used. Unlike `upsert`, reconcile does not fall back to a by-value match silently: a type with no label property must supply `matchOn` or `"*"`, or the operation is rejected. A list must be non-empty. |
| `scope` | object | no | Flat property/value map restricting the slice of the type this operation owns, for both matching and deletion. An object must match every property listed. Evaluated client-side, so `@type` works on every multi-variant type. Keys must be `@type` or a declared property. Values may not be `null`, and may use `#<id>` on reference properties from earlier operations. Every entry in `value` must satisfy it. If omitted, the whole type is in scope. |
| `value` | object | yes | Map of client id -> object body, same shape as `upsert`. May be empty (`{}`) to mean "nothing in scope should exist". Each body must include every property named in `matchOn`, and `@type` for multi-variant objects. |

A `reconcile` makes a type contain exactly the objects that the plan lists. It first runs the `upsert` logic, matching each entry and then updating or creating it. Afterwards, it destroys every existing object in scope that no entry matched. [Reconciling to exact state](/docs/management/cli/idempotent-plans#reconciling-to-exact-state) describes the full semantics.

The deletes are deferred to the cleanup pass, which runs after the whole apply pass, in reverse plan order. A `reconcile` can therefore add, update and remove in one operation, without the deletes being ordered by hand.

The following errors fail a `reconcile` before any operation in the plan runs:

* A `reconcile` on a singleton.
* An empty `matchOn`.
* A `scope` that is not an object, or that names an unknown property or a `null` value.
* An entry outside its own scope.
* A type that would fall back to by-value matching without `"matchOn": "*"`.

A delete that a live reference blocks fails with `objectIsLinked`, exactly as a `destroy` does.

### `create`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"create"` | yes | |
| `object` | string | yes | Object type name (`x:` prefix optional). |
| `value` | object | yes | Map of client id -> object body. Each body must include `@type` for multi-variant objects. References use `#<id>`. |

A `create` adds new objects without looking for existing ones. The map keys are client-assigned ids, which can be referenced elsewhere in the plan as `#<key>`. The CLI strips a single leading `#` from these keys, so `{"dom-a": {...}}` and `{"#dom-a": {...}}` are equivalent.

The operation maps directly to one or more JMAP `Object/set` requests with `create` populated, which the CLI splits into batches. Unlike `upsert`, a `create` cannot be re-run, because a second apply trips a primary-key violation or produces duplicate rows. It therefore suits one-shot plans, and `upsert` is the better choice for anything that is applied again.

### `update`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"update"` | yes | |
| `object` | string | yes | |
| `id` | string or null | required for non-singletons | Top-level sibling of `value`, not a key inside `value`. May be a `#<id>` reference to an object created earlier in the plan. May be `null` or omitted for singletons. |
| `value` | object | yes | JMAP patch object. Top-level keys may be JSON pointers (`"aliases/2/name"`). |

An `update` changes one object that is already known, either a singleton or an object identified by its id. It corresponds to a single JMAP `Object/set` with `update` populated. The `value` is a patch in the JMAP sense: only the changed fields are sent, sub-fields are addressed with `/`-separated paths, and `null` removes a value.

A singleton has exactly one instance and therefore needs no id. Its update omits the top-level `id` field or sets it to `null`:

```text
{"@type":"update","object":"SystemSettings","value":{"defaultDomainId":"#dom-a"}}
```

A non-singleton update sets the top-level `id` field to the id of the object being patched. The id may be a `#<id>` reference to an object created earlier in the same plan:

```text
{"@type":"update","object":"Domain","id":"#dom-a","value":{"description":"Renamed"}}
```

The id can also be a literal server-assigned id, which patches an existing object that the plan does not create:

```text
{"@type":"update","object":"Domain","id":"k1234abcd","value":{"description":"Renamed"}}
```

The `id` is a top-level field of the operation, alongside `@type`, `object` and `value`, and never a key inside `value`. Ids as keys of `value` are the `create` convention. Confusing the two is a common mistake in a first non-singleton update.

Some fields hold one of several variants, each with its own fields. A change that switches such a field to another variant passes the new variant's whole body as a single value, because individual sub-paths cannot be patched in that case. [Updating objects](/docs/management/cli/update#variant-changes) gives the reason.

### `destroy`

| Field | Type | Required | Notes |
|---|---|---|---|
| `@type` | `"destroy"` | yes | |
| `object` | string | yes | Singletons cannot be destroyed. |
| `value` | object or null | no | JMAP filter object. `{}` or `null` matches every instance of the type. |

A `destroy` deletes every object that a filter selects. It takes no ids. The CLI runs a paginated `Object/query` with the supplied filter, and then destroys every returned id in batches. To delete one specific object, use a filter that matches only that object, such as `{"name": "..."}`, or the standalone [`delete`](/docs/management/cli/delete) command.

The server evaluates the filter, so the filterable properties are those that the server's `Object/query` accepts for the type. Most user-facing properties, such as `name` and `domainId`, are supported everywhere. Filtering on the `@type` discriminator, which selects a variant, works for some multi-variant types, `Account` among them, but not for all.

When a destroy fails with `unsupportedFilter: Filter on property @type is not supported or invalid`, the `@type` clause has to go. Either destroy all variants of the type by omitting `value`, or filter on a regular property.
