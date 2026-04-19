---
title: MtaStageEhlo
description: Configures EHLO command requirements and validation.
custom_edit_url: null
---

# MtaStageEhlo

Configures EHLO command requirements and validation.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › EHLO Stage

## Fields


##### `rejectNonFqdn`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"local_port == 25","then":"true"}]}`
>
> Whether to reject EHLO commands that do not include a fully-qualified domain name as a parameter
>
> Available variables: [`MtaConnectionVariable`](../expression/variable/mta-connection-variable.md).


##### `require`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Whether the remote client must send an EHLO command before starting an SMTP transaction
>
> Available variables: [`MtaConnectionVariable`](../expression/variable/mta-connection-variable.md).


##### `script`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false"}`
>
> Which Sieve script to run after the client sends an EHLO command
>
> Available variables: [`MtaConnectionVariable`](../expression/variable/mta-connection-variable.md).



## JMAP API

The MtaStageEhlo singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaStageEhlo/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaStageEhloGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageEhlo/get",
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



### `x:MtaStageEhlo/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaStageEhloUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaStageEhlo/set",
          {
            "update": {
              "singleton": {
                "rejectNonFqdn": {
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get mta-stage-ehlo
```


### Update

```sh
stalwart-cli update mta-stage-ehlo --field description='Updated'
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

- [`MtaConnectionVariable`](../expression/variable/mta-connection-variable.md) (Variables)

