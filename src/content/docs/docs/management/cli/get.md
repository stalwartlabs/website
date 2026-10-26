---
sidebar_position: 3
title: "Fetching a single object"
description: "Read one configuration object or singleton with stalwart-cli get, as formatted text or JSON."
---

The `get` command reads one configuration object from the server and prints it. It is the command to use when the administrator already knows which object to look at, for example to check a domain's settings before changing them, or to confirm that an update took effect. Finding the object in the first place is the job of [`query`](/docs/management/cli/query), which lists the objects of a type together with their ids.

An object is identified by its type and its id. Singletons are the exception: a singleton is a configuration object that exists exactly once on a server, such as the system settings, so it needs no id to be found. By default `get` renders the object in a human-readable view. With `--json`, it prints the object as JSON instead, for scripts and other tools.

## Synopsis

```text
stalwart-cli get <object> [<id>] [--fields name,email,...] [--json]
```

The command takes the following arguments and options:

* `<object>`: the object type name. It is case-insensitive and may be written with or without the `x:` prefix. The slash form `<Object>/<Variant>` is rejected here, because selecting a variant is meaningful only when an object is created with [`create`](/docs/management/cli/create).
* `<id>`: the id of the object. A regular object needs it. For a singleton it is optional, and when it is left out it defaults to `singleton`.
* `--fields`: a comma-separated list of the properties to fetch. Without it, the server returns every property of the object.
* `--json`: prints the object as a single-line JSON document, in place of the human-readable view.

## Reading a regular object

A regular object is fetched by naming its type and its id. The following command reads the domain with id `b`:

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

The layout of this output comes from the schema. Besides the fields of each object, the schema contains form definitions, which describe how the WebUI groups those fields into sections and labels them. The CLI organises its output into the same sections. It also merges in the sections of the associated views that the WebUI uses, so every property the server returns is visible, even one that the main form does not list.

## Reading singletons

Because a singleton has only one instance, its id carries no information. The CLI therefore accepts either the literal id `singleton` or no id at all, and the following commands are equivalent:

```sh
stalwart-cli get systemsettings
stalwart-cli get systemsettings singleton
```

Any other id is rejected for a singleton.

## Selecting fields

An object can have many properties, and often only a few of them matter. The `--fields` option restricts both the request sent to the server and the rendering to the listed properties. The `id` and `@type` properties are always allowed in the list:

```sh
stalwart-cli get domain b --fields id,name,enable,createdAt
```

```text
Domain
  Domain Name: example.org
  Enabled:     Yes
  Created At:  2026-04-15T18:13:35Z
```

A small field list also suits a check of whether an object exists: `--fields id`, or any single `server-set` field, keeps the response minimal.

## JSON output

With `--json`, the object is printed as a JSON document:

```sh
stalwart-cli get domain b --json
```

```json
{"aliases":{},"allowRelaying":false,"catchAllAddress":null,"certificateManagement":{"@type":"Manual"},"createdAt":"2026-04-15T18:13:35Z","description":"Test domain","directoryId":null,...,"id":"b"}
```

The JSON is compact, without pretty printing. It can therefore be stored verbatim, or piped into `jq` to extract or reshape the fields:

```sh
stalwart-cli get domain b --json | jq '{name, enable, createdAt}'
```

## Value rendering

In the human-readable view, raw values are converted into a form that is easier to read. The type that the schema gives each field decides how its value is formatted:

| Type | Rendering |
|---|---|
| `boolean` | `Yes` or `No` |
| `number<size>` | Bytes converted to binary units, such as `1.5 GB`, `12 MB` or `512 B` |
| `number<duration>` | Milliseconds converted to the two most significant units, such as `1 m 30 s`, `2 h 15 m` or `1 d 5 h` |
| `datetime` | ISO 8601 in UTC, such as `2026-04-15T18:13:35Z` |
| `enum` | The label of the variant, coloured when the schema declares a colour |
| `id<Object>` | The resolved display name with the id, such as `Tenant Acme (id: c)` |
| `set<...>` | Comma-separated values |
| `object<...>` (single-variant) | A nested block |
| `object<...>` (multi-variant) | The label of the variant, with the fields of the variant nested below |
| `list<Object>` | A small inline table |
| `map<_, Object>` | A small inline table keyed by the map key |

A `null` value is dimmed and rendered as `<none>`.

A reference to another object is shown by that object's display name, so the CLI has to look the names up. It resolves them in batches: when a single `get` returns ten references to a `Tenant`, the CLI issues only one extra JMAP request to resolve their labels. When the referenced object declares no `labelProperty` in its list, there is no name to show, and the bare id is shown instead.

## See also

* [Searching and listing](/docs/management/cli/query) for retrieving multiple objects with filters.
* [Updating objects](/docs/management/cli/update) for modifying an object after fetching it.
* [Exploring the schema](/docs/management/cli/describe) to discover what fields exist on a given object.
