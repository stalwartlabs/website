---
sidebar_position: 4
---

# LDAP Server

LDAP (Lightweight Directory Access Protocol) is an open, vendor-neutral protocol used to access and manage directory information services. It is commonly employed to centralize user authentication and authorization data across multiple systems and applications. LDAP directories, such as OpenLDAP, Microsoft Active Directory, and others, store user credentials and metadata in a structured, hierarchical format that can be queried efficiently.

Stalwart supports integration with LDAP directories for user authentication. By configuring Stalwart to use an LDAP backend, administrators can leverage existing directory infrastructure to manage user accounts, passwords, and group policies centrally. This allows seamless authentication using credentials stored in the LDAP directory, improving security, simplifying user management, and enabling single sign-on (SSO) capabilities in enterprise environments. Stalwart is compatible with a wide range of LDAP-compliant servers, including OpenLDAP, Active Directory, and other RFC 4511-conforming implementations.

## Connection details

To enable LDAP authentication in Stalwart, the core requirement is specifying the LDAP server URL. This URL defines how and where the server connects to the directory service. A basic example would be `ldap://localhost:3893`, which instructs Stalwart to connect to an LDAP server running on localhost using the standard non-encrypted LDAP protocol on port 3893.

All connection details for the LDAP directory are specified under the `directory.<name>` key in the configuration file with the following attributes:

- `type`: Indicates the type of directory, which has to be set to `"ldap"`.
- `url`: The URL of the LDAP server.
- `tls.enable`: Whether to use `STARTTLS` to encrypt the connection. This is disabled by default.
- `tls.allow-invalid-certs`: Whether to allow self-signed certificates. This is disabled by default.
- `timeout`: The timeout for LDAP operations. This is set to 30 seconds by default.

For example,

```toml
[directory."ldap"]
type = "ldap"
url = "ldap://localhost:3893"
timeout = "30s"

[directory."ldap".tls]
enable = false
allow-invalid-certs = false
```

## Default Bind Credentials

In LDAP, **binding** is the process of authenticating to the directory server. It establishes the identity under which queries and operations will be performed. To authenticate and perform searches against the LDAP directory, Stalwart typically needs to bind using a valid account, specified by a Bind DN (Distinguished Name) and a corresponding secret (password). These credentials allow Stalwart to connect to the directory with sufficient privileges to search for and validate user entries during the authentication process.

Bind credentials can be specified under the `directory.<name>.bind` key in the configuration file using the following attributes:

- `dn`: The distinguished name of the user account that the server will bind as to connect to the LDAP directory.
- `secret`: The password associated with the DN account. Can also be specified using an [environment variable](/docs/configuration/macros).

For example,

```toml
[directory."ldap".bind]
dn = "cn=admin,dc=example,dc=org"
secret = "password"
```

If **no bind credentials are provided**, the server will attempt to connect and perform operations anonymously. While some LDAP directories allow anonymous access for basic queries, many are configured to require authentication for security reasons. In such cases, failing to provide bind credentials may result in failed authentication attempts or limited visibility into the directory structure.

:::tip Note

Even if bind authentication is enabled, the server still requires a default bind DN to connect to the LDAP server in order to perform other operations such as retrieving account information or validating e-mail addresses and domains.

:::

## Authentication Methods

Stalwart offers multiple methods for authenticating users against an LDAP directory, providing flexibility to accommodate different directory configurations and security policies.

In some LDAP environments—particularly with directories like Microsoft Active Directory or hardened OpenLDAP setups, **password hashes are not retrievable via queries**, even when using privileged bind credentials. This limitation makes it impossible for Stalwart to validate user credentials by comparing password hashes directly. In such cases, the only viable method for authentication is **bind authentication**, where the server attempts to log in (bind) as the user using the credentials provided during the login process. If the bind succeeds, the user is considered authenticated.

Stalwart supports three authentication methods when integrating with an LDAP server:

- The **default** method relies on the [default bind credentials](#default-bind-credentials) to search for the user and retrieve their password hash, which Stalwart then compares against the user-supplied password. This approach only works if the LDAP server exposes [password hashes in a format supported by Stalwart](/docs/auth/authentication/password).
- The **template** method performs bind authentication by constructing the user’s Distinguished Name (DN) from a template string, such as `cn={username},dc=example,dc=com`. The server attempts to bind directly using the resulting DN and the password supplied by the user.
- The **lookup** method also uses bind authentication, but instead of relying on a static DN template, it first performs a search query (using the [default bind credentials](#default-bind-credentials)) to locate the user's DN dynamically. Once the DN is found, Stalwart attempts to bind as that user using their provided password.

These authentication methods give administrators the flexibility to work with a wide variety of LDAP directory configurations, whether or not password hashes are accessible.

### Bind with default credentials

The **default** authentication method uses the configured **default bind credentials** to connect to the LDAP server and retrieve user entries. Once connected, Stalwart searches for the user based on the login input, retrieves the user’s password hash from the directory, and compares it against the password provided during login.

To enable this method, set the `bind.auth.method` configuration option to `default` in the `directory.<name>` section of the configuration file. Additionally, you must specify the name of the [LDAP attribute](#object-attributes) that holds the user’s password hash using the `attributes.secret` setting.

Example:

```toml
[directory."ldap".bind.auth]
method = "default"

[directory."ldap".attributes]
secret = "userPassword"
```

This instructs Stalwart to authenticate users by retrieving the `userPassword` attribute in the user’s LDAP entry and use its value for hash comparison. The attribute must contain the hash in a format supported by Stalwart (such as SSHA, SHA, MD5, etc.).

:::tip Note

This method is only suitable if the LDAP server allows access to password hashes and exposes them in a supported format. If the directory does not permit this—for example, in many Active Directory environments—bind authentication should be used instead.

:::

### Bind authentication with template

**Bind authentication** is a method where the server attempts to authenticate users by binding to the LDAP directory as the user themselves. Instead of retrieving and comparing password hashes, Stalwart uses the credentials entered during login to perform a bind operation. If the LDAP server accepts the bind, the user is successfully authenticated.

To enable this method, set the `bind.auth.method` configuration option to `template` in the `directory.<name>` section of the configuration file. The following additional attributes are available when configuring bind authentication with a template:

- `template`: The distinguished name (DN) template used for binding to the LDAP server. 
- `search`: Use the bind authentication connection to search for the user's DN. When set to `false`, a new connection to the LDAP server is established using the bind credentials (`directory.<name>.bind.dn`) to search for the user's DN. When set to `true`, the bind authentication connection is used to search for the user's DN.

Example:

```toml
[directory."ldap".bind.auth]
method = "template"
dn = "cn={local},ou=svcaccts,dc={domain}"
search = true

[directory."ldap".attributes]
secret-changed = "pwdChangedTime"
```

The user's **Distinguished Name (DN)** is constructed dynamically using a template string defined in the `bind.auth.template` setting. This template allows you to specify how the DN should be formatted based on the username provided during login. The template supports the following placeholders:

* `{username}`: Replaced with the full username entered at login.
* `{local}`: If the username is an email address, this is replaced with the local part (before the `@`).
* `{domain}`: If the username is an email address, this is replaced with the domain part (after the `@`).

For example, if the login username is `john.doe@example.com`, `{local}` becomes `john.doe` and `{domain}` becomes `example.com`.

:::tip Note

Since password hashes are not available in bind authentication, Stalwart cannot detect password changes based on stored credentials in order to invalidate existing OAuth tokens. Therefore, it is essential to configure the `secret-changed` attribute to track password changes. This attribute should contain a value that changes whenever the user's password is updated, such as a timestamp or version hash. This allows Stalwart to recognize when a password has changed, even without access to the hash.

:::

### Bind authentication with lookup

**Bind authentication** is a method where the server attempts to authenticate users by binding to the LDAP directory as the user themselves. Instead of retrieving and comparing password hashes, Stalwart uses the credentials entered during login to perform a bind operation. If the LDAP server accepts the bind, the user is successfully authenticated.

The **bind authentication with lookup** method is designed for more complex or dynamic LDAP environments where the user's **Distinguished Name (DN)** cannot be reliably constructed using a [static template](#bind-authentication-with-template). This is often the case in large directory structures with nested organizational units or non-standard naming conventions.

In this method, Stalwart first performs an **LDAP search query** using the [default bind credentials](#default-bind-credentials) to locate the user's DN based on the login input. Once the DN is retrieved, Stalwart attempts to **bind as that user** using the password provided during login. If the bind succeeds, the user is authenticated.

To enable this method, set the `bind.auth.method` configuration option to `lookup` in the `directory.<name>` section of the configuration file.

Example:

```toml
[directory."ldap".bind.auth]
method = "lookup"

[directory."ldap".attributes]
secret-changed = "pwdChangedTime"
```

:::tip Note

Since password hashes are not available in bind authentication, Stalwart cannot detect password changes based on stored credentials in order to invalidate existing OAuth tokens. Therefore, it is essential to configure the `secret-changed` attribute to track password changes. This attribute should contain a value that changes whenever the user's password is updated, such as a timestamp or version hash. This allows Stalwart to recognize when a password has changed, even without access to the hash.

:::

## Lookup filters

**Lookup filters** are used to perform search queries against the LDAP directory. These filters determine how user entries are located based on either login credentials or email addresses. Stalwart uses two specific filters for LDAP lookups: `name` and `email`:

- The **`name` filter** is used during the authentication process. When a user attempts to log in, Stalwart uses this filter to search the directory for the corresponding LDAP object based on the login name. Once the user’s DN is retrieved, it can be used for bind authentication or to access additional attributes.
- The **`email` filter** is used during email delivery. Its purpose is to verify whether a given email address exists in the LDAP directory. This helps ensure that mail is only delivered to valid, known addresses within the system.

Both filters are **template strings** that must include a single `?` character. At runtime, this placeholder is replaced by the appropriate value—either the username (for the `name` filter) or the email address (for the `email` filter).

The following LDAP filters need to be defined under the `directory.<name>.filter` section in order to retrieve information about accounts:

- `name`: This filter is used to search for objects based on the account name.
- `email`: Searches for objects associated with a specific primary addresses or alias.

For example:

```toml
[directory."ldap".filter]
name = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(uid=?))"
email = "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=?)(mailAlias=?)))"
```

The `?` character in the queries denotes a parameter that will be filled in at runtime.

## Base DN

In addition to the filters themselves, a **base DN (Distinguished Name)** must be defined under `directory.<name>.base-dn`. The base DN specifies the starting point in the LDAP directory tree from which the search should begin. It acts as the root context for the lookup and determines the scope of the query. For example, a base DN might target a specific organizational unit or domain subtree to limit the search area and improve performance.

Example:

```toml
[directory."ldap"]
base-dn = "dc=example,dc=org"
```

## Object attributes

To interact effectively with an LDAP directory, Stalwart needs to understand how user information is represented within that directory. Different LDAP servers may use different attribute names for storing common data such as usernames, email addresses, or group memberships. Therefore, Stalwart must be explicitly configured to map its internal attribute names to the corresponding LDAP attribute names used by your directory schema.

The `directory.<name>.attributes` section is used to map the LDAP attributes to Stalwart's internal attributes. The following attributes need to be defined:

- `name`: Maps to the LDAP attribute for the user's account name.
- `class`: Maps to the LDAP attribute for the user's account type, if missing defaults to `individual`. Expected values are `individual` (or `person`, `posixAccount`, `inetOrgPerson`) for user accounts and `group` (or `posixGroup`) for group accounts.
- `description`: Maps to the LDAP attributes used to store the user's description.
- `secret`: Maps to the LDAP attribute for the user's password. Passwords can be stored [hashed](/docs/auth/authentication/password) or in plain text (not recommended).
- `groups`: Maps to the LDAP attributes for the groups that a user belongs to.
- `email`: Maps to the LDAP attribute for the user's primary email address.
- `email-alias`: Maps to the LDAP attribute for the user's email alias(es).
- `quota`: Maps to the LDAP attribute for the user's disk quota.
- `secret-changed`: Maps to the LDAP attribute that stores the last time the password was changed. This is used to determine if the password has been changed since the last login and is used for OAuth when the `secret` attribute is not available. 

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

These mappings are essential for Stalwart to interpret and use LDAP directory data correctly. By configuring them according to your directory's schema, you ensure accurate user identification, group membership resolution, and email delivery handling.
