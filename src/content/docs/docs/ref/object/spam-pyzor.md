---
title: SpamPyzor
description: Configures the Pyzor collaborative spam detection service.
custom_edit_url: null
---

# SpamPyzor

Configures the Pyzor collaborative spam detection service.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Pyzor

## Fields


##### `blockCount`

> Type: <code>UnsignedInt</code> · default: `5` · max: 1000 · min: 1
>
> The number of times the hash appears in the Pyzor blocklist


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable the Pyzor classifier. Pyzor is a collaborative, networked system to detect and report spam.


##### `host`

> Type: <code>String</code> · default: `"public.pyzor.org"`
>
> The hostname of the Pyzor server


##### `port`

> Type: <code>UnsignedInt</code> · default: `24441` · max: 65535 · min: 100
>
> The port to connect to the Pyzor server


##### `ratio`

> Type: <code>Float</code> · default: `0.2` · max: 1 · min: 0
>
> The ratio of the number of times the hash appears in the Pyzor allowlist to the blocklist


##### `timeout`

> Type: <code>Duration</code> · default: `"5s"`
>
> The timeout for the Pyzor server. If the server does not respond within this time, the check is considered failed.


##### `allowCount`

> Type: <code>UnsignedInt</code> · default: `10` · max: 1000 · min: 1
>
> The number of times the hash appears in the Pyzor allowlist



## JMAP API

The SpamPyzor singleton is available via the `urn:stalwart:jmap` capability.


### `x:SpamPyzor/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSpamPyzorGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamPyzor/get",
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



### `x:SpamPyzor/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSpamPyzorUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamPyzor/set",
          {
            "update": {
              "singleton": {
                "host": "updated value"
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get SpamPyzor
```


### Update

```sh
stalwart-cli update SpamPyzor --field host='updated value'
```



