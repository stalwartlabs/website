---
sidebar_position: 5
---

# Webhooks

Webhooks deliver real-time notifications about server events by posting to an HTTP endpoint of the operator's choice. They let external systems react to activity in the server without polling; typical uses include recording deliveries into an analytics pipeline, flagging authentication anomalies to a SIEM, or triggering automated workflows on message ingestion.

## Configuration

Each webhook is represented by a [WebHook](/docs/ref/object/web-hook) object (found in the WebUI under <!-- breadcrumb:WebHook --><!-- /breadcrumb:WebHook -->). Relevant fields are:

- [`url`](/docs/ref/object/web-hook#url): endpoint to which `POST` requests are sent.
- [`events`](/docs/ref/object/web-hook#events) and [`eventsPolicy`](/docs/ref/object/web-hook#eventspolicy): list of events and how to interpret it. With `eventsPolicy` set to `include`, only the listed events trigger the webhook; with `exclude`, all events except the listed ones trigger it. Event identifiers are documented on the [Events](/docs/telemetry/events#event-types) page.
- [`timeout`](/docs/ref/object/web-hook#timeout): maximum time to wait for a response. Default `"30s"`.
- [`throttle`](/docs/ref/object/web-hook#throttle): minimum interval between batches. Events that fall within the same window are grouped. Default `"1s"`.
- [`discardAfter`](/docs/ref/object/web-hook#discardafter): duration after which an undelivered webhook request is discarded. Default `"5m"`.
- [`signatureKey`](/docs/ref/object/web-hook#signaturekey): optional HMAC key used to sign each request body. The signature is base64-encoded and carried in the `X-Signature` header. The field is a `SecretKeyOptional` with variants `None`, `Value`, `EnvironmentVariable`, and `File`.
- [`httpAuth`](/docs/ref/object/web-hook#httpauth): HTTP authentication used by the request. A nested type with variants `Unauthenticated`, `Basic`, and `Bearer`.
- [`httpHeaders`](/docs/ref/object/web-hook#httpheaders): additional HTTP headers to include on each request.
- [`allowInvalidCerts`](/docs/ref/object/web-hook#allowinvalidcerts): whether to permit requests to endpoints with an invalid TLS certificate. Default `false`.
- [`lossy`](/docs/ref/object/web-hook#lossy): whether to drop events when the endpoint is unreachable or persistently failing. When `false`, events accumulate until delivery succeeds or [`discardAfter`](/docs/ref/object/web-hook#discardafter) elapses.
- [`enable`](/docs/ref/object/web-hook#enable): whether the webhook is active.
- [`level`](/docs/ref/object/web-hook#level): minimum severity of events delivered to this endpoint.

## API documentation

### Response object

The main object in the webhook response is `WebhookEvents`, which contains a list of `WebhookEvent` objects:

```json
{
    "events": [
        {
            "id": "12345",
            "createdAt": "2023-06-21T14:55:00Z",
            "type": "auth.success",
            "data": {}
        }
    ]
}
```

Each `WebhookEvent` contains the following fields:

- `id` (String): Unique identifier for the event.
- `createdAt` (RFC3339 timestamp): Timestamp when the event was created.
- `type` (WebhookType): Type of the [event](/docs/telemetry/events#event-types).
- `data` (WebhookPayload): Detailed data associated with the event.

### Data payload

The `data` payload is a nested object that contains additional information about the event. The structure of the `data` object varies depending on the event type and it may contain any of the supported [keys](/docs/telemetry/events#key-types).

## Example

The equivalent of a webhook firing on `auth.success` and `store.ingest`, signed with a shared secret, with a custom header and Basic authentication:

```json
{
  "url": "https://example.com/webhook",
  "events": ["auth.success", "store.ingest"],
  "eventsPolicy": "include",
  "timeout": "30s",
  "throttle": "1s",
  "signatureKey": {"@type": "Value", "secret": "my-secret-key"},
  "httpHeaders": {"X-My-Header": "my-value"},
  "httpAuth": {
    "@type": "Basic",
    "username": "account",
    "secret": {"@type": "Value", "secret": "password"}
  },
  "allowInvalidCerts": false,
  "enable": true
}
```

<!-- review: The previous docs described event matching as glob-style wildcards (for example `"*"` for all events or `"auth.*"` for every authentication event). The current WebHook object pairs `events` with `eventsPolicy` (`include`/`exclude`) and the EventType enum references individual events. Confirm whether wildcard expansion is still supported, or whether the equivalent effect is now obtained by leaving `events` empty with `eventsPolicy: "exclude"`. -->
