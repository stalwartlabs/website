---
title: Bootstrap
description: Initial setup shown the first time Stalwart starts. Configures the server's identity, storage, user accounts, logging, and DNS management.
custom_edit_url: null
---

# Bootstrap

Initial setup shown the first time Stalwart starts. Configures the server's identity, storage, user accounts, logging, and DNS management.

## Fields


##### `serverHostname`

> Type: <code>HostName</code> · required
>
> The public hostname this server answers to, for example mail.example.com.
> Used in SMTP greetings, outgoing message headers, and TLS certificate requests.


##### `defaultDomain`

> Type: <code>String</code> · required
>
> The primary email domain this installation will serve, for example example.com.
> Additional domains can be added at any time after setup.


##### `requestTlsCertificate`

> Type: <code>Boolean</code> · default: `true`
>
> Automatically obtain a free TLS certificate for the server hostname from Let's Encrypt using the ACME protocol, so clients can connect securely out of the box.
> Turn this off if you plan to install a certificate manually.


##### `generateDkimKeys`

> Type: <code>Boolean</code> · default: `true`
>
> Generate DKIM signing keys for the default domain. DKIM cryptographically signs outgoing mail and significantly improves the chances that messages reach the recipient's inbox instead of spam.
> Turn this off only if you plan to manage DKIM keys yourself.


##### `dataStore`

> Type: [<code>DataStore</code>](./data-store.md) · default: `{"@type":"RocksDb","path":"/var/lib/stalwart/"}`
>
> Where structured data is kept: email metadata, calendars, contacts, mailbox state, and server settings.
> RocksDB is recommended for single-node installations; PostgreSQL, MySQL, SQLite, and FoundationDB are also supported.


##### `blobStore`

> Type: [<code>BlobStore</code>](./blob-store.md) · default: `{"@type":"Default"}`
>
> Where the raw content of email messages, attachments, and other large files is stored.
> Leave as default to reuse the data store, or point to an object storage service such as S3 for larger deployments.


##### `searchStore`

> Type: [<code>SearchStore</code>](./search-store.md) · default: `{"@type":"Default"}`
>
> Where the full-text search index is kept, so users can search across message bodies and attachments.
> Leave as default to reuse the data store, or point to a dedicated search backend for larger deployments.


##### `inMemoryStore`

> Type: [<code>InMemoryStore</code>](./in-memory-store.md) · default: `{"@type":"Default"}`
>
> Where short-lived data lives: session caches, rate-limit counters, and temporary tokens.
> Leave as default to reuse the data store, or point to Redis for faster lookups and multi-node deployments.


##### `directory`

> Type: [<code>DirectoryBootstrap</code>](#directorybootstrap) · default: `{"@type":"Internal"}`
>
> Where user accounts and credentials come from.
> The internal directory is recommended for ease of setup and management through the WebUI, but external OIDC or LDAP directories can be used for single sign-on and user provisioning in larger organizations.


##### `tracer`

> Type: [<code>Tracer</code>](./tracer.md) · default: `{"@type":"Log","path":"/var/log/stalwart/"}`
>
> Where the server writes log messages, traces, and diagnostic events.
> Defaults to log files on disk; remote destinations such as OpenTelemetry or webhooks can be added after setup.


##### `dnsServer`

> Type: [<code>DnsServerBootstrap</code>](#dnsserverbootstrap) · default: `{"@type":"Manual"}`
>
> Optionally automate the DNS records your mail server needs (SPF, DKIM, DMARC, and more) by connecting to your DNS provider's API.
> Leave as manual unless your DNS is hosted by a supported provider; this can always be enabled later.



## JMAP API

The Bootstrap singleton is available via the `urn:stalwart:jmap` capability.


### `x:Bootstrap/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysBootstrapGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Bootstrap/get",
          {
            "ids": [
              "singleton"
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



### `x:Bootstrap/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysBootstrapUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Bootstrap/set",
          {
            "update": {
              "singleton": {
                "defaultDomain": "updated value"
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get bootstrap
```


### Update

```sh
stalwart-cli update bootstrap --field description='Updated'
```



## Nested types


### DirectoryBootstrap {#directorybootstrap}

External directory service configuration for user authentication and lookup.


- **`Internal`**: Use the internal directory. No additional fields.
- **`Ldap`**: LDAP Directory. Carries the fields of [`LdapDirectory`](#ldapdirectory).
- **`Sql`**: SQL Database. Carries the fields of [`SqlDirectory`](#sqldirectory).
- **`Oidc`**: OpenID Connect. Carries the fields of [`OidcDirectory`](#oidcdirectory).




#### LdapDirectory {#ldapdirectory}

LDAP directory connection and mapping settings.



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





##### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





#### SqlDirectory {#sqldirectory}

SQL database directory settings.



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





##### SqlAuthStore {#sqlauthstore}

Defines the SQL database used to store account and group information for SQL directories.


- **`Default`**: Use data store (SQL only). No additional fields.
- **`PostgreSql`**: PostgreSQL. Carries the fields of [`PostgreSqlStore`](#postgresqlstore).
- **`MySql`**: mySQL. Carries the fields of [`MySqlStore`](#mysqlstore).
- **`Sqlite`**: SQLite. Carries the fields of [`SqliteStore`](#sqlitestore).




##### PostgreSqlStore {#postgresqlstore}

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





##### MySqlStore {#mysqlstore}

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





##### SqliteStore {#sqlitestore}

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





#### OidcDirectory {#oidcdirectory}

OpenID Connect directory settings.



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





### DnsServerBootstrap {#dnsserverbootstrap}

Automatic DNS server management.


- **`Manual`**: Manual DNS server management. No additional fields.
- **`Tsig`**: RFC2136 (TSIG). Carries the fields of [`DnsServerTsig`](#dnsservertsig).
- **`Sig0`**: RFC2136 (SIG0). Carries the fields of [`DnsServerSig0`](#dnsserversig0).
- **`Cloudflare`**: Cloudflare. Carries the fields of [`DnsServerCloudflare`](#dnsservercloudflare).
- **`DigitalOcean`**: DigitalOcean. Carries the fields of [`DnsServerCloud`](#dnsservercloud).
- **`DeSEC`**: DeSEC. Carries the fields of [`DnsServerCloud`](#dnsservercloud).
- **`Ovh`**: OVH. Carries the fields of [`DnsServerOvh`](#dnsserverovh).
- **`Bunny`**: BunnyDNS. Carries the fields of [`DnsServerCloud`](#dnsservercloud).
- **`Porkbun`**: Porkbun. Carries the fields of [`DnsServerPorkbun`](#dnsserverporkbun).
- **`Dnsimple`**: DNSimple. Carries the fields of [`DnsServerDnsimple`](#dnsserverdnsimple).
- **`Spaceship`**: Spaceship. Carries the fields of [`DnsServerSpaceship`](#dnsserverspaceship).
- **`Route53`**: AWS Route53. Carries the fields of [`DnsServerRoute53`](#dnsserverroute53).
- **`GoogleCloudDns`**: Google Cloud DNS. Carries the fields of [`DnsServerGoogleCloudDns`](#dnsservergoogleclouddns).




#### DnsServerTsig {#dnsservertsig}

RFC2136 TSIG DNS server.



##### `host`

> Type: <code>IpAddr</code> · required
>
> The IP address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · max: 65535 · min: 1
>
> The port used to communicate with the DNS server


##### `keyName`

> Type: <code>String</code> · required
>
> The key used to authenticate with the DNS server


##### `key`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `protocol`

> Type: [<code>IpProtocol</code>](#ipprotocol) · default: `"udp"`
>
> The protocol used to communicate with the DNS server


##### `tsigAlgorithm`

> Type: [<code>TsigAlgorithm</code>](#tsigalgorithm) · default: `"hmac-sha512"`
>
> The TSIG algorithm used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





##### SecretKey {#secretkey}

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### DnsServerSig0 {#dnsserversig0}

RFC2136 SIG0 DNS server.



##### `host`

> Type: <code>IpAddr</code> · required
>
> The IP address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · max: 65535 · min: 1
>
> The port used to communicate with the DNS server


##### `publicKey`

> Type: <code>String</code> · required
>
> The public key used to authenticate with the DNS server


##### `key`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> The secret or token used to authenticate with the DNS server


##### `signerName`

> Type: <code>String</code> · required
>
> The signer name used in the SIG0 records


##### `protocol`

> Type: [<code>IpProtocol</code>](#ipprotocol) · default: `"udp"`
>
> The protocol used to communicate with the DNS server


##### `sig0Algorithm`

> Type: [<code>Sig0Algorithm</code>](#sig0algorithm) · default: `"ed25519"`
>
> The SIG0 algorithm used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





##### SecretText {#secrettext}

A secret text value provided directly, from an environment variable, or from a file.


- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretTextValue {#secrettextvalue}

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





#### DnsServerCloudflare {#dnsservercloudflare}

Cloudflare DNS server.



##### `email`

> Type: <code>String?</code>
>
> Optional account email to authenticate with Cloudflare


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerCloud {#dnsservercloud}

Cloud DNS server with token authentication.



##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerOvh {#dnsserverovh}

OVH DNS server.



##### `applicationKey`

> Type: <code>String</code> · required
>
> The application key used to authenticate with the OVH DNS server


##### `applicationSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The application secret used to authenticate with the OVH DNS server


##### `consumerKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The consumer key used to authenticate with the OVH DNS server


##### `ovhEndpoint`

> Type: [<code>OvhEndpoint</code>](#ovhendpoint) · default: `"ovh-eu"`
>
> Which OVH endpoint to use


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerPorkbun {#dnsserverporkbun}

Porkbun DNS server.



##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Porkbun


##### `secretApiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret API key used to authenticate with Porkbun


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerDnsimple {#dnsserverdnsimple}

DNSimple DNS server.



##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The authentication token used to authenticate with DNSimple


##### `accountIdentifier`

> Type: <code>String</code> · required
>
> The account ID used to authenticate with DNSimple


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerSpaceship {#dnsserverspaceship}

Spaceship DNS server.



##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Spaceship


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerRoute53 {#dnsserverroute53}

AWS Route53 DNS server.



##### `accessKeyId`

> Type: <code>String</code> · required
>
> The AWS access key ID


##### `secretAccessKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The AWS secret access key


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional session token for temporary AWS credentials


##### `region`

> Type: <code>String</code> · default: `"us-east-1"`
>
> The AWS region


##### `hostedZoneId`

> Type: <code>String?</code>
>
> Hosted zone ID to use (resolved automatically by name if not set)


##### `privateZoneOnly`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





#### DnsServerGoogleCloudDns {#dnsservergoogleclouddns}

Google Cloud DNS server.



##### `serviceAccountJson`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> Service account JSON credentials used to authenticate with Google Cloud


##### `projectId`

> Type: <code>String</code> · required
>
> The Google Cloud project ID that owns the managed zone


##### `managedZone`

> Type: <code>String?</code>
>
> Managed zone name (resolved automatically by longest suffix match if not set)


##### `privateZone`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `impersonateServiceAccount`

> Type: <code>String?</code>
>
> Optional service account email to impersonate


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)





## Enums


### PostgreSqlRecyclingMethod {#postgresqlrecyclingmethod}



| Value | Label |
|---|---|
| `fast` | Fast recycling method |
| `verified` | Verified recycling method |
| `clean` | Clean recycling method |


### IpProtocol {#ipprotocol}



| Value | Label |
|---|---|
| `udp` | UDP |
| `tcp` | TCP |


### TsigAlgorithm {#tsigalgorithm}



| Value | Label |
|---|---|
| `hmac-md5` | HMAC-MD5 |
| `gss` | GSS |
| `hmac-sha1` | HMAC-SHA1 |
| `hmac-sha224` | HMAC-SHA224 |
| `hmac-sha256` | HMAC-SHA256 |
| `hmac-sha256-128` | HMAC-SHA256-128 |
| `hmac-sha384` | HMAC-SHA384 |
| `hmac-sha384-192` | HMAC-SHA384-192 |
| `hmac-sha512` | HMAC-SHA512 |
| `hmac-sha512-256` | HMAC-SHA512-256 |


### Sig0Algorithm {#sig0algorithm}



| Value | Label |
|---|---|
| `ecdsa-p256-sha256` | ECDSA-P256-SHA256 |
| `ecdsa-p384-sha384` | ECDSA-P384-SHA384 |
| `ed25519` | ED25519 |


### OvhEndpoint {#ovhendpoint}



| Value | Label |
|---|---|
| `ovh-eu` | OVH EU |
| `ovh-ca` | OVH CA |
| `kimsufi-eu` | Kimsufi EU |
| `kimsufi-ca` | Kimsufi CA |
| `soyoustart-eu` | Soyoustart EU |
| `soyoustart-ca` | Soyoustart CA |


