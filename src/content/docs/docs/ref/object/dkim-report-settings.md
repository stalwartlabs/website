---
title: DkimReportSettings
description: Configures DKIM authentication failure report generation.
custom_edit_url: null
---

# DkimReportSettings

Configures DKIM authentication failure report generation.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › DKIM

## Fields


##### `fromAddress`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'noreply-dkim@' + system('domain')"}`
>
> Email address that will be used in the From header of the DKIM report email
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `fromName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'Report Subsystem'"}`
>
> Name that will be used in the From header of the DKIM report email
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `sendFrequency`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"[1, 1d]"}`
>
> Rate at which DKIM reports will be sent to a given email address. When this rate is exceeded, no further DKIM failure reports will be sent to that address
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `dkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Which domain's DKIM signatures to use when signing the DKIM report
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `subject`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'DKIM Authentication Failure Report'"}`
>
> Subject name that will be used in the DKIM report email
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).



## JMAP API

The DkimReportSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:DkimReportSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysDkimReportSettingsGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimReportSettings/get",
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



### `x:DkimReportSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysDkimReportSettingsUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DkimReportSettings/set",
          {
            "update": {
              "singleton": {
                "fromAddress": {
                  "else": "'noreply-dkim@' + system('domain')"
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
stalwart-cli get DkimReportSettings
```


### Update

```sh
stalwart-cli update DkimReportSettings --field fromAddress='{"else":"'\''noreply-dkim@'\'' + system('\''domain'\'')"}'
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

- [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable) (Variables)

