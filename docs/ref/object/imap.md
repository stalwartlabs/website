---
title: Imap
description: Configures IMAP protocol settings including authentication, timeouts, and rate limits.
custom_edit_url: null
---

# Imap

Configures IMAP protocol settings including authentication, timeouts, and rate limits.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › IMAP

## Fields


##### `allowPlainTextAuth`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to allow plain text authentication on unencrypted connections


##### `maxAuthFailures`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1
>
> Number of authentication attempts a user can make before being disconnected by the server


##### `maxConcurrent`

> Type: <code>UnsignedInt?</code> · default: `16` · min: 1
>
> The maximum number of concurrent connections


##### `maxRequestRate`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":2000,"period":"1m"}`
>
> The maximum number of requests per minute


##### `maxRequestSize`

> Type: <code>Size</code> · default: `"50mb"`
>
> Maximum size of an IMAP request that the server will accept


##### `timeoutAnonymous`

> Type: <code>Duration</code> · default: `"1m"`
>
> Time an unauthenticated session can stay inactive before being ended by the server


##### `timeoutAuthenticated`

> Type: <code>Duration</code> · default: `"30m"`
>
> Time an authenticated session can remain idle before the server terminates it


##### `timeoutIdle`

> Type: <code>Duration</code> · default: `"30m"`
>
> Time a connection can stay idle in the IMAP IDLE state before the server breaks the connection



## JMAP API

The Imap singleton is available via the `urn:stalwart:jmap` capability.


### `x:Imap/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysImapGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Imap/get",
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



### `x:Imap/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysImapUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Imap/set",
          {
            "update": {
              "singleton": {
                "allowPlainTextAuth": false
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
stalwart-cli get Imap
```


### Update

```sh
stalwart-cli update Imap --field allowPlainTextAuth=false
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





