---
title: MtaConnectionStrategy
description: Defines a connection strategy for outbound message delivery.
custom_edit_url: null
---

# MtaConnectionStrategy

Defines a connection strategy for outbound message delivery.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Connection Strategies

## Fields


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the strategy


##### `description`

> Type: <code>String?</code>
>
> Short description of the connection strategy


##### `ehloHostname`

> Type: <code>HostName?</code>
>
> Overrides the EHLO hostname that will be used when connecting using this strategy


##### `sourceIps`

> Type: [<code>MtaConnectionIpHost</code>](#mtaconnectioniphost)<code>[]</code>
>
> List of local IPv4 and IPv6 addresses to use when delivering emails to remote SMTP servers


##### `connectTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the connection to be established


##### `dataTimeout`

> Type: <code>Duration</code> · default: `"10m"`
>
> Maximum time to wait for the DATA command response


##### `ehloTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the EHLO command response


##### `greetingTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the SMTP greeting message


##### `mailFromTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the MAIL-FROM command response


##### `rcptToTimeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Maximum time to wait for the RCPT-TO command response



## JMAP API

The MtaConnectionStrategy object is available via the `urn:stalwart:jmap` capability.


### `x:MtaConnectionStrategy/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaConnectionStrategyGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaConnectionStrategy/get",
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



### `x:MtaConnectionStrategy/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaConnectionStrategyCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaConnectionStrategy/set",
          {
            "create": {
              "new1": {
                "sourceIps": {}
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

This operation requires the `sysMtaConnectionStrategyUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaConnectionStrategy/set",
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

This operation requires the `sysMtaConnectionStrategyDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaConnectionStrategy/set",
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




### `x:MtaConnectionStrategy/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaConnectionStrategyQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaConnectionStrategy/query",
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




The `x:MtaConnectionStrategy/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get MtaConnectionStrategy id1
```


### Create

```sh
stalwart-cli create MtaConnectionStrategy \
  --field 'sourceIps={}'
```


### Query

```sh
stalwart-cli query MtaConnectionStrategy
stalwart-cli query MtaConnectionStrategy --where name=example
```


### Update

```sh
stalwart-cli update MtaConnectionStrategy id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete MtaConnectionStrategy --ids id1
```



## Nested types


### MtaConnectionIpHost {#mtaconnectioniphost}

Defines a source IP address and optional EHLO hostname override for outbound connections.



##### `ehloHostname`

> Type: <code>HostName?</code>
>
> Overrides the EHLO hostname that will be used when connecting from this IP address


##### `sourceIp`

> Type: <code>IpAddr</code> · required
>
> Local IPv4 and IPv6 address to use when delivering emails to remote SMTP servers





