---
sidebar_position: 4
title: "Values"
description: "Literal values, variables, capture groups and string composition in expressions."
---

Every expression ends in a value: the route a message takes, the tag a rule adds, the address a recipient is rewritten to. These values are assembled from three sources. Literal strings and numbers are written into the expression itself. [Context variables](/docs/configuration/variables) supply the data of the current operation. The capture groups of a preceding regular expression match supply parts of a string that the expression has examined. This page describes each source, and how they are combined.

## Literals

String literals are delimited by single or double quotes: `'local'`, `"fallback"`. The two forms are equivalent. Single quotes are easier to use, however, because expressions are stored as JSON strings, where a double quote would have to be escaped.

Numbers and booleans are written without quotes. Integer literals are written as decimal digits (`25`, `0`, `-1`), and floating-point literals use a decimal point (`1.26`, `-3.14`). Boolean literals are the bare words `true` and `false`.

Array literals use square brackets, with the elements separated by commas: `[plain, login]`, `['abuse@example.org', 'postmaster@example.org']`. Array elements may themselves be expressions.

## Context variables

Context variables are referenced by name, without any prefix. Which variables are available depends on the setting that evaluates the expression, and [Variables](/docs/configuration/variables) lists them per context. A variable reference may appear anywhere a value is expected, including inside function arguments and concatenations. The following expression builds a store name from a variable:

```json
{"else": "'sql_' + listener"}
```

At runtime, `listener` is replaced with the name of the listener that accepted the current connection, for example `smtp` or `submission`. The expression therefore produces values such as `'sql_smtp'` or `'sql_submission'`.

## Positional variables

A regular expression can do more than test a string: its capture groups, the parts of the pattern in parentheses, pick out pieces of the string. Positional variables give access to these pieces after a [regular expression](/docs/configuration/expressions/functions#matches) has matched.

Positional variables are written as `$n`, where `n` is the index of the capture group. `$0` holds the entire matched string, and `$1`, `$2` and so on hold the individual groups. The groups come from the most recent `matches(...)` call in an `if` condition, and they are available in the `then` value of the same condition.

The following expression rewrites a recipient address to its local part and its top-level domain:

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

At runtime, `$1` and `$3` are replaced by the first and third capture groups of the match.

:::note
The backslash in the regular expression is doubled because the expression is shown inside a JSON document. In an expression field in the WebUI it is written once, as `\.`. See [escaping backslashes](/docs/configuration/expressions/functions#escaping-backslashes).
:::

## Composition

The `+` operator concatenates strings. When one operand is a number, it converts the number to its string form first. The following expression, in an SMTP session context, returns a tag such as `'tls-submission-465'`, built from three context variables:

```json
{"else": "if_then(is_tls, 'tls', 'plain') + '-' + listener + '-' + local_port"}
```

Arrays are joined with the same operator, which concatenates their elements. `['alice@example.org'] + recipients`, for example, prepends a fixed address to the recipient list.
