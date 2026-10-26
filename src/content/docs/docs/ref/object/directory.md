---
title: "Directory"
description: "Defines an external directory for account authentication and lookups."
custom_edit_url: null
---

Defines an external directory for account authentication and lookups.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Directory"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories</span>

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


##### `urlFailover`

> Type: <code>Set&lt;Uri&gt;</code> · [enterprise](/docs/server/enterprise)
>
> URLs of backup LDAP servers, tried in order when the primary server is unreachable


##### `timeout`

> Type: <code>Duration</code> · default: `30000`
>
> Timeout for establishing a connection to the LDAP server and for each LDAP operation


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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
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


##### `filterRecipient`

> Type: <code>String</code> · default: `"(|(&(objectClass=inetOrgPerson)(|(mail=?)(mailAlias=?)))(&(objectClass=groupOfNames)(|(mail=?)(mailAlias=?))))"`
>
> Searches for users or groups matching a recipient e-mail address or alias


##### `filterMemberOf`

> Type: <code>String?</code> · default: `"(&(objectClass=groupOfNames)(member=?))"`
>
> Searches for groups that an account is member of. Use when the group membership is not provided in the account entry. The ? in the filter will be replaced with the account DN.


##### `attrClass`

> Type: <code>Set&lt;String&gt;</code> · default: `{"objectClass":true}`
>
> LDAP attribute for the user's account type, if missing defaults to individual.


##### `attrDescription`

> Type: <code>Set&lt;String&gt;</code> · default: `{"description":true}`
>
> LDAP attributes used to store the user's description


##### `attrEmail`

> Type: <code>Set&lt;String&gt;</code> · default: `{"mail":true}`
>
> LDAP attribute for the user's primary email address


##### `attrEmailAlias`

> Type: <code>Set&lt;String&gt;</code> · default: `{"mailAlias":true}`
>
> LDAP attribute for the user's email alias(es)


##### `attrMemberOf`

> Type: <code>Set&lt;String&gt;</code> · default: `{"memberOf":true}`
>
> LDAP attributes for the groups that a user belongs to. Used when filterMemberOf is not configured or when the group membership is also provided in the account entry.


##### `attrSecret`

> Type: <code>Set&lt;String&gt;</code> · default: `{"userPassword":true}`
>
> LDAP attribute for the user's password hash. This setting is required when binding as a service user. When using bind authentication, configure the secret-changed attribute instead.


##### `attrSecretChanged`

> Type: <code>Set&lt;String&gt;</code> · default: `{"pwdChangeTime":true}`
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

> Type: <code>Duration</code> · default: `30000`
>
> Maximum amount of time that the connection pool will wait for a new connection to be created


##### `poolTimeoutRecycle`

> Type: <code>Duration</code> · default: `30000`
>
> Maximum amount of time that the connection pool manager will wait for a connection to be recycled


##### `poolTimeoutWait`

> Type: <code>Duration</code> · default: `30000`
>
> Maximum amount of time that the connection pool will wait for a connection to become available


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this directory belongs to



### `@type: "Sql"`

SQL Database


##### `description`

> Type: <code>String</code> · required
>
> Short description of this directory


##### `store`

> Type: [<code>SqlAuthStore</code>](#sqlauthstore) · default: `{"@type":"Default"}`
>
> Storage backend where accounts and groups are stored


##### `columnEmail`

> Type: <code>String</code> · default: `"name"`
>
> Column holding the account's primary e-mail address. When the column is missing from the result or does not hold an address, the login name is used as the address at sign-in, and recipient lookups find no aliases or groups.


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

> Type: <code>String</code> · default: `"SELECT name, secret, description, type FROM accounts WHERE name = $1 AND active = true"`
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

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
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
> The issuer URL of the OpenID Connect provider (e.g. https://sso.example.com/realms/myrealm). It is compared exactly with the issuer reported by the provider, so enter it exactly as the provider reports it, including any trailing slash. Endpoints are discovered from /.well-known/oauth-authorization-server first and then from /.well-known/openid-configuration. For Microsoft Entra ID, use the tenant-specific issuer.


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the OpenID Connect provider


##### `claimUsername`

> Type: <code>String</code> · default: `"preferred_username"`
>
> The claim name used to retrieve the user's login name from the token or user info response. Common values are preferred_username, email, or sub depending on the provider's configuration. If the claim value is not an email address and usernameDomain is set, the domain will be appended automatically (e.g. john becomes john@example.com). If the claim value already contains an @, it is used as-is. If the claim value is not an email address and no usernameDomain is configured, Stalwart will fall back to the email claim. If neither yields a valid email address, authentication will be rejected.


##### `usernameDomain`

> Type: <code>String?</code>
>
> The domain name to append to the username when the value of claimUsername does not contain an @ symbol (e.g. setting this to example.com will turn john into john@example.com). If not set, Stalwart will fall back to the email claim when the username claim does not contain a valid email address.


##### `claimName`

> Type: <code>String?</code>
>
> The claim name used to retrieve the user's display name from the token or user info response. Common values are name or display_name. If not set, the display name will not be populated. When it is set and the access token does not carry the claim, every login calls the provider's user info endpoint to fetch it, so leave it unset unless the provider includes it in access tokens or the extra request is acceptable.


##### `claimGroups`

> Type: <code>String?</code>
>
> The claim name used to retrieve the user's group memberships from the token or user info response. Common values are groups or roles depending on the provider's configuration. If not set, group information will not be populated. Note that some providers omit group claims from the token to keep its size small and only return them via the user info endpoint. When it is set and the access token does not carry the claim, every login calls the user info endpoint to fetch it.


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this directory belongs to


##### `acceptedAudiences`

> Type: <code>Set&lt;String&gt;</code>
>
> Additional values accepted in the token's aud claim besides this server's resource identifiers. Use it for the audience the identity provider puts in access tokens, for example the client id of the web interface, an API identifier, or a project id.


##### `opaqueTokenValidation`

> Type: [<code>OidcOpaqueTokenValidation</code>](#oidcopaquetokenvalidation) · default: `"none"`
>
> How access tokens that are not JWTs are validated. Disabled rejects them. User info calls the provider's UserInfo endpoint, which cannot check the token's audience or scopes, so any token the provider issued to any application is accepted, with the access set by the tokens without scopes option. Introspection calls the provider's RFC 7662 introspection endpoint, checks audience and scopes, and requires client credentials. Only one method is used per token.


##### `introspectionClientId`

> Type: <code>String?</code>
>
> Client id used to authenticate to the introspection endpoint


##### `introspectionClientSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Client secret used to authenticate to the introspection endpoint


##### `introspectionAuthMethod`

> Type: [<code>OidcIntrospectionAuth</code>](#oidcintrospectionauth) · default: `"clientSecretBasic"`
>
> How the server authenticates to the introspection endpoint


##### `unscopedTokens`

> Type: [<code>OidcUnscopedTokenPolicy</code>](#oidcunscopedtokenpolicy) · default: `"reject"`
>
> How access tokens that carry none of the interoperable mail, contacts, calendars or files scopes are handled. Tokens issued to this server's web interface always have full access. Reject follows the OAuth profile for open public clients. Interoperable services grants access to mail, contacts, calendars and files, which is enough for mail clients when the provider cannot issue these scopes. Full access also grants management permissions to any such token and should only be used together with a strict audience check.


##### `skipAudienceValidation`

> Type: <code>Boolean</code> · default: `false`
>
> Accept access tokens whose aud claim is missing or matches none of this server's resource identifiers or accepted audiences. Tokens issued to any application at the provider will then be accepted.


##### `allowIdTokenClaims`

> Type: <code>Boolean</code> · default: `false`
>
> Accept JWT access tokens that carry ID token claims such as nonce or at_hash. Needed for providers whose access tokens are copies of the ID token. When enabled, an ID token can be presented as an access token.


##### `lenientIssuerMatch`

> Type: <code>Boolean</code> · default: `false`
>
> Ignore a trailing slash difference between the configured issuer URL and the issuer reported by the provider and found in tokens




## JMAP API

The Directory object is available via the `urn:stalwart:jmap` capability.


### `x:Directory/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDirectoryGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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

Supports the following operations in a single call: create, update, destroy.



#### Create

This operation requires the `sysDirectoryCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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
                "description": "Example",
                "urlFailover": {}
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

This operation requires the `sysDirectoryUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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

This operation requires the `sysDirectoryDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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


This method requires the `sysDirectoryQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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
  --field 'urlFailover={}' \
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


### SecretKeyOptional

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SqlAuthStore

Defines the SQL database used to store account and group information for SQL directories.


- **`Default`**: Use data store (SQL only). No additional fields.
- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).
- **`Sqlite`**: SQLite. Carries the fields of [`SqliteStore`](#sqlitestore).




#### PostgreSqlStore

PostgreSQL data store.



##### `connectTimeout`

> Type: <code>Duration?</code> · default: `15000`
>
> Maximum time to wait for a connection to the database server to be established


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Use TLS to connect to the store


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Allow invalid TLS certificates when connecting to the store


##### `poolMaxConnections`

> Type: <code>UnsignedInt?</code> · max: 8192 · min: 1
>
> Maximum number of connections to the store. When unset, 4 per CPU core, between 16 and 32.


##### `poolRecyclingMethod`

> Type: [<code>PostgreSqlRecyclingMethod</code>](#postgresqlrecyclingmethod) · default: `"fast"`
>
> Method to use when recycling connections in the pool


##### `readReplicas`

> Type: <code>List&lt;</code>[<code>PostgreSqlSettings</code>](#postgresqlsettings)<code>&gt;</code> · [enterprise](/docs/server/enterprise)
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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





##### PostgreSqlSettings

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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store


##### `options`

> Type: <code>String?</code>
>
> Additional connection options





#### MySqlStore

MySQL data store.



##### `idleTimeout`

> Type: <code>Duration?</code> · default: `15000`
>
> Time an idle connection may stay open before the server closes it (sets the MySQL wait_timeout session variable)


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

> Type: <code>UnsignedInt?</code> · max: 8192 · min: 1
>
> Maximum number of connections to the store. When unset, 4 per CPU core, between 16 and 32.


##### `poolMinConnections`

> Type: <code>UnsignedInt?</code> · default: `5` · max: 8192 · min: 1
>
> Minimum number of connections to the store


##### `readReplicas`

> Type: <code>List&lt;</code>[<code>MySqlSettings</code>](#mysqlsettings)<code>&gt;</code> · [enterprise](/docs/server/enterprise)
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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store





##### MySqlSettings

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

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> Password to connect to the store





#### SqliteStore

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

> Type: <code>UnsignedInt?</code> · max: 8192 · min: 1
>
> Maximum number of connections to the store. When unset, the number of worker threads, between 4 and 16.





## Enums


### PostgreSqlRecyclingMethod



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


### OidcOpaqueTokenValidation



| Value | Label |
|---|---|
| `none` | Disabled |
| `userInfo` | UserInfo endpoint (no audience or scope checks) |
| `introspection` | Token introspection (RFC 7662) |


### OidcIntrospectionAuth



| Value | Label |
|---|---|
| `clientSecretBasic` | HTTP Basic (client_secret_basic) |
| `clientSecretPost` | Form parameters (client_secret_post) |
| `none` | No authentication |


### OidcUnscopedTokenPolicy



| Value | Label |
|---|---|
| `reject` | Reject |
| `interoperable` | Interoperable services only |
| `full` | Full access (unsafe) |


