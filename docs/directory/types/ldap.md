---
sidebar_position: 2
---

# LDAP Server

Stalwart Mail Server supports retrieving account information from an LDAP directory such as OpenLDAP or Active Directory. This allows you to leverage an existing LDAP directory to handle tasks such as authentication, validating local accounts, and retrieving account-related information.

## Connection details

The connection details for the LDAP directory are specified under the `directory.<name>.ldap` key in the configuration file with the following attributes:

- `address`: The URL of the LDAP server.
- `base-dn`: The base distinguished name (DN) from where searches should begin.

For example,

```toml
[directory."ldap"]
type = "ldap"
address = "ldap://localhost:3893"
base-dn = "dc=example,dc=org"
```

## Bind credentials

The bind credentials can be specified under the `directory.<name>.ldap.bind` key in the configuration file using the following attributes:

- `dn`: The distinguished name of the user account that the server will bind as to connect to the LDAP directory.
- `secret`: The password associated with the DN account.

If no bind credentials are specified, the server will attempt to connect anonymously.

For example,

```toml
[directory."ldap".bind]
dn = "cn=admin,dc=example,dc=org"
secret = "password"
```

## Lookup queries

The `directory.<name>.filter` section contains the filters used to interact with the LDAP server. The following LDAP filters need to be defined in order to retrieve information about accounts:

- `name`: This filter is used to search for objects based on the account name.
- `email`: Searches for objects associated with a specific primary addresses, alias or mailing lists address.
- `verify`: A wildcard search filter to retrieve the objects that contain a certain string in their email addresses. This filter is used by the SMTP `VRFY` command.
- `expand`: This filter is used to search for objects that belong to a specific mailing list. This filter is used by the SMTP `EXPN` command.
- `domains`: Searches for objects that have an email address in a specific domain name. This filter is used by the SMTP server to validate local domains during the `RCPT TO` command.

For example:

```toml
[directory."ldap".filter]
name = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(uid=?))"
email = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=?)(mailAlias=?)(mailList=?)))"
verify = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=*?*)(mailAlias=*?*)))"
expand = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(mailList=?))"
domains = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=*@?)(mailAlias=*@?)))"
```

The `?` character in the queries denotes a parameter that will be filled in at runtime.

## Object classes and attributes

The `directory.<name>.object-classes` defines the object classes for user and group accounts. The following attributes need to be specified:

- `user`: The LDAP object class used to represent user accounts.
- `group`: The LDAP object class used to represent groups.

The `directory.<name>.attributes` section is used to map the LDAP attributes to Stalwart's internal attributes. The following attributes need to be defined:

- `name`: Maps to the LDAP attribute for the user's account name.
- `description`: Maps to the LDAP attributes used to store the user's description.
- `secret`: Maps to the LDAP attribute for the user's password. Passwords can be stored encrypted, as a salted hash or in plain text (not recommended).
- `groups`: Maps to the LDAP attributes for the groups that a user belongs to.
- `email`: Maps to the LDAP attribute for the user's primary email address.
- `email-alias`: Maps to the LDAP attribute for the user's email alias(es).
- `quota`: Maps to the LDAP attribute for the user's disk quota.

For example:

```toml
[directory."ldap".object-classes]
user = "posixAccount"
group = "posixGroup"

[directory."ldap".attributes]
name = "uid"
description = ["principalName", "description"]
secret = "userPassword"
groups = ["memberOf", "otherGroups"]
email = "mail"
email-alias = "mailAlias"
quota = "diskQuota"
```

## Custom lookup queries

Custom lookup filters can be defined under the `directory.<name>.lookup.<lookup_name>` section. These custom queries are used mainly in the SMTP server from rules or Sieve filters.

For example:

```toml
[directory."ldap".lookup]
blocked_ip = "(&(|(objectClass=ipAddress)(blocked=true))(ip=?))"
greylist = "(&(|(objectClass=emailAddress)(trusted=true))(address=?))"
```

