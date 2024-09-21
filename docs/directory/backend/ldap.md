---
sidebar_position: 4
---

# LDAP Server

Stalwart Mail Server supports retrieving account information from an LDAP directory such as OpenLDAP or Active Directory. This allows you to leverage an existing LDAP directory to handle tasks such as authentication, validating local accounts, and retrieving account-related information.

## Connection details

The connection details for the LDAP directory are specified under the `directory.<name>` key in the configuration file with the following attributes:

- `type`: Indicates the type of directory, which has to be set to `"ldap"`.
- `url`: The URL of the LDAP server.
- `base-dn`: The base distinguished name (DN) from where searches should begin.
- `tls.enable`: Whether to use `STARTTLS` to encrypt the connection. This is disabled by default.
- `tls.allow-invalid-certs`: Whether to allow self-signed certificates. This is disabled by default.
- `timeout`: The timeout for LDAP operations. This is set to 30 seconds by default.

For example,

```toml
[directory."ldap"]
type = "ldap"
url = "ldap://localhost:3893"
base-dn = "dc=example,dc=org"
timeout = "30s"

[directory."ldap".tls]
enable = false
allow-invalid-certs = false
```

## Binding

The process of "binding" is essentially the LDAP way of logging in. It involves verifying the credentials (usually a distinguished name and a password) of a user or application trying to access the LDAP server.

### Bind Credentials

Bind credentials can be specified under the `directory.<name>.bind` key in the configuration file using the following attributes:

- `dn`: The distinguished name of the user account that the server will bind as to connect to the LDAP directory.
- `secret`: The password associated with the DN account. Can also be specified using an [environment variable](/docs/configuration/macros).

If no bind credentials are specified, the server will attempt to connect anonymously.

For example,

```toml
[directory."ldap".bind]
dn = "cn=admin,dc=example,dc=org"
secret = "password"
```

### Bind Authentication

Bind authentication is a method of verifying user credentials by binding to the LDAP server using the provided credentials. It can be configured under the `directory.<name>.bind.auth` key in the configuration file using the following attributes:

- `enable`: A boolean setting that enables (`true`) or disables (`false`) bind authentication. When set to `false`, bind authentication is not used for verifying credentials with the LDAP server.
- `dn`: The distinguished name (DN) template used for binding to the LDAP server. The `?` in the DN template is a placeholder that will be replaced with the username provided during the login process.

For example,

```toml
[directory."ldap".bind.auth]
enable = false
dn = "cn=?,ou=svcaccts,dc=example,dc=org"
```

:::tip Note

Even if bind authentication is enabled, the server still requires the `directory.<name>.bind` credentials to connect to the LDAP server in order to perform other operations such as retrieving account information or validating e-mail addresses and domains.

:::

### Limitations Regarding Password Hashes

When integrating LDAP servers with Stalwart Mail Server, one key consideration is the availability of password hashes. In many LDAP implementations, the LDAP server does not expose the account password hashes to connected applications or services. This limitation has specific implications for certain authentication mechanisms in Stalwart Mail Server, particularly regarding OAuth support and challenge-response SASL authentication methods like SCRAM (Salted Challenge Response Authentication Mechanism).

- **Impact on OAuth Support**: [OAuth](/docs/directory/authentication/oauth) is an open standard for access delegation commonly used as a way for users to grant websites or applications access to their information on other websites without giving them the passwords.  For OAuth to function correctly, the server needs to validate whether the current password of a user account has been revoked. This process typically involves comparing stored password hashes. If the LDAP server does not provide access to password hashes, Stalwart Mail Server cannot perform this validation. As a result, OAuth support will be disabled. This is because, without access to password hashes, there is no reliable method for the server to ascertain the current validity of an OAuth token.

- **Impact on challenge-response mechanisms**: Challenge-response authentication mechanism such as SCRAM enhances security by avoiding the transmission of password-equivalent data over the network. However, its implementation relies on access to password hashes. SCRAM requires the server to have access to stored password hashes to engage in the challenge-response process with the client. In scenarios where the LDAP server does not expose password hashes, mechanisms like SCRAM cannot be supported by Stalwart Mail Server. This is because the server cannot perform the necessary hash-based computations for the SCRAM protocol without access to these hashes.

In summary, when integrating LDAP servers with Stalwart Mail Server, the unavailability of password hashes from the LDAP server leads to specific limitations. It disables the use of OAuth, as the server cannot verify the current status of passwords, and it also renders challenge-response authentication methods like SCRAM unsupported, as these methods require direct access to password hashes. Understanding these limitations is crucial for administrators when configuring and managing authentication methods in Stalwart Mail Server environments that rely on LDAP directories.

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

## Object attributes

The `directory.<name>.attributes` section is used to map the LDAP attributes to Stalwart's internal attributes. The following attributes need to be defined:

- `name`: Maps to the LDAP attribute for the user's account name.
- `class`: Maps to the LDAP attribute for the user's account type, if missing defaults to `individual`. Expected values are `individual` (or `person`, `posixAccount`, `inetOrgPerson`) for user accounts, `admin` (or `administrator`, `root`, `superuser`) for administrator accounts, and `group` (or `posixGroup`) for group accounts.
- `description`: Maps to the LDAP attributes used to store the user's description.
- `secret`: Maps to the LDAP attribute for the user's password. Passwords can be stored [hashed](/docs/directory/authentication/password) or in plain text (not recommended).
- `groups`: Maps to the LDAP attributes for the groups that a user belongs to.
- `email`: Maps to the LDAP attribute for the user's primary email address.
- `email-alias`: Maps to the LDAP attribute for the user's email alias(es).
- `quota`: Maps to the LDAP attribute for the user's disk quota.

For example:

```toml
[directory."ldap".attributes]
name = "uid"
class = "objectClass"
description = ["principalName", "description"]
secret = "userPassword"
groups = ["memberOf", "otherGroups"]
email = "mail"
email-alias = "mailAlias"
quota = "diskQuota"
```
