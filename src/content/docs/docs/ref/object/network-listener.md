---
title: NetworkListener
description: Defines a network listener for accepting incoming connections.
custom_edit_url: null
---

# NetworkListener

Defines a network listener for accepting incoming connections.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners

## Fields


##### `name`

> Type: <code>String</code> · read-only
>
> Unique identifier for the listener


##### `bind`

> Type: <code>SocketAddr[]</code> · min items: 1
>
> The addresses the listener will bind to


##### `protocol`

> Type: [<code>NetworkListenerProtocol</code>](#networklistenerprotocol) · default: `"smtp"`
>
> The protocol used by the listener


##### `overrideProxyTrustedNetworks`

> Type: <code>IpMask[]</code>
>
> Enable proxy protocol for connections from these networks


##### `socketBacklog`

> Type: <code>UnsignedInt?</code> · default: `1024` · min: 1
>
> The maximum number of incoming connections that can be pending in the backlog queue


##### `socketNoDelay`

> Type: <code>Boolean</code> · default: `true`
>
> Whether the Nagle algorithm should be disabled for the socket


##### `socketReceiveBufferSize`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The size of the buffer used for receiving data


##### `socketReuseAddress`

> Type: <code>Boolean</code> · default: `true`
>
> Whether the socket can be bound to an address that is already in use by another socket


##### `socketReusePort`

> Type: <code>Boolean</code> · default: `true`
>
> Whether multiple sockets can be bound to the same address and port


##### `socketSendBufferSize`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The size of the buffer used for sending data


##### `socketTosV4`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The type of service (TOS) value for the socket, which determines the priority of the traffic sent through the socket


##### `socketTtl`

> Type: <code>UnsignedInt?</code> · min: 1
>
> Time-to-live (TTL) value for the socket, which determines how many hops a packet can make before it is discarded


##### `useTls`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable TLS for this listener


##### `tlsDisableCipherSuites`

> Type: [<code>TlsCipherSuite</code>](#tlsciphersuite)<code>[]</code>
>
> Which cipher suites to disable


##### `tlsDisableProtocols`

> Type: [<code>TlsVersion</code>](#tlsversion)<code>[]</code>
>
> Which TLS protocols to disable


##### `tlsIgnoreClientOrder`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to ignore the client's cipher order


##### `tlsImplicit`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to use implicit TLS


##### `tlsTimeout`

> Type: <code>Duration?</code> · default: `"1m"`
>
> TLS handshake timeout


##### `maxConnections`

> Type: <code>UnsignedInt?</code> · default: `8192` · min: 1
>
> The maximum number of concurrent connections the listener will accept



## JMAP API

The NetworkListener object is available via the `urn:stalwart:jmap` capability.


### `x:NetworkListener/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysNetworkListenerGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:NetworkListener/get",
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



### `x:NetworkListener/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysNetworkListenerCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:NetworkListener/set",
          {
            "create": {
              "new1": {
                "bind": {},
                "overrideProxyTrustedNetworks": {},
                "tlsDisableCipherSuites": {},
                "tlsDisableProtocols": {}
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

This operation requires the `sysNetworkListenerUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:NetworkListener/set",
          {
            "update": {
              "id1": {
                "bind": {}
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

This operation requires the `sysNetworkListenerDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:NetworkListener/set",
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




### `x:NetworkListener/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysNetworkListenerQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:NetworkListener/query",
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




The `x:NetworkListener/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get NetworkListener id1
```


### Create

```sh
stalwart-cli create NetworkListener \
  --field 'bind={}' \
  --field 'overrideProxyTrustedNetworks={}' \
  --field 'tlsDisableCipherSuites={}' \
  --field 'tlsDisableProtocols={}'
```


### Query

```sh
stalwart-cli query NetworkListener
stalwart-cli query NetworkListener --where name=example
```


### Update

```sh
stalwart-cli update NetworkListener id1 --field bind='{}'
```


### Delete

```sh
stalwart-cli delete NetworkListener --ids id1
```



## Enums


### NetworkListenerProtocol



| Value | Label |
|---|---|
| `smtp` | SMTP |
| `lmtp` | LMTP |
| `http` | HTTP |
| `imap` | IMAP4 |
| `pop3` | POP3 |
| `manageSieve` | ManageSieve |


### TlsCipherSuite



| Value | Label |
|---|---|
| `tls13-aes-256-gcm-sha384` | TLS1.3 AES256 GCM SHA384 |
| `tls13-aes-128-gcm-sha256` | TLS1.3 AES128 GCM SHA256 |
| `tls13-chacha20-poly1305-sha256` | TLS1.3 CHACHA20 POLY1305 SHA256 |
| `tls-ecdhe-ecdsa-with-aes-256-gcm-sha384` | ECDHE ECDSA AES256 GCM SHA384 |
| `tls-ecdhe-ecdsa-with-aes-128-gcm-sha256` | ECDHE ECDSA AES128 GCM SHA256 |
| `tls-ecdhe-ecdsa-with-chacha20-poly1305-sha256` | ECDHE ECDSA CHACHA20 POLY1305 SHA256 |
| `tls-ecdhe-rsa-with-aes-256-gcm-sha384` | ECDHE RSA AES256 GCM SHA384 |
| `tls-ecdhe-rsa-with-aes-128-gcm-sha256` | ECDHE RSA AES128 GCM SHA256 |
| `tls-ecdhe-rsa-with-chacha20-poly1305-sha256` | ECDHE RSA CHACHA20 POLY1305 SHA256 |


### TlsVersion



| Value | Label |
|---|---|
| `tls12` | TLS version 1.2 |
| `tls13` | TLS version 1.3 |


