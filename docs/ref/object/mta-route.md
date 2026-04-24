---
title: MtaRoute
description: Defines a routing rule for outbound message delivery.
custom_edit_url: null
---

# MtaRoute

Defines a routing rule for outbound message delivery.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Routes

## Fields

MtaRoute is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Mx"`

Remote Delivery (MX)


##### `ipLookupStrategy`

> Type: [<code>MtaIpStrategy</code>](#mtaipstrategy) · default: `"v4ThenV6"`
>
> IP resolution strategy for MX hosts


##### `maxMultihomed`

> Type: <code>UnsignedInt</code> · default: `2` · min: 1
>
> For multi-homed remote servers, it is the maximum number of IP addresses to try on each delivery attempt


##### `maxMxHosts`

> Type: <code>UnsignedInt</code> · default: `5` · min: 1
>
> Maximum number of MX hosts to try on each delivery attempt


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the route


##### `description`

> Type: <code>String?</code>
>
> A short description of the route, which can be used to identify it in the list of routes



### `@type: "Relay"`

Relay Host


##### `address`

> Type: <code>String</code> · required
>
> The address of the remote SMTP server, which can be an IP address or a domain name


##### `authSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> The secret to use when authenticating with the remote server


##### `authUsername`

> Type: <code>String?</code>
>
> The username to use when authenticating with the remote server


##### `port`

> Type: <code>UnsignedInt</code> · default: `25` · max: 65535 · min: 1
>
> The port number of the remote server, which is typically 25 for SMTP and 11200 for LMTP


##### `protocol`

> Type: [<code>MtaProtocol</code>](#mtaprotocol) · default: `"smtp"`
>
> The protocol to use when delivering messages to the remote server, which can be either SMTP or LMTP


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow connections to servers with invalid TLS certificates


##### `implicitTls`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to use TLS encryption for all connections to the remote server


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the route


##### `description`

> Type: <code>String?</code>
>
> A short description of the route, which can be used to identify it in the list of routes



### `@type: "Local"`

Local Delivery


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the route


##### `description`

> Type: <code>String?</code>
>
> A short description of the route, which can be used to identify it in the list of routes




## JMAP API

The MtaRoute object is available via the `urn:stalwart:jmap` capability.


### `x:MtaRoute/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaRouteGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaRoute/get",
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



### `x:MtaRoute/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaRouteCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaRoute/set",
          {
            "create": {
              "new1": {
                "@type": "Mx",
                "description": "Example",
                "ipLookupStrategy": "v4ThenV6",
                "maxMultihomed": 2,
                "maxMxHosts": 5
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

This operation requires the `sysMtaRouteUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaRoute/set",
          {
            "update": {
              "id1": {
                "id": "id1"
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

This operation requires the `sysMtaRouteDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaRoute/set",
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




### `x:MtaRoute/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaRouteQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaRoute/query",
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




The `x:MtaRoute/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get mta-route id1
```


### Create

```sh
stalwart-cli create mta-route/mx \
  --field ipLookupStrategy=v4ThenV6 \
  --field maxMultihomed=2 \
  --field maxMxHosts=5 \
  --field description=Example
```


### Query

```sh
stalwart-cli query mta-route
stalwart-cli query mta-route --where name=example
```


### Update

```sh
stalwart-cli update mta-route id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete mta-route --ids id1
```



## Nested types


### SecretKeyOptional {#secretkeyoptional}

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





## Enums


### MtaIpStrategy {#mtaipstrategy}



| Value | Label |
|---|---|
| `v4ThenV6` | IPv4 then IPv6 |
| `v6ThenV4` | IPv6 then IPv4 |
| `v4Only` | IPv4 Only |
| `v6Only` | IPv6 Only |


### MtaProtocol {#mtaprotocol}



| Value | Label |
|---|---|
| `smtp` | SMTP |
| `lmtp` | LMTP |


