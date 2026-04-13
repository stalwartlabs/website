---
sidebar_position: 2
---

# Local

Local lookup lists are static lists that are kept entirely in memory. They are defined directly in the configuration file and are useful for storing small amounts of static data that do not change often.
lookup lists are used from expressions or Sieve filters and their contents can be defined directly in the configuration file or loaded from local files or from remote HTTP resources.

## Configuration

Local lookup lists are specified in the configuration file under the `lookup.<name>` section, where `<name>` is the unique identifier for the lookup list. Keys under the `lookup.<name>` section define the entries in the lookup list, where the key is the lookup key and the value is the lookup value. 

For example, to create the `allow-list-domain` lookup list with the keys `example.com` and `example.org`, the configuration would look like this:

```toml
[lookup."allow-list-domain"]
example.com = true
example.org = true
```

It is also possible to use glob patterns in the keys to match multiple entries. For example, to create an lookup list that matches all subdomains of `example.com` and all mail exchangers of `example.org`, the configuration would look like this:

```toml
[lookup."allow-list-domain"]
"*.example.com" = true
"mx?.example.org" = true
```

