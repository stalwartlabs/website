---
sidebar_position: 10
---

# In-Memory

The in-memory lookup store is a static key value store that is kept entirely in memory. In-memory stores are defined directly in the configuration file and are useful for storing small amounts of static data that do not change often.

## Configuration

The only configuration option for the in-memory lookup store is the `type` attribute, which must be set to `memory`. For example:

```toml
[store."memory"]
type = "memory"
```

## Lookup lists & maps

Lookup lists and maps are used primarily by the SMTP server from rules or Sieve filters and their contents can be defined directly in the configuration file or loaded from local files or from remote HTTP resources.

Lookup lists and maps are created by specifying the following attributes under the `store.<name>.lookup.<lookup_name>` key:

- `values`: The list or map contents or the URL to the list or map, for example `file:///etc/spamfilter/maps/spam_trap.list` or `https://get.stalw.art/maps/mime_types.map`.
- `type`: Specifies the type of the lookup. Can be either `list`, `map`, `glob` or `regex`.
- `comment`: Lines beginning with this character are ignored. Defaults to `#`.
- `separator`: For maps, the character that separates the key from the value. Defaults to space.

Supported lookup types are:

- `list`: A list of values.
- `glob`: A list of glob patterns (for example "*.domain.org", "user@*", or "test@domain?.org").
- `regex`: A list of regular expressions.
- `map`: A map of key/value pairs.

The `values` key also supports the special URL `file+fallback://` which defines a local fallback file to be used when a remote resource is unavailable.

## Example

```toml
[store."spam"]
type = "memory"

[store."spam".lookup."blocked_ips"]
type = "list"
values = ["10.0.0.20", "192.168.1.7"]

[store."spam".lookup."domains"]
type = "list"
values = ["example.org", "example.com"]

[store."spam".lookup."redirectors"]
type = "glob"
comment = '#'
values = ["https://get.stalw.art/resources/config/spamfilter/maps/url_redirectors.list", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/url_redirectors.list"]

[store."spam".lookup."mime-types"]
type = "map"
comment = '#'
separator = ' '
values = ["https://get.stalw.art/resources/config/spamfilter/maps/mime_types.map", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/mime_types.map"]

```

