---
title: MtaQueueQuota
description: Defines a quota rule for message queues.
custom_edit_url: null
---

# MtaQueueQuota

Defines a quota rule for message queues.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Rates & Quotas › Queue Quotas

## Fields


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this quota


##### `description`

> Type: <code>String?</code> · read-only
>
> Short description for the quota


##### `key`

> Type: [<code>MtaQueueQuotaKey</code>](#mtaqueuequotakey)<code>[]</code> · min items: 1
>
> Optional list of context variables that determine where this quota should be applied


##### `match`

> Type: [<code>Expression</code>](#expression) · required
>
> Enable the imposition of concurrency and rate limits only when a specific condition is met
>
> Available variables: [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md).


##### `messages`

> Type: <code>UnsignedInt?</code> · min: 1
>
> Maximum number of messages in the queue that this quota will allow


##### `size`

> Type: <code>Size?</code>
>
> Maximum total size of messages in the queue that this quota will allow



## JMAP API

The MtaQueueQuota object is available via the `urn:stalwart:jmap` capability.


### `x:MtaQueueQuota/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaQueueQuotaGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaQueueQuota/get",
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



### `x:MtaQueueQuota/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaQueueQuotaCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaQueueQuota/set",
          {
            "create": {
              "new1": {
                "key": {},
                "match": {
                  "else": "Example",
                  "match": {}
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

This operation requires the `sysMtaQueueQuotaUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaQueueQuota/set",
          {
            "update": {
              "id1": {
                "enable": true
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

This operation requires the `sysMtaQueueQuotaDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaQueueQuota/set",
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




### `x:MtaQueueQuota/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaQueueQuotaQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaQueueQuota/query",
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
stalwart-cli get MtaQueueQuota id1
```


### Create

```sh
stalwart-cli create MtaQueueQuota \
  --field 'key={}' \
  --field 'match={"else":"Example","match":{}}'
```


### Query

```sh
stalwart-cli query MtaQueueQuota
```


### Update

```sh
stalwart-cli update MtaQueueQuota id1 --field enable=true
```


### Delete

```sh
stalwart-cli delete MtaQueueQuota --ids id1
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





## Enums


### MtaQueueQuotaKey {#mtaqueuequotakey}



| Value | Label |
|---|---|
| `sender` | Sender |
| `senderDomain` | Sender Domain |
| `rcpt` | Recipient |
| `rcptDomain` | Recipient Domain |


## Expression references

The following expression contexts are used by fields on this page:

- [`MtaQueueHostVariable`](../expression/variable/mta-queue-host-variable.md) (Variables)

