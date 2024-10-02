---
sidebar_position: 6
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

Users are defined under the `directory.<id>.principals` sections of the configuration file using the following attributes:

- `name`: Specifies the username of the account.
- `class`: Specifies the account type. Expected values are `individual` for user accounts and `admin` for administrator accounts.
- `description`: Provides a description or full name for the user.
- `secret`: Sets the password for the user account. Passwords can be stored [hashed](//docs/auth/authentication/password) or in plain text (not recommended).
- `email`: A list of email addresses associated with the user. The first address in the list is considered the primary address.
- `email-list`: Optionally, a list of mailing list addresses that the user is a part of.
- `member-of`: A list of groups that the user is a member of.
- `quota`: Optionally, a disk quota for the user, in bytes.

For example:

```toml
[[directory."memory".principals]]
name = "admin"
class = "admin"
description = "Superuser"
secret = "changeme"
email = ["postmaster@example.org"]

[[directory."memory".principals]]
name = "jane"
class = "individual"
description = "Jane Doe"
secret = "abcde"
email = ["jane@example.org", "jane.doe@example.org"]
email-list = ["info@example.org"]
member-of = ["sales", "support"]

[[directory."memory".principals]]
name = "bill"
class = "individual"
description = "Bill Foobar"
secret = "$2y$05$bvIG6Nmid91Mu9RcmmWZfO5HJIMCT8riNW0hEp8f6/FuA2/mHZFpe"
quota = 50000000
email = ["bill@example.org", "bill.foobar@example.org"]
email-list = ["info@example.org"]
```

## Groups

Groups are defined under the `directory.<id>.principals` sections of the configuration file using the following attributes:

- `name`: Specifies the name of the group.
- `type`: Set to `group` to define a group.
- `description`: Provides a description for the group.

For example:

```toml
[[directory."memory".principals]]
name = "sales"
class = "group"
description = "Sales Team"

[[directory."memory".principals]]
name = "support"
class = "group"
description = "Support Team"
```

