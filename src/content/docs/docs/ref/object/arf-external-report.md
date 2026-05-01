---
title: ArfExternalReport
description: Stores an ARF feedback report received from an external source.
custom_edit_url: null
---

# ArfExternalReport

Stores an ARF feedback report received from an external source.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Inbox › ARF

## Fields


##### `report`

> Type: [<code>ArfFeedbackReport</code>](#arffeedbackreport) · required
>
> Parsed ARF feedback report content


##### `from`

> Type: <code>EmailAddress</code> · required
>
> Email address of the report sender


##### `subject`

> Type: <code>String</code> · required
>
> Subject line of the report email


##### `to`

> Type: <code>EmailAddress[]</code>
>
> List of recipient email addresses


##### `receivedAt`

> Type: <code>UTCDateTime</code> · required
>
> When the report email was received


##### `expiresAt`

> Type: <code>UTCDateTime</code> · required
>
> When the report is scheduled to be deleted


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this report belongs to



## JMAP API

The ArfExternalReport object is available via the `urn:stalwart:jmap` capability.


### `x:ArfExternalReport/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysArfExternalReportGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArfExternalReport/get",
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



### `x:ArfExternalReport/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysArfExternalReportCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArfExternalReport/set",
          {
            "create": {
              "new1": {
                "expiresAt": "2026-01-01T00:00:00Z",
                "from": "user@example.com",
                "receivedAt": "2026-01-01T00:00:00Z",
                "report": {
                  "authFailure": "adsp",
                  "authenticationResults": {},
                  "deliveryResult": "delivered",
                  "feedbackType": "abuse",
                  "identityAlignment": "none",
                  "reportedDomains": {},
                  "reportedUris": {}
                },
                "subject": "Example",
                "to": {}
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

This operation requires the `sysArfExternalReportUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArfExternalReport/set",
          {
            "update": {
              "id1": {
                "subject": "updated value"
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

This operation requires the `sysArfExternalReportDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArfExternalReport/set",
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




### `x:ArfExternalReport/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysArfExternalReportQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArfExternalReport/query",
          {
            "filter": {}
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get ArfExternalReport id1
```


### Create

```sh
stalwart-cli create ArfExternalReport \
  --field 'report={"authFailure":"adsp","authenticationResults":{},"deliveryResult":"delivered","feedbackType":"abuse","identityAlignment":"none","reportedDomains":{},"reportedUris":{}}' \
  --field from=user@example.com \
  --field subject=Example \
  --field 'to={}' \
  --field receivedAt=2026-01-01T00:00:00Z \
  --field expiresAt=2026-01-01T00:00:00Z
```


### Query

```sh
stalwart-cli query ArfExternalReport
```


### Update

```sh
stalwart-cli update ArfExternalReport id1 --field subject='updated value'
```


### Delete

```sh
stalwart-cli delete ArfExternalReport --ids id1
```



## Nested types


### ArfFeedbackReport {#arffeedbackreport}

Parsed content of an ARF feedback report.



##### `feedbackType`

> Type: [<code>ArfFeedbackType</code>](#arffeedbacktype) · required
>
> Type of feedback being reported


##### `arrivalDate`

> Type: <code>UTCDateTime?</code>
>
> When the original message arrived


##### `authenticationResults`

> Type: <code>String[]</code>
>
> Authentication-Results header values from the original message


##### `incidents`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of incidents represented by this report


##### `originalEnvelopeId`

> Type: <code>String?</code>
>
> Original SMTP envelope ID (ENVID)


##### `originalMailFrom`

> Type: <code>EmailAddress?</code>
>
> Original envelope sender address (MAIL FROM)


##### `originalRcptTo`

> Type: <code>EmailAddress?</code>
>
> Original envelope recipient address (RCPT TO)


##### `reportedDomains`

> Type: <code>DomainName[]</code>
>
> Domains being reported


##### `reportedUris`

> Type: <code>Uri[]</code>
>
> URIs being reported


##### `reportingMta`

> Type: <code>String?</code>
>
> Hostname of the MTA generating this report


##### `sourceIp`

> Type: <code>IpAddr?</code>
>
> IP address of the original message source


##### `sourcePort`

> Type: <code>UnsignedInt?</code> · min: 1 · max: 65535
>
> Port of the original message source


##### `userAgent`

> Type: <code>String?</code>
>
> Software that generated this report


##### `version`

> Type: <code>UnsignedInt</code> · default: `1`
>
> ARF format version


##### `authFailure`

> Type: [<code>ArfAuthFailureType</code>](#arfauthfailuretype) · required
>
> Type of authentication failure (for auth-failure reports)


##### `deliveryResult`

> Type: [<code>ArfDeliveryResult</code>](#arfdeliveryresult) · required
>
> What happened to the original message


##### `dkimAdspDns`

> Type: <code>String?</code>
>
> DKIM ADSP DNS record content


##### `dkimCanonicalizedBody`

> Type: <code>String?</code>
>
> Message body after DKIM canonicalization


##### `dkimCanonicalizedHeader`

> Type: <code>String?</code>
>
> Message headers after DKIM canonicalization


##### `dkimDomain`

> Type: <code>String?</code>
>
> Domain from the DKIM signature


##### `dkimIdentity`

> Type: <code>String?</code>
>
> Identity from the DKIM signature (i= tag)


##### `dkimSelector`

> Type: <code>String?</code>
>
> Selector from the DKIM signature


##### `dkimSelectorDns`

> Type: <code>String?</code>
>
> DKIM selector DNS record content


##### `spfDns`

> Type: <code>String?</code>
>
> SPF DNS record content


##### `identityAlignment`

> Type: [<code>ArfIdentityAlignment</code>](#arfidentityalignment) · required
>
> Which identities were aligned


##### `message`

> Type: <code>String?</code>
>
> Original message content that triggered the report


##### `headers`

> Type: <code>String?</code>
>
> Original message headers that triggered the report





## Enums


### ArfFeedbackType {#arffeedbacktype}



| Value | Label |
|---|---|
| `abuse` | Message was reported as abusive or unwanted |
| `authFailure` | Message failed authentication checks |
| `fraud` | Message was reported as fraudulent |
| `notSpam` | Message was incorrectly classified as spam |
| `virus` | Message contained a virus |
| `other` | Other feedback type |


### ArfAuthFailureType {#arfauthfailuretype}



| Value | Label |
|---|---|
| `adsp` | DKIM ADSP policy failure |
| `bodyHash` | DKIM body hash verification failed |
| `revoked` | DKIM key has been revoked |
| `signature` | DKIM signature verification failed |
| `spf` | SPF authentication failed |
| `dmarc` | DMARC authentication failed |
| `unspecified` | Authentication failure type not specified |


### ArfDeliveryResult {#arfdeliveryresult}



| Value | Label |
|---|---|
| `delivered` | Message was delivered to recipient |
| `spam` | Message was delivered to spam folder |
| `policy` | Message was handled according to policy |
| `reject` | Message was rejected |
| `other` | Other delivery result |
| `unspecified` | Delivery result not specified |


### ArfIdentityAlignment {#arfidentityalignment}



| Value | Label |
|---|---|
| `none` | No identity alignment |
| `spf` | SPF identity aligned |
| `dkim` | DKIM identity aligned |
| `dkimSpf` | Both DKIM and SPF identities aligned |
| `unspecified` | Identity alignment not specified |


