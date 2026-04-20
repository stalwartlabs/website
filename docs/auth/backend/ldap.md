---
sidebar_position: 4
---

# LDAP Server

LDAP (Lightweight Directory Access Protocol) is an open, vendor-neutral protocol used to access and manage directory information services. LDAP directories such as OpenLDAP and Microsoft Active Directory store user credentials and metadata in a hierarchical form that can be queried efficiently, and are commonly used to centralise authentication across multiple systems.

Stalwart integrates with LDAP directories for account authentication and lookup. With an LDAP directory configured, the server can reuse existing account records and group policies. Stalwart is compatible with LDAP directories that follow RFC 4511, including OpenLDAP and Active Directory.

An LDAP integration is represented by the LDAP variant of the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><!-- /breadcrumb:Directory -->).

## Connection details

The minimum required configuration for LDAP is the URL of the directory server. The URL is set through [`url`](/docs/ref/object/directory#url); a typical value is `"ldap://localhost:389"` for an unencrypted connection to a server on the same host.

Related connection fields on the LDAP variant of the Directory object are:

- [`url`](/docs/ref/object/directory#url): URL of the LDAP server.
- [`useTls`](/docs/ref/object/directory#usetls): whether to negotiate TLS on the connection. Default `false`.
- [`allowInvalidCerts`](/docs/ref/object/directory#allowinvalidcerts): whether to accept invalid TLS certificates. Default `false`.
- [`timeout`](/docs/ref/object/directory#timeout): connection timeout. Default `"30s"`.

For example:

```json
{
  "@type": "Ldap",
  "description": "Corporate LDAP",
  "url": "ldap://localhost:389",
  "timeout": "30s",
  "useTls": false,
  "allowInvalidCerts": false
}
```

## Default bind credentials

Binding is the operation by which an LDAP client authenticates to the directory. To query the directory and validate account entries, Stalwart needs to bind using a service account that holds sufficient privileges to search the directory tree.

Service-account credentials are configured through:

- [`bindDn`](/docs/ref/object/directory#binddn): the distinguished name of the account used to connect to the directory.
- [`bindSecret`](/docs/ref/object/directory#bindsecret): the secret associated with `bindDn`. Accepts a direct value, an environment-variable reference, or a file reference.

For example:

```json
{
  "@type": "Ldap",
  "bindDn": "cn=admin,dc=example,dc=org",
  "bindSecret": {
    "@type": "Value",
    "secret": "password"
  }
}
```

If `bindDn` is left unset, the server attempts anonymous queries. Some directories allow that for basic lookups, but most require an authenticated bind. Without valid credentials, authentication or address validation may fail.

:::tip Note

Even when users authenticate by binding as themselves, the service-account bind is still required for non-authentication operations such as retrieving account metadata and validating email addresses and domains.

:::

## Authentication methods

Stalwart supports two authentication modes against an LDAP directory, selected by the [`bindAuthentication`](/docs/ref/object/directory#bindauthentication) boolean on the Directory object.

In some LDAP environments, particularly hardened OpenLDAP setups and Active Directory, password hashes are not returned even to a privileged service account. In those environments Stalwart cannot compare a stored hash against the password supplied by the user, so it must authenticate by attempting to bind directly as the user. If the bind succeeds, the credentials are considered valid.

### Service-account bind (hash comparison)

When [`bindAuthentication`](/docs/ref/object/directory#bindauthentication) is set to `false`, Stalwart uses the service account (`bindDn` / `bindSecret`) to search for the user entry, reads the password hash from the attribute configured by [`attrSecret`](/docs/ref/object/directory#attrsecret), and compares it against the password supplied at login. This mode only works if the LDAP server exposes password hashes in a format that Stalwart [recognises](/docs/auth/authentication/password).

For example:

```json
{
  "@type": "Ldap",
  "bindAuthentication": false,
  "attrSecret": ["userPassword"]
}
```

:::tip Note

This mode is only suitable when the LDAP server returns password hashes to the bind account. When the directory does not permit this (for example, in many Active Directory environments), use bind authentication instead.

:::

### Bind authentication

When [`bindAuthentication`](/docs/ref/object/directory#bindauthentication) is set to `true` (the default), Stalwart authenticates users by attempting to bind as the user themselves, using the password supplied at login. If the bind succeeds, the credentials are accepted. No password hash is read from the directory.

In this mode, the user's distinguished name is located by running the [`filterLogin`](/docs/ref/object/directory#filterlogin) search using the service account; the `?` placeholder in the filter is replaced with the login value. Once the DN is known, Stalwart attempts the user bind. Because the password hash is not available, Stalwart relies on the [`attrSecretChanged`](/docs/ref/object/directory#attrsecretchanged) attribute (by default `pwdChangeTime`) to detect password changes and invalidate cached OAuth tokens.

For example:

```json
{
  "@type": "Ldap",
  "bindAuthentication": true,
  "filterLogin": "(&(objectClass=inetOrgPerson)(mail=?))",
  "attrSecretChanged": ["pwdChangeTime"]
}
```

## Lookup filters

Two LDAP filters drive account resolution: a login filter used at authentication time, and a mailbox filter used during email delivery.

- [`filterLogin`](/docs/ref/object/directory#filterlogin): locates the LDAP entry that matches the login value supplied by the user. Default `"(&(objectClass=inetOrgPerson)(mail=?))"`.
- [`filterMailbox`](/docs/ref/object/directory#filtermailbox): locates a user or group entry that matches a recipient email address or alias. Default `"(|(&(objectClass=inetOrgPerson)(|(mail=?)(mailAlias=?)))(&(objectClass=groupOfNames)(|(mail=?)(mailAlias=?))))"`.
- [`filterMemberOf`](/docs/ref/object/directory#filtermemberof): locates the groups an account belongs to when group membership is not carried on the account entry. The `?` is replaced with the account DN. Default `"(&(objectClass=groupOfNames)(member=?))"`.

Each filter contains a `?` placeholder that the server replaces at runtime: the login value for `filterLogin`, the recipient address for `filterMailbox`, or the account DN for `filterMemberOf`.

For example:

```json
{
  "@type": "Ldap",
  "filterLogin": "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(uid=?))",
  "filterMailbox": "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=?)(mailAlias=?)))"
}
```

## Base DN

Searches start from a base distinguished name configured through [`baseDn`](/docs/ref/object/directory#basedn). The base DN sets the scope of every query and should be narrow enough to limit the search surface but broad enough to cover all relevant accounts.

For example, `"dc=example,dc=org"` restricts lookups to entries under the `example.org` organisation.

## Object attributes

LDAP schemas vary between servers, so Stalwart has to be told which attributes to read for each piece of account information. The mapping is carried on the LDAP variant of the Directory object through the following fields:

- [`attrClass`](/docs/ref/object/directory#attrclass): attribute(s) carrying the account's object class. Defaults to `["objectClass"]`. An account entry is treated as an individual unless its class matches [`groupClass`](/docs/ref/object/directory#groupclass), which defaults to `"groupOfNames"`.
- [`attrDescription`](/docs/ref/object/directory#attrdescription): attribute(s) used as the account description. Default `["description"]`.
- [`attrSecret`](/docs/ref/object/directory#attrsecret): attribute carrying the password hash, used only when `bindAuthentication` is `false`. Default `["userPassword"]`.
- [`attrSecretChanged`](/docs/ref/object/directory#attrsecretchanged): attribute carrying the last password-change timestamp (or version value), used to invalidate OAuth tokens in bind-authentication mode. Default `["pwdChangeTime"]`.
- [`attrMemberOf`](/docs/ref/object/directory#attrmemberof): attribute(s) listing the groups an account belongs to. Default `["memberOf"]`.
- [`attrEmail`](/docs/ref/object/directory#attremail): attribute carrying the primary email address. Default `["mail"]`.
- [`attrEmailAlias`](/docs/ref/object/directory#attremailalias): attribute carrying email aliases. Default `["mailAlias"]`.

There is no attribute mapping for the account's login name or for a per-account disk quota: the login name is resolved from the entry returned by [`filterLogin`](/docs/ref/object/directory#filterlogin), and disk quotas are held on the [Account](/docs/ref/object/account) and [Tenant](/docs/ref/object/tenant) objects rather than read from the directory (see [Quotas](/docs/auth/authorization/quotas)).

For example:

```json
{
  "@type": "Ldap",
  "attrClass": ["objectClass"],
  "attrDescription": ["principalName", "description"],
  "attrSecret": ["userPassword"],
  "attrMemberOf": ["memberOf", "otherGroups"],
  "attrEmail": ["mail"],
  "attrEmailAlias": ["mailAlias"]
}
```
