---
title: MtaStageData
description: Configures message processing rules for the SMTP DATA stage.
custom_edit_url: null
---

# MtaStageData

Configures message processing rules for the SMTP DATA stage.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage

## Fields


##### `addAuthResultsHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add an Authentication-Results header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `addDateHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add a Date header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `addDeliveredToHeader`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to add a Delivered-To header to the message


##### `addMessageIdHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add a Message-Id header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `addReceivedHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add a Received header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `addReceivedSpfHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add a Received-SPF header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `addReturnPathHeader`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to add a Return-Path header to the message
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `maxMessages`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"10"}`
>
> Maximum number of messages that can be submitted per SMTP session
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `maxReceivedHeaders`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"50"}`
>
> Maximum limit on the number of Received headers, which helps to prevent message loops
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `maxMessageSize`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"104857600"}`
>
> Maximum size of a message in bytes
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `script`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Which Sieve script to run after the client sends a DATA command
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `enableSpamFilter`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"is_empty(authenticated_as)"}`
>
> Whether to enable the spam filter for incoming messages
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).



## JMAP API

The MtaStageData singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaStageData/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaStageDataGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageData/get",
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



### `x:MtaStageData/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaStageDataUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageData/set",
          {
            "update": {
              "singleton": {
                "addAuthResultsHeader": {
                  "else": "false",
                  "match": [
                    {
                      "if": "local_port == 25",
                      "then": "true"
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
stalwart-cli get MtaStageData
```


### Update

```sh
stalwart-cli update MtaStageData --field addAuthResultsHeader='{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}'
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

- [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md) (Variables)

