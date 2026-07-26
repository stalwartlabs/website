---
sidebar_position: 4
title: "Expressions"
---

The expression extension introduces the ability to evaluate arithmetic, logical, and comparison operations within Sieve scripts. This is useful for computing values from the current message and environment, and for controlling the flow of a script based on conditions that the base Sieve language cannot express.

Expressions can be evaluated using the `eval` test and the `let` and `while` instructions. In order to use these features, the `vnd.stalwart.expressions` extension must be declared in the script's `require` statement.

## Operators

The expression extension supports the following operators:

**Arithmetic:** `+` (addition), `-` (subtraction), `*` (multiplication), `/` (division).

**Logical:** `&&` (AND), `||` (OR), `^` (XOR), `!` (NOT).

**Comparison:** `==` (equal), `!=` (not equal), `>`, `<`, `>=`, `<=`.

When working with logical and comparison operators, the operands must have compatible types. Comparing a string to a number with `>` or `<` does not raise a runtime error, but the ordering reflects the string representation of the number rather than its numeric value. Keeping the operands of a comparison consistent (both numeric, or both strings) avoids surprising behaviour.

The `+` operator is overloaded: when either operand is a string it performs concatenation, when both are numbers it performs addition, and when either operand is an array it concatenates arrays or appends the scalar. For example, `'user-' + env.remote_ip` builds a key from a literal and a variable, and `['Sender', envelope.from]` can be joined into a flat list with `['Sender'] + [envelope.from]`.

## Literals and indexing

String literals are delimited by single or double quotes. Integer and floating-point literals follow the usual decimal form. Array literals use square brackets: `[1, 2, 3]`, `['abuse@example.org', 'postmaster@example.org']`.

Array elements are accessed with square-bracket indexing, starting at zero. The result of a function call that returns an array can be indexed directly:

```sieve
let "parts" "split_once(envelope.from, '@')";
let "local" "parts[0]";
let "domain" "parts[1]";
```

## Literal text in `let` and `eval`

The value assigned by `let`, and the argument of the `eval` test, is a Sieve string whose contents are parsed as an expression. A bare word inside that string is therefore read as a variable or function name rather than as text, and a script such as `let "prompt" "You are an assistant";` fails to compile with `Invalid variable or function name "You"`. Literal text has to carry its own quotes inside the Sieve string:

```sieve
let "prompt" "'You are an assistant'";
```

Text spanning several lines uses the Sieve multi-line form, which opens with `text:` and closes with a line containing a single period. The quoted expression string spans the whole block. There is no triple-quote form:

```sieve
let "prompt" text:
"First line of the prompt.
Second line of the prompt."
.
;
```

Two quoting layers are involved, so the delimiters are worth choosing with care:

- A `text:` block is taken verbatim, with no backslash processing, so the quote character that delimits the expression string cannot appear inside it. Use `"..."` when the text contains apostrophes and `'...'` when it contains double quotes. A backslash does keep the string from ending early, but it remains part of the value: `'the email\'s subject'` evaluates to `the email\'s subject`.
- A Sieve quoted string translates `\n`, `\r`, and `\t` before the expression is parsed, so a short multi-line value fits on one line: `let "prompt" "'First line.\nSecond line.'";` assigns two lines. A quote of the other kind is written directly, and `\\` produces a single backslash.
- A line consisting of a single period closes a `text:` block. To carry such a line inside the text, double the period; the interpreter removes the added one.

## Functions

A large set of functions is available from expressions. These range from pure string and array manipulation to DNS, SQL, and HTTP operations that the trusted interpreter can call during message processing. The [reference](/docs/sieve/reference) documents each function, its signature, and whether it is restricted to the [trusted interpreter](/docs/sieve/interpreter/trusted).

The `system()` and `metric()` forms available in the [configuration expression language](/docs/configuration/expressions/) are **not** available from Sieve expressions; those forms are specific to the configuration layer. Similarly, the Sieve regex extension provides the `:regex` and `:matches` match-type modifiers on tests, rather than a `matches()` function.

## Using the `eval` test

The `eval` test evaluates the expression within the quotes and returns a boolean value.

```sieve
if eval "expression_here" {
    # Actions performed when the expression evaluates to true
}
```

Every name in the expression has to resolve to a [variable](/docs/sieve/variables), to a variable assigned earlier in the script, or to a [function](/docs/sieve/reference); an unknown name is a compile-time error. For example, rejecting a message whose body is mostly links:

```sieve
require ["variables", "vnd.stalwart.expressions", "reject"];

let "words" "count(tokenize(body.to_text, 'words'))";
let "urls"  "count(tokenize(body.to_text, 'url_strict'))";

if eval "words > 0 && (urls * 100) / words > 25" {
    reject "Your message is mostly links.";
    stop;
}
```

## Using the `let` instruction

The `let` instruction evaluates an expression and assigns the result to a variable.

```sieve
let "from_domain" "to_lowercase(email_part(envelope.from, 'domain'))";
```

A common pattern is to compute several intermediate values with `let` and then branch on them with `if eval`:

```sieve
let "from_domain" "to_lowercase(email_part(envelope.from, 'domain'))";
let "mx_count"    "count(dns_query(from_domain, 'mx'))";
if eval "mx_count == 0" {
    reject "Your domain has no MX records.";
}
```

## Using the `while` instruction

The `while` instruction, available only from the [trusted interpreter](/docs/sieve/interpreter/trusted), executes a block of code repeatedly while a given condition is true. The `vnd.stalwart.while` extension must be declared in the script's `require` statement. The expression must eventually evaluate to false to avoid infinite loops; the `maxCpuCycles` limit on the interpreter provides a final safety net.

```sieve
let "i" "10";
while "i > 0" {
    addheader :last "X-Header-${i}" "Counter is ${i}";
    let "i" "i - 1";
}
```

A `while` loop can be terminated by the `break` instruction, which exits the loop and resumes execution after it:

```sieve
let "i" "10";
while "true" {
    let "i" "i - 1";
    if eval "i == 0" {
        break;
    }
    addheader :last "X-Header-${i}" "Counter is ${i}";
}
```

The `continue` instruction skips the rest of the current iteration and starts the next one:

```sieve
let "i" "10";
while "true" {
    let "i" "i - 1";
    if eval "contains([1, 3, 5, 7, 9], i)" {
        continue;
    }
    addheader :last "X-Header-${i}" "Counter is ${i}";
}
```
