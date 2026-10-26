---
sidebar_position: 7
title: "Removing objects"
description: "Delete configuration objects with stalwart-cli delete, by id or from a list on standard input."
---

The `delete` command removes objects from the server: a domain that is no longer served, a lookup key, a set of test accounts. It destroys one or more objects of a single type, identified by their ids, which usually come from [`query`](/docs/management/cli/query).

Singletons are the exception. A singleton is an object that exists exactly once on every server, so it cannot be destroyed, only updated, as described in [Updating objects](/docs/management/cli/update).

## Synopsis

```text
stalwart-cli delete <object> ( --ids id1,id2,... | --stdin )
```

The `<object>` argument is the object type name, with or without the `x:` prefix. The slash form used to select a variant is rejected. The ids come from exactly one of two sources:

* `--ids`: a comma-separated list of ids.
* `--stdin`: ids read from standard input.

## Direct ids

For a few known objects, the ids are passed on the command line, either a single id or a comma-separated list:

```sh
stalwart-cli delete domain --ids xyz789
stalwart-cli delete domain --ids id1,id2,id3
```

Whitespace around the commas is tolerated, and empty entries are ignored.

## Reading ids from stdin

When the ids are produced by another command, `--stdin` reads them from standard input. They can arrive as a JSON array of strings:

```sh
echo '["id1","id2","id3"]' | stalwart-cli delete domain --stdin
```

They can also arrive as a list separated by commas, spaces or newlines:

```sh
printf 'id1\nid2\nid3\n' | stalwart-cli delete domain --stdin
```

Reading from standard input lets the output of [`query`](/docs/management/cli/query) feed a delete directly, so a filter selects the objects and `delete` removes them. The following pipeline removes every lookup key in the `tmp` namespace:

```sh
stalwart-cli query memorylookupkey --where namespace=tmp --fields id --json \
  | jq -r '.id' \
  | stalwart-cli delete memorylookupkey --stdin
```

## Output

Each id is deleted on its own, so some can succeed while others fail. The CLI therefore prints one line per id, followed by a summary:

```text
id1 deleted
id2 deleted
id3 failed: error: objectIsLinked
    Linked by:   <linked objects>
2 deleted, 1 failed
```

A failed entry reports the JMAP `SetError` type, which names the reason for the failure. It also lists the linked objects when there are any, and any validation details.

The exit status is `0` when every deletion succeeded and non-zero when at least one failed, so a script can tell whether the whole delete went through. A singleton type is refused before any request is sent, with `<Object> is a singleton and cannot be deleted`.

## Batching

The server limits how many objects a single request may change. That limit is `maxObjectsInSet`, which the CLI reads from the JMAP session and which the `maxSetObjects` field of the [Jmap](/docs/ref/object/jmap) settings controls. The CLI splits deletions into batches of that size, so a large delete needs no batching by the caller.

## Common failures

A delete most often reports one of these `SetError` types:

- `objectIsLinked`: other objects reference this one. Destroy the linked objects first; the message lists them.
- `notFound`: the id does not exist. Confirm the id with [`query`](/docs/management/cli/query).
- `forbidden`: the account lacks the permission for this object type. Authenticate as an account with the required permission.

The `objectIsLinked` failure is the reason that order matters in a teardown: an object can be deleted only once nothing references it any more. A teardown in which order matters is therefore better done with [`apply`](/docs/management/cli/apply), which processes destroys in reverse plan order and so removes dependent objects before the objects they reference.

## See also

* [Searching and listing](/docs/management/cli/query) to obtain the ids to delete.
* [Declarative bulk operations](/docs/management/cli/apply) for filter-based destroys and dependency-ordered teardowns.
