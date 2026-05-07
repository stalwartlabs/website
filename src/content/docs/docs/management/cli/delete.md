---
sidebar_position: 7
title: "Removing objects"
---

The `delete` command destroys one or more objects by id. Singletons cannot be destroyed (they can only be updated; see [Updating objects](./update.md)).

## Synopsis

```text
stalwart-cli delete <object> ( --ids id1,id2,... | --stdin )
```

* `<object>`: object type name (with or without `x:` prefix). The slash form is rejected.
* `--ids`: comma-separated list of ids.
* `--stdin`: read ids from standard input.

Exactly one of `--ids` and `--stdin` must be supplied.

## Direct ids

```sh
stalwart-cli delete domain --ids xyz789
stalwart-cli delete domain --ids id1,id2,id3
```

Whitespace around commas is tolerated. Empty entries are ignored.

## Reading ids from stdin

`--stdin` accepts either a JSON array of strings:

```sh
echo '["id1","id2","id3"]' | stalwart-cli delete domain --stdin
```

or a comma-, space-, or newline-separated list:

```sh
printf 'id1\nid2\nid3\n' | stalwart-cli delete domain --stdin
```

This is convenient when piping from [`query`](./query.md):

```sh
stalwart-cli query domain --where namespace=tmp --json \
  | stalwart-cli delete domain --stdin
```

(Replace `--json` with the appropriate jq filter as needed: `... --json | jq -r '.[] | .id' | xargs -d, stalwart-cli delete domain --ids` for an alternate flow.)

## Output

One line per id, then a summary:

```text
id1 deleted
id2 deleted
id3 failed: objectIsLinked
  Linked by:   DkimSignature#abc, DkimSignature#def
2 deleted, 1 failed
```

The exit status is `0` if every deletion succeeded and non-zero if at least one failed. Failed entries report the JMAP `SetError` type, the linked objects (when applicable), and any validation details.

## Batching

Internally, deletions are split into batches of `maxObjectsInSet` (taken from the JMAP session, typically 500). Large deletes are streamed without any extra effort from the caller.

## Common failures

| SetError type | Meaning | Resolution |
|---|---|---|
| `objectIsLinked` | Other objects reference this one | Destroy the linked objects first (the message lists them) |
| `notFound` | The id does not exist | Confirm with [`query`](./query.md) |
| `forbidden` | Insufficient permissions on this object type | Authenticate as a user with the required permission |
| `singleton` | An attempt was made to destroy a singleton | Use [`update`](./update.md) instead |

For dependency-aware bulk teardowns (where order matters), the [`apply`](./apply.md) command processes destroys in reverse plan order, which makes it the right tool for tearing down full deployments.

## See also

* [Searching and listing](./query.md) to obtain the ids to delete.
* [Declarative bulk operations](./apply.md) for filter-based destroys and dependency-ordered teardowns.
