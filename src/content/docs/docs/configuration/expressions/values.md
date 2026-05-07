---
sidebar_position: 4
title: "Values"
---

Values produced by an expression can be assembled from literal strings and numbers, from [context variables](/docs/configuration/variables), and from the capture groups of a preceding regular-expression match. Three substitution mechanisms are available: context variable references, positional capture groups, and string concatenation with the `+` operator.

## Literals

String literals are delimited by single or double quotes: `'local'`, `"fallback"`. The two forms are equivalent; single quotes avoid the need to escape the surrounding JSON double quotes when the expression is stored in a JSON document, as is the case in every reference object that accepts an expression.

Integer literals are written as decimal digits (`25`, `0`, `-1`). Floating-point literals use a decimal point (`1.26`, `-3.14`). Boolean literals are the bare words `true` and `false`.

Array literals use square brackets and comma-separated elements: `[plain, login]`, `['abuse@example.org', 'postmaster@example.org']`. Array elements may themselves be expressions.

## Context variables

Context variables are referenced by name, without any sigil. The set of available variables depends on the component evaluating the expression; [Variables](/docs/configuration/variables) lists them per context. A variable reference may appear anywhere a value is expected, including inside function arguments and concatenations:

```json
{"else": "'sql_' + listener"}
```

At runtime, `listener` is replaced with the identifier of the listener accepting the current connection (for example `smtp` or `submission`), producing values such as `'sql_smtp'` or `'sql_submission'`.

## Positional variables

Positional variables refer to data matched by a [regular expression](/docs/configuration/expressions/functions#matches). They are written as `$n`, where `n` is the index of the capture group. `$0` holds the entire matched string; `$1`, `$2`, and so on hold the individual groups. The capture groups populated by the most recent `matches(...)` call in the `if` branch are available in the corresponding `then` branch.

For example, rewriting a recipient address by extracting the local part and the top-level domain:

```json
{
  "rewrite": {
    "match": [
      {"if": "listener != 'smtp' && matches('^([^.]+)@([^.]+)\\.(.+)$', rcpt)", "then": "$1 + '@' + $3"}
    ],
    "else": "false"
  }
}
```

At runtime, `$1` and `$3` are replaced by the first and third capture groups of the regex match.

## Composition

The `+` operator concatenates strings and joins them with numeric values by converting the number to its string form. The following expression returns a tag such as `'tls-submission-10'` built from three context variables:

```json
{"else": "if_then(is_tls, 'tls', 'plain') + '-' + listener + '-' + retry_num"}
```

Arrays can be composed with the same operator, producing the concatenation of their elements: `['alice@example.org'] + recipients` prepends a fixed address to the recipient list.
