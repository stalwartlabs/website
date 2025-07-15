---
sidebar_position: 3
---

# Scheduling

Queue scheduling determine which virtual queue to use, the frequency of delivery attempts, the timing for notifications of delivery issues, and the maximum amount of time a message can stay in the queue before it is considered expired and returned to the sender.

A **scheduling strategy** in Stalwart MTA defines the policies and behavior for how outbound message deliveries are managed over time. These strategies play a critical role in determining not only *when* and *how often* delivery attempts are made, but also *how messages are prioritized* and *when they should be removed from the queue* if delivery ultimately fails.

Each scheduling strategy governs several key aspects of message handling:

* **Virtual Queue Assignment**: Determines which [virtual queue](/docs/mta/outbound/queue) a message recipient should be placed into for delivery. This allows messages to be grouped and processed independently based on priority, message type, or other criteria.
* **Retry Logic**: Specifies how frequently the MTA should retry delivery after a failed attempt, and whether retry intervals should increase over time.
* **Status Notifications**: Controls when delayed [delivery status notifications](/docs/mta/reports/dsn) (DSNs) should be generated and sent to the message sender.
* **Message Expiry**: Defines how long the system should continue retrying delivery attempts before considering the message undeliverable and bouncing it back to the sender.

Scheduling strategies are defined by under the `queue.schedule.<id>` setting (where `<id>` is the name of the strategy) and selected dynamically at runtime based on an expression configured in the [scheduling strategy](/docs/mta/outbound/strategy) setting. This allows different scheduling behaviors to be applied to different types of messages or recipients depending on delivery context.

## Queue

Each **scheduling strategy** in Stalwart must be associated with a [virtual queue](/docs/mta/outbound/queue), which determines where recipients are placed for delivery processing. The virtual queue defines how delivery is executed, including the number of delivery threads and concurrency limits. By assigning different scheduling strategies to different queues, administrators can control how messages are prioritized and processed based on message characteristics or delivery context.

The virtual queue used by a scheduling strategy is specified using the `queue.schedule.<id>.queue-name` setting, where `<id>` is the name of the scheduling strategy.

For example:

```toml
[queue.schedule.local]
queue-name = "local"

[queue.schedule.remote]
queue-name = "mx"
```

In this example:

* Messages using the `local` scheduling strategy will be placed in the `local` virtual queue.
* Messages using the `remote` strategy will be placed in the `mx` virtual queue.

Each message recipient is evaluated independently and placed into the appropriate queue based on the selected strategy. This allows Stalwart to process different types of messages in isolation—for example, handling local deliveries separately from remote ones, or prioritizing high-importance messages without blocking other traffic.

It is important to ensure that the virtual queues referenced in scheduling strategies are properly defined using the `queue.virtual.<name>.threads-per-node` setting, as queues are not created automatically.

## Retries

When a message cannot be delivered on the first attempt—due to a temporary failure such as a remote server being unavailable—the MTA must retry delivery at a later time. The logic that governs when these retry attempts are made is defined in the **scheduling strategy**, specifically through the `retry` setting.

In Stalwart, delivery retries are configured using the `queue.schedule.<id>.retry` setting, where `<id>` is the name of the scheduling strategy. This setting accepts a list of durations, which define the intervals between successive delivery attempts.

For example:

```toml
[queue.schedule.local]
retry = ["2m", "5m", "10m", "15m", "30m", "1h", "2h"]
```

In this case, delivery will be retried:

* 2 minutes after the first failure,
* then 5 minutes after that,
* then 10 minutes after the previous attempt, and so on.

Once the list is exhausted, the last duration in the list (`2h` in this example) is used repeatedly for subsequent retry attempts until the message is either delivered, expires, or exceeds the maximum number of delivery attempts (configured separately). Each recipient in a message is retried independently, and retries are always scheduled based on the delivery failure of the individual recipient.

Retry behavior works in conjunction with message expiration and notification settings, which are described in the following sections.

## Delay Notifications

Delayed Delivery Status Notifications (DSNs) inform the sender that a message has not yet been delivered but is still being retried. These notifications are particularly useful for informing users of potential delivery delays without waiting for the final expiration of the message.

In Stalwart, delayed DSNs are configured using the `queue.schedule.<id>.notify` setting, where `<id>` is the name of the scheduling strategy. This setting accepts a list of durations that specify when delayed notifications should be sent relative to the time the message entered the queue.

For example:

```toml
[queue.schedule.local]
notify = ["1d", "3d"]
```

In this configuration, if a message remains undelivered:

* A delayed DSN will be sent to the sender after 1 day,
* and again after 3 days,
* assuming the message is still in the queue and has not been successfully delivered or expired.

If the `notify` list is empty or not defined, no delayed delivery notifications will be sent.

Each duration in the list is evaluated independently, and notifications are only sent once per configured time threshold. Note that these notifications are separate from final bounce messages, which are sent when a message is permanently undeliverable.

## Expiration

Message expiration determines how long the MTA should continue attempting delivery before giving up and returning a non-delivery report (bounce [DSN](/docs/mta/reports/dsn)) to the sender. This mechanism ensures that undeliverable messages do not remain in the queue indefinitely and that senders are eventually notified of permanent delivery failures.

In Stalwart, message expiration can be configured using **one of two methods**:

- **Time-to-Live (TTL)**: The message expires after a fixed duration in the queue, regardless of the number of delivery attempts.
- **Maximum Delivery Attempts**: The message expires after a specified number of failed delivery attempts, regardless of how much time has passed.

Both methods offer flexibility for different operational needs. TTL-based expiration is typically used when guaranteed delivery within a fixed time window is important, while attempt-based expiration is useful in environments where retry frequency may vary, but a maximum effort should be enforced.

Note the only one expiration method can be used per scheduling strategy. If both `expire` and `max-attempts` are defined, the configuration is invalid.

### TTL-Based Expiration

To configure expiration based on TTL, use the `queue.schedule.<id>.expire` setting with a duration value, where `<id>` is the name of the scheduling strategy:

```toml
[queue.schedule.local]
expire = "4d"
```

In this example, messages using the `local` scheduling strategy will expire 4 days after entering the queue if they have not been successfully delivered by that time.

### Attempt-Based Expiration

To expire messages based on a maximum number of delivery attempts, use the `queue.schedule.<id>.max-attempts` setting with an integer value, where `<id>` is the name of the scheduling strategy:

```toml
[queue.schedule.relay]
max-attempts = 15
```

Here, messages using the `relay` scheduling strategy will be expired and bounced after 15 unsuccessful delivery attempts, regardless of how much time has passed.

## Examples

### Queues by Message Type

This example shows how to assign different types of messages—such as delivery status notifications, reports, autogenerated messages, local deliveries, and general outbound mail—to separate virtual queues. This approach ensures that lower-priority or system-generated messages do not interfere with regular message flow, enabling more efficient and isolated processing.

```toml
[queue.strategy]
schedule = [ { if = "is_local_domain('*', rcpt_domain)", then = "'local'" }, 
             { if = "source == 'dsn'", then = "'dsn'" }, 
             { if = "source == 'report'", then = "'report'" }, 
             { if = "source == 'autogenerated'", then = "'autogenerated'" }, 
             { else = "'remote'" } ]

[queue.schedule.local]
queue-name = "local"

[queue.schedule.dsn]
queue-name = "dsn"

[queue.schedule.report]
queue-name = "report"

[queue.schedule.autogenerated]
queue-name = "autogenerated"

[queue.schedule.remote]
queue-name = "mx"

[queue.virtual.local]
threads-per-node = 1000

[queue.virtual.dsn]
threads-per-node = 50

[queue.virtual.report]
threads-per-node = 10

[queue.virtual.autogenerated]
threads-per-node = 20

[queue.virtual.remote]
threads-per-node = 1000
```

### Priority-Based Delivery Queues

This configuration prioritizes message delivery based on the `MT-PRIORITY` SMTP extension value set by the sender. Messages marked as high priority are given more resources and retried more aggressively, while low-priority traffic is throttled to avoid impacting other deliveries.

```toml
[queue.strategy]
schedule = [ { if = "priority == 1", then = "'high-priority'" }, 
             { if = "priority == 3", then = "'low-priority'" }, 
             { else = "'normal-priority'" } ]

[queue.schedule.high-priority]
queue-name = "high-priority"
retry = ["1m"]

[queue.schedule.normal-priority]
queue-name = "normal-priority"
retry = ["2m", "5m", "10m", "15m", "30m", "1h", "2h"]

[queue.schedule.low-priority]
queue-name = "low-priority"
retry = ["30m"]

[queue.virtual.high-priority]
threads-per-node = 2000

[queue.virtual.normal-priority]
threads-per-node = 100

[queue.virtual.low-priority]
threads-per-node = 2
```

### VIP Client Queue

This example demonstrates how to prioritize message delivery for VIP users, such as premium or high-importance clients. A database query checks whether either the sender or recipient is listed in a VIP table, and if so, assigns their messages to a dedicated queue with fast retries and higher concurrency.

```toml
[queue.strategy]
schedule = [ { if = "sql_query("my-db", "SELECT 1 FROM vip_clients WHERE email = ? OR email = ?", [rcpt, sender])", then = "'vip-client'" }, 
             { else = "'default'" } ]

[queue.schedule.vip-client]
queue-name = "vip"
retry = ["1m", "5m", "10m"]

[queue.schedule.default]
queue-name = "default"
retry = ["2m", "5m", "10m", "15m", "30m", "1h", "2h"]

[queue.virtual.vip]
threads-per-node = 1000

[queue.virtual.default]
threads-per-node = 100
```