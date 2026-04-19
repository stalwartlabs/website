---
sidebar_position: 4
---

# Values

Values produced by an expression can be assembled from literal strings, context variables, and regex capture groups. Two substitution mechanisms are available: positional variables from a regex match, and references to context variables.

## Positional variables

Positional variables refer to data matched by a regular expression. They are written as `$n`, where `n` is the index of the capture group. `$0` holds the entire matched string; `$1`, `$2`, and so on hold the individual groups. For example, rewriting a recipient address by extracting the local part and the top-level domain:

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

## Context variables

Values can also be assembled from [context variables](/docs/configuration/variables) such as `remote_ip`, `local_ip`, or `listener`. The variable name is referenced directly inside the expression string. For example, selecting a directory whose identifier depends on the active listener:

```json
{"else": "'sql_' + listener"}
```

At runtime, `listener` is replaced with the identifier of the listener accepting the current connection (for example `smtp` or `submission`), producing values such as `'sql_smtp'` or `'sql_submission'`.
