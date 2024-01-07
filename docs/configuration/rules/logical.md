---
sidebar_position: 3
---

# Logical expressions

Logical expressions enable the evaluation of one or multiple conditions using boolean operations such as `AND,` `OR,` and `NOT.` The following logical comparators are available:

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

