---
sidebar_position: 1
---

# Queues

Queues are essentially a holding area for outbound messages in an SMTP server. When a message arrives, it is placed in the queue until it can be delivered to its final destination. Stalwart SMTP supports an unlimited number of virtual queues, which means that a system administrator can create and configure multiple queues with different settings and behaviors. This allows for a high degree of flexibility and customization in managing incoming messages. For example, different queues can be created for different types of messages, such as messages from high-priority senders or messages with specific content, and these queues can be processed differently, such as by assigning more resources or prioritizing delivery.

## Queue Path

Queued messages that are waiting to be delivered are stored in the file system. The path to the message queue is specified with the `queue.path` attribute. It is also possible to hash the queued messages under multiple sub-folders by specifying a hash value in the `queue.hash` attribute.

Example:

```toml
[queue]
path = "/opt/stalwart-smtp/queue"
hash = 64
```

[DKIM](/docs/smtp/authentication/dkim/overview), [SPF](/docs/smtp/authentication/spf), [DMARC](/docs/smtp/authentication/dmarc) and [TLS](/docs/smtp/outbound/tls) reports queued for delivery are stored in a different location which is specified with the `report.path` attribute. Just like with the message queue, it is possible to hash the queued reports under multiple sub-folders by specifying a hash value in the `report.hash` attribute. Additionally, the report submitter address can be configured using the `report.submitter` attribute or left blank to use the value specified in `server.hostname`.

Example:

```toml
[report]
path = "/opt/stalwart-smtp/reports"
hash = 64
submitter = "mx.foobar.org"
```

## Schedule

The queue scheduling settings determine the frequency of delivery attempts, the timing for notifications of delivery issues, and the maximum amount of time a message can stay in the queue before it is considered expired and returned to the sender. The following scheduling parameters can be configured under the `queue.schedule` key in the configuration file:

- `retry`: A list of durations defining the schedule for retrying the delivery of a message.
- `notify`: A list of durations specifying when to notify the sender of any delivery problems.
- `expire`: The maximum duration that a message can remain in the queue before it expires and is returned to the sender.

Additionally, these scheduling settings can be made dynamic using [rules](/docs/smtp/overview).

Example:

```toml
[queue.schedule]
retry = ["2m", "5m", "10m", "15m", "30m", "1h", "2h"]
notify = ["1d", "3d"]
expire = "5d"
```

## Delivery Notifications

Delivery Status Notifications (DSN) allows senders of an email message to be notified of its delivery status. It works by sending a message back to the sender, notifying them of the delivery status of the email message they sent. The delivery status information includes whether the message was delivered successfully, whether it was delivered to the recipient's mailbox or to a different location, whether it was delayed, or whether there was a permanent delivery failure. 

DSNs are configured under the `report.dsn` key and support the following attributes:

- `from-name`: The name that will be used in the `From` header of the DSN email.
- `from-address`: The email address that will be used in the `From` header of the DSN email.
- `sign`: The list of [DKIM](/docs/smtp/authentication/dkim/overview) signatures to use when signing the DSN.

Example:

```toml
[report.dsn]
from-name = "Mail Delivery Subsystem"
from-address = "MAILER-DAEMON@foobar.org"
sign = ["rsa"]
```


