---
sidebar_position: 2
---

# Webhooks

Stalwart provides a webhook API to notify your application of various events related to email delivery and authentication. This document describes the structure and types of webhook events that can be received.

## Response object

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

## Data payload

The `data` payload is a nested object that contains additional information about the event. The structure of the `data` object varies depending on the event type and it may contain any of the supported [keys](/docs/telemetry/events#key-types).


