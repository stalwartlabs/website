---
sidebar_position: 8
title: "Object encoding"
description: "How configuration objects are encoded in JSON: lists, sets, maps, durations, sizes and variants, and how to change one element of a list or set."
---

Configuration objects are written in JSON whenever they are sent through the API: in `x:Foo/set` calls, in plans for [`stalwart-cli apply`](/docs/management/cli/apply), and with the `--json` and `--field` options of the CLI. The WebUI produces the encoding itself, so this page matters only for those other paths.

The encoding differs from common JSON conventions in a few respects. The server refuses a value encoded differently with an error that names the property, for example:

```text
invalidPatch | Invalid value for object property | Properties: retry/intervals
```

The most common cause of this error is a JSON array where a list or a set is expected. The [schema reference](/docs/ref/) shows the type of every field, and the sections below show how each type is written.

## Lists

A list, shown as `List<T>` on the reference pages, is an ordered sequence of elements. JSON would normally encode it as an array. Stalwart encodes it instead as a JSON object whose keys are the positions, `"0"`, `"1"` and so on, and the keys determine the order of the elements. The custom retry intervals of an [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule), for example, are written as follows:

```json
{
  "retry": {
    "@type": "Custom",
    "intervals": {
      "0": {"duration": 120000},
      "1": {"duration": 300000}
    }
  }
}
```

## Sets

A set, shown as `Set<T>`, is a collection of distinct members without an order. It is encoded as a JSON object that maps each member to `true`, so an empty set is `{}`. The bind addresses of a [NetworkListener](/docs/ref/object/network-listener), for example, are written as follows:

```json
{
  "bind": {"[::]:993": true, "127.0.0.1:993": true}
}
```

## Maps

A map, shown as `Map<K, V>`, needs no special encoding. It is an ordinary JSON object from keys to values. An example is the `httpHeaders` of an [AiModel](/docs/ref/object/ai-model), which maps header names to values.

## Durations and sizes

A duration (`Duration`) is an integer number of milliseconds, and a size (`Size`) is an integer number of bytes. Strings such as `"30d"` or `"10mb"` are refused. Durations with units are accepted only inside [expressions](/docs/configuration/expressions/). The following values are seven days and 100 MiB:

```json
{
  "maxAge": 604800000,
  "maxSize": 104857600
}
```

Writing these numbers by hand is error-prone, so the following table converts common values:

| Duration | Milliseconds | Size | Bytes |
|---|---|---|---|
| 1 second | 1000 | 1 KiB | 1024 |
| 1 minute | 60000 | 1 MiB | 1048576 |
| 5 minutes | 300000 | 10 MiB | 10485760 |
| 1 hour | 3600000 | 100 MiB | 104857600 |
| 1 day | 86400000 | 1 GiB | 1073741824 |
| 7 days | 604800000 | | |
| 30 days | 2592000000 | | |

[`stalwart-cli get`](/docs/management/cli/get) prints durations in a readable form, such as `1 h 30 m`. That form applies to its output only, and is not accepted as input.

## Variants

Some objects and fields come in several variants, such as the different backends of a [DataStore](/docs/ref/object/data-store). They carry the variant name in `@type`, for example `{"@type": "RocksDb", "path": "/var/lib/stalwart/"}`. The variant determines which other fields are valid, so `@type` must match the fields that accompany it.

## Changing one element of a list or set

An update that sets a list or set field replaces the whole field. To change one element only, the update addresses it with a path made of the field name, a `/` and the element's key, as in JMAP patches ([RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3)). Each kind of field has its own form:

| Field | Add or replace | Remove |
|---|---|---|
| Set | `"<field>/<member>": true` | `"<field>/<member>": null` or `false` |
| List | `"<field>/<position>": {...}` | `"<field>/<position>": null` |
| Map | `"<field>/<key>": <value>` | `"<field>/<key>": null` |

Positions in a list are keys, not indexes, so removing an element does not renumber the others. After removing position 1, the list has positions 0 and 2. A field of a nested element is addressed by extending the path, for example `"aliases/0/enable": false`.

The following call adds a group to an account's [`memberGroupIds`](/docs/ref/object/account#membergroupids) and removes the second of its aliases, leaving the other groups and aliases unchanged:

```json
["x:Account/set", {
  "update": {
    "<account id>": {
      "memberGroupIds/<group id>": true,
      "aliases/1": null
    }
  }
}, "c1"]
```

The CLI makes the same change with the paths passed as `--field` keys. The [`update` command](/docs/management/cli/update) describes how to quote paths that contain `=`. The following command is equivalent to the call above:

```sh
stalwart-cli update Account <account id> \
  --field 'memberGroupIds/<group id>=true' \
  --field 'aliases/1=null'
```

## Confirming the encoding

When the right encoding of a field is unclear, the server itself is the best reference. A snapshot of a configured server prints objects exactly as the server encodes them:

```sh
stalwart-cli snapshot MtaDeliverySchedule
```

The example plan linked from [Plan file format](/docs/management/cli/plan-format) shows the encoding of several object types.
