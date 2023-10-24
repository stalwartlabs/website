---
sidebar_position: 3
---

# In-memory

In small setups or for testing purposes, you can use the in-memory directory type to define users and groups directly in the configuration file.
Please note that you will have to restart the server every time you make changes to the accounts and groups included in your configuration file.

To define an in-memory directory, use the `type = "memory"` attribute in the directory section of the configuration file. For example:

```toml
[directory."memory"]
type = "memory"
```

## Users

Users are defined under the `directory.<id>.users` sections of the configuration file using the following attributes:

- `name`: Specifies the username of the account.
- `description`: Provides a description or full name for the user.
- `secret`: Sets the password for the user account. Passwords can be stored [hashed](/docs/directory/users#passwords) or in plain text (not recommended).
- `email`: A list of email addresses associated with the user. The first address in the list is considered the primary address.
- `email-list`: Optionally, a list of mailing list addresses that the user is a part of.
- `member-of`: A list of groups that the user is a member of.
- `quota`: Optionally, a disk quota for the user, in bytes.

For example:

```toml
[[directory."memory".users]]
name = "admin"
description = "Superuser"
secret = "changeme"
email = ["postmaster@example.org"]
member-of = ["superusers"]

[[directory."memory".users]]
name = "jane"
description = "Jane Doe"
secret = "abcde"
email = ["jane@example.org", "jane.doe@example.org"]
email-list = ["info@example.org"]
member-of = ["sales", "support"]

[[directory."memory".users]]
name = "bill"
description = "Bill Foobar"
secret = "$2y$05$bvIG6Nmid91Mu9RcmmWZfO5HJIMCT8riNW0hEp8f6/FuA2/mHZFpe"
quota = 50000000
email = ["bill@example.org", "bill.foobar@example.org"]
email-list = ["info@example.org"]
```

## Groups

Groups are defined under the `directory.<id>.groups` sections of the configuration file using the following attributes:

- `name`: Specifies the name of the group.
- `description`: Provides a description for the group.

For example:

```toml
[[directory."memory".groups]]
name = "sales"
description = "Sales Team"

[[directory."memory".groups]]
name = "support"
description = "Support Team"
```

## Lookup lists & maps

Lookup lists and maps are defined under the `directory.<name>.lookup.<lookup_name>` section. These lookup lists are used mainly by the SMTP server from rules or Sieve filters.

### Embedded

The simplest way to define a lookup list is to use the `values` attribute. For example:

```toml
[directory."memory".lookup]
blocked_ips = ["10.0.0.20", "192.168.1.7"]
domains = ["example.org", "example.com"]
```

### External

Lists and maps can also be loaded from local files or from remote HTTP resources. An external list/map is defined using the following attributes under the `directory.<name>.lookup.<lookup_name>` key:

- `values`: The URL to the list or map, for example `file:///etc/spamfilter/maps/spam_trap.list` or `https://get.stalw.art/maps/mime_types.map`.
- `type`: Specifies the type of the lookup. Can be either `list`, `map`, `glob` or `regex`.
- `comment`: Lines beginning with this character are ignored. Defaults to `#`.
- `separator`: For maps, the character that separates the key from the value. Defaults to space.

Supported lookup types are:

- `list`: A list of values.
- `glob`: A list of glob patterns (for example "*.domain.org", "user@*", or "test@domain?.org").
- `regex`: A list of regular expressions.
- `map`: A map of key/value pairs.

The `values` key also supports the special URL `file+fallback://` which defines a local fallback file to be used when a remote resource is unavailable.

For example:

```toml
[directory."spam".lookup."redirectors"]
type = "glob"
comment = '#'
values = ["https://get.stalw.art/resources/config/spamfilter/maps/url_redirectors.list", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/url_redirectors.list"]

[directory."spam".lookup."mime-types"]
type = "map"
comment = '#'
separator = ' '
values = ["https://get.stalw.art/resources/config/spamfilter/maps/mime_types.map", 
          "file+fallback://%{BASE_PATH}%/etc/spamfilter/maps/mime_types.map"]

```
