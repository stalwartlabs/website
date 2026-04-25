---
sidebar_position: 4
---

# Searching and listing

The `query` command lists objects of a given type, with optional filters and a choice of columns. Results are paginated automatically and can be emitted as a human-friendly table or as an NDJSON stream.

## Synopsis

```text
stalwart-cli query <object> [--where key=value]... [--fields a,b,c] [--json]
```

* `<object>`: object type name, with or without the `x:` prefix, case-insensitive. Singletons are rejected (use [`get`](./get.md) instead).
* `--where`: filter clause (repeatable). The supported operator forms are described below.
* `--fields`: comma-separated list of properties to return. When omitted, the default columns from the object's list (or from any view targeting it) are used, with an `Id` column prepended.
* `--json`: emit one record per line as **NDJSON** (newline-delimited JSON) instead of the human-friendly table. With `--fields`, each record is the object; without `--fields`, each record is just the id string.

## Default columns

Without `--fields`, the CLI uses the column set declared by the object's list, which mirrors what the web UI shows. An `Id` column is always prepended so each row is addressable by [`get`](./get.md), [`update`](./update.md), or [`delete`](./delete.md).

```sh
stalwart-cli query domain
```

```text
Id  Domain Name  Enabled  Certificate Management             DNS Management
b   example.org  Yes      Manual TLS certificate management  Manual DNS management
c   foo.com      Yes      Manual TLS certificate management  Manual DNS management
d   bar.com      No       Manual TLS certificate management  Manual DNS management
```

For multi-variant fields (such as `Certificate Management`), the variant's friendly label is rendered. Single-variant embedded objects are summarised as `<object>`. Lists and maps with object values are summarised as `<list:N>` and `<map:N>` to keep the table compact.

## Selecting columns

When `--fields` is supplied, those exact columns are shown (still with their friendly labels resolved from the schema's forms or list definitions):

```sh
stalwart-cli query domain --fields id,name,isEnabled,createdAt
```

```text
id  Domain Name  Enabled  Created At
b   example.org  Yes      2026-04-15T18:13:35Z
c   foo.com      Yes      2026-04-15T18:17:54Z
d   bar.com      No       2026-04-15T18:17:54Z
```

Property names are matched case-insensitively and rewritten to the canonical case before sending. Unknown names are rejected with an error.

## Filtering

Filters are passed as `--where field<op>value`. Multiple `--where` flags are AND-ed together (JMAP's filter object only supports a single conjunction).

| Operator | Translates to |
|---|---|
| `=` | exact match (the default JMAP filter key) |
| `>=` | `<field>IsGreaterThanOrEqual` |
| `<=` | `<field>IsLessThanOrEqual` |
| `>` | `<field>IsGreaterThan` |
| `<` | `<field>IsLessThan` |

Comparison operators (`>`, `>=`, `<`, `<=`) are only valid for `number` and `datetime` fields. The CLI rejects them on other types when the field is known to the schema.

```sh
stalwart-cli query log --where namespace=surbl-hashbl --fields key,isGlobPattern
```

```text
key                Glob Pattern
0ven.io            No
1drv.ms            No
1kb.link           No
...
```

For an enum filter:

```sh
stalwart-cli query log --where level=error --fields timestamp,event,details
```

For a numeric range:

```sh
stalwart-cli query trafficstat --where receivedCount>=1000 --fields domainId,receivedCount
```

Repeating the same `--where` field overrides the previous value (filters are single-valued by definition); duplicates are not an error.

To list which filters an object supports, run [`describe <object>`](./describe.md). The `Filters:` section lists each accepted key, its kind, and a label.

## JSON output

```sh
stalwart-cli query domain --fields id,name --json
```

```text
{"name":"example.org","id":"b"}
{"name":"foo.com","id":"c"}
{"name":"bar.com","id":"d"}
```

`--json` emits one record per line as **NDJSON** (newline-delimited JSON). Records are streamed page-by-page as they are fetched, so total memory is bounded regardless of result-set size: even a `query` returning hundreds of thousands of rows runs in constant memory.

Without `--fields`, each line is a single JSON-encoded id string:

```sh
stalwart-cli query domain --json
```

```text
"b"
"c"
"d"
```

NDJSON pipes naturally into `jq`:

```sh
stalwart-cli query account --fields id,name,domainId --json \
  | jq -c 'select(.domainId=="b") | .name'
```

To collect the stream into a single JSON array (for tools that expect one), pipe through `jq -s '.'`:

```sh
stalwart-cli query domain --fields id,name --json | jq -s '.'
```

## Pagination

Internally the CLI uses anchor-based pagination (the JMAP-recommended approach for stable cursors). One JMAP page returns up to `maxObjectsInGet` rows (typically 500). The CLI then displays them ten at a time, prompting `Show more? [Y/n]` between batches when stdout is a TTY:

```text
... 10 rows ...
Show more? [Y/n] y
... next 10 rows ...
```

Press `n` (or `no`) to stop. Anything else (including just Enter) continues. When a batch boundary is reached, the next JMAP page is fetched transparently.

When stdout is **not** a TTY (for example, piping to a file or another command), no prompt is shown and all results stream out.

## Tips

* Long cell values are truncated to 60 visible characters with a trailing ellipsis to keep column widths from blowing up. The full value is always available with `--json`.
* The `Id` column added to default listings is the lower-case `id`; explicit `--fields id` keeps the case as supplied.
* For very large result sets where only counts matter, `query` followed by `wc -l` (id-only mode) is the cheapest way to count: `stalwart-cli query log | wc -l`.

## See also

* [Fetching a single object](./get.md) for full per-object detail.
* [Removing objects](./delete.md), often combined with the ids returned here.
* [Declarative bulk operations](./apply.md) for filter-driven destroys at scale.
