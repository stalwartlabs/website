---
title: TlsReportSettings
description: Configures TLS aggregate report generation.
custom_edit_url: null
---

# TlsReportSettings

Configures TLS aggregate report generation.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › TLS

## Fields


##### `contactInfo`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Contact information to be included in the report
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `fromAddress`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'noreply-tls@' + system('domain')"}`
>
> Email address that will be used in the From header of the TLS aggregate report email
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `fromName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'Report Subsystem'"}`
>
> Name that will be used in the From header of the TLS aggregate report email
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `maxReportSize`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"5242880"}`
>
> Maximum size of the TLS aggregate report in bytes
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `orgName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Name of the organization to be included in the report
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `sendFrequency`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"daily"}`
>
> Frequency at which the TLS aggregate reports will be sent. The options are hourly, daily, weekly, or disable to disable reporting
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).
>
> Available constants: [`MtaAggregateConstant`](/docs/ref/expression/constant/mta-aggregate-constant).


##### `dkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Which domain's DKIM signatures to use when signing the TLS aggregate report
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).


##### `subject`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'TLS Aggregate Report'"}`
>
> Subject name that will be used in the TLS aggregate report email
>
> Available variables: [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable).



## JMAP API

The TlsReportSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:TlsReportSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysTlsReportSettingsGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsReportSettings/get",
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



### `x:TlsReportSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysTlsReportSettingsUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TlsReportSettings/set",
          {
            "update": {
              "singleton": {
                "contactInfo": {
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get TlsReportSettings
```


### Update

```sh
stalwart-cli update TlsReportSettings --field contactInfo='{"else":"false"}'
```



## Nested types


### Expression

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





#### ExpressionMatch

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

- [`MtaQueueHostVariable`](/docs/ref/expression/variable/mta-queue-host-variable) (Variables)
- [`MtaAggregateConstant`](/docs/ref/expression/constant/mta-aggregate-constant) (Constants)

