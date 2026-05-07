---
title: DmarcInternalReport
description: Stores an outbound DMARC aggregate report pending delivery.
custom_edit_url: null
---

# DmarcInternalReport

Stores an outbound DMARC aggregate report pending delivery.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Outbox › DMARC

## Fields


##### `rua`

> Type: <code>EmailAddress[]</code>
>
> Reporting email addresses from the DMARC policy


##### `policyIdentifier`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Identifier for the DMARC policy that generated this report


##### `report`

> Type: [<code>DmarcReport</code>](#dmarcreport) · required
>
> DMARC report content


##### `domain`

> Type: <code>DomainName</code> · required
>
> Domain this report is associated with


##### `createdAt`

> Type: <code>UTCDateTime</code> · required
>
> When the report was created


##### `deliverAt`

> Type: <code>UTCDateTime</code> · required
>
> When the report is scheduled to be delivered



## JMAP API

The DmarcInternalReport object is available via the `urn:stalwart:jmap` capability.


### `x:DmarcInternalReport/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDmarcInternalReportGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcInternalReport/get",
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



### `x:DmarcInternalReport/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDmarcInternalReportCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcInternalReport/set",
          {
            "create": {
              "new1": {
                "createdAt": "2026-01-01T00:00:00Z",
                "deliverAt": "2026-01-01T00:00:00Z",
                "domain": "example.com",
                "report": {
                  "dateRangeBegin": "2026-01-01T00:00:00Z",
                  "dateRangeEnd": "2026-01-01T00:00:00Z",
                  "email": "user@example.com",
                  "errors": {},
                  "extensions": {},
                  "orgName": "Example",
                  "policyAdkim": "relaxed",
                  "policyAspf": "relaxed",
                  "policyDisposition": "none",
                  "policyDomain": "Example",
                  "policyFailureReportingOptions": {},
                  "policySubdomainDisposition": "none",
                  "records": {},
                  "reportId": "Example"
                },
                "rua": {}
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

This operation requires the `sysDmarcInternalReportUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcInternalReport/set",
          {
            "update": {
              "id1": {
                "rua": {}
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

This operation requires the `sysDmarcInternalReportDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcInternalReport/set",
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




### `x:DmarcInternalReport/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDmarcInternalReportQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcInternalReport/query",
          {
            "filter": {
              "domain": "example"
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




The `x:DmarcInternalReport/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `domain` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get DmarcInternalReport id1
```


### Create

```sh
stalwart-cli create DmarcInternalReport \
  --field 'rua={}' \
  --field 'report={"dateRangeBegin":"2026-01-01T00:00:00Z","dateRangeEnd":"2026-01-01T00:00:00Z","email":"user@example.com","errors":{},"extensions":{},"orgName":"Example","policyAdkim":"relaxed","policyAspf":"relaxed","policyDisposition":"none","policyDomain":"Example","policyFailureReportingOptions":{},"policySubdomainDisposition":"none","records":{},"reportId":"Example"}' \
  --field domain=example.com \
  --field createdAt=2026-01-01T00:00:00Z \
  --field deliverAt=2026-01-01T00:00:00Z
```


### Query

```sh
stalwart-cli query DmarcInternalReport
stalwart-cli query DmarcInternalReport --where domain=example
```


### Update

```sh
stalwart-cli update DmarcInternalReport id1 --field rua='{}'
```


### Delete

```sh
stalwart-cli delete DmarcInternalReport --ids id1
```



## Nested types


### DmarcReport

Content of a DMARC aggregate report.



##### `version`

> Type: <code>Float</code> · default: `1.0`
>
> DMARC report format version


##### `orgName`

> Type: <code>String</code> · required
>
> Name of the organization that generated the report


##### `email`

> Type: <code>EmailAddress</code> · required
>
> Contact email address of the reporting organization


##### `extraContactInfo`

> Type: <code>String?</code>
>
> Additional contact information for the reporting organization


##### `reportId`

> Type: <code>String</code> · required
>
> Unique identifier for this report


##### `dateRangeBegin`

> Type: <code>UTCDateTime</code> · required
>
> Start of the reporting period


##### `dateRangeEnd`

> Type: <code>UTCDateTime</code> · required
>
> End of the reporting period


##### `errors`

> Type: <code>String[]</code>
>
> Errors encountered during report generation


##### `policyDomain`

> Type: <code>String</code> · required
>
> Domain for which the DMARC policy is published


##### `policyVersion`

> Type: <code>String?</code>
>
> Version of the published DMARC policy


##### `policyAdkim`

> Type: [<code>DmarcAlignment</code>](#dmarcalignment) · required
>
> DKIM alignment mode specified in the policy


##### `policyAspf`

> Type: [<code>DmarcAlignment</code>](#dmarcalignment) · required
>
> SPF alignment mode specified in the policy


##### `policyDisposition`

> Type: [<code>DmarcDisposition</code>](#dmarcdisposition) · required
>
> Requested handling policy for failing messages


##### `policySubdomainDisposition`

> Type: [<code>DmarcDisposition</code>](#dmarcdisposition) · required
>
> Requested handling policy for failing messages from subdomains


##### `policyTestingMode`

> Type: <code>Boolean</code> · default: `false`
>
> Whether the policy is in testing mode (pct &lt; 100)


##### `policyFailureReportingOptions`

> Type: [<code>FailureReportingOption</code>](#failurereportingoption)<code>[]</code>
>
> Conditions under which failure reports should be generated


##### `records`

> Type: [<code>DmarcReportRecord</code>](#dmarcreportrecord)<code>[]</code>
>
> Aggregated authentication results grouped by source


##### `extensions`

> Type: [<code>DmarcExtension</code>](#dmarcextension)<code>[]</code>
>
> Custom vendor-specific extensions to the report





#### DmarcReportRecord

An aggregated authentication result record from a single source.



##### `sourceIp`

> Type: <code>IpAddr?</code>
>
> IP address of the sending mail server


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of messages from this source matching this result


##### `evaluatedDisposition`

> Type: [<code>DmarcActionDisposition</code>](#dmarcactiondisposition) · required
>
> Action taken on the messages


##### `evaluatedDkim`

> Type: [<code>DmarcResult</code>](#dmarcresult) · required
>
> DMARC result based on DKIM authentication


##### `evaluatedSpf`

> Type: [<code>DmarcResult</code>](#dmarcresult) · required
>
> DMARC result based on SPF authentication


##### `policyOverrideReasons`

> Type: [<code>DmarcPolicyOverrideReason</code>](#dmarcpolicyoverridereason)<code>[]</code>
>
> Reasons why the evaluated disposition differs from the published policy


##### `envelopeTo`

> Type: <code>String?</code>
>
> Envelope recipient domain


##### `envelopeFrom`

> Type: <code>String</code> · required
>
> Envelope sender domain (MAIL FROM)


##### `headerFrom`

> Type: <code>String</code> · required
>
> Domain from the message From header


##### `dkimResults`

> Type: [<code>DmarcDkimResult</code>](#dmarcdkimresult)<code>[]</code>
>
> DKIM authentication results for the messages


##### `spfResults`

> Type: [<code>DmarcSpfResult</code>](#dmarcspfresult)<code>[]</code>
>
> SPF authentication results for the messages


##### `extensions`

> Type: [<code>DmarcExtension</code>](#dmarcextension)<code>[]</code>
>
> Custom vendor-specific extensions to this record





##### DmarcPolicyOverrideReason

Reason for a DMARC policy override.



##### `overrideType`

> Type: [<code>DmarcPolicyOverride</code>](#dmarcpolicyoverride) · required
>
> Type of policy override applied


##### `comment`

> Type: <code>String?</code>
>
> Additional explanation for the override





##### DmarcDkimResult

DKIM authentication result within a DMARC report record.



##### `domain`

> Type: <code>DomainName</code> · required
>
> Domain that signed the message


##### `selector`

> Type: <code>String</code> · required
>
> DKIM selector used for signing


##### `result`

> Type: [<code>DkimAuthResult</code>](#dkimauthresult) · required
>
> DKIM verification result


##### `humanResult`

> Type: <code>String?</code>
>
> Human-readable explanation of the result





##### DmarcSpfResult

SPF authentication result within a DMARC report record.



##### `domain`

> Type: <code>DomainName</code> · required
>
> Domain checked for SPF


##### `scope`

> Type: [<code>SpfDomainScope</code>](#spfdomainscope) · required
>
> Which identity was checked


##### `result`

> Type: [<code>SpfAuthResult</code>](#spfauthresult) · required
>
> SPF verification result


##### `humanResult`

> Type: <code>String?</code>
>
> Human-readable explanation of the result





##### DmarcExtension

A vendor-specific extension in a DMARC report.



##### `name`

> Type: <code>String</code> · required
>
> Extension identifier


##### `definition`

> Type: <code>String</code> · required
>
> Extension content or value





## Enums


### DmarcAlignment



| Value | Label |
|---|---|
| `relaxed` | Organizational domain match is sufficient |
| `strict` | Exact domain match is required |
| `unspecified` | Alignment mode not specified |


### DmarcDisposition



| Value | Label |
|---|---|
| `none` | No specific action requested |
| `quarantine` | Treat failing messages as suspicious |
| `reject` | Reject failing messages |
| `unspecified` | Disposition not specified |


### FailureReportingOption



| Value | Label |
|---|---|
| `all` | Generate report if all authentication mechanisms fail |
| `any` | Generate report if any authentication mechanism fails |
| `dkimFailure` | Generate report if DKIM authentication fails |
| `spfFailure` | Generate report if SPF authentication fails |


### DmarcActionDisposition



| Value | Label |
|---|---|
| `none` | No action taken |
| `pass` | Message passed evaluation |
| `quarantine` | Message was quarantined |
| `reject` | Message was rejected |
| `unspecified` | Disposition not specified |


### DmarcResult



| Value | Label |
|---|---|
| `pass` | Authentication passed |
| `fail` | Authentication failed |
| `unspecified` | Result not specified |


### DmarcPolicyOverride



| Value | Label |
|---|---|
| `Forwarded` | Message was forwarded |
| `SampledOut` | Message was excluded by policy sampling (pct) |
| `TrustedForwarder` | Message came from a trusted forwarder |
| `MailingList` | Message came from a mailing list |
| `LocalPolicy` | Local policy override was applied |
| `Other` | Other reason for override |


### DkimAuthResult



| Value | Label |
|---|---|
| `none` | No DKIM signature present |
| `pass` | DKIM signature verified successfully |
| `fail` | DKIM signature verification failed |
| `policy` | DKIM signature not accepted due to policy |
| `neutral` | DKIM verification returned neutral |
| `tempError` | Temporary error during verification |
| `permError` | Permanent error in DKIM record or signature |


### SpfDomainScope



| Value | Label |
|---|---|
| `helo` | SPF check performed on HELO/EHLO identity |
| `mailFrom` | SPF check performed on MAIL FROM identity |
| `unspecified` | Scope not specified |


### SpfAuthResult



| Value | Label |
|---|---|
| `none` | No SPF record found |
| `neutral` | SPF record returned neutral |
| `pass` | SPF check passed |
| `fail` | SPF check failed (hard fail) |
| `softFail` | SPF check returned soft fail |
| `tempError` | Temporary error during SPF check |
| `permError` | Permanent error in SPF record |


