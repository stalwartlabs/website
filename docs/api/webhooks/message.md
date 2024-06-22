---
sidebar_position: 5
---

# Message events

## message.accepted

Triggered when a message is accepted for delivery and contains the following fields:

- `queueId` (u64): The ID of the message in the queue.
- `remoteIp` (String): The IP address of the client.
- `localPort` (u16): The local port used for the connection.
- `authenticatedAs` (String): The authenticated username.
- `returnPath` (String): The return path of the message.
- `recipients` ([String]): The list of recipients.
- `nextRetry` (RFC3339): The next retry time.
- `nextDSN` (RFC3339): The next DSN time.
- `expires` (RFC3339): The delivery expiration time.

Example:

```json
{
    "queueId": 12345,
    "remoteIp": "192.0.2.2",
    "localPort": 587,
    "authenticatedAs": "user@example.com",
    "returnPath": "bounce@example.com",
    "recipients": ["recipient@example.com"],
    "nextRetry": "2023-06-21T15:55:00Z",
    "nextDSN": "2023-06-21T16:55:00Z",
    "expires": "2023-06-22T14:55:00Z",
    "size": 1024
}
```

## message.rejected

Triggered when a message is rejected and contains the following fields:

- `reason` (Reason): The reason for the rejection.
- `remoteIp` (String): The IP address of the client.
- `localPort` (u16): The local port used for the connection.
- `authenticatedAs` (String): The authenticated user.
- `returnPath` (String): The return path of the message.
- `recipients` ([String]): The list of recipients.

The `Reason` enum defines the possible reasons for the rejection:

- `parseFailed`: The message could not be parsed.
- `loopDetected`: A mail loop was detected.
- `dkimPolicy`: Rejected by DKIM policy.
- `arcPolicy`: Rejected by ARC policy.
- `dmarcPolicy`: Rejected by DMARC policy.
- `milterReject`: Rejected by a milter filter.
- `sieveDiscard`: Message discarded by Sieve script.
- `sieveReject`: Message rejected by Sieve script.
- `serverFailure`: Server failure.

Example:

```json
{
    "reason": "parseFailed",
    "remoteIp": "192.0.2.3",
    "localPort": 25,
    "authenticatedAs": "user@example.com",
    "returnPath": "bounce@example.com",
    "recipients": ["recipient@example.com"]
}
```

## message.appended

Triggered when a message is appended to a mailbox and contains the following fields:

- `accountId` (u32): The ID of the account.
- `mailboxIds` ([u32]): The list of mailbox IDs.
- `source` (Source): The source of the message (imap, smtp, etc).
- `encrypt` (Boolean): Whether the encryption at rest is enabled.
- `size` (u64): The size of the message.

The `Source` enum defines the possible sources of the message:

- `smtp`: SMTP
- `jmap`: JMAP Email/Set
- `imap`: IMAP append

Example:

```json
{
    "accountId": 1,
    "mailboxIds": [1, 2, 3],
    "source": "imap",
    "encrypt": true,
    "size": 2048
}
```

