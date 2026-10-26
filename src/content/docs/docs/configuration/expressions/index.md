---
sidebar_position: 1
title: "Overview"
description: "Expressions: the conditional rules that compute setting values at runtime, their JSON shape, how they are validated and evaluated, and examples."
---

A fixed value is often not enough for a mail server's settings. The right authentication mechanisms depend on the port and on whether the connection is encrypted. The right route for a message depends on its recipient. Whether an HTTP request is allowed depends on its path and its source address. Settings like these hold an expression in place of a fixed value.

An expression is a small rule that is evaluated each time the setting is needed. It has access to the data of the current operation, and computes the setting's value from it. The reference page of each object shows which of its fields are expressions, and which variables they can use.

An expression is built from four kinds of element:

- [Variables](/docs/configuration/variables) carry the data of the operation, such as `remote_ip`, `rcpt` or `retry_num`.
- [Values](/docs/configuration/expressions/values) are literal strings, numbers and arrays.
- [Operators](/docs/configuration/expressions/operators) combine variables and values.
- [Functions](/docs/configuration/expressions/functions), such as `contains`, `matches` or `is_local_domain`, compute new values from them.

## Shape of an expression

An expression works like a chain of `if` and `else if` statements that ends in a final `else`. In JSON, it is an object with two fields. `match` lists conditions, each made of an `if` and the `then` value to use when the condition is true. The conditions are tried in order, and the first one that is true gives the result. `else` is the value used when no condition is true:

```json
{
  "match": {
    "0": {"if": "<condition>", "then": "<value>"},
    "1": {"if": "<condition>", "then": "<value>"}
  },
  "else": "<value>"
}
```

`match` is a list, written as an object with the keys `"0"`, `"1"` and so on, as described in [Object encoding](/docs/configuration/object-encoding#lists).

`if`, `then` and `else` are strings that contain expression text, even when the value is a number, a boolean or an array: `"true"`, `"3"`, `"[plain, login]"`. The JSON quotes delimit the expression text, not a string value. A string value inside the expression text is therefore quoted again, with single quotes: `"'local'"`.

An expression with a constant result has only `else`:

```json
{"else": "true"}
```

The WebUI shows the same structure in an expression field: a list of conditions with their values, followed by a default value. It accepts the same text.

Durations inside expressions can be written with the units `d`, `h`, `m`, `s` and `ms`, as in `5m` or `'5m'`, and the server converts them to milliseconds. This is a convenience of expressions only. Plain duration fields take only integers. Sizes have no units, even in expressions, and are written as numbers of bytes.

## Validation and evaluation

An expression is compiled when it is saved, so most mistakes are caught before the expression ever runs. A syntax error, an unknown function, a wrong number of arguments, or a variable that is not available in the setting's context is refused at that point, with an error that names the field. As with other settings, a changed expression takes effect after a [settings reload](/docs/configuration/#applying-changes).

Errors that depend on runtime data cannot be caught when the expression is saved. A function can fail during evaluation, for example a DNS or SQL query that returns an error, or `sql_query` with a store that does not exist. The expression then logs an `eval.error` event at `debug` level, and produces no result. The setting behaves as if the expression were absent, which for most settings means its built-in default.

The in-memory store functions are an exception. For a store that does not exist, they return an empty value, without an event.

An expression that compiles can still compute the wrong value. The result of every evaluation is logged as an `eval.result` event at `trace` level. The way to check what an expression does is therefore to raise the level of these events on a [tracer](/docs/telemetry/tracing/), and observe the results for real traffic.

## Examples

The following examples show common uses. Each shows only the expression field of its object, not the whole object.

The following [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms) expression offers `PLAIN` and `LOGIN` only on TLS connections to ports other than 25, and no authentication elsewhere:

```json
{
  "saslMechanisms": {
    "match": {"0": {"if": "local_port != 25 && is_tls", "then": "[plain, login]"}},
    "else": "false"
  }
}
```

The following [`route`](/docs/ref/object/mta-outbound-strategy#route) expression delivers local recipients locally, sends messages that have failed more than once to a fallback route, and the rest to the recipients' MX hosts:

```json
{
  "route": {
    "match": {
      "0": {"if": "is_local_domain(rcpt_domain)", "then": "'local'"},
      "1": {"if": "retry_num > 1", "then": "'fallback'"}
    },
    "else": "'mx'"
  }
}
```

The following expression uses the capture groups of a regular expression to rewrite recipient addresses on listeners other than `smtp`, keeping only the local part and the top-level domain:

```json
{
  "rewrite": {
    "match": {
      "0": {"if": "listener != 'smtp' && matches('^([^.]+)@([^.]+)\\.(.+)$', rcpt)", "then": "$1 + '@' + $3"}
    },
    "else": "false"
  }
}
```

:::note
The backslash in the regular expression is doubled because the expression is shown inside a JSON document. In an expression field in the WebUI it is written once, as `\.`. See [escaping backslashes](/docs/configuration/expressions/functions#escaping-backslashes).
:::

The following expression classifies the answers of the MailSpike DNSBL by the last octet of the returned address:

```json
{
  "tag": {
    "match": {
      "0": {"if": "octets[0] != 127", "then": "false"},
      "1": {"if": "octets[3] == 10", "then": "'RBL_MAILSPIKE_WORST'"},
      "2": {"if": "octets[3] == 11", "then": "'RBL_MAILSPIKE_VERYBAD'"},
      "3": {"if": "octets[3] == 12", "then": "'RBL_MAILSPIKE_BAD'"},
      "4": {"if": "octets[3] >= 13 && octets[3] <= 16", "then": "'RWL_MAILSPIKE_NEUTRAL'"},
      "5": {"if": "octets[3] == 17", "then": "'RWL_MAILSPIKE_POSSIBLE'"},
      "6": {"if": "octets[3] == 18", "then": "'RWL_MAILSPIKE_GOOD'"},
      "7": {"if": "octets[3] == 19", "then": "'RWL_MAILSPIKE_VERYGOOD'"},
      "8": {"if": "octets[3] == 20", "then": "'RWL_MAILSPIKE_EXCELLENT'"}
    },
    "else": "false"
  }
}
```
