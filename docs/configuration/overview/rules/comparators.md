---
sidebar_position: 2
---

# Comparators

Comparators are functions that evaluate the contents of a variable against a specified value and return a boolean result. The following value comparators are available:

- `eq` / `ne`: Tests for equality / non-equality of the value.
- `starts-with` / `not-starts-with`: Tests whether a string starts with / does not start with a specified value.
- `ends-with` / `not-ends-with`: Tests whether a string ends with / does not end with a specified value.
- `in-list` / `not-in-list`: Tests whether a value is present / not present in a [directory](/docs/directory/overview).
- `matches` / `not-matches`: Tests whether a value matches a regular expression / does not match a regular expression.

## Lookup Lists

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

## Strings

Variables such as `sender` or `rcpt` that contain string values can be evaluated using any of the value comparators, for instance:

```toml
max-recipients = [ { if = "sender", matches = "^(.+)@(.+)$", then = 20 },
                   { if = "authenticated-as", starts-with = "john@", then = 1000 },
                   { if = "sender-domain", in-list = "db/postgresql/paid_clients", then = 5000 },
                   { else = 5 } ]
```

## Integers

Variables such as `priority` that contain integer values can be evaluated only using the equality or list comparators, for instance:

```toml
expire = [ { if = "priority", eq = "1", then = "5d" },
           { if = "priority", in-list = "list/low_priorities", then = "1d" },
           { else = "3d" } ]
```

## IP Addresses

Variables such as `remote-ip` or `local-ip` that contain IP addresses can be evaluated using the equality or list comparators. 
When using the equality comparator, IP ranges may be specified using [CIDR notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation), for instance:

```toml
notify = [ { if = "remote-ip", eq = "198.51.100.0/22", then = ["1d", "2d", "3d"] },
           { if = "remote-ip", in-list = "list/lmtp_hosts", then = ["30d"] },
           { if = "local-ip", ne = "2001:db8::/48", then = ["4d"] },
           { else = ["5d", "6d"] } ]
```

