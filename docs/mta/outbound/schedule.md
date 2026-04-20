---
sidebar_position: 3
---

# Scheduling

A scheduling strategy defines the policies and behaviour that govern how outbound message deliveries are managed over time. Scheduling strategies control which virtual queue a message uses, how often delivery is retried after a failure, when delayed delivery-status notifications are generated, and when undeliverable messages are expired and bounced to the sender.

Scheduling strategies are defined as [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) objects (found in the WebUI under <!-- breadcrumb:MtaDeliverySchedule --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Delivery Schedules<!-- /breadcrumb:MtaDeliverySchedule -->) and selected dynamically at runtime via the schedule expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy); see [Strategies](/docs/mta/outbound/strategy) for details.

Each scheduling strategy controls the following aspects:

- **Virtual queue assignment**: determines which [virtual queue](/docs/mta/outbound/queue) a message recipient is placed into for delivery.
- **Retry intervals**: specify how frequently the MTA retries delivery after a failed attempt.
- **Delay notifications**: control when delayed [delivery-status notifications](/docs/mta/reports/dsn) (DSNs) are generated and sent to the sender.
- **Expiration**: defines how long the system should continue retrying before considering the message undeliverable.

## Queue

Each scheduling strategy must be associated with a [virtual queue](/docs/mta/outbound/queue), which determines where recipients are placed for delivery processing. The [`queueId`](/docs/ref/object/mta-delivery-schedule#queueid) field references the [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) object to use. Different scheduling strategies can reference different queues to isolate message classes.

Each recipient is evaluated independently and placed into the appropriate queue based on the selected strategy, so local deliveries can be processed separately from remote ones, or high-importance messages can bypass a congested general-purpose queue. The referenced virtual queue must exist before the scheduling strategy can be applied, as queues are not created automatically.

## Retries

When a delivery attempt fails temporarily (for example because the remote server is unavailable), the MTA retries delivery later. Retry timing is controlled by the [`retry`](/docs/ref/object/mta-delivery-schedule#retry) field, which is a multi-variant value: the `Default` variant uses the built-in retry schedule, and the `Custom` variant carries an `intervals` array of `MtaDeliveryScheduleInterval` entries, each with a `duration` field.

With intervals such as `2m`, `5m`, `10m`, `15m`, `30m`, `1h`, `2h`, delivery is retried 2 minutes after the first failure, 5 minutes after that, and so on. When the list is exhausted, the last duration is reused for all subsequent attempts, until the message is delivered, expires, or exceeds the maximum number of delivery attempts. Retries are scheduled independently for each recipient.

## Delay notifications

Delayed Delivery Status Notifications (DSNs) inform the sender that a message has not yet been delivered but is still being retried. These notifications are useful for alerting users to delivery delays before the final expiration.

Delay notifications are configured via [`notify`](/docs/ref/object/mta-delivery-schedule#notify), which accepts the same multi-variant shape as `retry`: the `Default` variant uses the built-in schedule and the `Custom` variant carries an `intervals` array. Durations are measured from the moment the message enters the queue; for example an interval list of `1d`, `3d` sends a delay DSN one day and three days after queue entry, provided the message is still undelivered.

Each interval triggers at most one notification. These delay notifications are separate from the final bounce message, which is sent when the message is permanently undeliverable.

## Expiration

Message expiration determines how long the MTA should continue attempting delivery before giving up and returning a bounce [DSN](/docs/mta/reports/dsn) to the sender. Expiration is configured via [`expiry`](/docs/ref/object/mta-delivery-schedule#expiry), a multi-variant field with two variants:

- `Ttl`: Time-To-Live. The message expires after a fixed duration, regardless of the number of delivery attempts. Carries an `expire` duration (default `3d`).
- `Attempts`: Attempt-based. The message expires after a specified number of failed delivery attempts, regardless of how much time has passed. Carries a `maxAttempts` count (default 5).

TTL-based expiration suits deployments where guaranteed delivery within a fixed time window is important; attempt-based expiration suits environments where retry frequency may vary, but a maximum effort should be enforced.

A schedule that expires messages after 4 days with custom retry intervals:

```json
{
  "name": "local",
  "queueId": "<MtaVirtualQueue id>",
  "retry": {
    "@type": "Custom",
    "intervals": [
      {"duration": "2m"}, {"duration": "5m"}, {"duration": "10m"},
      {"duration": "15m"}, {"duration": "30m"}, {"duration": "1h"}, {"duration": "2h"}
    ]
  },
  "notify": {
    "@type": "Custom",
    "intervals": [{"duration": "1d"}, {"duration": "3d"}]
  },
  "expiry": {"@type": "Ttl", "expire": "4d"}
}
```

A schedule that gives up after 15 delivery attempts uses the `Attempts` variant instead:

```json
{
  "name": "relay",
  "queueId": "<MtaVirtualQueue id>",
  "retry": {"@type": "Default"},
  "notify": {"@type": "Default"},
  "expiry": {"@type": "Attempts", "maxAttempts": 15}
}
```

## Examples

### Queues by message type

Different message types (DSNs, reports, auto-generated notifications, local deliveries, general outbound mail) can be placed into separate virtual queues. The schedule expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy) branches on context variables (`is_local_domain('*', rcpt_domain)`, `source == 'dsn'`, `source == 'report'`, `source == 'autogenerated'`) and selects the appropriate scheduling-strategy name. Each referenced [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) sets [`queueId`](/docs/ref/object/mta-delivery-schedule#queueid) to a different [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) (`local`, `dsn`, `report`, `autogen`, `remote`), and each virtual queue has an appropriate [`threadsPerNode`](/docs/ref/object/mta-virtual-queue#threadspernode) value.

The schedule expression:

```json
{
  "schedule": {
    "match": [
      {"if": "is_local_domain('*', rcpt_domain)", "then": "'local'"},
      {"if": "source == 'dsn'", "then": "'dsn'"},
      {"if": "source == 'report'", "then": "'report'"},
      {"if": "source == 'autogenerated'", "then": "'autogen'"}
    ],
    "else": "'remote'"
  }
}
```

Paired with five MtaVirtualQueue objects (`local`/1000, `dsn`/50, `report`/10, `autogen`/20, `remote`/1000 threads per node) and five MtaDeliverySchedule objects whose [`queueId`](/docs/ref/object/mta-delivery-schedule#queueid) points at the matching queue.

### Priority-based delivery queues

Delivery priority can be driven by the `MT-PRIORITY` SMTP extension. A schedule expression that branches on `priority == 1` and `priority == 3` selects `high-priority`, `low-priority`, or `normal-priority` scheduling strategies. The high-priority strategy uses a short retry interval (`Custom` variant with intervals `["1m"]`) and a high-concurrency virtual queue; the low-priority strategy throttles retries (`["30m"]`) and uses a queue with very few threads.

```json
{
  "schedule": {
    "match": [
      {"if": "priority == 1", "then": "'high-priority'"},
      {"if": "priority == 3", "then": "'low-priority'"}
    ],
    "else": "'normal-priority'"
  }
}
```

The `high-priority` MtaDeliverySchedule uses `retry = {"@type": "Custom", "intervals": [{"duration": "1m"}]}` against a 2000-thread `high-priority` virtual queue; `low-priority` uses `retry = {"@type": "Custom", "intervals": [{"duration": "30m"}]}` against a 2-thread `low-priority` virtual queue; `normal-priority` uses the default schedule against a 100-thread `normal-priority` virtual queue.

### VIP client queue

Messages involving VIP clients can be routed to a dedicated queue. The schedule expression invokes `sql_query` against a lookup store to check whether sender or recipient is listed in a VIP table, and selects a `vip-client` scheduling strategy when it matches. The VIP scheduling strategy targets a high-concurrency queue and uses aggressive retry intervals; the default scheduling strategy targets a smaller queue with the standard retry schedule.

```json
{
  "schedule": {
    "match": [
      {"if": "sql_query('my-db', 'SELECT 1 FROM vip_clients WHERE email = ? OR email = ?', [rcpt, sender])", "then": "'vip-client'"}
    ],
    "else": "'default'"
  }
}
```

The `vip-client` MtaDeliverySchedule targets a 1000-thread `vip` virtual queue with intervals `["1m", "5m", "10m"]`; `default` targets a 100-thread `default` virtual queue with the standard retry schedule.
