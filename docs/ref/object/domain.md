---
title: Domain
description: Defines an email domain and its DNS, DKIM, and TLS certificate settings.
custom_edit_url: null
---

# Domain

Defines an email domain and its DNS, DKIM, and TLS certificate settings.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains

## Fields


##### `name`

> Type: <code>DomainName</code> · required
>
> Domain name


##### `aliases`

> Type: <code>DomainName[]</code>
>
> List of additional domain names that are aliases of this domain


##### `isEnabled`

> Type: <code>Boolean</code> · default: `true`
>
> Whether this domain is enabled


##### `createdAt`

> Type: <code>UTCDateTime</code> · read-only · server-set
>
> Creation date of the domain


##### `description`

> Type: <code>String?</code>
>
> Description of the domain


##### `logo`

> Type: <code>String?</code> · [enterprise](/docs/server/enterprise)
>
> URL or base64-encoded image representing the domain


##### `certificateManagement`

> Type: [<code>CertificateManagement</code>](#certificatemanagement) · required
>
> Whether TLS certificates for this domain are managed manually or automatically by an ACME provider


##### `dkimManagement`

> Type: [<code>DkimManagement</code>](#dkimmanagement) · required
>
> Whether DKIM keys for this domain are managed manually or automatically by the server


##### `dnsManagement`

> Type: [<code>DnsManagement</code>](#dnsmanagement) · required
>
> Whether DNS records for this domain are managed manually or automatically by a DNS provider


##### `dnsZoneFile`

> Type: <code>Text</code> · server-set
>
> Current DNS zone data for the domain


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this domain belongs to


##### `directoryId`

> Type: <code>Id&lt;</code>[<code>Directory</code>](./directory.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the directory where accounts for this domain are stored, or null to use the internal directory


##### `catchAllAddress`

> Type: <code>EmailAddress?</code>
>
> Catch-all email address that receives messages addressed to unknown local recipients


##### `subAddressing`

> Type: [<code>SubAddressing</code>](#subaddressing) · required
>
> Whether sub-addressing (plus addressing) is enabled for the domain


##### `allowRelaying`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow relaying for non-local recipients, useful in split delivery scenarios


##### `reportAddressUri`

> Type: <code>String?</code> · default: `"mailto:postmaster"`
>
> Email address to receive DMARC, TLS-RPT and CAA reports for this domain, or null to not receive reports



## JMAP API

The Domain object is available via the `urn:stalwart:jmap` capability.


### `x:Domain/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDomainGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Domain/get",
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



### `x:Domain/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDomainCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Domain/set",
          {
            "create": {
              "new1": {
                "aliases": [],
                "allowRelaying": false,
                "catchAllAddress": "user@example.com",
                "certificateManagement": {
                  "@type": "Manual"
                },
                "description": "Example",
                "directoryId": "<Directory id>",
                "dkimManagement": {
                  "@type": "Automatic",
                  "algorithms": [
                    "Dkim1Ed25519Sha256",
                    "Dkim1RsaSha256"
                  ],
                  "deleteAfter": "30d",
                  "retireAfter": "7d",
                  "rotateAfter": "90d",
                  "selectorTemplate": "v{version}-{algorithm}-{date-%Y%m%d}"
                },
                "dnsManagement": {
                  "@type": "Manual"
                },
                "isEnabled": true,
                "logo": "Example",
                "memberTenantId": "<Tenant id>",
                "name": "example.com",
                "reportAddressUri": "mailto:postmaster",
                "subAddressing": {
                  "@type": "Enabled"
                }
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

This operation requires the `sysDomainUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Domain/set",
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

This operation requires the `sysDomainDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Domain/set",
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




### `x:Domain/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDomainQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Domain/query",
          {
            "filter": {
              "text": "example"
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




The `x:Domain/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `name` | text |
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get domain id1
```


### Create

```sh
stalwart-cli create domain \
  --field name=example.com \
  --field 'aliases=[]' \
  --field isEnabled=true \
  --field description=Example \
  --field logo=Example \
  --field 'certificateManagement={"@type":"Manual"}' \
  --field 'dkimManagement={"@type":"Automatic","algorithms":["Dkim1Ed25519Sha256","Dkim1RsaSha256"],"deleteAfter":"30d","retireAfter":"7d","rotateAfter":"90d","selectorTemplate":"v{version}-{algorithm}-{date-%Y%m%d}"}' \
  --field 'dnsManagement={"@type":"Manual"}' \
  --field 'memberTenantId=<Tenant id>' \
  --field 'directoryId=<Directory id>' \
  --field catchAllAddress=user@example.com \
  --field 'subAddressing={"@type":"Enabled"}' \
  --field allowRelaying=false \
  --field reportAddressUri=mailto:postmaster
```


### Query

```sh
stalwart-cli query domain
stalwart-cli query domain --where text=example
```


### Update

```sh
stalwart-cli update domain id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete domain --ids id1
```



## Nested types


### CertificateManagement {#certificatemanagement}

Defines how TLS certificates for the domain are managed.


- **`Manual`**: Manual TLS certificate management. No additional fields.
- **`Automatic`**: ACME TLS certificate management. Carries the fields of [`CertificateManagementProperties`](#certificatemanagementproperties).




#### CertificateManagementProperties {#certificatemanagementproperties}

Automatic TLS certificate management settings using an ACME provider.



##### `acmeProviderId`

> Type: <code>Id&lt;</code>[<code>AcmeProvider</code>](./acme-provider.md)<code>&gt;</code> · required
>
> Identifier for the ACME provider managing certificates for this domain


##### `subjectAlternativeNames`

> Type: <code>String[]</code>
>
> Additional hostnames to include in the certificate as Subject Alternative Names (SANs).
> Enter hostnames only (e.g. `mta-sts`, `autoconfig`), the domain is appended automatically.
> To include the apex domain, enter it in full (e.g. `example.org`).
> Leave empty to request a wildcard certificate when possible, or to use the default SANs.





### DkimManagement {#dkimmanagement}

Defines how DKIM keys for the domain are managed.


- **`Automatic`**: Automatic DKIM management. Carries the fields of [`DkimManagementProperties`](#dkimmanagementproperties).
- **`Manual`**: Manual DKIM management. No additional fields.




#### DkimManagementProperties {#dkimmanagementproperties}

Automatic DKIM key generation and rotation settings.



##### `algorithms`

> Type: [<code>DkimSignatureType</code>](#dkimsignaturetype)<code>[]</code> · default: `["Dkim1Ed25519Sha256","Dkim1RsaSha256"]`
>
> List of signing algorithms to use when generating new DKIM keys


##### `selectorTemplate`

> Type: <code>String</code> · default: `"v{version}-{algorithm}-{date-%Y%m%d}"`
>
> Template for generating DKIM selectors during key rotation. Supported variables:
> - `{algorithm}`: signing algorithm in lowercase (`rsa`, `ed25519`)
> - `{hash}`: hash algorithm (`sha256`)
> - `{version}`: DKIM version number (`1`)
> - `{date-<fmt>}`: current UTC date formatted with chrono strftime (e.g. `{date-%Y%m%d}`)
> - `{epoch}`: current UTC unix timestamp
> - `{random}`: random 8-character alphanumeric string


##### `rotateAfter`

> Type: <code>Duration</code> · default: `"90d"`
>
> How often to rotate DKIM keys. Requires automatic DNS management to be enabled for the domain.


##### `retireAfter`

> Type: <code>Duration</code> · default: `"7d"`
>
> How long to keep the old key's DNS record published after rotation before removing it. Requires automatic DNS management.


##### `deleteAfter`

> Type: <code>Duration</code> · default: `"30d"`
>
> How long to retain old DKIM keys on the server after rotation before deleting them permanently. Requires automatic DNS management.





### DnsManagement {#dnsmanagement}

Defines how DNS records for the domain are managed.


- **`Manual`**: Manual DNS management. No additional fields.
- **`Automatic`**: Automatic DNS management. Carries the fields of [`DnsManagementProperties`](#dnsmanagementproperties).




#### DnsManagementProperties {#dnsmanagementproperties}

Automatic DNS record management settings using a DNS provider.



##### `dnsServerId`

> Type: <code>Id&lt;</code>[<code>DnsServer</code>](./dns-server.md)<code>&gt;</code> · required
>
> Identifier for the DNS server provider managing DNS records for this domain


##### `origin`

> Type: <code>String?</code>
>
> Origin domain used to determine the correct DNS zone for managing records. For example, if the domain is "sub.example.com" and DNS records should be managed in the "example.com" zone, set the origin to "example.com". Leave empty to use the domain name itself as the zone origin.


##### `publishRecords`

> Type: [<code>DnsRecordType</code>](#dnsrecordtype)<code>[]</code> · default: `["dkim","spf","mx","dmarc","srv","mtaSts","tlsRpt","caa","autoConfig","autoConfigLegacy","autoDiscover"]` · min items: 1
>
> Which DNS record types should be automatically published and kept in sync





### SubAddressing {#subaddressing}

Defines sub-addressing (plus addressing) settings for the domain.


- **`Enabled`**: Enable sub-addressing. No additional fields.
- **`Custom`**: Enable custom sub-addressing. Carries the fields of [`SubAddressingCustom`](#subaddressingcustom).
- **`Disabled`**: Disable sub-addressing. No additional fields.




#### SubAddressingCustom {#subaddressingcustom}

Custom sub-addressing rules for the domain.



##### `customRule`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that defines custom sub-addressing rules for the domain
>
> Available variables: [`MtaRcptVariable`](../expression/variable/mta-rcpt-variable.md).





##### Expression {#expression}

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





##### ExpressionMatch {#expressionmatch}

A single condition-result pair in an expression.



##### `if`

> Type: <code>String</code> · required
>
> If condition


##### `then`

> Type: <code>String</code> · required
>
> Then clause





## Enums


### DkimSignatureType {#dkimsignaturetype}



| Value | Label |
|---|---|
| `Dkim1Ed25519Sha256` | DKIM1 - Ed25519 SHA-256 |
| `Dkim1RsaSha256` | DKIM1 - RSA SHA-256 |


### DnsRecordType {#dnsrecordtype}



| Value | Label |
|---|---|
| `dkim` | DKIM public keys |
| `tlsa` | TLSA records |
| `spf` | SPF records |
| `mx` | MX records |
| `dmarc` | DMARC policy |
| `srv` | SRV records |
| `mtaSts` | MTA-STS policy record |
| `tlsRpt` | TLS reporting record |
| `caa` | CAA records |
| `autoConfig` | Autoconfig records |
| `autoConfigLegacy` | Legacy Autoconfig records |
| `autoDiscover` | Microsoft Autodiscover records |


## Expression references

The following expression contexts are used by fields on this page:

- [`MtaRcptVariable`](../expression/variable/mta-rcpt-variable.md) (Variables)

