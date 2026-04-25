---
title: MtaStageAuth
description: Configures SMTP authentication requirements and error handling.
custom_edit_url: null
---

# MtaStageAuth

Configures SMTP authentication requirements and error handling.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › AUTH Stage

## Fields


##### `maxFailures`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"3"}`
>
> Maximum number of authentication errors allowed before the session is disconnected
>
> Available variables: [`MtaEhloVariable`](../expression/variable/mta-ehlo-variable.md).


##### `waitOnFail`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"5s"}`
>
> Time interval to wait after an authentication failure
>
> Available variables: [`MtaEhloVariable`](../expression/variable/mta-ehlo-variable.md).


##### `saslMechanisms`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port != 25 && is_tls","then":"[plain, login, oauthbearer, xoauth2]"},{"if":"local_port != 25","then":"[oauthbearer, xoauth2]"}]}`
>
> A list of SASL authentication mechanisms offered to clients, or an empty list to disable authentication. Stalwart supports PLAIN, LOGIN, and OAUTHBEARER mechanisms
>
> Available variables: [`MtaEhloVariable`](../expression/variable/mta-ehlo-variable.md).
>
> Available constants: [`MtaAuthTypeConstant`](../expression/constant/mta-auth-type-constant.md).


##### `mustMatchSender`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Specifies whether the authenticated user or any of their associated e-mail addresses must match the sender of the email message
>
> Available variables: [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md).


##### `require`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"local_port != 25"}`
>
> Specifies whether authentication is necessary to send email messages
>
> Available variables: [`MtaEhloVariable`](../expression/variable/mta-ehlo-variable.md).



## JMAP API

The MtaStageAuth singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaStageAuth/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaStageAuthGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageAuth/get",
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



### `x:MtaStageAuth/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaStageAuthUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageAuth/set",
          {
            "update": {
              "singleton": {
                "maxFailures": {
                  "else": "3"
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
stalwart-cli get MtaStageAuth
```


### Update

```sh
stalwart-cli update MtaStageAuth --field maxFailures='{"else":"3"}'
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

- [`MtaEhloVariable`](../expression/variable/mta-ehlo-variable.md) (Variables)
- [`MtaAuthTypeConstant`](../expression/constant/mta-auth-type-constant.md) (Constants)
- [`MtaMailFromVariable`](../expression/variable/mta-mail-from-variable.md) (Variables)

