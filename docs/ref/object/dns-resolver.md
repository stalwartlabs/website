---
title: DnsResolver
description: Configures the DNS resolver used for domain lookups.
custom_edit_url: null
---

# DnsResolver

Configures the DNS resolver used for domain lookups.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Resolver

## Fields

DnsResolver is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "System"`

System Resolver


##### `attempts`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of times a resolution request will be retried before it is considered failed


##### `concurrency`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of concurrent resolution requests that can be made at the same time


##### `enableEdns`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable EDNS (Extension Mechanisms for DNS) support


##### `preserveIntermediates`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to preserve the intermediate name servers in the DNS resolution results


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> Time after which a resolution request will be timed out if no response is received


##### `tcpOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request



### `@type: "Custom"`

Custom DNS


##### `servers`

> Type: [<code>DnsCustomResolver</code>](#dnscustomresolver)<code>[]</code> · min items: 1
>
> List of custom DNS server URLs to use for resolution


##### `attempts`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of times a resolution request will be retried before it is considered failed


##### `concurrency`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of concurrent resolution requests that can be made at the same time


##### `enableEdns`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable EDNS (Extension Mechanisms for DNS) support


##### `preserveIntermediates`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to preserve the intermediate name servers in the DNS resolution results


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> Time after which a resolution request will be timed out if no response is received


##### `tcpOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request



### `@type: "Cloudflare"`

Cloudflare DNS


##### `useTls`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to use TLS for DNS resolution


##### `attempts`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of times a resolution request will be retried before it is considered failed


##### `concurrency`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of concurrent resolution requests that can be made at the same time


##### `enableEdns`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable EDNS (Extension Mechanisms for DNS) support


##### `preserveIntermediates`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to preserve the intermediate name servers in the DNS resolution results


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> Time after which a resolution request will be timed out if no response is received


##### `tcpOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request



### `@type: "Quad9"`

Quad9 DNS


##### `useTls`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to use TLS for DNS resolution


##### `attempts`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of times a resolution request will be retried before it is considered failed


##### `concurrency`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of concurrent resolution requests that can be made at the same time


##### `enableEdns`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable EDNS (Extension Mechanisms for DNS) support


##### `preserveIntermediates`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to preserve the intermediate name servers in the DNS resolution results


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> Time after which a resolution request will be timed out if no response is received


##### `tcpOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request



### `@type: "Google"`

Google DNS


##### `attempts`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of times a resolution request will be retried before it is considered failed


##### `concurrency`

> Type: <code>UnsignedInt</code> · default: `2`
>
> Number of concurrent resolution requests that can be made at the same time


##### `enableEdns`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable EDNS (Extension Mechanisms for DNS) support


##### `preserveIntermediates`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to preserve the intermediate name servers in the DNS resolution results


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> Time after which a resolution request will be timed out if no response is received


##### `tcpOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request




## JMAP API

The DnsResolver singleton is available via the `urn:stalwart:jmap` capability.


### `x:DnsResolver/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysDnsResolverGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsResolver/get",
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



### `x:DnsResolver/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysDnsResolverUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsResolver/set",
          {
            "update": {
              "singleton": {
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get dns-resolver
```


### Update

```sh
stalwart-cli update dns-resolver --field description='Updated'
```



## Nested types


### DnsCustomResolver {#dnscustomresolver}

Custom DNS server endpoint.



##### `protocol`

> Type: [<code>DnsResolverProtocol</code>](#dnsresolverprotocol) · default: `"udp"`
>
> Protocol to use for DNS queries


##### `address`

> Type: <code>IpAddr</code> · default: `"127.0.0.1"`
>
> Address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · min: 1 · max: 65535
>
> Port of the DNS server





## Enums


### DnsResolverProtocol {#dnsresolverprotocol}



| Value | Label |
|---|---|
| `tls` | DNS over TLS |
| `udp` | UDP |
| `tcp` | TCP |


