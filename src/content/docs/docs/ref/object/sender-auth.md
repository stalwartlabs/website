---
title: SenderAuth
description: Configures sender authentication verification including DKIM, SPF, DMARC, and ARC.
custom_edit_url: null
---

# SenderAuth

Configures sender authentication verification including DKIM, SPF, DMARC, and ARC.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication

## Fields


##### `dkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"is_local_domain(sender_domain) && !is_empty(authenticated_as)","then":"sender_domain"}]}`
>
> Domain to use for DKIM signing
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `dkimStrict`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to ignore insecure DKIM signatures such as those containing a length parameter


##### `dkimVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"relaxed","match":[]}`
>
> Whether DKIM verification is strict, relaxed or disabled
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).


##### `spfEhloVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"disable","match":[{"if":"local_port == 25","then":"relaxed"}]}`
>
> Whether SPF EHLO verification is strict, relaxed or disabled
>
> Available variables: [`MtaConnectionVariable`](/docs/ref/expression/variable/mta-connection-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).


##### `spfFromVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"disable","match":[{"if":"local_port == 25","then":"relaxed"}]}`
>
> Whether SPF MAIL FROM verification is strict, relaxed or disabled
>
> Available variables: [`MtaConnectionVariable`](/docs/ref/expression/variable/mta-connection-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).


##### `arcVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"disable","match":[]}`
>
> Whether ARC verification is strict, relaxed or disabled.
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).


##### `dmarcVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"disable","match":[{"if":"local_port == 25","then":"relaxed"}]}`
>
> Whether DMARC verification is strict, relaxed or disabled
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).


##### `reverseIpVerify`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"disable","match":[{"if":"local_port == 25","then":"relaxed"}]}`
>
> How strict to be when verifying the reverse DNS of the client IP
>
> Available variables: [`MtaConnectionVariable`](/docs/ref/expression/variable/mta-connection-variable).
>
> Available constants: [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant).



## JMAP API

The SenderAuth singleton is available via the `urn:stalwart:jmap` capability.


### `x:SenderAuth/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSenderAuthGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SenderAuth/get",
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



### `x:SenderAuth/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSenderAuthUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SenderAuth/set",
          {
            "update": {
              "singleton": {
                "dkimSignDomain": {
                  "else": "false",
                  "match": [
                    {
                      "if": "is_local_domain(sender_domain) && !is_empty(authenticated_as)",
                      "then": "sender_domain"
                    }
                  ]
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
stalwart-cli get SenderAuth
```


### Update

```sh
stalwart-cli update SenderAuth --field dkimSignDomain='{"else":"false","match":[{"if":"is_local_domain(sender_domain) && !is_empty(authenticated_as)","then":"sender_domain"}]}'
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
- [`MtaVerifyConstant`](/docs/ref/expression/constant/mta-verify-constant) (Constants)
- [`MtaConnectionVariable`](/docs/ref/expression/variable/mta-connection-variable) (Variables)

