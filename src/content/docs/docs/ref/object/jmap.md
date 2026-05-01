---
title: Jmap
description: Configures JMAP protocol limits for requests, uploads, and push notifications.
custom_edit_url: null
---

# Jmap

Configures JMAP protocol limits for requests, uploads, and push notifications.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket

## Fields


##### `parseLimitEvent`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Limits the maximum number of iCalendar items that can be parsed in a single request


##### `parseLimitContact`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Limits the maximum number of vCard items that can be parsed in a single request


##### `parseLimitEmail`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Limits the maximum number of e-mail message that can be parsed in a single request


##### `changesMaxResults`

> Type: <code>UnsignedInt</code> · default: `5000` · min: 1
>
> Determines the maximum number of change objects that a Changes method can return


##### `getMaxResults`

> Type: <code>UnsignedInt</code> · default: `500` · min: 1
>
> Determines the maximum number of objects that can be fetched in a single method call


##### `queryMaxResults`

> Type: <code>UnsignedInt</code> · default: `5000` · min: 1
>
> Sets the maximum number of results that a Query method can return


##### `maxMethodCalls`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1
>
> Limits the maximum number of method calls that can be included in a single request


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt?</code> · default: `4` · min: 1
>
> Restricts the number of concurrent requests a user can make to the JMAP server


##### `maxRequestSize`

> Type: <code>Size</code> · default: `10000000` · min: 1
>
> Defines the maximum size of a single request, in bytes, that the server will accept


##### `setMaxObjects`

> Type: <code>UnsignedInt</code> · default: `500` · min: 1
>
> Establishes the maximum number of objects that can be modified in a single method call


##### `snippetMaxResults`

> Type: <code>UnsignedInt</code> · default: `100` · min: 1
>
> Maximum number of search snippets to return in a single request


##### `maxConcurrentUploads`

> Type: <code>UnsignedInt?</code> · default: `4` · min: 1
>
> Restricts the number of concurrent file uploads a user can perform


##### `maxUploadSize`

> Type: <code>UnsignedInt</code> · default: `50000000` · min: 1
>
> Defines the maximum file size for file uploads to the server


##### `maxUploadCount`

> Type: <code>UnsignedInt</code> · default: `1000` · min: 1
>
> Specifies the maximum number of files that a user can upload within a certain period


##### `uploadQuota`

> Type: <code>UnsignedInt</code> · default: `50000000` · min: 1
>
> Defines the total size of files that a user can upload within a certain period


##### `uploadTtl`

> Type: <code>Duration</code> · default: `"1h"`
>
> Specifies the Time-To-Live (TTL) for each uploaded file, after which the file is deleted from temporary storage


##### `eventSourceThrottle`

> Type: <code>Duration</code> · default: `"1s"`
>
> Specifies the minimum time between two event source notifications


##### `pushAttemptWait`

> Type: <code>Duration</code> · default: `"1m"`
>
> Time to wait between push attempts


##### `pushMaxAttempts`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1
>
> Maximum number of push attempts before a notification is discarded


##### `pushRetryWait`

> Type: <code>Duration</code> · default: `"1s"`
>
> Time to wait between retry attempts


##### `pushThrottle`

> Type: <code>Duration</code> · default: `"1s"`
>
> Time to wait before sending a new request to the push service


##### `pushRequestTimeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Time before a connection with a push service URL times out


##### `pushVerifyTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> Time to wait for the push service to verify a subscription


##### `pushShardsTotal`

> Type: <code>UnsignedInt</code> · default: `1` · min: 1
>
> Total number of shards for push notification processing across multiple nodes


##### `websocketHeartbeat`

> Type: <code>Duration</code> · default: `"1m"`
>
> Time to wait before sending a new heartbeat to the WebSocket client


##### `websocketThrottle`

> Type: <code>Duration</code> · default: `"1s"`
>
> Amount of time to wait before sending a batch of notifications to a WS client


##### `websocketTimeout`

> Type: <code>Duration</code> · default: `"10m"`
>
> Time before an inactive WebSocket connection times out


##### `maxSubscriptions`

> Type: <code>UnsignedInt?</code> · default: `15` · min: 1
>
> The default maximum number of push subscriptions a user can create



## JMAP API

The Jmap singleton is available via the `urn:stalwart:jmap` capability.


### `x:Jmap/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysJmapGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Jmap/get",
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



### `x:Jmap/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysJmapUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Jmap/set",
          {
            "update": {
              "singleton": {
                "parseLimitEvent": 10
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
stalwart-cli get Jmap
```


### Update

```sh
stalwart-cli update Jmap --field parseLimitEvent=10
```



