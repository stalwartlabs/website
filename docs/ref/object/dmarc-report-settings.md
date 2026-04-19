---
title: DmarcReportSettings
description: Configures DMARC aggregate and failure report generation.
custom_edit_url: null
---

# DmarcReportSettings

Configures DMARC aggregate and failure report generation.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › DMARC

## Fields


##### `aggregateContactInfo`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Contact information to be included in the report
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateFromAddress`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'noreply-dmarc@' + system('domain')"}`
>
> Email address that will be used in the From header of the DMARC aggregate report email
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateFromName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'Report Subsystem'"}`
>
> Name that will be used in the From header of the DMARC aggregate report email
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateMaxReportSize`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"5242880"}`
>
> Maximum size of the DMARC aggregate report in bytes
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateOrgName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Name of the organization to be included in the report
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateSendFrequency`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"daily"}`
>
> Frequency at which the DMARC aggregate reports will be sent. The options are hourly, daily, weekly, or never to disable reporting
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).
>
> Available constants: [`MtaAggregateConstant`](../expression/constant/mta-aggregate-constant.md).


##### `aggregateDkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Which domain's DKIM signatures to use when signing the DMARC aggregate report
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `aggregateSubject`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'DMARC Aggregate Report'"}`
>
> Subject name that will be used in the DMARC aggregate report email
>
> Available variables: [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md).


##### `failureFromAddress`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'noreply-dmarc@' + system('domain')"}`
>
> Email address that will be used in the From header of the DMARC authentication failure report email
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `failureFromName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'Report Subsystem'"}`
>
> Name that will be used in the From header of the DMARC report email
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `failureSendFrequency`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"[1, 1d]"}`
>
> Rate at which DMARC reports will be sent to a given email address. When this rate is exceeded, no further DMARC failure reports will be sent to that address
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `failureDkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Which domain's DKIM signatures to use when signing the DMARC authentication failure report
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `failureSubject`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'DMARC Authentication Failure Report'"}`
>
> Subject name that will be used in the DMARC authentication failure report email
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).



## JMAP API

The DmarcReportSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:DmarcReportSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysDmarcReportSettingsGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcReportSettings/get",
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



### `x:DmarcReportSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysDmarcReportSettingsUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DmarcReportSettings/set",
          {
            "update": {
              "singleton": {
                "aggregateContactInfo": {
                  "else": "false"
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get dmarc-report-settings
```


### Update

```sh
stalwart-cli update dmarc-report-settings --field description='Updated'
```



## Nested types


### Expression {#expression}

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





#### ExpressionMatch {#expressionmatch}

A single condition-result pair in an expression.



##### `if`

> Type: <code>String</code> · required
>
> If condition


##### `then`

> Type: <code>String</code> · required
>
> Then clause





## Expression references

The following expression contexts are used by fields on this page:

- [`MtaRcptDomainVariable`](../expression/variable/mta-rcpt-domain-variable.md) (Variables)
- [`MtaAggregateConstant`](../expression/constant/mta-aggregate-constant.md) (Constants)
- [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md) (Variables)

