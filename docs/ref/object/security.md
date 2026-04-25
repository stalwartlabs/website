---
title: Security
description: Configures automatic IP banning rules for abuse, authentication failures, and port scanning.
custom_edit_url: null
---

# Security

Configures automatic IP banning rules for abuse, authentication failures, and port scanning.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Security › Settings

## Fields


##### `abuseBanRate`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":35,"period":"1d"}`
>
> The maximum number of abuse attempts (relaying or failed RCPT TO attempts) before the IP is banned


##### `abuseBanPeriod`

> Type: <code>Duration?</code>
>
> The duration of the ban for abuse attempts


##### `authBanRate`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":100,"period":"1d"}`
>
> The maximum number of failed login attempts before the IP is banned


##### `authBanPeriod`

> Type: <code>Duration?</code>
>
> The duration of the ban for failed login attempts


##### `loiterBanRate`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":150,"period":"1d"}`
>
> The maximum number of loitering disconnections before the IP is banned


##### `loiterBanPeriod`

> Type: <code>Duration?</code>
>
> The duration of the ban for loitering connections.


##### `scanBanPaths`

> Type: <code>String[]</code> · default: `["*.php*","*.cgi*","*.asp*","*/wp-*","*/php*","*/cgi-bin*","*xmlrpc*","*../*","*/..*","*joomla*","*wordpress*","*drupal*"]`
>
> The paths that will trigger an immediate ban if accessed. Each path should be a glob expression


##### `scanBanRate`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":30,"period":"1d"}`
>
> The maximum number of port scanning attempts before the IP is banned


##### `scanBanPeriod`

> Type: <code>Duration?</code>
>
> The duration of the ban for port scanning attempts



## JMAP API

The Security singleton is available via the `urn:stalwart:jmap` capability.


### `x:Security/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSecurityGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Security/get",
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



### `x:Security/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSecurityUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Security/set",
          {
            "update": {
              "singleton": {
                "abuseBanRate": {
                  "count": 35,
                  "period": "1d"
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
stalwart-cli get Security
```


### Update

```sh
stalwart-cli update Security --field abuseBanRate='{"count":35,"period":"1d"}'
```



## Nested types


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





