---
sidebar_position: 3
title: "Scheduling"
description: "Delivery schedules: the virtual queue, the retry intervals, the delay notifications and the expiry of each recipient, with examples by message type and MT-PRIORITY."
---

Delivery to another server does not always succeed at the first attempt. The remote server may be down, overloaded or deliberately deferring new senders, and the right response is to wait and try again. A delivery schedule decides how Stalwart does this for a recipient: when it tries, how long it waits after a temporary failure, when it tells the sender that delivery is delayed, and when it gives up and returns the message as undeliverable. Schedules are also the means of giving some mail faster retries or a longer lifetime than the rest.

Each schedule is an [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) object (found in the WebUI under <!-- breadcrumb:MtaDeliverySchedule --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Delivery Schedules<!-- /breadcrumb:MtaDeliverySchedule -->). The `schedule` expression of the [outbound strategy](/docs/mta/outbound/strategy) selects one for each recipient. The expression is evaluated again before each attempt, so a recipient can move to another schedule during its delivery, for example after a number of failures.

## Fields

A schedule makes four decisions, each held in one field:

- [`queueId`](/docs/ref/object/mta-delivery-schedule#queueid) names the [virtual queue](/docs/mta/outbound/queue) that delivers the recipient. It holds the identifier of an [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue), not its name.
- [`retry`](/docs/ref/object/mta-delivery-schedule#retry) sets the intervals between attempts: `Default`, or `Custom` with a list of `intervals`.
- [`notify`](/docs/ref/object/mta-delivery-schedule#notify) sets when delay notifications are sent: `Default`, or `Custom` with a list of `intervals`.
- [`expiry`](/docs/ref/object/mta-delivery-schedule#expiry) sets when to give up: `Ttl` with a duration in `expire`, or `Attempts` with a number in `maxAttempts`.

The retry intervals decide how persistently Stalwart tries. After a temporary failure, the next attempt is made after the next interval of the `retry` list. Once the list is exhausted, its last interval is repeated for every further attempt. The `Default` retry intervals are 2, 5, 10, 15 and 30 minutes, 1, 2, 24 and 72 hours. An attempt deferred by an [outbound throttle](/docs/mta/outbound/rate-limit) is not a failure: it is rescheduled for when the throttle allows it, and it does not count as an attempt.

The `notify` intervals are measured differently from the retry intervals. The first is measured from the time the message entered the queue, and each further interval from the previous notification. When a recipient is still undelivered at that time, and the sender asked for delay notifications, the sender receives a [delivery status notification](/docs/mta/reports/dsn) saying that delivery is delayed and will be retried. Senders ask for delay notifications by default. The `Default` intervals are 1 day and 3 days, so notifications go out after about 1 and 4 days. The `local` and `remote` schedules of a new installation expire after 3 days, so with them only the first notification is sent.

The `expiry` decides when delivery stops. With `Ttl`, delivery stops once the message has been in the queue for `expire` milliseconds. With `Attempts`, it stops after `maxAttempts` attempts. In both cases the sender then receives a failure notification. The choice between the two is a choice of what to keep constant. A time-based expiry gives senders a predictable answer, while an attempt-based one gives each recipient the same number of tries, however long the intervals are.

A new installation has four schedules, one for each of its virtual queues:

| Schedule | Queue | Retry | Expiry |
|---|---|---|---|
| `local` | `local` | Default | 3 days |
| `remote` | `remote` | Default | 3 days |
| `dsn` | `dsn` | 15 and 30 minutes, 1 and 2 hours | 10 attempts |
| `report` | `report` | 30 minutes, 1 and 2 hours | 8 attempts |

The following schedule retries after 1, 5 and 15 minutes and then every hour, notifies the sender once after 4 hours, and gives up after 2 days:

```json
{
  "name": "urgent",
  "queueId": "<MtaVirtualQueue id>",
  "retry": {
    "@type": "Custom",
    "intervals": {
      "0": {"duration": 60000},
      "1": {"duration": 300000},
      "2": {"duration": 900000},
      "3": {"duration": 3600000}
    }
  },
  "notify": {
    "@type": "Custom",
    "intervals": {"0": {"duration": 14400000}}
  },
  "expiry": {"@type": "Ttl", "expire": 172800000}
}
```

In this object, durations are integers in milliseconds, and lists are written as objects with numbered keys ([object encoding](/docs/configuration/object-encoding)).

## Schedules by message type

Different kinds of message often deserve different treatment. The `source` variable tells the `schedule` expression how a message entered the queue:

- `authenticated`: submitted by a user
- `unauthenticated`: received from another server
- `dmarc_pass`
- `dsn`: a delivery status notification
- `report`: a DMARC or TLS report
- `autogenerated`: for example a Sieve vacation reply

The following expression gives automatically generated messages a schedule of their own, in addition to the defaults:

```json
{
  "schedule": {
    "match": {
      "0": {"if": "is_local_domain(rcpt_domain)", "then": "'local'"},
      "1": {"if": "source == 'dsn'", "then": "'dsn'"},
      "2": {"if": "source == 'report'", "then": "'report'"},
      "3": {"if": "source == 'autogenerated'", "then": "'autogen'"}
    },
    "else": "'remote'"
  }
}
```

The expression only names the schedule, so the schedule `autogen` and its virtual queue must then be created.

## Schedules by priority

A client can give a message a priority with the `MT-PRIORITY` parameter of `MAIL FROM` ([RFC 6710](https://www.rfc-editor.org/rfc/rfc6710)). It can do so only when the extension is offered to it, which by default is to authenticated sessions only ([EHLO stage](/docs/mta/inbound/ehlo#smtp-extensions)). Priorities range from `-9` to `9`, and higher numbers mean higher priority. A message without the parameter has priority `0`. A value outside that range is refused with `501 5.5.4 Invalid priority value.`

The priority is stored with the message and is available to the strategy expressions as `priority`. Stalwart does not order deliveries by priority on its own, and it does not pass the parameter on to the next server. The priority therefore takes effect only through the schedules that the expression selects. The following expression places high-priority messages in a schedule with short intervals and a large queue, and low-priority messages in a slower one:

```json
{
  "schedule": {
    "match": {
      "0": {"if": "is_local_domain(rcpt_domain)", "then": "'local'"},
      "1": {"if": "priority > 0", "then": "'high-priority'"},
      "2": {"if": "priority < 0", "then": "'low-priority'"}
    },
    "else": "'remote'"
  }
}
```

## Schedules from a lookup

The schedule can also depend on data held outside Stalwart. The expression can consult an SQL database with the `sql_query` [function](/docs/configuration/expressions/functions), for example to give a list of important customers a schedule of their own. The query runs for each recipient at every attempt, so it should be fast and use an index. The `?` placeholders in the example are those of SQLite and MySQL, while PostgreSQL uses `$1`, `$2` and so on:

```json
{
  "schedule": {
    "match": {
      "0": {"if": "sql_query('crm', 'SELECT 1 FROM vip_clients WHERE email = ? OR email = ?', [rcpt, sender])", "then": "'vip'"}
    },
    "else": "'remote'"
  }
}
```
