---
sidebar_position: 1
---

# Overview

Stalwart Mail Server provides a webhook API to notify your application of various events related to email delivery and authentication. This document describes the structure and types of webhook events that can be received.

## Response object

The main object in the webhook response is `WebhookEvents`, which contains a list of `WebhookEvent` objects:

```json
{
    "events": [
        {
            "id": 12345,
            "createdAt": "2023-06-21T14:55:00Z",
            "type": "auth.success",
            "data": {}
        }
    ]
}
```

Each `WebhookEvent` contains the following fields:

- `id` (unsigned 64 bits integer): Unique identifier for the event.
- `createdAt` (RFC3339 timestamp): Timestamp when the event was created.
- `type` (WebhookType): Type of the event.
- `data` (WebhookPayload): Detailed data associated with the event.

## Event types

The `WebhookType` enum defines the type of events that can be triggered:

- `auth.success`: Authentication success.
- `auth.failure`: Authentication failure.
- `auth.banned`: IP address banned after multiple authentication failures (fail2ban).
- `auth.error`: Authentication error (due to database failure, etc).
- `message.accepted`: Message accepted for delivery.
- `message.rejected`: Message rejected.
- `message.appended`: Message appended to a mailbox.
- `account.over-quota`: Account over quota.
- `dsn`: Delivery Status Notification (DSN).
- `double-bounce`: Double bounce message.
- `report.incoming.dmarc`: Incoming DMARC report.
- `report.incoming.tls`: Incoming TLS report.
- `report.incoming.arf`: Incoming ARF report.
- `report.outgoing`: Outgoing DMARC or TLS report.

