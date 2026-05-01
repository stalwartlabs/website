---
title: MtaTlsStrategy
description: Defines a TLS security strategy for outbound connections.
custom_edit_url: null
---

# MtaTlsStrategy

Defines a TLS security strategy for outbound connections.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies

## Fields


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the TLS strategy


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow connections to servers with invalid TLS certificates


##### `dane`

> Type: [<code>MtaRequiredOrOptional</code>](#mtarequiredoroptional) · default: `"optional"`
>
> Whether DANE is required, optional, or disabled


##### `description`

> Type: <code>String?</code>
>
> A short description of the TLS strategy, which can be used to identify it in the list of strategies


##### `mtaSts`

> Type: [<code>MtaRequiredOrOptional</code>](#mtarequiredoroptional) · default: `"optional"`
>
> Whether MTA-STS is required, optional, or disabled


##### `startTls`

> Type: [<code>MtaRequiredOrOptional</code>](#mtarequiredoroptional) · default: `"optional"`
>
> Whether TLS support is required, optional, or disabled


##### `mtaStsTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the MTA-STS policy lookup to complete


##### `tlsTimeout`

> Type: <code>Duration</code> · default: `"3m"`
>
> Maximum time to wait for the TLS handshake to complete



## JMAP API

The MtaTlsStrategy object is available via the `urn:stalwart:jmap` capability.


### `x:MtaTlsStrategy/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaTlsStrategyGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaTlsStrategy/get",
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



### `x:MtaTlsStrategy/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaTlsStrategyCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaTlsStrategy/set",
          {
            "create": {
              "new1": {}
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

This operation requires the `sysMtaTlsStrategyUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaTlsStrategy/set",
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

This operation requires the `sysMtaTlsStrategyDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaTlsStrategy/set",
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




### `x:MtaTlsStrategy/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaTlsStrategyQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaTlsStrategy/query",
          {
            "filter": {
              "name": "example"
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




The `x:MtaTlsStrategy/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get MtaTlsStrategy id1
```


### Create

```sh
stalwart-cli create MtaTlsStrategy
```


### Query

```sh
stalwart-cli query MtaTlsStrategy
stalwart-cli query MtaTlsStrategy --where name=example
```


### Update

```sh
stalwart-cli update MtaTlsStrategy id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete MtaTlsStrategy --ids id1
```



## Enums


### MtaRequiredOrOptional {#mtarequiredoroptional}



| Value | Label |
|---|---|
| `optional` | Optional |
| `require` | Required |
| `disable` | Disabled |


