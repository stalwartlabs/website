---
title: MtaStageRcpt
description: Configures RCPT TO stage processing and recipient validation.
custom_edit_url: null
---

# MtaStageRcpt

Configures RCPT TO stage processing and recipient validation.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage

## Fields


##### `maxFailures`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"5"}`
>
> Maximum number of recipient errors before the session is disconnected
>
> Available variables: [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md).


##### `waitOnFail`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"5s"}`
>
> Amount of time to wait after a recipient error
>
> Available variables: [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md).


##### `maxRecipients`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"100"}`
>
> Maximum number of recipients per message
>
> Available variables: [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md).


##### `allowRelaying`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"!is_empty(authenticated_as)"}`
>
> Whether to allow relaying for non-local domains
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `rewrite`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Expression to rewrite the recipient address
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `script`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Which Sieve script to run after the client sends a RCPT command
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).



## JMAP API

The MtaStageRcpt singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaStageRcpt/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaStageRcptGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageRcpt/get",
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



### `x:MtaStageRcpt/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaStageRcptUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageRcpt/set",
          {
            "update": {
              "singleton": {
                "maxFailures": {
                  "else": "5"
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
stalwart-cli get mta-stage-rcpt
```


### Update

```sh
stalwart-cli update mta-stage-rcpt --field description='Updated'
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

- [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md) (Variables)
- [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md) (Variables)

