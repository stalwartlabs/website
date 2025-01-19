---
sidebar_position: 2
---

# Schedule

The queue scheduling settings determine the frequency of delivery attempts, the timing for notifications of delivery issues, and the maximum amount of time a message can stay in the queue before it is considered expired and returned to the sender. Proper configuration of the queue schedule ensures efficient delivery management and provides timely feedback to senders about the status of their messages.

## Retries

The `queue.schedule.retry` setting defines how frequently the server will retry delivering a message after a failed attempt. This setting is an [expression](/docs/configuration/expressions/overview) that evaluates to an array of wait durations, specifying the intervals between consecutive retries. For example, an expression returning `[2m, 5m, 10m]` means that if the first delivery attempt fails, the server will retry delivery 2 minutes after the first failure, 5 minutes after the second failure, and 10 minutes after the third and subsequent failures. This flexible configuration allows administrators to tailor the retry schedule to suit their delivery policies and operational requirements.

Example:

```toml
[queue.schedule]
retry = "[2m, 5m, 10m, 15m, 30m, 1h, 2h]"
```

## Notifications

The `queue.retry.notify` setting determines when Stalwart Mail Server sends delayed [delivery notifications](/docs/smtp/queue/dsn) (DSNs) to message senders. This setting is an [expression](/docs/configuration/expressions/overview) that evaluates to an array of durations, specifying the time intervals after which notifications should be sent. For example, an expression returning `[1d, 3d]` instructs the server to send the first delayed DSN 1 day after the message enters the queue and a second and final delayed DSN 3 days later. These notifications inform senders that their message is still queued and has not yet been delivered, ensuring transparency in the delivery process.

Example:

```toml
[queue.schedule]
notify = "[1d, 3d]"
```

## Expiration

The `queue.schedule.expire` setting controls how long a message can remain in the queue before it is deemed undeliverable. This setting is an [expression](/docs/configuration/expressions/overview) that evaluates to a duration, indicating the maximum lifetime of a message in the queue. For example, with a value of `10d`, the server will continue retrying delivery for up to 10 days, following the retry schedule defined by `queue.schedule.retry`. Once this duration is exceeded, the message is considered undeliverable and is bounced back to the sender with an appropriate [failure notification](/docs/smtp/queue/dsn). Configuring expiration times ensures that undeliverable messages are handled promptly and do not remain in the queue indefinitely.

Example:

```toml
[queue.schedule]
expire = "5d"
```

