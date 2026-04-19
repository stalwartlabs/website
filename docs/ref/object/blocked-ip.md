---
title: BlockedIp
description: Defines a blocked IP address or network range.
custom_edit_url: null
---

# BlockedIp

Defines a blocked IP address or network range.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Security › Blocked IPs

## Fields


##### `address`

> Type: <code>IpMask</code> · read-only
>
> The IP address or mask to block


##### `reason`

> Type: [<code>BlockReason</code>](#blockreason) · default: `"manual"`
>
> The reason for blocking this IP address


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> The date and time when this IP address was blocked


##### `expiresAt`

> Type: <code>UTCDateTime?</code>
>
> The date and time when this IP address block will expire



## JMAP API

The BlockedIp object is available via the `urn:stalwart:jmap` capability.


### `x:BlockedIp/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysBlockedIpGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlockedIp/get",
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



### `x:BlockedIp/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysBlockedIpCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlockedIp/set",
          {
            "create": {
              "new1": {
                "expiresAt": "2026-01-01T00:00:00Z",
                "reason": "manual"
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

This operation requires the `sysBlockedIpUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlockedIp/set",
          {
            "update": {
              "id1": {
                "reason": "manual"
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

This operation requires the `sysBlockedIpDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlockedIp/set",
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




### `x:BlockedIp/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysBlockedIpQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:BlockedIp/query",
          {
            "filter": {
              "address": "example"
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




The `x:BlockedIp/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `address` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get blocked-ip id1
```


### Create

```sh
stalwart-cli create blocked-ip \
  --field reason=manual \
  --field expiresAt=2026-01-01T00:00:00Z
```


### Query

```sh
stalwart-cli query blocked-ip
stalwart-cli query blocked-ip --where address=example
```


### Update

```sh
stalwart-cli update blocked-ip id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete blocked-ip --ids id1
```



## Enums


### BlockReason {#blockreason}



| Value | Label |
|---|---|
| `rcptToFailure` | Excessive failed RCPT TO commands |
| `authFailure` | Excessive failed authentication attempts |
| `loitering` | Excessive loitering connections |
| `portScanning` | Excessive port scanning attempts |
| `manual` | Manually blocked IP address |
| `other` | Other reason |


