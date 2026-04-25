---
title: MtaOutboundStrategy
description: Configures outbound message delivery routing, scheduling, and TLS strategies.
custom_edit_url: null
---

# MtaOutboundStrategy

Configures outbound message delivery routing, scheduling, and TLS strategies.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Strategy

## Fields


##### `connection`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'default'"}`
>
> An expression that returns the connection strategy to use when delivering messages to remote SMTP servers
>
> Available variables: [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md).


##### `route`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'mx'","match":[{"if":"is_local_domain(rcpt_domain)","then":"'local'"}]}`
>
> An expression that returns the route name to use when delivering queued messages
>
> Available variables: [`MtaQueueRcptVariable`](../expression/variable/mta-queue-rcpt-variable.md).


##### `schedule`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'remote'","match":[{"if":"is_local_domain(rcpt_domain)","then":"'local'"},{"if":"source == 'dsn'","then":"'dsn'"},{"if":"source == 'report'","then":"'report'"}]}`
>
> An expression that returns the scheduling strategy to use when queueing messages
>
> Available variables: [`MtaQueueRcptVariable`](../expression/variable/mta-queue-rcpt-variable.md).


##### `tls`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'default'","match":[{"if":"retry_num > 0 && last_error == 'tls'","then":"'invalid-tls'"}]}`
>
> An expression that returns the TLS strategy to use when delivering messages to remote SMTP servers
>
> Available variables: [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md).



## JMAP API

The MtaOutboundStrategy singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaOutboundStrategy/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaOutboundStrategyGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundStrategy/get",
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



### `x:MtaOutboundStrategy/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaOutboundStrategyUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundStrategy/set",
          {
            "update": {
              "singleton": {
                "connection": {
                  "else": "'default'"
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
stalwart-cli get MtaOutboundStrategy
```


### Update

```sh
stalwart-cli update MtaOutboundStrategy --field connection='{"else":"'\''default'\''"}'
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

- [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md) (Variables)
- [`MtaQueueRcptVariable`](../expression/variable/mta-queue-rcpt-variable.md) (Variables)

