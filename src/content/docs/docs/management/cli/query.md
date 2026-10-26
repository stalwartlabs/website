---
sidebar_position: 4
title: "Searching and listing"
description: "List and filter configuration objects with stalwart-cli query: filters, fields, sorting, paging and JSON output."
---

The `query` command lists the objects of one type. It answers questions such as which domains exist, which accounts belong to a domain or which queued messages are due soon, and it supplies the ids that [`get`](/docs/management/cli/get), [`update`](/docs/management/cli/update) and [`delete`](/docs/management/cli/delete) need to address individual objects.

A listing can be narrowed with filters and limited to a chosen set of columns. The CLI pages through the results itself, so a listing of any size needs no extra handling. It prints the results either as a human-readable table or as an NDJSON stream for other tools. NDJSON (newline-delimited JSON) writes one complete JSON document per line, with no enclosing array.

## Synopsis

```text
stalwart-cli query <object> [--where key=value]... [--fields a,b,c] [--json]
```

The command takes the following arguments and options:

* `<object>`: the object type name. It is case-insensitive and may be written with or without the `x:` prefix. Singletons are rejected: a singleton has exactly one instance, so there is nothing to list, and [`get`](/docs/management/cli/get) reads it directly.
* `--where`: a filter clause, which can be repeated. The operator forms are described in [Filtering](#filtering).
* `--fields`: a comma-separated list of the properties to return. Without it, the CLI uses the default columns of the object's list, or of any view that targets it, with an `Id` column prepended.
* `--json`: prints one record per line as NDJSON in place of the table. Each record holds the requested fields, or the default columns when `--fields` is omitted.

## Default columns

The schema that the CLI downloads from the server declares, for each object, a list definition: the columns that the WebUI shows when it lists objects of that type. Without `--fields`, the CLI uses the same column set, so the table mirrors what the WebUI shows. It always prepends an `Id` column, because the id is what [`get`](/docs/management/cli/get), [`update`](/docs/management/cli/update) and [`delete`](/docs/management/cli/delete) need to address a row:

```sh
stalwart-cli query domain
```

```text
Id  Domain Name  Enabled  Certificate Management             DNS Management
b   example.org  Yes      Manual TLS certificate management  Manual DNS management
c   foo.com      Yes      Manual TLS certificate management  Manual DNS management
d   bar.com      No       Manual TLS certificate management  Manual DNS management
```

Structured values would not fit in a table cell, so they are summarised to keep the table compact. A multi-variant field, one whose value takes one of several shapes selected by its `@type`, such as `Certificate Management`, shows the label of its variant. A single-variant embedded object shows as `<object>`. Lists and maps with object values show as `<list:N>` and `<map:N>`.

## Selecting columns

With `--fields`, the table shows exactly the listed columns. They are still labelled with the names that the schema's forms or list definitions give them:

```sh
stalwart-cli query domain --fields id,name,enable,createdAt
```

```text
id  Domain Name  Enabled  Created At
b   example.org  Yes      2026-04-15T18:13:35Z
c   foo.com      Yes      2026-04-15T18:17:54Z
d   bar.com      No       2026-04-15T18:17:54Z
```

Property names are matched case-insensitively. The CLI rewrites each one to its canonical case before it sends the request, so `--fields ID` returns `id`. An unknown name is rejected with an error.

## Filtering

A filter is passed as `--where field<op>value`. Several `--where` flags can be given, and the CLI combines them with AND, which means an object must match every clause to be listed. The operator in each clause decides which JMAP filter condition the CLI sends:

| Operator | Translates to |
|---|---|
| `=` | An exact match on `<field>` |
| `>=` | `<field>IsGreaterThanOrEqual` |
| `<=` | `<field>IsLessThanOrEqual` |
| `>` | `<field>IsGreaterThan` |
| `<` | `<field>IsLessThan` |

The comparison operators `>`, `>=`, `<` and `<=` only make sense for values with an order, so they are valid only for `number` and `datetime` fields. When the field is known to the schema, the CLI rejects them on other types before sending anything.

An exact match is the common case. The following command lists the lookup keys in one namespace:

```sh
stalwart-cli query memorylookupkey --where namespace=surbl-hashbl --fields key,isGlobPattern
```

```text
key                Glob Pattern
0ven.io            No
1drv.ms            No
1kb.link           No
...
```

A comparison selects a range instead. The following command lists the queued messages that are due before a given time:

```sh
stalwart-cli query queuedmessage --where 'due<2026-10-15T00:00:00Z' --fields id,returnPath,due
```

Not every property can be filtered on. A filter that the object does not support is refused by the server, with a message such as `Filter on property level is not supported or invalid`. The filters that an object accepts are listed in the `Filters:` section of [`describe <object>`](/docs/management/cli/describe), with the key, kind and label of each.

Each filter field holds a single value. Repeating the same `--where` field therefore replaces the earlier value, and no error is raised.

## JSON output

With `--json`, each object is printed as one JSON record per line:

```sh
stalwart-cli query domain --fields id,name --json
```

```text
{"name":"example.org","id":"b"}
{"name":"foo.com","id":"c"}
{"name":"bar.com","id":"d"}
```

The records are streamed page by page as they are fetched. Memory use therefore stays constant whatever the size of the result set, even for a query that returns hundreds of thousands of rows. Without `--fields`, each record contains the default columns of the object's list. When only the ids are needed, `--fields id` returns them, and `jq -r '.id'` extracts them from the records.

Because each line is a complete JSON document, the stream pipes directly into `jq`:

```sh
stalwart-cli query account --fields id,name,domainId --json \
  | jq -c 'select(.domainId=="b") | .name'
```

A tool that expects a single JSON array can be fed by collecting the stream with `jq -s '.'`:

```sh
stalwart-cli query domain --fields id,name --json | jq -s '.'
```

Since each matching object produces exactly one line, counting the lines of the JSON output gives the number of matching objects:

```sh
stalwart-cli query log --fields id --json | wc -l
```

## Pagination

The server returns query results in pages, and the CLI walks through them on its own. It uses the `anchor` argument of JMAP `/query` ([RFC 8620, section 5.5](https://www.rfc-editor.org/rfc/rfc8620#section-5.5)), which starts each page after the last id of the previous one. One JMAP page returns up to the server's `maxObjectsInGet` limit of rows.

How the rows are shown depends on where the output goes. When stdout is a terminal, the CLI displays them ten at a time and prompts between batches:

```text
... 10 rows ...
Show more? [Y/n] y
... next 10 rows ...
```

Answering `n` or `no` stops the listing. Any other answer, including an empty one, continues it. When the displayed rows reach the end of a page, the CLI fetches the next page without asking again.

When stdout is not a terminal, as when the output is piped to a file or another command, nobody is there to answer a prompt. No prompt is shown, and all results stream out.

In the table, a cell value longer than 60 visible characters is truncated with a trailing ellipsis, so that the columns stay readable. The full value is always available with `--json`.

## See also

* [Fetching a single object](/docs/management/cli/get) for full per-object detail.
* [Removing objects](/docs/management/cli/delete), often combined with the ids returned here.
* [Declarative bulk operations](/docs/management/cli/apply) for filter-driven destroys at scale.
