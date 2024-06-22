---
sidebar_position: 4
---

# Delivery events

## dsn

Triggered for Delivery Status Notifications (DSN) and contains the following fields:

- `queueId` (u64): The ID of the message in the queue.
- `sender` (String): The sender of the message.
- `status` ([Status]): The list of delivery statuses.

The `Status` object contains the following fields:

- `address` (String): The recipient address.
- `remoteHost` (String): The remote host that reported the status.
- `type` (DSNType): The type of status.
- `message` (String): The status message.
- `nextRetry` (RFC3339): The next retry time.
- `expires` (RFC3339): The expiration time.
- `retryCount` (u32): The number of retries.

The `DSNType` is an enum with the following values:

- `success`: The message was successfully delivered.
- `temporaryFailure`: The message could not be delivered, but will be retried.
- `permanentFailure`: The message could not be delivered and will not be retried.

Example:

```json
{
    "queueId": 12345,
    "sender": "sender@example.com",
    "status": [
        {
            "address": "recipient@example.com",
            "remoteHost": "mail.example.com",
            "type": "temporaryFailure",
            "message": "Mailbox full",
            "nextRetry": "2023-06-21T16:55:00Z",
            "expires": "2023-06-22T14:55:00Z",
            "retryCount": 3
        }
    ],
    "createdAt": "2023-06-21T14:55:00Z"
}
```

## double-bounce

Triggered for double bounce messages (bounce messages that cannot be delivered) and contains the following fields:

- `queueId` (u64): The ID of the message in the queue.
- `status` ([Status]): The list of delivery statuses.

The `Status` object contains the following fields:

- `address` (String): The recipient address.
- `remoteHost` (String): The remote host that reported the status.
- `type` (enum): The type of status.
- `message` (String): The status message.
- `retryCount` (u32): The number of retries.

