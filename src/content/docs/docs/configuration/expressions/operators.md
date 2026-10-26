---
sidebar_position: 2
title: "Operators"
description: "The arithmetic, logical and comparison operators of expressions and their precedence."
---

Conditions and values in expressions are rarely a single variable. A condition usually compares a variable with a value, or combines several tests, and a value is often built from several parts. Operators do this work: arithmetic operators compute and concatenate, comparison operators test, and logical operators combine the tests. This page lists the operators, explains how values of different types are treated, and gives the order in which operators are applied.

## Arithmetic

The arithmetic operators work on numbers, and `+` also on strings and arrays:

| Operator | Meaning |
|---|---|
| `+` | Addition, or string and array concatenation when either operand is not a number. |
| `-` | Subtraction, or unary negation at the start of a subexpression. |
| `*` | Multiplication. |
| `/` | Division. |

Because `+` also concatenates, it is the common way to build identifiers and addresses from context variables. Examples are `'sql_' + listener` and `'postmaster@' + system('domain')`.

## Logical

The logical operators combine conditions. Each has a symbolic form, and some accept a shorter synonym:

| Operator | Meaning |
|---|---|
| `&&` | Logical AND. `&` is accepted as a synonym. |
| <code>&#124;&#124;</code> | Logical OR. <code>&#124;</code> is accepted as a synonym. |
| `^` | Logical XOR. |
| `!` | Logical NOT, written before its operand. |

A value that is not a boolean is converted when it is used in a logical context. The empty string, an empty array, `0` and `0.0` are treated as false, and every other value as true.

## Comparison

The comparison operators compare two values and produce a boolean:

| Operator | Meaning |
|---|---|
| `==` | Equal. `=` is accepted as a synonym. |
| `!=` | Not equal. |
| `>` | Greater than. |
| `<` | Less than. |
| `>=` | Greater than or equal. `=>` is accepted as a synonym. |
| `<=` | Less than or equal. `=<` is accepted as a synonym. |

Operands must be of compatible types, although a mismatch raises no error, and that makes mismatches easy to miss. When a string is compared with a number, the string is parsed as a number, and a string that is not a number counts as `0`. A comparison such as `sender == 0` is therefore true for every sender that is not numeric. Compare numbers with numbers, and strings with strings.

## Precedence

When an expression contains several operators without parentheses, they are applied in the following order, from highest precedence to lowest:

1. Unary `!` and unary `-`.
2. `*`, `/`.
3. `+`, `-`.
4. `>`, `<`, `>=`, `<=`.
5. `==`, `!=`.
6. `^`.
7. `&&`.
8. `||`.

Parentheses override precedence, as in the following condition:

```text
(retry_num > 3 || notify_num > 1) && is_local_domain(rcpt_domain)
```

Without the parentheses, `&&` would bind tighter than `||`, and the condition would mean `retry_num > 3 || (notify_num > 1 && is_local_domain(rcpt_domain))`.
