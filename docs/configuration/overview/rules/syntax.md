---
sidebar_position: 1
---

# Syntax

Stalwart Mail Server offers a flexible configuration system through the use of rules. These rules, which consist of single or nested `if` blocks, provide system administrators the ability to tailor the server behavior based on contextual variables such as IP address, sender, recipient and more. Rules can be applied to most parameters of the configuration file and are represented using nested TOML structures containing `if`, `else`, `all-of`, `any-of` and `none-of` attributes. 

A rule is comprised of a TOML array that includes one or multiple single or nested conditional blocks, followed by an `else` block. Each `if` block within a rule evaluates a specific [context variable](/docs/configuration/overview/variables) using a [comparator](/docs/configuration/overview/rules/comparators). If the condition is met, the `then` block is executed. If the condition is not met, the `else` block is executed. is not met.

## ABNF

The [ABNF](https://en.wikipedia.org/wiki/Augmented_Backus%E2%80%93Naur_form) (Augmented Backus-Naur Form) representation of a setting can be expressed as follows:

```abnf
SETTING        = <string> "=" (VALUE / RULE)
RULE           = "[" (1*CONDITION) "," THEN_BLOCK "]"
IF_BLOCK       = "{" "if" "=" VARIABLE "," COMPARATOR "=" CMP_VALUE "," "then" "=" VALUE "}"
THEN_BLOCK     = "{" "then" "=" VALUE } 
ALL_OF_BLOCK   = "{" "all-of" "=" "[" 1*CONDITION "]" "}"
ANY_OF_BLOCK   = "{" "any-of" "=" "[" 1*CONDITION "]" "}"
NONE_OF_BLOCK  = "{" "none-of" "=" "[" 1*CONDITION "]" "}"
CONDITION      = IF_BLOCK / ALL_OF_BLOCK / ANY_OF_BLOCK / NONE_OF_BLOCK

VARIABLE       = <string>
COMPARATOR     = "eq" / "ne" / "starts-with" / "not-starts-with" / "ends-with" / 
                 "not-ends-with" "in-list" / "not-in-list" / "matches" / "not-matches" 
CMP_VALUE      = <string> / <number> / IP_CIDR
IP_CIDR        = <ip_address> ["/" <integer>]
VALUE          = <string> / <number> / <array> / <duration>
```


## Example

A simple rule to enable the `CHUNKING` extension only for the IP address 10.0.0.25 would look like this:

```toml
chunking = [ { if = "remote-ip", eq = "10.0.0.25", then = true},
             { else = false } ]
```

Or, an example of a complex rule that combines nested conditions using the `all-of`, `any-of` and `none-of` operands could look like this:

```toml
chunking = [ { any-of = [ { if = "rcpt-domain", eq = "example.org" },
                          { if = "remote-ip", eq = "192.168.0.0/24" },
                          { all-of = [
                              { if = "rcpt", starts-with = "no-reply@" },
                              { if = "sender", ends-with = "@domain.org" },
                              { none-of = [
                                  { if = "priority", eq = 1 },
                                  { if = "priority", ne = -2 },
                              ]}
                          ]}
                        ], then = false },
              { else = true } ]
```

The use of rules in the configuration file is optional though, static values can also be assigned to settings, for example:

```toml
chunking = true
```
