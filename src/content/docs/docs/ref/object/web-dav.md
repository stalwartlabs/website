---
title: WebDav
description: Configures WebDAV protocol settings including property limits and locking.
custom_edit_url: null
---

# WebDav

Configures WebDAV protocol settings including property limits and locking.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › WebDAV

## Fields


##### `enableAssistedDiscovery`

> Type: <code>Boolean</code> · default: `true`
>
> Enables assisted discovery of WebDAV shared collections by modifying PROPFIND requests to the root collection. Requests with depth 1 are automatically changed to depth 2, which may cause compatibility issues with some clients that expect the original behavior.


##### `maxLockTimeout`

> Type: <code>Duration</code> · default: `"1h"`
>
> Specifies the maximum duration for which a lock can be held on a resource


##### `maxLocks`

> Type: <code>UnsignedInt</code> · default: `10`
>
> Specifies the maximum number of locks that a user can create on a resource


##### `deadPropertyMaxSize`

> Type: <code>Size?</code> · default: `1024`
>
> Specifies the maximum size of a WebDAV dead property value that the server will accept


##### `livePropertyMaxSize`

> Type: <code>Size</code> · default: `250`
>
> Specifies the maximum size of a WebDAV live property value that the server will accept


##### `requestMaxSize`

> Type: <code>Size</code> · default: `"25mb"`
>
> Determines the maximum XML size of a WebDAV request that the server will accept


##### `maxResults`

> Type: <code>UnsignedInt</code> · default: `2000`
>
> Specifies the maximum number of results that a WebDAV query can return



## JMAP API

The WebDav singleton is available via the `urn:stalwart:jmap` capability.


### `x:WebDav/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysWebDavGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:WebDav/get",
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



### `x:WebDav/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysWebDavUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:WebDav/set",
          {
            "update": {
              "singleton": {
                "enableAssistedDiscovery": true
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
stalwart-cli get WebDav
```


### Update

```sh
stalwart-cli update WebDav --field enableAssistedDiscovery=true
```



