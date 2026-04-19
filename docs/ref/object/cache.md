---
title: Cache
description: Configures in-memory cache sizes for data, DNS records, and authorization tokens.
custom_edit_url: null
---

# Cache

Configures in-memory cache sizes for data, DNS records, and authorization tokens.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Cache

## Fields


##### `accessTokens`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the access tokens cache


##### `contacts`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the address books and contacts cache


##### `dnsIpv4`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the IPv4 record cache


##### `dnsIpv6`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the IPv6 record cache


##### `dnsMtaSts`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the MTA-STS record cache


##### `dnsMx`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the MX record cache


##### `dnsPtr`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the PTR record cache


##### `dnsRbl`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the DNSBl record cache


##### `dnsTlsa`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the TLSA record cache


##### `dnsTxt`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the TXT record cache


##### `events`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the calendar and events cache


##### `scheduling`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the scheduling cache


##### `files`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the file storage data cache


##### `httpAuth`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the HTTP authorization headers cache


##### `messages`

> Type: <code>Size</code> · default: `"50mb"` · min: 2048
>
> Maximum size of the e-mail data cache


##### `domains`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the domains cache


##### `domainNames`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the domain name lookup cache


##### `domainNamesNegative`

> Type: <code>Size</code> · default: `"1mb"` · min: 2048
>
> Maximum size of the domain name lookup negative cache


##### `emailAddresses`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the email addresses lookup cache


##### `emailAddressesNegative`

> Type: <code>Size</code> · default: `"2mb"` · min: 2048
>
> Maximum size of the email addresses lookup negative cache


##### `accounts`

> Type: <code>Size</code> · default: `"20mb"` · min: 2048
>
> Maximum size of the accounts cache


##### `roles`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the roles cache


##### `tenants`

> Type: <code>Size</code> · default: `"5mb"` · min: 2048
>
> Maximum size of the tenants cache


##### `mailingLists`

> Type: <code>Size</code> · default: `"2mb"` · min: 2048
>
> Maximum size of the mailing lists cache


##### `dkimSignatures`

> Type: <code>Size</code> · default: `"10mb"` · min: 2048
>
> Maximum size of the DKIM signatures cache


##### `negativeTtl`

> Type: <code>Duration</code> · default: `"1h"`
>
> Time-to-live for domain and account name lookup negative cache entries



## JMAP API

The Cache singleton is available via the `urn:stalwart:jmap` capability.


### `x:Cache/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCacheGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Cache/get",
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



### `x:Cache/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCacheUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Cache/set",
          {
            "update": {
              "singleton": {
                "accessTokens": "10mb"
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
stalwart-cli get cache
```


### Update

```sh
stalwart-cli update cache --field description='Updated'
```



