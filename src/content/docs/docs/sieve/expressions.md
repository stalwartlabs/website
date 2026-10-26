---
sidebar_position: 4
title: "Expressions"
description: "The vnd.stalwart.expressions extension: operators, literals, quoting rules and the eval, let and while instructions."
---

Standard Sieve can compare strings and test headers, but it cannot compute values. A script cannot count the links in a message, extract the domain of an address, or look up whether that domain has an MX record. The `vnd.stalwart.expressions` extension adds these abilities. It brings arithmetic, logical and comparison operations and a library of functions to Sieve, so that a script can derive values from the message and its environment, and branch on conditions the base language cannot express.

The syntax is not new. Expressions use the same syntax as the [configuration expressions](/docs/configuration/expressions/) of Stalwart, with the differences noted under [Functions](#functions), so an administrator who writes one already knows the other.

Expressions are evaluated by the `eval` test and by the `let` and `while` instructions. A script that uses them declares `vnd.stalwart.expressions` in its `require` statement. A script that uses `while` also declares `vnd.stalwart.while`.

## Operators

Expressions support three kinds of operator. Their precedence is given in [Operators](/docs/configuration/expressions/operators):

| Kind | Operators |
|---|---|
| Arithmetic | `+` (addition), `-` (subtraction), `*` (multiplication), `/` (division) |
| Logical | `&&` (AND), `\|\|` (OR), `^` (XOR), `!` (NOT) |
| Comparison | `==` (equal), `!=` (not equal), `>`, `<`, `>=`, `<=` |

Comparisons between different types follow a rule that can surprise. When a comparison mixes a string and a number, the string is converted to a number, and a string that is not a number counts as `0`. `'10' > 9` is therefore true, and so is `'abc' > -1`. Compare numbers with numbers and strings with strings to avoid such results.

The `+` operator is overloaded, which means that its meaning depends on its operands. When either operand is a string, it performs concatenation. When both are numbers, it performs addition. When either operand is an array, it concatenates arrays or appends the scalar. For example, `'user-' + env.remote_ip` builds a key from a literal and a variable, and `['Sender', envelope.from]` can be joined into a flat list with `['Sender'] + [envelope.from]`.

## Literals and indexing

Literals follow familiar conventions. String literals are delimited by single or double quotes. Integer and floating-point literals follow the usual decimal form. Array literals use square brackets: `[1, 2, 3]`, `['abuse@example.org', 'postmaster@example.org']`.

Array elements are accessed with square-bracket indexing, starting at zero. The result of a function call that returns an array can be indexed directly, as in the following lines, which split an address into its local part and domain:

```sieve
let "parts" "split_once(envelope.from, '@')";
let "local" "parts[0]";
let "domain" "parts[1]";
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=TY5BagJBEEWv0tTGBAaJ285GEHfuXDoSKj2lNvZUNV2lMchAzpXj5CTpUQR39Xn8X-8KZ_CzBhh7Ag9rw_SFxVwnQb1bXnIh1Sis7u_n162iUcGkDrlzkTu6RN5DAxpKzKbgN9fHUo-RRyKnEsacyFwLuW5rC_XSnKJ9CAd6IT5TkkzTXZG-cZP55LWF95bvlSQB061yK2_etk-wk_HPE53dKQzbBvqqjnsatWpSMqu2NVVHWWDGz1gVvhcHCkfwVk40DP8" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

## Literal text in `let` and `eval`

The most common mistake with expressions concerns quoting. The value assigned by `let`, and the argument of the `eval` test, is a Sieve string whose contents are parsed as an expression. A bare word inside that string is therefore read as a variable or function name. A script such as `let "prompt" "You are an assistant";` fails to compile with `Invalid variable or function name "You"`.

Literal text has to carry its own quotes inside the Sieve string, as in the following line:

```sieve
let "prompt" "'You are an assistant'";
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=NY09DsIwDEavYnnp0oU1jBUbGxOiDCa1SkT-lLilqKrEuTgOJyEZ2Pxkfe-tOKPatejJMSo8CdknJYEh6KzgsMTEOZvgM3zfHzga4UQWhBcB48GyAPkBeCaLLWadTJSM6rL-hY6Mr58wJV25LnqMKbgoPZazOYcJKHHxAJVUFvLS9LjvPW7XFl3p08hVWiiziPFjoVIIHUW6GWvk1d1ZP1BJmnjbfg" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Text spanning several lines uses the Sieve multi-line form, which opens with `text:` and closes with a line containing a single period. The quoted expression string spans the whole block. There is no triple-quote form, so the following layout is the way to write a multi-line literal:

```sieve
let "prompt" text:
"First line of the prompt.
Second line of the prompt."
.
;
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=bY47TgMxEIavMpp6hURryggqupQxxcQ7JKN4x5Y9uwStVuJcHIeTYIPSpfz0P1dc0D0OqDQxOtwbxQ8qBmMK1cHzNReuVZJW-Pn6hlcxLhTB-GogCpENSEfghSIOWEORbBXdYb0VTiTalTSX0LknPOaSpmwe_4qcV48vUqpBFGVI72Bnhn_Pg9c9h9Q27mnotRmevOL2NuDUrtKJ-36jymaip0btTNpRpqNEsc_dmcMFnZWZt-0X" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Two quoting layers are therefore involved: the Sieve string, and the expression string inside it. The delimiters are chosen as follows:

- A `text:` block is taken verbatim, with no backslash processing, so the quote character that delimits the expression string cannot appear inside it. Use `"..."` when the text contains apostrophes and `'...'` when it contains double quotes. A backslash does keep the string from ending early, but it remains part of the value: `'the email\'s subject'` evaluates to `the email\'s subject`.
- A Sieve quoted string translates `\n`, `\r`, and `\t` before the expression is parsed, so a short multi-line value fits on one line: `let "prompt" "'First line.\nSecond line.'";` assigns two lines. A quote of the other kind is written directly, and `\\` produces a single backslash.
- A line consisting of a single period closes a `text:` block. To carry such a line inside the text, double the period, and the interpreter removes the added one.

## Functions

Most of the power of expressions comes from their functions. These range from string and array manipulation to DNS, SQL and HTTP operations, which only the trusted interpreter may call. The [reference](/docs/sieve/reference) documents each function, its signature, and whether it is restricted to the [trusted interpreter](/docs/sieve/interpreter/trusted).

A few parts of the configuration expression language are missing from Sieve. The `system()` and `metric()` forms are not available in Sieve expressions, and neither is the `matches()` function. Regular expressions are tested in Sieve with the `:regex` match type of the regex extension instead.

## Using the `eval` test

The `eval` test brings expressions into Sieve's `if` statements. It evaluates the expression in its argument, and is true when the result is true, a non-zero number, or a non-empty string or array:

```sieve
if eval "expression_here" {
    # Actions performed when the expression evaluates to true
}
```

Every name in the expression has to resolve to an [environment or envelope variable](/docs/sieve/variables), to a variable assigned earlier in the script, or to a [function](/docs/sieve/reference). An unknown name is a compile-time error, so a misspelt variable is caught before the script ever runs. The following system script, run at the DATA stage, rejects a message whose body consists mostly of links:

```sieve
require ["variables", "vnd.stalwart.expressions", "reject"];

let "words" "count(tokenize(body.to_text, 'words'))";
let "urls"  "count(tokenize(body.to_text, 'url_strict'))";

if eval "words > 0 && (urls * 100) / words > 25" {
    reject "550 5.7.1 Your message is mostly links.";
    stop;
}
```

## Using the `let` instruction

The `let` instruction evaluates an expression and assigns the result to a variable. The following line stores the domain of the envelope sender, in lower case:

```sieve
let "from_domain" "to_lowercase(email_part(envelope.from, 'domain'))";
```

<!-- sievepad { "noCapabilityCheck": true, "envelopeFrom": "Alice@Example.COM" } -->
<p><a href="https://sievepad.com/#w=NY7NakIxEIVfJcxGhSB0m24sF7srXRRX3nJJ41SD-SMz_iEXfC4fp0_SSYvLbw7nzHeFI5gnDclGBAMfbMPJVlab7Mio5blUJPI5kfq53dWKfNoq3qEKyMon4npwLDFoIFd9YQKzvj7WovV_ST5U17iVeviuOQ6b3MIehDkPIZ-wOks4RTmHoYjCFNMRQy44bwWtJv-VyWzWw3OfYPzUEEXObrE9FSJkFj8hMcidLfbLB8-XboduD0ZcUcNj9VVGRekleIeL5dnGEnDevb_BOP4C" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Breaking a computation into named steps keeps scripts readable. Intermediate values computed with `let` can then be tested with `if eval`. The following system script rejects senders whose domain publishes no MX record:

```sieve
let "from_domain" "to_lowercase(email_part(envelope.from, 'domain'))";
let "mx_count"    "count(dns_query(from_domain, 'mx'))";
if eval "mx_count == 0" {
    reject "550 5.7.1 Your domain has no MX records.";
}
```

## Using the `while` instruction

Sieve has no loops over arbitrary data, which keeps user scripts safe. System scripts sometimes need one, and the `while` instruction provides it. It is available only to [system scripts](/docs/sieve/#two-interpreters), and executes a block repeatedly while its condition is true.

A loop whose condition never becomes false does not hang the server. It runs until the script reaches the interpreter's `maxCpuCycles` limit, at which point the script is aborted. The following loop adds ten headers:

```sieve
let "i" "10";
while "i > 0" {
    addheader :last "X-Header-${i}" "Counter is ${i}";
    let "i" "i - 1";
}
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=TU_BSsVADPyVEDy2YK_7wEsRvIvwwPWwbsNrsN0tm9SnlILf5ef4JaYtgjkEZpJMZhZ8R9dUmMJI6PBRw3ANRaHLURzcf0yFRDgngZ-vb3gSThfQnuDa80DASbTMUW0BK5RYeFJB97z86Y2B90meS9zwQAoe2aP15tbjyadDyUi4A2Ng8QmsQtf1FDoq4IYg29W5ftiJ-mbhdVdo85zUNljg4E7H7f8vDDU0-2T1CdeXCkdLFC60-TQkpGqhDJnp3IYpvPLA-tn2FN_QWTxa118" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Two instructions change the flow of a loop. The `break` instruction exits the loop and resumes execution after it:

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

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=TVDLasQwDPwVIXpMYHN12VMo9F4KhboHbaJuxDpOsJ19EAL9rn5Ov6Ry0tLqYDOj0YjRjGc0VYGeekaDT4nchUKCdmiigYfrGDhGGXyEr49PeI7ij5A6hksnjkF8TGFqkgqwwNgEGVNE8zr_-vUka2eYQpOx4wQWxaK-1c7ivfWbk0U1YuVn60Hrv1CghGrV5o68A5_Jrfx-D7u_mVyHwHT6US7bR23bMbUcwDiK2falfFyJ8m6WZV1RD5NPqpAIG6cWOo7LW4G9XoCOnHMpipySHkGRhhxqGukgTtKt7rg5ockpluUb" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `continue` instruction skips the rest of the current iteration and starts the next one:

```sieve
let "i" "10";
while "i > 0" {
    let "i" "i - 1";
    if eval "contains([1, 3, 5, 7, 9], i)" {
        continue;
    }
    addheader :last "X-Header-${i}" "Counter is ${i}";
}
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=TVDBSsUwEPyVZfGgkIJFRIzgpQjeRRBe3yGma7vYJiVJ31NKwe_yc_wSN62ie0iY2dkZdmc8oC4VOjMQanxIpj-akKDxNmq4exsDxcjeRfj6-ITHyK6F1BEcO-4J2MUUJptEgAqjDTymiHo3__oNhteOn4LNuKcENXKN8pbnNd7UbnMSEm5BGJhrB1L_lQwFlKs4d_gF6GB64a13SQLi6a5UcKHgUsGVguu9Aj77c8qVlewm-rFYts80TUemoQC6NzHnPRX3K1GczLys2ZWfXBIFR9g4sZBxXPYKB7mNaSlvLChSkoxWkKzvKzOaZ-45vVcd2VfUcihalm8" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->
