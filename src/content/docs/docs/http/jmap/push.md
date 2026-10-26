---
sidebar_position: 4
title: "Push notifications"
description: "How JMAP clients are notified of changes: Server-Sent Events, Web Push subscriptions with VAPID, push subscription limits and the settings that pace notifications."
---

A client that wants to show a new message as soon as it arrives could ask the server again and again whether anything has changed, but polling wastes resources and still lags behind. JMAP clients instead learn about changes, such as a new message or an updated calendar event, through push notifications. Stalwart supports the three mechanisms defined for JMAP.

The first is Server-Sent Events ([RFC 8620, section 7.3](https://www.rfc-editor.org/rfc/rfc8620#section-7.3)). The client keeps an HTTP request to `/jmap/eventsource` open, and the server writes notifications to it as `text/event-stream` events. This suits clients that run continuously, such as webmail.

The second is WebSocket push ([RFC 8887](https://www.rfc-editor.org/rfc/rfc8887)), which delivers notifications on the client's [WebSocket](/docs/http/jmap/websockets) connection.

The third is push subscriptions ([RFC 8620, section 7.2](https://www.rfc-editor.org/rfc/rfc8620#section-7.2)), which reach clients that are not running. The client registers the URL of a push service, such as the one of a browser or a mobile platform. Stalwart sends each notification to that URL with an HTTP `POST`, and the push service delivers it to the device even when the client is not running. Notifications are encrypted for the client when it supplies keys ([RFC 8291](https://www.rfc-editor.org/rfc/rfc8291)).

The settings are on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket<!-- /breadcrumb:Jmap -->), and they take effect after a [settings reload](/docs/configuration/#applying-changes).

## Server-Sent Events

The URL is advertised in the session resource as `/jmap/eventsource/?types={types}&closeafter={closeafter}&ping={ping}`, and the client fills in three parameters:

- `types`: the data types to watch, or `*` for all.
- `closeafter`: `state` ends the response after the first notification.
- `ping`: the interval of keep-alive events in seconds, raised to at least 30 seconds, or `0` for none.

A burst of changes should not produce a burst of notifications, so notifications on one connection are paced. [`eventSourceThrottle`](/docs/ref/object/jmap#eventsourcethrottle) is the minimum time between two of them, and changes that occur in between are combined into the next notification.

## Push subscriptions

A push subscription makes the server send requests to a URL that a client chose, so the server restricts where it will send them. A subscription is accepted only for a public `https` URL. A URL with another scheme, a URL with credentials, and a URL whose host is a private, loopback or otherwise non-public address or name are refused with `invalidProperties` on `url`, with a description such as `URL must use the https scheme` or `Destination is a local or reserved IP address`. The same rule is applied again when notifications are sent, so a name that later resolves to a private address does not receive them.

[`maxSubscriptions`](/docs/ref/object/jmap#maxsubscriptions) limits the push subscriptions that one account can have, to <!-- default:Jmap.maxSubscriptions -->15<!-- /default --> unless changed.

Browser push services require the sending server to identify itself. Stalwart does so with VAPID ([RFC 8292](https://www.rfc-editor.org/rfc/rfc8292), used for JMAP by [RFC 9749](https://www.rfc-editor.org/rfc/rfc9749)), which signs each request with the server's key. [`webPushKey`](/docs/ref/object/jmap#webpushkey) is the ECDSA P-256 signing key, generated when the server starts for the first time. While it is set, the session resource advertises the `urn:ietf:params:jmap:webpush-vapid` capability, with the public key. [`webPushContact`](/docs/ref/object/jmap#webpushcontact) is the contact address sent to push services, `mailto:postmaster@<hostname>` when it is unset.

[`maxPushSize`](/docs/ref/object/jmap#maxpushsize) limits the size of a notification, to <!-- default:Jmap.maxPushSize -->4 KiB<!-- /default --> unless changed. Larger email push notifications are truncated.

Delivery to push services is paced and retried. [`pushThrottle`](/docs/ref/object/jmap#pushthrottle) is the minimum time between two requests to one push subscription, and [`pushRequestTimeout`](/docs/ref/object/jmap#pushrequesttimeout) is the timeout of each request. When a request fails, [`pushRetryWait`](/docs/ref/object/jmap#pushretrywait) is the wait before retrying, and [`pushAttemptWait`](/docs/ref/object/jmap#pushattemptwait) the wait between attempts. A notification that still fails after [`maxPushAttempts`](/docs/ref/object/jmap#maxpushattempts) attempts is discarded.

A new subscription must also be verified. The client verifies it with the code sent to it, within [`pushVerifyTimeout`](/docs/ref/object/jmap#pushverifytimeout).

In a [cluster](/docs/cluster/), push subscriptions are divided among the nodes. [`pushShardsTotal`](/docs/ref/object/jmap#pushshardstotal) is the number of shards, and each node serves the shard set by its `STALWART_PUSH_SHARD` [environment variable](/docs/configuration/environment-variables#clustering).
