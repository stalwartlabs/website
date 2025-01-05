---
sidebar_position: 1
---

# Overview

Expressions in Stalwart Mail Server provide a powerful, flexible, and dynamic way to configure and control various aspects of the mail server based on context. These expressions enable administrators to define conditional logic that evaluates variables, manipulates data, and returns results in the form of booleans, strings, numbers, or arrays. Think of expressions as small programs that evaluate conditions and produce results. These results can control various aspects of the mail server's behavior, from deciding whether to accept connections to determining how to route messages.

Stalwart Mail Server compiles these expressions into optimized bytecode, ensuring that they are executed with high performance and minimal memory usage. Expressions are used extensively across the server’s configuration, enabling precise customization for routing, authentication, spam filtering, and more.

## Core Concepts

An expression consists of the following components:

- [Variables](/docs/configuration/variables): Variables are contextual data points provided by the mail server component evaluating the expression. For instance, variables like `remote_ip`, `url_path`, `rcpt`, or `retry_num` might be available in different contexts, depending on where the expression is used.
- [Functions](/docs/configuration/expressions/functions): A rich library of functions is available to manipulate variables and perform logic. These functions include string operations (`starts_with`, `contains`), numerical comparisons, regex matching (`matches`), and more.
- **Values**: Expressions manipulate values that can be booleans (`true` or `false`), strings (e.g., `'local'`, `'fallback'`), numbers (e.g., `25`, `1.26`) or arrays (combinations of the mentioned types).
- **Operators**: Mathematical and logical operations that combine values.
- **Conditional Logic**: Multiple expressions can be combined using `if` and `else` clauses to define conditional behavior. The `if` clause specifies the condition to evaluate, while the `then` clause provides the result if the condition is true. An `else` clause specifies the result if no conditions are met.

Expressions can return several types of values:

- **Boolean**: true/false values for conditional decisions.
- **String**: Text values for configuration settings or transformations.
- **Number**: Numerical values for thresholds or calculations.
- **Arrays**: Lists of values when multiple items are needed.

## Writing Expressions

### Basic Syntax

Expressions use a familiar programming-style syntax. They can be as simple as a single comparison or as complex as a multi-step evaluation. They are defined in configuration files, and their syntax follows a structured approach:

```toml
[component.section]
key = [ 
    { if = "condition", then = "value_if_true" },
    { if = "condition_2", then = "value_if_true" },
    { else = "value_if_false" }
]
```

Expressions can chain multiple conditions to handle different scenarios and each condition is evaluated sequentially until one matches. Expressions usually consist of one or more conditional blocks, each with an `if` clause that evaluates a condition and a `then` clause that specifies the result if the condition is true. If no conditions match, the `else` clause is executed.

For example, the expression bellow allows access to HTTP endpoints if the IP starts with `192.180.1.` or the path contains specific filenames:

```toml
[server.http]
allowed-endpoint = [ 
    { if = "starts_with(remote_ip, '192.180.1.') || contains(['robots.txt', '.well-known'], split(url_path, '/')[1])", 
      then = "200" },
    { else = "400" }
]
```

For simple expressions, the `if`/`then` and `else` blocks can be omitted, and a single value can be assigned directly, as shown below:

```toml
[session.data]
chunking = "remote_ip == '192.0.2.1'"
```

In this example, the `chunking` setting is assigned based on the condition that the `remote_ip` is equal to `192.0.2.1`.

### Variables

[Variables](/docs/configuration/variables) represent contextual information available to the expression. The exact variables available depend on where the expression is being evaluated. Common examples include:

- `remote_ip`: The IP address of the connecting client
- `local_port`: The port number the server is listening on
- `url_path`: The path component of a URL in HTTP contexts
- `subject`: The email subject in message processing contexts

### Functions

[Functions](/docs/configuration/expressions/functions) provide powerful capabilities for manipulating values. Some common functions include:

- `starts_with(string, prefix)`: Checks if a string starts with a given prefix
- `contains(array, value)`: Checks if an array contains a specific value
- `matches(pattern, string)`: Performs regular expression matching
- `split(string, separator)`: Splits a string into an array

### Operators

[Operators](/docs/configuration/expressions/operators) are used to combine values and perform logical or mathematical operations. Common operators include:

- **Arithmetic**: `+`, `-`, `*`, `/`
- **Logical**: `&&` (AND), `||` (OR), `!` (NOT), '^' (XOR)
- **Comparison**: `>`, `<`, `==`, `!=`, `>=`, `<=`

### Control Flow

Expressions support conditional logic through if/then/else constructs. These are typically configured as arrays of conditions:

```toml
[some.configuration]
setting = [
    { if = "condition1", then = "result1" },
    { if = "condition2", then = "result2" },
    { else = "default_result" }
]
```

The use of expressions in the configuration file is optional though, static values can also be assigned to settings, for example:

```toml
setting = true
```

## Examples

The following examples demonstrate how expressions can be used in different contexts to control the behavior of the mail server:

```toml
[session.auth]
mechanisms = [ { if = "local_port != 25 && is_tls", then = "[plain, login]"},
               { else = false } ]

[session.mail]
rewrite = [ { if = "listener != 'smtp' & matches('^([^.]+)@([^.]+)\.(.+)$', rcpt)", then = "$1 + '@' + $3" },
            { else = false } ]

[queue.outbound]
next-hop = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
             { if = "retry_num > 1", then = "'fallback'" }, 
             { else = false } ]

[queue.outbound.tls]
allow-invalid-certs = [ { if = "retry_num > 0 && last_error == 'tls'", then = true},
                        { else = false } ]
starttls = [ { if = "retry_num > 1 && last_error == 'tls'", then = "disable"},
             { else = "require" } ]

[spam-filter.dnsbl.server.STWT_RBL_MAILSPIKE_IP]
enable = true
zone = [ { if = "location == 'tcp'", then = "ip_reverse + '.rep.mailspike.net'" },
		{ else = false } ]
tag = [ { if = "octets[0] != 127", then = "false" },
        { if = "octets[3] == 10", then = "'RBL_MAILSPIKE_WORST'" },
        { if = "octets[3] == 11", then = "'RBL_MAILSPIKE_VERYBAD'" },
        { if = "octets[3] == 12", then = "'RBL_MAILSPIKE_BAD'" },
        { if = "octets[3] >= 13 && octets[3] <= 16", then = "'RWL_MAILSPIKE_NEUTRAL'" },
        { if = "octets[3] == 17", then = "'RWL_MAILSPIKE_POSSIBLE'" },
        { if = "octets[3] == 18", then = "'RWL_MAILSPIKE_GOOD'" },
        { if = "octets[3] == 19", then = "'RWL_MAILSPIKE_VERYGOOD'" },
        { if = "octets[3] == 20", then = "'RWL_MAILSPIKE_EXCELLENT'" },
		{ else = false } ]
scope = "ip"

[spam-filter.rule.STWT_FAKE_REPLY]
enable = true
scope = "any"
priority = 24
condition = [ { if = "contains_ignore_case(['re', 'aw', 'antw', 'sv'], split_once(subject, ':')[0]) && !$X_HDR_IN_REPLY_TO && !$X_HDR_REFERENCES", then = "'FAKE_REPLY'" },
			  { else = false } ]

[spam-filter.rule.STWT_FREE_OR_DISP]
enable = true
scope = "email"
priority = 63
condition = [ { if = "!contains(['env_from', 'from', 'reply_to', 'to', 'cc', 'bcc', 'dnt'], location) || is_empty(sld)", then = "false" },
			  { if = "key_exists('freemail-providers', sld)", then = "'FREEMAIL_' + to_uppercase(location)" },
			  { if = "key_exists('disposable-providers', sld)", then = "'DISPOSABLE_' + to_uppercase(location)" },
			  { else = false } ]
```

