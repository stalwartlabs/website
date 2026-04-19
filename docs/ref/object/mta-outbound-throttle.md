---
title: MtaOutboundThrottle
description: Defines an outbound rate limit rule for message delivery.
custom_edit_url: null
---

# MtaOutboundThrottle

Defines an outbound rate limit rule for message delivery.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Rates & Quotas › Outbound Rate Limits

## Fields


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this throttle


##### `description`

> Type: <code>String</code> · required
>
> Short description for the throttle


##### `key`

> Type: [<code>MtaOutboundThrottleKey</code>](#mtaoutboundthrottlekey)<code>[]</code>
>
> Optional list of context variables that determine where this throttle should be applied


##### `match`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Enable the imposition of concurrency and rate limits only when a specific condition is met
>
> Available variables: [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md).


##### `rate`

> Type: [<code>Rate</code>](#rate) · required
>
> Number of incoming requests over a period of time that the rate limiter will allow



## JMAP API

The MtaOutboundThrottle object is available via the `urn:stalwart:jmap` capability.


### `x:MtaOutboundThrottle/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaOutboundThrottleGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundThrottle/get",
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



### `x:MtaOutboundThrottle/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaOutboundThrottleCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundThrottle/set",
          {
            "create": {
              "new1": {
                "description": "Example",
                "enable": true,
                "key": [],
                "match": {
                  "else": "true"
                },
                "rate": {
                  "count": 0,
                  "period": "0s"
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


#### Update

This operation requires the `sysMtaOutboundThrottleUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundThrottle/set",
          {
            "update": {
              "id1": {
                "description": "updated value"
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

This operation requires the `sysMtaOutboundThrottleDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundThrottle/set",
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




### `x:MtaOutboundThrottle/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaOutboundThrottleQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaOutboundThrottle/query",
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get mta-outbound-throttle id1
```


### Create

```sh
stalwart-cli create mta-outbound-throttle \
  --field enable=true \
  --field description=Example \
  --field 'key=[]' \
  --field 'match={"else":"true"}' \
  --field 'rate={"count":0,"period":"0s"}'
```


### Query

```sh
stalwart-cli query mta-outbound-throttle
```


### Update

```sh
stalwart-cli update mta-outbound-throttle id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete mta-outbound-throttle --ids id1
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





### Rate {#rate}

Defines a rate limit as a count over a time period.



##### `count`

> Type: <code>UnsignedInt</code> · default: `0` · min: 1 · max: 1000000
>
> Count


##### `period`

> Type: <code>Duration</code> · default: `"0s"` · min: 1
>
> Period





## Enums


### MtaOutboundThrottleKey {#mtaoutboundthrottlekey}



| Value | Label |
|---|---|
| `mx` | MX Host |
| `remoteIp` | Remote IP |
| `localIp` | Local IP |
| `sender` | Sender |
| `senderDomain` | Sender Domain |
| `rcptDomain` | Recipient Domain |


## Expression references

The following expression contexts are used by fields on this page:

- [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md) (Variables)

