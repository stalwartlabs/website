---
sidebar_position: 3
---

# Fetching a single object

The `get` command retrieves one object by id (or a singleton) and renders it in human-readable form by default, or as JSON with `--json`.

## Synopsis

```text
stalwart-cli get <object> [<id>] [--fields name,email,...] [--json]
```

* `<object>`: object type name, with or without the `x:` prefix, case-insensitive.
* `<id>`: required for normal objects; optional for singletons (defaults to `singleton`).
* `--fields`: comma-separated list of properties to fetch. When omitted, the server returns every property.
* `--json`: emit a single-line JSON document instead of the human-friendly view.

The slash form `<Object>/<Variant>` is rejected here (it is only valid for [`create`](./create.md)).

## Reading a regular object

```sh
stalwart-cli get domain b
```

```text
Domain
  Domain Name: example.org
  Aliases:     <none>
  Enabled:     Yes
  Tenant:      <none>
  Directory:   <none>

Email
  Catch-All Address: <none>
  Sub-Addressing:
    Type: Enable sub-addressing
  Allow Relaying:    No

DKIM
  DKIM Management:
    Type: Automatic DKIM management
    Key Generation
      Signing Algorithms: DKIM1 - Ed25519 SHA-256, DKIM1 - RSA SHA-256
      Selector Template:  v{version}-{algorithm}-{date-%Y%m%d}
    Key Rotation
      Rotate After: 90 d
      Retire After: 7 d
      Delete After: 30 d

TLS
  Certificate Management:
    Type: Manual TLS certificate management

DNS
  DNS Management:
    Type: Manual DNS management

Reports
  Report Address: mailto:postmaster

Details
  Description: Test domain
  Logo:        <none>
  Created At:  2026-04-15T18:13:35Z
```

The output is organised into sections that mirror the schema's form definitions. Sections from associated views (used by the web UI) are merged automatically, so all returned properties are visible even when the main form does not list every field.

## Reading singletons

Singletons accept the literal id `singleton`, or no id at all. These are equivalent:

```sh
stalwart-cli get systemsettings
stalwart-cli get systemsettings singleton
```

Passing any other id for a singleton is rejected.

## Selecting fields

`--fields` restricts the request and the rendering to a subset of properties (`id` and `@type` are always allowed):

```sh
stalwart-cli get domain b --fields id,name,isEnabled,createdAt
```

```text
Domain
  Domain Name: example.org
  Enabled:     Yes
  Created At:  2026-04-15T18:13:35Z
```

Use `--fields id` (or any single `serverSet` field) when only an existence check is needed.

## JSON output

```sh
stalwart-cli get domain b --json
```

```json
{"aliases":{},"allowRelaying":false,"catchAllAddress":null,"certificateManagement":{"@type":"Manual"},"createdAt":"2026-04-15T18:13:35Z","description":"Test domain","directoryId":null,...,"id":"b"}
```

Output is compact (no pretty printing) so it can be piped into `jq` or stored verbatim:

```sh
stalwart-cli get domain b --json | jq '{name, isEnabled, createdAt}'
```

## How values are rendered

The schema's field types drive formatting in the human view:

| Type | Rendering |
|---|---|
| `boolean` | `Yes` / `No` |
| `string<size>` | bytes converted to binary units (`1.5 GB`, `12 MB`, `512 B`) |
| `string<duration>` | milliseconds converted to two-significant-unit form (`1 m 30 s`, `2 h 15 m`, `1 d 5 h`) |
| `datetime` | ISO 8601 UTC (`2026-04-15T18:13:35Z`) |
| `enum` | the variant's label, colored when the schema declares a color |
| `id<Object>` | resolved display name with the id (`Tenant Acme (id: c)`) |
| `set<...>` | comma-separated values |
| `object<...>` (single-variant) | nested block |
| `object<...>` (multi-variant) | the variant's label is shown, then the variant's fields nested below |
| `list<Object>` | a small inline table |
| `map<_, Object>` | a small inline table keyed by the map key |

`null` values are dimmed and rendered as `<none>`.

For ObjectId fields, the CLI batches lookups: when a single `get` returns ten references to a `Tenant`, only one extra JMAP request is issued to resolve the labels. When the referenced object has no `labelProperty` declared in its list, the bare id is shown.

## See also

* [Searching and listing](./query.md) for retrieving multiple objects with filters.
* [Updating objects](./update.md) for modifying an object after fetching it.
* [Exploring the schema](./describe.md) to discover what fields exist on a given object.
