---
sidebar_position: 5
title: "Webhooks"
description: "Post selected Stalwart events to an HTTP endpoint: configuration, payload format, signature verification and delivery behaviour."
---

A webhook lets an external system react to what happens on the server. It posts selected [events](/docs/telemetry/events) to an HTTP endpoint as they occur, and the receiving system decides what to do with them. Typical uses are recording deliveries in an analytics pipeline, forwarding authentication failures to a security monitoring system, or starting a workflow when a message arrives.

Each webhook is a [WebHook](/docs/ref/object/web-hook) object (found in the WebUI under <!-- breadcrumb:WebHook --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Webhooks<!-- /breadcrumb:WebHook -->). Setting one up involves three decisions: which events to send, where and how to send them, and how the receiver verifies that a request is genuine.

## Selecting events

A webhook selects events by name with [`events`](/docs/ref/object/web-hook#events) and [`eventsPolicy`](/docs/ref/object/web-hook#eventspolicy). With `eventsPolicy` set to `include`, only the listed events are sent. With `exclude`, every event except the listed ones is sent, and the policy is <!-- default:WebHook.eventsPolicy -->`exclude`<!-- /default --> by default. Events are listed individually by their full name, as in the [event reference](/docs/ref/events), because groups and wildcards are not accepted.

The webhook also has a [`level`](/docs/ref/object/web-hook#level), <!-- default:WebHook.level -->`info`<!-- /default --> by default, and events below it are not sent. An `exclude` policy with an empty list therefore sends every event at or above that level. That is why webhooks in practice use `include` with a short list.

The level is compared after any change of level. An event whose level has been changed, as described in [Changing the level of an event](/docs/telemetry/events#changing-the-level-of-an-event), is compared at its changed level.

A webhook can end up with no events to send, for example when its `include` list names only events below its `level`. Such a webhook is not started, and the configuration build reports the warning `No events enabled for webhook`.

## Configuration

### Endpoint

Events are sent with `POST` requests to the endpoint in [`url`](/docs/ref/object/web-hook#url). The endpoint's authentication is set in [`httpAuth`](/docs/ref/object/web-hook#httpauth), as one of:

- `Unauthenticated`.
- `Basic`, with `username` and `secret`.
- `Bearer`, with `bearerToken`.

[`httpHeaders`](/docs/ref/object/web-hook#httpheaders) adds other headers, and [`allowInvalidCerts`](/docs/ref/object/web-hook#allowinvalidcerts) accepts an invalid TLS certificate.

Authentication protects the endpoint. In the other direction, [`signatureKey`](/docs/ref/object/web-hook#signaturekey) sets a key with which each request is signed, so that the receiver can tell genuine requests from forged ones, as described in [Verifying the signature](#verifying-the-signature). With `None`, requests are sent unsigned.

### Timing

Three durations govern how events reach the endpoint:

- [`throttle`](/docs/ref/object/web-hook#throttle) is the minimum interval between two requests, <!-- default:WebHook.throttle -->1 second<!-- /default --> by default. Events produced in the meantime are sent together in the next request, which keeps the request rate bounded however busy the server is.
- [`timeout`](/docs/ref/object/web-hook#timeout) limits each request.
- [`discardAfter`](/docs/ref/object/web-hook#discardafter) is the age after which an event that could not be delivered is dropped, <!-- default:WebHook.discardAfter -->5 minutes<!-- /default --> by default.

### Other settings

[`enable`](/docs/ref/object/web-hook#enable) turns the webhook off without deleting it. [`lossy`](/docs/ref/object/web-hook#lossy) has the same meaning as for [tracers](/docs/telemetry/tracing/#event-loss-under-load): it decides how the webhook behaves when it cannot keep up with the events.

The following webhook sends authentication failures and delivered messages to an endpoint, signed and with Basic authentication:

```json
{
  "url": "https://hooks.example.com/stalwart",
  "events": {"auth.failed": true, "delivery.delivered": true},
  "eventsPolicy": "include",
  "signatureKey": {"@type": "EnvironmentVariable", "variableName": "WEBHOOK_KEY"},
  "httpAuth": {
    "@type": "Basic",
    "username": "stalwart",
    "secret": {"@type": "EnvironmentVariable", "variableName": "WEBHOOK_PASSWORD"}
  },
  "httpHeaders": {"X-Source": "mail1"}
}
```

## Payload

Each request carries a JSON object with an `events` array. Because of throttling, one request usually contains several events, so the receiver should always process the whole array:

```json
{
  "events": [
    {
      "id": "17368534641210000123",
      "createdAt": "2026-01-14T09:12:44Z",
      "type": "auth.failed",
      "data": {
        "spanId": 7302861283650912,
        "listenerId": "imaps",
        "remoteIp": "203.0.113.9",
        "accountName": "alice@example.org"
      }
    }
  ]
}
```

Each event in the array has four members:

- `id` is a unique identifier of the event.
- `createdAt` is the time of the event, in RFC 3339 format.
- `type` is the event name.
- `data` contains the keys of the event, together with those of the session in which it occurred, such as the remote address.

Within `data`, `spanId` identifies the session, so that the receiver can group the events of one connection. The keys present depend on the event and are listed in the [key reference](/docs/ref/enum/key). Durations are given in milliseconds, times as RFC 3339 strings and binary values in base64.

## Verifying the signature

When `signatureKey` is set, each request carries an `X-Signature` header. Its value is the HMAC-SHA256 of the raw request body, computed with the key and encoded in base64. An HMAC can be produced only by someone who holds the key, so a matching value shows that the request came from the server and that the body was not altered.

To verify a request, the receiver recomputes the value over the body exactly as received, before parsing it, and compares the two. Parsing first would not work, because re-serialised JSON rarely matches the original bytes. The following Python function performs the check:

```python
import base64, hashlib, hmac

def is_valid(body: bytes, signature: str, key: bytes) -> bool:
    expected = base64.b64encode(hmac.new(key, body, hashlib.sha256).digest()).decode()
    return hmac.compare_digest(expected, signature)
```

## Delivery and failures

Requests are sent one at a time. A request fails when the endpoint returns a status other than 2xx or cannot be reached. A failed request is retried at the `throttle` interval until it succeeds, and new events are queued in the meantime.

The queue has two limits, so that an unreachable endpoint cannot hold events forever. Events older than `discardAfter` are dropped, and at most 65,536 events are queued, so beyond that limit new events are dropped as well.

The server reports delivery problems as `telemetry.webhook-error` events. These go to the server's tracers, never to webhooks. The events follow the course of an outage:

1. One is emitted when requests start failing, with the status code and reason phrase.
2. Another is emitted whenever the error changes.
3. Each group of dropped events produces one with their number.
4. A final one reports that delivery has resumed.

Webhooks are delivered by each node independently, so in a cluster every node sends its own events.
