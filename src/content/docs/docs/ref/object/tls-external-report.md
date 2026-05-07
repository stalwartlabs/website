---
title: TlsExternalReport
description: Stores a TLS aggregate report received from an external source.
custom_edit_url: null
---

# TlsExternalReport

Stores a TLS aggregate report received from an external source.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Inbox › TLS

## Fields


##### `report`

> Type: [<code>TlsReport</code>](#tlsreport) · required
>
> TLS report content


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

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code> · [enterprise](/docs/server/enterprise)
>
> Identifier for the tenant this report belongs to



## JMAP API

The TlsExternalReport object is available via the `urn:stalwart:jmap` capability.


### `x:TlsExternalReport/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysTlsExternalReportGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsExternalReport/get",
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



### `x:TlsExternalReport/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysTlsExternalReportCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsExternalReport/set",
          {
            "create": {
              "new1": {
                "expiresAt": "2026-01-01T00:00:00Z",
                "from": "user@example.com",
                "receivedAt": "2026-01-01T00:00:00Z",
                "report": {
                  "dateRangeEnd": "2026-01-01T00:00:00Z",
                  "dateRangeStart": "2026-01-01T00:00:00Z",
                  "policies": {},
                  "reportId": "Example"
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

This operation requires the `sysTlsExternalReportUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsExternalReport/set",
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

This operation requires the `sysTlsExternalReportDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsExternalReport/set",
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




### `x:TlsExternalReport/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysTlsExternalReportQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsExternalReport/query",
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
stalwart-cli get TlsExternalReport id1
```


### Create

```sh
stalwart-cli create TlsExternalReport \
  --field 'report={"dateRangeEnd":"2026-01-01T00:00:00Z","dateRangeStart":"2026-01-01T00:00:00Z","policies":{},"reportId":"Example"}' \
  --field from=user@example.com \
  --field subject=Example \
  --field 'to={}' \
  --field receivedAt=2026-01-01T00:00:00Z \
  --field expiresAt=2026-01-01T00:00:00Z
```


### Query

```sh
stalwart-cli query TlsExternalReport
```


### Update

```sh
stalwart-cli update TlsExternalReport id1 --field subject='updated value'
```


### Delete

```sh
stalwart-cli delete TlsExternalReport --ids id1
```



## Nested types


### TlsReport

Content of a TLS aggregate report.



##### `organizationName`

> Type: <code>String?</code>
>
> Name of the organization that generated the report


##### `contactInfo`

> Type: <code>String?</code>
>
> Contact information for the reporting organization


##### `reportId`

> Type: <code>String</code> · required
>
> Unique identifier for this report


##### `dateRangeStart`

> Type: <code>UTCDateTime</code> · required
>
> Start of the reporting period


##### `dateRangeEnd`

> Type: <code>UTCDateTime</code> · required
>
> End of the reporting period


##### `policies`

> Type: [<code>TlsReportPolicy</code>](#tlsreportpolicy)<code>[]</code>
>
> Policy evaluation results for each domain





#### TlsReportPolicy

TLS policy evaluation result for a specific domain.



##### `policyType`

> Type: [<code>TlsPolicyType</code>](#tlspolicytype) · required
>
> Type of TLS policy that was evaluated


##### `policyStrings`

> Type: <code>String[]</code>
>
> Raw policy strings as retrieved


##### `policyDomain`

> Type: <code>DomainName</code> · required
>
> Domain the policy applies to


##### `mxHosts`

> Type: <code>String[]</code>
>
> MX hostnames covered by the policy


##### `totalSuccessfulSessions`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of sessions that successfully established TLS


##### `totalFailedSessions`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of sessions that failed TLS establishment


##### `failureDetails`

> Type: [<code>TlsFailureDetails</code>](#tlsfailuredetails)<code>[]</code>
>
> Details of TLS failures encountered





##### TlsFailureDetails

Details of a TLS failure encountered during delivery.



##### `resultType`

> Type: [<code>TlsResultType</code>](#tlsresulttype) · required
>
> Type of failure encountered


##### `sendingMtaIp`

> Type: <code>IpAddr?</code>
>
> IP address of the sending mail server


##### `receivingMxHostname`

> Type: <code>String?</code>
>
> Hostname of the receiving mail server


##### `receivingMxHelo`

> Type: <code>String?</code>
>
> HELO/EHLO string of the receiving mail server


##### `receivingIp`

> Type: <code>IpAddr?</code>
>
> IP address of the receiving mail server


##### `failedSessionCount`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of sessions that failed with this error


##### `additionalInformation`

> Type: <code>String?</code>
>
> Additional context about the failure


##### `failureReasonCode`

> Type: <code>String?</code>
>
> Error code or reason string for the failure





## Enums


### TlsPolicyType



| Value | Label |
|---|---|
| `tlsa` | DANE TLSA policy |
| `sts` | MTA-STS policy |
| `noPolicyFound` | No TLS policy was found for the domain |
| `other` | Other or unrecognized policy type |


### TlsResultType



| Value | Label |
|---|---|
| `startTlsNotSupported` | Remote server does not support STARTTLS |
| `certificateHostMismatch` | Certificate hostname does not match server |
| `certificateExpired` | Certificate has expired |
| `certificateNotTrusted` | Certificate is not trusted |
| `validationFailure` | General certificate validation failure |
| `tlsaInvalid` | DANE TLSA record is invalid |
| `dnssecInvalid` | DNSSEC validation failed |
| `daneRequired` | DANE is required but not available |
| `stsPolicyFetchError` | Failed to fetch MTA-STS policy |
| `stsPolicyInvalid` | MTA-STS policy is invalid |
| `stsWebpkiInvalid` | MTA-STS WebPKI validation failed |
| `other` | Other or unrecognized failure type |


