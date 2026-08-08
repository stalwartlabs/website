---
sidebar_position: 8
title: "Object encoding"
description: "How configuration objects are encoded as JSON: lists, sets, durations and sizes."
---

Configuration objects are stored in the database and written through the JMAP API, either by the [WebUI](/docs/management/webui/), by the [CLI](/docs/management/cli/), or by a direct API call. The [schema reference](/docs/ref/) documents the fields of every object; this page describes how their values are encoded as JSON.

Operators using the WebUI never encounter this: the forms produce the correct payload. It matters when writing a plan for [`stalwart-cli apply`](/docs/management/cli/apply) or calling a `Foo/set` method directly, because the encoding differs from ordinary JSON conventions in three respects. A payload that gets any of them wrong is rejected with an error naming the offending property:

```
invalidPatch | Invalid value for object property | Properties: retry/intervals
```

## Lists

An ordered list is a JSON object whose keys are the stringified position, starting at `"0"`, rather than a JSON array. The retry intervals of an [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) are written as:

```json
{
  "intervals": {
    "0": {"duration": 120000},
    "1": {"duration": 300000}
  }
}
```

The keys determine the order in which entries are evaluated. Fields of this kind appear as `List<T>` on the object reference pages.

## Sets

A set is a JSON object mapping each member to `true`, again not a JSON array. The listen addresses of a [NetworkListener](/docs/ref/object/network-listener) are written as:

```json
{
  "bind": {"[::]:993": true, "127.0.0.1:993": true}
}
```

An empty set is `{}`. Fields of this kind appear as `Set<T>` on the object reference pages.

Genuine key-value maps, which appear as `Map<K, V>`, keep their natural JSON object form and are unaffected. The `httpHeaders` field of an [AiModel](/docs/ref/object/ai-model), for example, maps a header name to its value.

## Durations and sizes

A duration is an integer count of milliseconds, and a size is an integer count of bytes. Neither accepts a string:

```json
{
  "maxAge": 604800000,
  "maxSize": 104857600
}
```

The values above are seven days and 100 MB. Reference pages show the type as `Duration` or `Size` and give defaults in the same integer form.

The [`stalwart-cli get`](/docs/management/cli/get) command renders durations in a readable two-unit form (`2 m`, `1 h 30 m`) when printing an object for a human reader. That formatting applies to output only; the stored value, and the value accepted on input, is the integer.

## Confirming the encoding

The most reliable way to see the canonical encoding of an object is to take a snapshot of a configured system, which prints exactly what the server itself produces:

```bash
stalwart-cli snapshot MtaDeliverySchedule
```

The example plan linked from the [`apply`](/docs/management/cli/apply) documentation shows the same encoding across several object types.
