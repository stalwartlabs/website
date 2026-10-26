---
sidebar_position: 5
title: "Creating objects"
description: "Create configuration objects with stalwart-cli create: input sources, multi-variant objects and output."
---

The `create` command adds a single configuration object to the server, such as a domain, an account or an API key. It is also how an [action](/docs/management/tasks-actions/actions) is run from the CLI, because each action request is an object that the server creates and executes. For many objects at once, or for configuration that is applied repeatedly, a plan run with [`apply`](/docs/management/cli/apply) is the better tool.

The fields of the new object come from one of four input sources: individual `--field` flags, an inline JSON document, a file or standard input. Before sending the request, the CLI checks only that the field names exist in the schema and that the values have the right shape. Every other validation is left to the server, so a create that passes the CLI's checks can still be rejected by the server.

## Synopsis

```text
stalwart-cli create <object> ( --field key=value... | --json '<json>' | --file <path> | --stdin )
```

The `<object>` argument is the object type name, with or without the `x:` prefix. For a multi-variant object, described in the next section, the `Object/Variant` shorthand selects a variant. The variant name is matched without regard to case, so `Action/ReloadSettings` and `action/reloadsettings` are equivalent. An unknown variant fails with `unknown variant '<name>' for object <Object>`.

The four input forms are mutually exclusive, and supplying more than one is an error. A variant without fields, such as `Action/ReloadSettings`, needs no input at all, so `stalwart-cli create Action/ReloadSettings` is a complete command.

## Multi-variant objects

Some object types come in several distinct shapes, called variants. `Account` is the typical example: a `User` and a `Group` are both accounts, but they have different fields. The `@type` field of each object names its variant, and the server needs it to know which shape the object has. Creating a multi-variant object therefore requires an `@type` value, which can be given in either of two equivalent forms.

### Slash shorthand

The `Object/Variant` form names the variant together with the object type, and the CLI injects an `@type` that matches the variant name:

```sh
stalwart-cli create Account/User \
  --field name=alice \
  --field domainId=b \
  --field 'credentials={"0":{"@type":"Password","secret":"hunter2"}}'
```

### Explicit @type

Supplying `@type` directly as a field has the same effect:

```sh
stalwart-cli create account \
  --field @type=User \
  --field name=alice \
  --field domainId=b
```

When the slash form and an explicit `@type` name different variants, the explicit value wins and the CLI prints a warning. [`describe`](/docs/management/cli/describe) lists the variants of a multi-variant object and the fields of each.

## Input sources

The four input sources suit different situations. `--field` sets values one by one from the shell, while the JSON sources carry a complete document, as produced by a script or a template.

### `--field key=value`

Each `--field` flag sets one top-level property, and the flag can be repeated. On the command line every value is a string, so the CLI coerces each one according to the type of the schema field:

| Field type | Accepted forms |
|---|---|
| `boolean` | `true` or `false`, case-insensitive |
| `number` (integer) | A decimal integer literal |
| `number` (float) | Any float literal |
| `string`, `enum`, `objectId`, `blobId`, `datetime` | The literal as written |
| `object`, `objectList`, `set`, `map` | A JSON literal starting with `{` or `[`, quoted for the shell |

Scalar fields are set directly:

```sh
stalwart-cli create domain --field name=example.com --field enable=true --field description='Primary domain'
```

A field whose value is an object or an array takes a JSON literal:

```sh
stalwart-cli create dkimsignature \
  --field domainId=b \
  --field '@type=Dkim1Ed25519Sha256' \
  --field 'privateKey={"@type":"Text","secret":"-----BEGIN PRIVATE KEY-----\n..."}' \
  --field selector=2026
```

Repeating the same key in one invocation is an error. A sub-key of a structured field cannot be set on its own, because JSON pointer paths are available only in [`update`](/docs/management/cli/update). Instead, the whole structure is passed as one JSON value.

#### Quoting field names

The parser splits each `--field` argument on its first `=`. A field name that itself contains an `=` would therefore be cut in the wrong place. Wrapping the name in double or single quotes avoids this: the whole quoted string becomes the key, and the next `=` becomes the separator:

```sh
stalwart-cli create memorylookupkey \
  --field 'namespace=block-list' \
  --field '"key=foo=bar"=value'
```

### `--json '<json>'`

The `--json` flag passes a complete JSON object inline, which suits one-shot scripts:

```sh
stalwart-cli create domain \
  --json '{"name":"example.org","enable":true,"description":"Primary"}'
```

### `--file <path>`

The `--file` flag reads the JSON object from a file. This suits payloads rendered from templates such as Jinja2 or Jsonnet:

```sh
stalwart-cli create Account/User --file users/alice.json
```

### `--stdin`

The `--stdin` flag reads the JSON object from standard input, so the payload can come from a pipeline:

```sh
jq -n '{name: "ops-team", domainId: "b", description: "Ops"}' \
  | stalwart-cli create Account/Group --stdin
```

The `--json`, `--file` and `--stdin` sources accept arbitrarily nested JSON. Only `--field` is limited to top-level property names.

## Output

On success, the CLI prints a one-line confirmation that includes the id the server assigned to the new object:

```text
Created Domain xyz789
```

For some objects, the server generates values at creation and returns them, such as a generated API key, app password or DKIM key pair. The CLI prints these additional properties below the confirmation, in the same form-driven view as [`get`](/docs/management/cli/get). Some of them are shown only once, so the output must be captured at that point.

The `ApiKey` and `AppPassword` objects have no owner field, because the credential belongs to the account that authenticates the request. An administrator who creates a credential for another account therefore uses a JMAP call with that account's `accountId`, as described in [Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key). The following command creates an API key for the authenticated account:

```sh
stalwart-cli create apikey \
  --field description='CI deploy key' \
  --field 'permissions={"@type":"Inherit"}' \
  --field 'allowedIps={}'
```

```text
Created ApiKey aaa111

Credential
  Secret: API_AAAAEwAAAAHDN7BtUeZSrGrM9DibqfhzRGD7sw
```

The server returns the `Secret` value only in this create response. A later [`get`](/docs/management/cli/get) of the same `ApiKey` returns the masked placeholder `****`, and the original cannot be recovered. The value must therefore be stored before anything else runs.

Unlike [`get`](/docs/management/cli/get), `create` has no JSON output mode, because the `--json` flag is already taken as an input source. Machine-readable workflows use [`apply`](/docs/management/cli/apply) instead, which can emit NDJSON status records.

## See also

* [Updating objects](/docs/management/cli/update) for modifying an existing object.
* [Declarative bulk operations](/docs/management/cli/apply) for creating many objects in one plan, including cross-object references.
* [Exploring the schema](/docs/management/cli/describe) to see required and accepted fields.
