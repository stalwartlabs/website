---
sidebar_position: 1
---

# Overview

Expressions in Stalwart Mail Server allow administrators to define complex, dynamic criteria for evaluating and handling email messages based on various attributes of the emails themselves and contextual variables such as IP address, sender, recipient and more. These expressions enable fine-grained control over mail routing, filtering, and processing rules, making them a powerful tool for customizing mail server behavior. Expressions can be applied to most parameters of the configuration file and and also used from [Sieve scripts](/docs/sieve/overview). 

In the configuration file, Expressions are specified within a TOML array that includes one or multiple conditional `if` blocks, followed by an `else` block. Each `if` block evaluates an expression that references one or multiple [context variables](/docs/configuration/variables). If the condition is met, the `then` block is executed. If the condition is not met, the `else` block is executed.

## Syntax

An expression is a logical statement that evaluates to either `true` or `false`. In Stalwart Mail Server, expressions can be used to apply specific actions or rules when certain conditions are met. They consist of operands (such as `rcpt_domain`, `remote_ip`, `sender`, etc) and operators (such as =, |, &, and !) that define the relationships and logic between these operands. Expressions can also be used to generate [dynamic values](/docs/configuration/expressions/values) that adapt to the context of the server operation.

The syntax for expressions in Stalwart Mail Server is designed to be intuitive and readable. Expressions consist of the following components:

- **Operands**: Represent the elements being evaluated. These can be attributes of the email or the [environment variables](/docs/configuration/variables), such as `rcpt_domain` (recipient's domain), `remote_ip` (IP address of the sending server), `rcpt` (recipient email address), `sender` (sender's email address) and others.
- **Operators**: Define the type of operation or comparison being performed. 
- **Functions**: Perform specific operations on one or more operands (parameters).

## Example

A simple expression to enable the `CHUNKING` extension only for the IP address 192.0.2.1 would look like this:

```toml
chunking = [ { if = "remote_ip == '192.0.2.1'", then = true},
             { else = false } ]
```

Or, an example of a complex expression that combines nested operations could look like this:

```toml
chunking = [ { if = "rcpt_domain == 'example.org' || 
                     starts_with(remote_ip, '192.0.2.') || 
                     ( starts_with(rcpt, 'no-reply@') && 
                       ends_with(sender, '@example.org') && 
                       !(priority = 1 || priority = -2)
                     )", then = false},
             { else = true } ]
```

The use of expressions in the configuration file is optional though, static values can also be assigned to settings, for example:

```toml
chunking = true
```
