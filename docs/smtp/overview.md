---
sidebar_position: 1
---

# Overview

Stalwart SMTP offers a flexible configuration system through the use of rules. These rules, which consist of single or nested `if` blocks, provide system administrators the ability to tailor the server behavior based on contextual variables such as IP address, sender, recipient and more. Rules can be applied to most parameters of the configuration file and are represented using nested TOML structures containing `if`, `else`, `all-of`, `any-of` and `none-of` attributes. 

For example, a simple rule to enable the `CHUNKING` extension only for the IP address 10.0.0.25 would look like this:

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

## Syntax

In the Stalwart SMTP configuration file, a setting can either be specified as a static value or as a rule. A rule is comprised of a TOML array that includes one or multiple single or nested conditional blocks, followed by an `else` block. The [ABNF](https://en.wikipedia.org/wiki/Augmented_Backus%E2%80%93Naur_form) (Augmented Backus-Naur Form) representation of a setting can be expressed as follows:

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

## Variables

Each `if` block within a rule evaluates a specific context variable. The available context variables for evaluation vary depending on the setting and can include:

- `remote-ip`: The IP address of the client for inbound sessions and the remote server's IP address for outbound sessions.
- `local-ip`: The local server's IP address used in an outbound connection (available only when a source IP is specified).
- `listener`: The listener ID where the connection was initiated for inbound sessions.
- `sender`: The return path address specified in the MAIL FROM command for inbound sessions and the sender's address for outbound sessions.
- `sender-domain`: The return path domain name specified in the MAIL FROM command for inbound sessions and the sender's domain name for outbound sessions.
- `rcpt`: The recipient's address.
- `rcpt-domain`: The recipient's domain name.
- `priority`: The priority provided using the MT-PRIORITY extension.
- `authenticated-as`: The account name used to authenticate the session for inbound sessions, or an empty value if the session is unauthenticated.
- `mx`: The remote mail exchanger's hostname for outbound sessions.

## Value comparators

Comparators are functions that evaluate the contents of a variable against a specified value and return a boolean result. The following value comparators are available:

- `eq` / `ne`: Tests for equality / non-equality of the value.
- `starts-with` / `not-starts-with`: Tests whether a string starts with / does not start with a specified value.
- `ends-with` / `not-ends-with`: Tests whether a string ends with / does not end with a specified value.
- `in-list` / `not-in-list`: Tests whether a value is present / not present in a [directory](/docs/directory/overview).
- `matches` / `not-matches`: Tests whether a value matches a regular expression / does not match a regular expression.

### Lists

The `in-list` and `not-in-list` comparators determine if the value contained in the variable is present or absent in the specified directory. The expected syntax for this comparator is `<directory_name>/<lookup_name>` where `<directory_name>` is the name of the directory and `<lookup_name>` is the name of the lookup. For example, `sql/domains` would execute the `domains` query in the `sql` directory.
More details on the use of directories can be found below in the [lookups](#lookups) section.

### Strings

Variables such as `sender` or `rcpt` that contain string values can be evaluated using any of the value comparators, for instance:

```toml
max-recipients = [ { if = "sender", matches = "^(.+)@(.+)$", then = 20 },
                   { if = "authenticated-as", starts-with = "john@", then = 1000 },
                   { if = "sender-domain", in-list = "db/postgresql/paid_clients", then = 5000 },
                   { else = 5 } ]
```

### Integers

Variables such as `priority` that contain integer values can be evaluated only using the equality or list comparators, for instance:

```toml
expire = [ { if = "priority", eq = "1", then = "5d" },
           { if = "priority", in-list = "list/low_priorities", then = "1d" },
           { else = "3d" } ]
```

### IP Addresses

Variables such as `remote-ip` or `local-ip` that contain IP addresses can be evaluated using the equality or list comparators. 
When using the equality comparator, IP ranges may be specified using [CIDR notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation), for instance:

```toml
notify = [ { if = "remote-ip", eq = "198.51.100.0/22", then = ["1d", "2d", "3d"] },
           { if = "remote-ip", in-list = "list/lmtp_hosts", then = ["30d"] },
           { if = "local-ip", ne = "2001:db8::/48", then = ["4d"] },
           { else = ["5d", "6d"] } ]
```

## Logical comparators

Logical comparators enable the evaluation of one or multiple conditions using boolean operations such as `AND,` `OR,` and `NOT.` The following logical comparators are available:

- `all-of`: Represents the `AND` operation and returns true only when all conditions return true.
- `any-of`: Represents the `OR` operation and returns true if any of the conditions return true.
- `none-of`: Represents the `NOT` operation and returns true if none of the conditions return true.

These logical comparators are represented as TOML arrays that contain the conditions to be evaluated, for example:

```toml
.. [ { any-of = [ { if = "authenticated-as", ne = "john@foobar.org" },
                  { if = "rcpt-domain", eq = "example.org" },
                  { if = "mx", starts-with = "mx.some" } ], then = .. 

.. [ { all-of = [ { any-of = [
                      { if = "authenticated-as", ne = "john@foobar.org" },
                      { if = "rcpt-domain", eq = "example.org" },
                      { if = "mx", starts-with = "mx.some" },
                  ] },
                  { all-of = [
                      { if = "rcpt-domain", eq = "example.org" },
                      { if = "listener", eq = "smtp" },
                      { if = "mx", starts-with = "mx.some" }
                  ] },
                  { none-of = [
                      { if = "rcpt-domain", eq = "example.org" },
                      { if = "listener", eq = "smtp" },
                      { if = "mx", starts-with = "mx.some" }
                  ] }
              ] }, then = ..
```

## Lookups

Lookups allow the evaluation of queries against a [SQL database](/docs/directory/types/sql#custom-lookup-queries), [LDAP directory](/docs/directory/types/ldap#custom-lookup-queries) or [local lists](/docs/directory/types/memory#custom-lookup-lists). Lookups are useful for validating recipients, authenticating accounts, verifying addresses, expanding mailing lists or checking the presence of a value in a table. 
Queries and lists are defined under the `directory.<name>.lookup.<lookup_name>` section of the configuration file, where `<name>` is the identifier of the directory and `<lookup_name>` is the name of the lookup. To reference a lookup from a rule, use the `in-list = "<name>/<lookup_name>"` comparator to check if a value is contained in the lookup list.

For example, the following configuration defines a lookup named `trusted_ips` that checks if the remote IP address is present in the `trusted_ips` table of a mySQL database:

```toml
[directory."mysql".lookup]
trusted_ips = "SELECT 1 FROM trusted_ips WHERE address=? LIMIT 1"

[session.rcpt]
relay = [ { any-of = [ { if = "remote-ip", in-list = "mysql/trusted_ips" },
                       { if = "authenticated-as", ne = "" }], then = true }, 
          { else = false } ]
```

Lookup lists can also be defined in the configuration file using the `memory` directory type under the `directory.<name>.lookup.<lookup_name>` section. For example:

```toml
[directory."lists"]
type = "memory"

[directory."lists".lookup]
can_vrfy = ["john@example.org", "jane@example.org"]

[session.extensions]
vrfy = [ { if = "authenticated-as", in-list = "lists/can_vrfy", then = true},
        { else = false } ]

```

