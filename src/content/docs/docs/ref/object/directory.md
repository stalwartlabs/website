---
title: Directory
description: Defines an external directory for account authentication and lookups.
custom_edit_url: null
---

# Directory

Defines an external directory for account authentication and lookups.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories

## Fields

Directory is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Ldap"`

LDAP Directory


##### `description`

> Type: <code>String</code> · required
>
> Short description of this directory


##### `url`

> Type: <code>Uri</code> · default: `"ldap://localhost:389"`
>
> URL of the LDAP server


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Connection timeout to the server


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the server


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the remote server


##### `baseDn`

> Type: <code>String</code> · required
>
> The base distinguished name (DN) from where searches should begin


##### `bindDn`

> Type: <code>String?</code>
>
> The distinguished name of the account that the server will bind as to connect to the LDAP directory


##### `bindSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The password or secret for the bind DN account


##### `bindAuthentication`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to use bind authentication. When enabled, the server will use the filterLogin to search for the user account and then attempt to bind as that account using the provided password. When disabled, the server will use the bind DN and secret to connect to the LDAP server and obtain the secret from the account entry using the attrSecret attribute.


##### `filterLogin`

> Type: <code>String</code> · default: `"(&(objectClass=inetOrgPerson)(mail=?))"`
>
> Searches for user accounts by e-mail address during authentication


##### `filterMailbox`

> Type: <code>String</code> · default: `"(|(&(objectClass=inetOrgPerson)(|(mail=?)(mailAlias=?)))(&(objectClass=groupOfNames)(|(mail=?)(mailAlias=?))))"`
>
> Searches for users or groups matching a recipient e-mail address or alias


##### `filterMemberOf`

> Type: <code>String?</code> · default: `"(&(objectClass=groupOfNames)(member=?))"`
>
> Searches for groups that an account is member of. Use when the group membership is not provided in the account entry. The ? in the filter will be replaced with the account DN.


##### `attrClass`

> Type: <code>String[]</code> · default: `["objectClass"]`
>
> LDAP attribute for the user's account type, if missing defaults to individual.


##### `attrDescription`

> Type: <code>String[]</code> · default: `["description"]`
>
> LDAP attributes used to store the user's description


##### `attrEmail`

> Type: <code>String[]</code> · default: `["mail"]`
>
> LDAP attribute for the user's primary email address


##### `attrEmailAlias`

> Type: <code>String[]</code> · default: `["mailAlias"]`
>
> LDAP attribute for the user's email alias(es)


##### `attrMemberOf`

> Type: <code>String[]</code> · default: `["memberOf"]`
>
> LDAP attributes for the groups that a user belongs to. Used when filterMemberOf is not configured or when the group membership is also provided in the account entry.


##### `attrSecret`

> Type: <code>String[]</code> · default: `["userPassword"]`
>
> LDAP attribute for the user's password hash. This setting is required when binding as a service user. When using bind authentication, configure the secret-changed attribute instead.


##### `attrSecretChanged`

> Type: <code>String[]</code> · default: `["pwdChangeTime"]`
>
> LDAP attribute that provides a password change hash or a timestamp indicating when the password was last changed. When using bind authentication, this attribute is used to determine when to invalidate OAuth tokens.


##### `groupClass`

> Type: <code>String</code> · default: `"groupOfNames"`
>
> LDAP object class used to identify group entries


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192
>
> Maximum number of connections that can be maintained simultaneously in the connection pool


##### `poolTimeoutCreate`

> Type: <code>Duration</code> · default: `"30s"`
>
> Maximum amount of time that the connection pool will wait for a new connection to be created


##### `poolTimeoutRecycle`

> Type: <code>Duration</code> · default: `"30s"`
>
> Maximum amount of time that the connection pool manager will wait for a connection to be recycled


##### `poolTimeoutWait`

> Type: <code>Duration</code> · default: `"30s"`
>
> Maximum amount of time that the connection pool will wait for a connection to become available


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this directory belongs to



### `@type: "Sql"`

SQL Database


##### `description`

> Type: <code>String</code> · required
>
> Short description of this directory


##### `store`

> Type: [<code>SqlAuthStore</code>](#sqlauthstore) · required
>
> Storage backend where accounts and groups are stored


##### `columnEmail`

> Type: <code>String</code> · default: `"name"`
>
> Column name for e-mail address. Optional, you can use instead a query to obtain the account's addresses.


##### `columnSecret`

> Type: <code>String</code> · default: `"secret"`
>
> Column name for the account password.


##### `columnClass`

> Type: <code>String?</code> · default: `"type"`
>
> Column name for account type


##### `columnDescription`

> Type: <code>String?</code> · default: `"description"`
>
> Column name for account full name or description


##### `queryLogin`

> Type: <code>String</code> · default: `"SELECT name, secret, description, type FROM accounts WHERE name = $1"`
>
> Query to obtain the account details by login e-mail address.


##### `queryRecipient`

> Type: <code>String</code> · default: `"SELECT name, secret, description, type FROM accounts WHERE name = $1 AND active = true"`
>
> Query to obtain the account details by recipient e-mail address or alias.


##### `queryMemberOf`

> Type: <code>String?</code> · default: `"SELECT member_of FROM group_members WHERE name = $1"`
>
> Query to obtain the groups an account is member of.


##### `queryEmailAliases`

> Type: <code>String?</code> · default: `"SELECT address FROM emails WHERE name = $1"`
>
> Query to obtain the e-mail aliases of an account.


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this directory belongs to



### `@type: "Oidc"`

OpenID Connect


##### `description`

> Type: <code>String</code> · required
>
> Short description of this directory


##### `issuerUrl`

> Type: <code>Uri</code> · required
>
> The base URL of the OpenID Connect provider (e.g. https://sso.example.com/realms/myrealm). Stalwart will use this URL to automatically discover the provider's endpoints, including the token validation and user info endpoints.


##### `requireAudience`

> Type: <code>String?</code> · default: `"stalwart"`
>
> If set, Stalwart will reject any token whose aud (audience) claim does not include this value. Set this to the client ID or resource identifier registered for Stalwart in your identity provider to ensure tokens issued for other applications are not accepted.


##### `requireScopes`

> Type: <code>String[]</code> · default: `["openid","email"]`
>
> If set, Stalwart will reject any token that does not include all of the specified scopes. Useful for ensuring that only tokens explicitly granted access to the mail server are accepted.


##### `claimUsername`

> Type: <code>String</code> · default: `"preferred_username"`
>
> The claim name used to retrieve the user's login name from the token or user info response. Common values are preferred_username, email, or sub depending on your provider's configuration. If the claim value is not an email address and usernameDomain is set, the domain will be appended automatically (e.g. john becomes john@example.com). If the claim value already contains an @, it is used as-is. If the claim value is not an email address and no usernameDomain is configured, Stalwart will fall back to the email claim. If neither yields a valid email address, authentication will be rejected.


##### `usernameDomain`

> Type: <code>String?</code>
>
> The domain name to append to the username when the value of claimUsername does not contain an @ symbol (e.g. setting this to example.com will turn john into john@example.com). If not set, Stalwart will fall back to the email claim when the username claim does not contain a valid email address.


##### `claimName`

> Type: <code>String?</code> · default: `"name"`
>
> The claim name used to retrieve the user's display name from the token or user info response. Common values are name or display_name. If not set, the display name will not be populated.


##### `claimGroups`

> Type: <code>String?</code>
>
> The claim name used to retrieve the user's group memberships from the token or user info response. Common values are groups or roles depending on your provider's configuration. If not set, group information will not be populated. Note that some providers omit group claims from the token to keep its size small and only return them via the user info endpoint, if group information is missing, ensure your provider is configured to include it.


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this directory belongs to




## JMAP API

The Directory object is available via the `urn:stalwart:jmap` capability.


### `x:Directory/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDirectoryGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Directory/get",
          {
            "ids": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:Directory/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDirectoryCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Directory/set",
          {
            "create": {
              "new1": {
                "@type": "Ldap",
                "baseDn": "Example",
                "bindSecret": {
                  "@type": "None"
                },
                "description": "Example"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Update

This operation requires the `sysDirectoryUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Directory/set",
          {
            "update": {
              "id1": {
                "description": "updated value"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Destroy

This operation requires the `sysDirectoryDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Directory/set",
          {
            "destroy": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




### `x:Directory/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDirectoryQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Directory/query",
          {
            "filter": {
              "memberTenantId": "id1"
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




The `x:Directory/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Directory id1
```


### Create

```sh
stalwart-cli create Directory/Ldap \
  --field description=Example \
  --field baseDn=Example \
  --field 'bindSecret={"@type":"None"}'
```


### Query

```sh
stalwart-cli query Directory
stalwart-cli query Directory --where memberTenantId=id1
```


### Update

```sh
stalwart-cli update Directory id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete Directory --ids id1
```



## Nested types


### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SqlAuthStore {#sqlauthstore}

Defines the SQL database used to store account and group information for SQL directories.


- **`Default`**: Use data store (SQL only). No additional fields.
- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).
- **`Sqlite`**: SQLite. Carries the fields of [`SqliteStore`](#sqlitestore).




#### PostgreSqlStore {#postgresqlstore}

PostgreSQL data store.



##### `timeout`

> Type: <code>Duration?</code> · default: `"15s"`
>
> Connection timeout to the database


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolRecyclingMethod`

> Type: [<code>PostgreSqlRecyclingMethod</code>](#postgresqlrecyclingmethod) · default: `"fast"`
>
> Method to use when recycling connections in the pool


##### `readReplicas`

> Type: [<code>PostgreSqlSettings</code>](#postgresqlsettings)<code>[]</code> · [enterprise](/docs/server/enterprise)
>
> List of read replicas for the store


##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `5432` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





##### PostgreSqlSettings {#postgresqlsettings}

PostgreSQL connection settings.



##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `5432` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





#### MySqlStore {#mysqlstore}

MySQL data store.



##### `timeout`

> Type: <code>Duration?</code> · default: `"15s"`
>
> Connection timeout to the database


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `maxAllowedPacket`

> Type: <code>UnsignedInt?</code> · max: 1073741824 · min: 1024
>
> Maximum size of a packet in bytes


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store


##### `poolMinConnections`

> Type: <code>UnsignedInt?</code> · default: `5` · max: 8192 · min: 1
>
> Minimum number of connections to the store


##### `readReplicas`

> Type: [<code>MySqlSettings</code>](#mysqlsettings)<code>[]</code> · [enterprise](/docs/server/enterprise)
>
> List of read replicas for the store


##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `3306` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store





##### MySqlSettings {#mysqlsettings}

MySQL connection settings.



##### `host`

> Type: <code>String</code> · required
>
> Hostname of the database server


##### `port`

> Type: <code>UnsignedInt</code> · default: `3306` · max: 65535 · min: 1
>
> Port of the database server


##### `database`

> Type: <code>String</code> · default: `"stalwart"`
>
> Name of the database


##### `authUsername`

> Type: <code>String?</code> · default: `"stalwart"`
>
> Username to connect to the store


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Password to connect to the store





#### SqliteStore {#sqlitestore}

SQLite embedded data store.



##### `path`

> Type: <code>String</code> · required
>
> Path to the SQLite data directory


##### `poolWorkers`

> Type: <code>UnsignedInt?</code> · max: 64 · min: 1
>
> Number of worker threads to use for the store, defaults to the number of cores


##### `poolMaxConnections`

> Type: <code>UnsignedInt</code> · default: `10` · max: 8192 · min: 1
>
> Maximum number of connections to the store





## Enums


### PostgreSqlRecyclingMethod {#postgresqlrecyclingmethod}



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


