---
sidebar_position: 5
title: "Creating objects"
---

The `create` command creates a single object from one of four input sources. Validation is intentionally minimal (the server is the source of truth); the CLI only checks that field names exist on the schema and that values are of the right shape.

## Synopsis

```text
stalwart-cli create <object> ( --field key=value... | --json '<json>' | --file <path> | --stdin )
```

* `<object>`: object type name (with or without `x:` prefix). For multi-variant objects, use the `Object/Variant` shorthand to select a variant.
* The four input forms are mutually exclusive (an error is raised if more than one is supplied).

## Multi-variant objects

Multi-variant objects (such as `Account`, with variants `User` and `Group`) require an `@type` value. There are two equivalent forms.

### Slash shorthand

The `Object/Variant` form auto-injects `@type` matching the variant name:

```sh
stalwart-cli create account/user \
  --field name=alice \
  --field domainId=b \
  --field 'credentials={"0":{"@type":"Password","secret":"hunter2"}}'
```

### Explicit @type

The same effect can be achieved by supplying `@type` directly:

```sh
stalwart-cli create account \
  --field @type=User \
  --field name=alice \
  --field domainId=b
```

If both the slash form and an explicit `@type` are supplied, the user's value wins and a warning is printed. To inspect a multi-variant object's variants and their fields, see [Exploring the schema](./describe.md).

## Input sources

### `--field key=value`

Repeatable. Sets one top-level property per flag. Values are coerced based on the schema field's type:

| Field type | Accepted forms |
|---|---|
| `boolean` | `true` / `false` (case-insensitive) |
| `number` (integer) | a decimal integer literal |
| `number` (float) | any float literal |
| `string`, `enum`, `objectId`, `blobId`, `datetime` | the literal as written |
| `object`, `objectList`, `set`, `map` | a JSON literal starting with `{` or `[` (quote it for the shell) |

Example:

```sh
stalwart-cli create domain --field name=example.com --field isEnabled=true --field description='Primary domain'
```

For a field whose value is structured (an object or an array), supply explicit JSON:

```sh
stalwart-cli create dkimsignature \
  --field domainId=b \
  --field '@type=Dkim1Ed25519Sha256' \
  --field 'privateKey={"@type":"Text","secret":"-----BEGIN PRIVATE KEY-----\n..."}' \
  --field selector=2026
```

Repeating the same key in one invocation is an error. To set a JSON sub-key in a `create`, use a structured `--field` value (JSON pointer paths are an [`update`](./update.md) feature, not a `create` feature).

#### Quoting field names

If a field name itself contains characters that would confuse parsing (a literal `=`, for example), wrap it in double or single quotes:

```sh
stalwart-cli create memorylookupkey \
  --field 'namespace=block-list' \
  --field '"key=foo=bar"=value'
```

Without quotes, the parser splits on the first `=`. With quotes, the whole quoted string is treated as the key and the next `=` is the separator.

### `--json '<json>'`

A complete JSON object passed inline. Useful for one-shot scripts:

```sh
stalwart-cli create domain \
  --json '{"name":"example.org","isEnabled":true,"description":"Primary"}'
```

### `--file <path>`

Reads the JSON object from a file. Convenient for templated payloads (jinja2, jsonnet, ...):

```sh
stalwart-cli create account/user --file users/alice.json
```

### `--stdin`

Reads the JSON object from standard input. Plays well with pipelines:

```sh
jq -n '{name: "ops-team", description: "Ops"}' \
  | stalwart-cli create account/group --stdin
```

`--json` / `--file` / `--stdin` accept arbitrarily nested JSON; the slash-in-key restriction only applies to `--field`.

## Output

By default, the CLI prints a one-line confirmation including the new server-assigned id:

```text
Created Domain xyz789
```

If the server returns additional properties (for example, a generated API key, app password, or DKIM keypair), those are rendered below the confirmation using the same form-driven view as [`get`](./get.md). This matters in cases where the value is shown only once and must be captured immediately:

```sh
stalwart-cli create apikey --field accountId=b --field description='CI deploy key'
```

```text
Created ApiKey aaa111

ApiKey
  Description: CI deploy key
  Account:     alice (id: b)
  Token:       sk_live_REDACTED_FROM_DOC
  Created At:  2026-04-16T08:00:00Z
```

Unlike [`get`](./get.md), `create` does not currently support a JSON output mode (the input flag `--json` is reserved as an input source). For machine-readable workflows, use [`apply`](./apply.md), which can emit NDJSON status records.

## See also

* [Updating objects](./update.md) for modifying an existing object.
* [Declarative bulk operations](./apply.md) for creating many objects in one plan, including cross-object references.
* [Exploring the schema](./describe.md) to see required and accepted fields.
