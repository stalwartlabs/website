---
sidebar_position: 10
---

# In-Memory

The in-memory lookup store is a static key value store that is kept entirely in memory. They are defined directly in the configuration file and are useful for storing small amounts of static data that do not change often.
In-memory stores are used primarily by the SMTP server from expressions or Sieve filters and their contents can be defined directly in the configuration file or loaded from local files or from remote HTTP resources.

## Configuration

The following configuration settings are available for in-memory stores, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `memory` for in-memory stores.
- `format`: Specifies the type of the lookup. Can be either `list`, `map`, `glob` or `regex`.
- `values`: The list or map contents or the URL to the list or map, for example `file:///etc/spamfilter/maps/spam_trap.list` or `https://get.stalw.art/maps/mime_types.map`.
- `comment`: Lines beginning with this character are ignored. Defaults to `#`.
- `separator`: For maps, the character that separates the key from the value. Defaults to space.

Supported in-memory lookup formats are:

- `list`: A list of values.
- `glob`: A list of glob patterns (for example `*.domain.org`, `user@*`, or `test@domain?.org`).
- `regex`: A list of regular expressions.
- `map`: A map of key/value pairs.

The `values` key also supports the special URL `file+fallback://` which defines a local fallback file to be used when a remote resource is unavailable.

## Example

```toml
[store."blocked_ips"]
type = "memory"
format = "list"
values = ["10.0.0.20", "192.168.1.7"]

[store."domains"]
type = "memory"
format = "list"
values = ["example.org", "example.com"]

[store."redirectors"]
type = "memory"
format = "glob"
comment = '#'
values = ["https://get.stalw.art/resources/config/spamfilter/maps/url_redirectors.list", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/url_redirectors.list"]

[store."mime-types"]
type = "memory"
format = "map"
comment = '#'
separator = ' '
values = ["https://get.stalw.art/resources/config/spamfilter/maps/mime_types.map", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/mime_types.map"]

```

