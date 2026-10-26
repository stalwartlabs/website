---
sidebar_position: 4
title: "LDAP Server"
description: "Use an LDAP directory such as OpenLDAP or Active Directory for Stalwart accounts: connection, TLS, bind modes, lookup filters, attribute mapping and failover."
---

Many organisations keep their users in an LDAP directory such as OpenLDAP or Microsoft Active Directory. Stalwart can use that directory as the source of its accounts and passwords. Users then sign in to mail with the credentials they already use elsewhere, and the server accepts mail for the addresses recorded in the directory. Stalwart works with directories that implement [RFC 4511](https://www.rfc-editor.org/rfc/rfc4511).

The server queries the directory at two moments: when a user signs in, and when mail arrives for an address in a domain the directory serves. For each entry it finds, it keeps a local account ([Directories](/docs/auth/backend/)).

To connect a directory, create a [Directory](/docs/ref/object/directory) object of type `Ldap` (in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->). Then set its id as `directoryId` on the Authentication singleton or, in the Enterprise edition, on the domains the directory serves.

## Account provisioning

The server does not copy accounts from the directory in advance. It creates a local account the first time it needs one: when the user signs in, or when a message arrives for an address and the directory returns the entry. An account can therefore receive mail before its user has ever signed in.

Each later lookup updates the local account from the directory. The description and group memberships are refreshed, and any new aliases are added. Aliases removed from the directory are kept, however.

SCIM changes this behaviour. In a domain opened to [SCIM provisioning](/docs/auth/scim/provisioning#authority-when-both-are-configured), the directory neither creates nor updates accounts. A sign-in by an account that SCIM has not provisioned then fails with `Accounts in this domain are provisioned through SCIM, just-in-time provisioning is disabled`.

Nothing is ever removed automatically. An entry deleted from the directory stops appearing in query results, so mail for its address is no longer accepted. The server cannot observe the deletion itself, however. The local account and its mailbox therefore remain, and keep counting against the licensed account limit, until an administrator deletes them. For the identity provider to delete and suspend accounts explicitly, enable [SCIM provisioning](/docs/auth/scim/) for the domain. [Provisioning models](/docs/auth/scim/provisioning) describes how the two interact.

## Connection

[`url`](/docs/ref/object/directory#url) is the address of the directory server. Its scheme decides how the connection is encrypted:

- With an `ldap://` URL, the connection starts unencrypted. Enabling [`useTls`](/docs/ref/object/directory#usetls) upgrades it with STARTTLS before anything is sent.
- With an `ldaps://` URL, conventionally on port 636, the connection uses TLS from the start, so `useTls` has no effect.

Use one of the two whenever the directory is not on the same host. Both authentication modes send secrets over this connection: in password-comparison mode the directory sends password hashes, and in bind mode the server sends the user's password. [`allowInvalidCerts`](/docs/ref/object/directory#allowinvalidcerts) accepts certificates that fail validation and is meant for testing only.

[`timeout`](/docs/ref/object/directory#timeout) bounds both the establishment of a connection and each LDAP operation. It is <!-- default:Directory.timeout -->30 seconds<!-- /default --> by default. When several servers are configured (see [Secondary servers](#secondary-servers)), a connection attempt can take that long for each server before it fails.

The server does not open a new connection for every request. It keeps a pool of connections to the directory, and [`poolMaxConnections`](/docs/ref/object/directory#poolmaxconnections) caps the number of simultaneous connections. Three timeouts bound the steps of handing out a connection from the pool:

- [`poolTimeoutWait`](/docs/ref/object/directory#pooltimeoutwait) limits how long a request waits for a free connection.
- [`poolTimeoutCreate`](/docs/ref/object/directory#pooltimeoutcreate) limits how long opening a new connection may take.
- [`poolTimeoutRecycle`](/docs/ref/object/directory#pooltimeoutrecycle) limits how long a used connection may take to be checked before reuse.

Occasional reconnects by the directory do not cause failed sign-ins. When a login fails because a pooled connection was dropped or had gone stale, the server retries once on a fresh connection before reporting the failure.

### Secondary servers

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A directory often runs on several replicated servers, so that sign-ins keep working when one of them is down. List the backups in [`urlFailover`](/docs/ref/object/directory#urlfailover). When the server in `url` cannot be reached, the backups are tried in order, and the first one that accepts a connection becomes the active server.

The server returns to the primary as soon as it can. While a backup is active, the primary is probed at most once a minute, and the server switches back as soon as the primary responds. Each switch is logged as a `store.ldap-warning` event with the message `Switched active LDAP server`. A transport error during an operation is retried once on a new connection, as it is without failover.

The following settings make `ldap1` the primary server and `ldap2` and `ldap3` its backups:

```json
{
  "url": "ldaps://ldap1.example.org",
  "urlFailover": {"ldaps://ldap2.example.org": true, "ldaps://ldap3.example.org": true}
}
```

## Service account

The server needs its own account in the directory to search it. This service account is set in [`bindDn`](/docs/ref/object/directory#binddn) and [`bindSecret`](/docs/ref/object/directory#bindsecret). Every search starts at [`baseDn`](/docs/ref/object/directory#basedn), for example `dc=example,dc=org`, and the service account needs read access to the user and group entries under it.

The service account is needed in both authentication modes, because recipient lookups and group resolution always use it. When `bindDn` is empty, the server searches anonymously, which most directories do not allow.

`bindSecret` can hold the password itself, or read it from an environment variable or a file, which keeps the password out of the configuration. The following settings read it from the `LDAP_BIND_PASSWORD` environment variable:

```json
{
  "baseDn": "dc=example,dc=org",
  "bindDn": "cn=stalwart,ou=services,dc=example,dc=org",
  "bindSecret": {"@type": "EnvironmentVariable", "variableName": "LDAP_BIND_PASSWORD"}
}
```

## Authentication modes

A password can be checked in two places: by the directory, or by the server against the hash stored in the directory. [`bindAuthentication`](/docs/ref/object/directory#bindauthentication) chooses between them. Bind authentication is <!-- default:Directory.bindAuthentication as=enabled -->enabled<!-- /default --> by default.

### Bind authentication

With bind authentication, the directory decides whether the password is correct. The server uses the service account to search for the user's entry with [`filterLogin`](/docs/ref/object/directory#filterlogin). It then binds to the directory as that entry, with the password the user supplied. Because the directory performs the check, this mode works with directories that do not reveal password hashes, which includes Active Directory and most hardened OpenLDAP installations.

Bind mode has one drawback. Since no hash is read, the server cannot tell from the password itself that it has changed. It detects a change through [`attrSecretChanged`](/docs/ref/object/directory#attrsecretchanged), an attribute whose value changes whenever the password does, and then signs out the user's OAuth applications. If the attribute is not configured, or not present on the directory entries, OAuth tokens stay valid after a password change in the directory.

### Password comparison

When `bindAuthentication` is set to `false`, the server uses password comparison instead. It reads the password hash with the service account, from the attribute named in [`attrSecret`](/docs/ref/object/directory#attrsecret), and verifies the supplied password against it. Two conditions follow: the hash must be in one of the [supported formats](/docs/auth/authentication/password#supported-hash-formats), and the service account must be allowed to read it.

In both modes, a wrong password is reported as invalid credentials. Sign-in failures do not reveal whether the account exists in the directory.

## Lookup filters

The server locates entries with three LDAP search filters. Each filter contains placeholders, which the server replaces with the value being looked up after LDAP escaping:

- `{user}` stands for the whole value. It can also be written `{username}`, `{email}` or, as in older configurations, `?`.
- `{local}` stands for the part before the `@`.
- `{domain}` stands for the part after the `@`.

A filter without a placeholder fails to load with `Missing parameter placeholders in value ...`. A filter with an unknown placeholder fails with `Unknown LDAP filter placeholder: <name>`.

Each filter serves one lookup:

- [`filterLogin`](/docs/ref/object/directory#filterlogin) finds the entry for the name a user signs in with. By default it is <!-- default:Directory.filterLogin -->`(&(objectClass=inetOrgPerson)(mail=?))`<!-- /default -->.
- [`filterRecipient`](/docs/ref/object/directory#filterrecipient) finds the user or group entry for a recipient address. By default it is <!-- default:Directory.filterRecipient -->`(|(&(objectClass=inetOrgPerson)(|(mail=?)(mailAlias=?)))(&(objectClass=groupOfNames)(|(mail=?)(mailAlias=?))))`<!-- /default -->.
- [`filterMemberOf`](/docs/ref/object/directory#filtermemberof) finds the groups of an entry, with `?` replaced by the entry's DN. By default it is <!-- default:Directory.filterMemberOf -->`(&(objectClass=groupOfNames)(member=?))`<!-- /default -->. It is needed only when user entries do not carry their group memberships.

The defaults suit directories built on `inetOrgPerson` and `groupOfNames`. A directory that uses `posixAccount` and `posixGroup` entries needs other filters. The following filters find users by `uid` when they sign in, and users or groups by `mail` or `mailAlias` when mail arrives:

```json
{
  "filterLogin": "(&(objectClass=posixAccount)(uid=?))",
  "filterRecipient": "(&(|(objectClass=posixAccount)(objectClass=posixGroup))(|(mail=?)(mailAlias=?)))"
}
```

## Attribute mapping

Once an entry is found, the server reads the account's information from its attributes. The following fields name those attributes. Each field is a set, so several attributes can be listed for it:

| Field | Information | Default |
|---|---|---|
| [`attrEmail`](/docs/ref/object/directory#attremail) | Primary address | <!-- default:Directory.Ldap.attrEmail -->`mail`<!-- /default --> |
| [`attrEmailAlias`](/docs/ref/object/directory#attremailalias) | Aliases | <!-- default:Directory.Ldap.attrEmailAlias -->`mailAlias`<!-- /default --> |
| [`attrDescription`](/docs/ref/object/directory#attrdescription) | Display name | <!-- default:Directory.Ldap.attrDescription -->`description`<!-- /default --> |
| [`attrMemberOf`](/docs/ref/object/directory#attrmemberof) | Groups the entry belongs to | <!-- default:Directory.Ldap.attrMemberOf -->`memberOf`<!-- /default --> |
| [`attrClass`](/docs/ref/object/directory#attrclass) | Object class, to tell users from groups | <!-- default:Directory.Ldap.attrClass -->`objectClass`<!-- /default --> |
| [`attrSecret`](/docs/ref/object/directory#attrsecret) | Password hash, in password-comparison mode | <!-- default:Directory.Ldap.attrSecret -->`userPassword`<!-- /default --> |
| [`attrSecretChanged`](/docs/ref/object/directory#attrsecretchanged) | Value that changes with the password, in bind mode | <!-- default:Directory.Ldap.attrSecretChanged -->`pwdChangeTime`<!-- /default --> |

The server tells users from groups by their class. An entry whose class equals [`groupClass`](/docs/ref/object/directory#groupclass) is a group, and any other entry is a user. `groupClass` is <!-- default:Directory.groupClass -->`groupOfNames`<!-- /default --> by default.

Quotas, roles and permissions are not read from the directory. They are set on the local account in Stalwart ([Quotas](/docs/auth/authorization/quotas)).

## Active Directory

Active Directory needs settings that differ from the defaults in three respects. It does not reveal password hashes, so bind authentication is required. It uses its own object classes. It also records group membership in `memberOf`.

The following object is a starting point for the domain `example.org`, where users sign in with their user principal name and receive mail at the address in `mail`. It keeps bind authentication, matches `user` and `group` entries, reads the display name from `displayName` and detects password changes through `pwdLastSet`:

```json
{
  "@type": "Ldap",
  "description": "Active Directory",
  "url": "ldaps://dc1.example.org",
  "baseDn": "dc=example,dc=org",
  "bindDn": "CN=Stalwart,OU=Service Accounts,DC=example,DC=org",
  "bindSecret": {"@type": "EnvironmentVariable", "variableName": "LDAP_BIND_PASSWORD"},
  "bindAuthentication": true,
  "filterLogin": "(&(objectClass=user)(userPrincipalName=?))",
  "filterRecipient": "(|(&(objectClass=user)(mail=?))(&(objectClass=group)(mail=?)))",
  "filterMemberOf": "(&(objectClass=group)(member=?))",
  "attrEmail": {"mail": true},
  "attrDescription": {"displayName": true},
  "attrMemberOf": {"memberOf": true},
  "attrSecretChanged": {"pwdLastSet": true},
  "groupClass": "group"
}
```
