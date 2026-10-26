---
sidebar_position: 6
title: "Alerts"
description: "Send an email or emit an event when a condition on Stalwart's metrics holds: conditions, evaluation schedule, messages and examples."
---

Alerts give a server basic monitoring without an external monitoring system. An alert is a condition on the server's [metrics](/docs/telemetry/metrics/), such as "the outbound queue holds more than 5000 messages", together with the notifications to produce while the condition holds. A notification can be an email to administrators, an event for the tracers and webhooks, or both.

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Evaluation schedule

The server evaluates the conditions of all enabled alerts every five minutes, starting five minutes after it starts. Each node evaluates them against its own metrics, so in a cluster each node sends its own notifications.

Evaluations keep no memory of earlier ones. While a condition holds, its notifications are produced at every evaluation, that is, every five minutes, until the condition no longer holds. A condition that cannot be evaluated is treated as false.

This behaviour affects the choice of metric, because a condition should become false again once the problem is gone:

- Counters, such as `store.s3-error`, count from the start of the process and never decrease. A condition such as `metric('store.s3-error') > 100` therefore remains true from the first time it is reached until the server restarts.
- Gauges, such as `queue.count` or `server.memory`, follow the current state, so conditions on them clear when the problem is resolved.

`queue.count` needs particular care in a cluster. It is a total for the whole cluster, calculated every five minutes, and only on nodes whose [role](/docs/cluster/configuration/roles) includes `metricsCalculate`. On other nodes it is 0. A queue alert therefore fires only on those nodes, once per node.

## Configuration

Each alert is an [Alert](/docs/ref/object/alert) object (found in the WebUI under <!-- breadcrumb:Alert --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Alerts<!-- /breadcrumb:Alert -->). Configuring one means choosing the condition and the notifications it produces.

### Condition

[`condition`](/docs/ref/object/alert#condition) is an [expression](/docs/configuration/expressions/). It reads metrics with the `metric` function, which takes the metric's name as listed in the [metrics reference](/docs/ref/metrics): `metric('queue.count') > 5000`. A condition can combine several metrics with `&&` and `||`. A misspelt metric name is rejected with `Invalid metric name`.

### Notifications

An alert can notify in two ways, each enabled on its own.

[`eventAlert`](/docs/ref/object/alert#eventalert) emits a `telemetry.alert-event` event at level `warn` when the condition holds, with its `eventMessage` as the event's details. The event reaches the tracers and any [webhook](/docs/telemetry/webhooks) that selects it, so a webhook can pass the alert on to another system.

[`emailAlert`](/docs/ref/object/alert#emailalert) sends an email from `fromAddress`, with the optional display name `fromName`, to the addresses in `to`, with the given `subject` and `body`. Each email carries an `Auto-Submitted: auto-generated` header, and the server logs it as a `telemetry.alert-message` event.

The message, subject and body can include the current value of a metric, written as `%{<metric name>}%` with the name in its usual dotted form, such as `%{queue.count}%`. A histogram is shown as its average. An unknown name is left in the text unchanged.

[`enable`](/docs/ref/object/alert#enable) turns the alert off without deleting it.

## Examples

The following alert sends an email while the outbound queue holds more than 5000 messages:

```json
{
  "condition": {"else": "metric('queue.count') > 5000"},
  "emailAlert": {
    "@type": "Enabled",
    "fromAddress": "postmaster@example.com",
    "fromName": "Mail server",
    "to": {"ops@example.com": true},
    "subject": "Outbound queue at %{queue.count}% messages",
    "body": "The outbound queue holds %{queue.count}% messages."
  },
  "eventAlert": {"@type": "Disabled"}
}
```

The following alert emits an event while the server uses more than 6 GiB of memory, so that a webhook can forward it:

```json
{
  "condition": {"else": "metric('server.memory') > 6442450944"},
  "eventAlert": {
    "@type": "Enabled",
    "eventMessage": "Memory usage at %{server.memory}% bytes"
  },
  "emailAlert": {"@type": "Disabled"}
}
```

The following alert reports S3 errors once any have occurred since the last restart. Because the counter only grows, the alert repeats every five minutes until the server restarts:

```json
{
  "condition": {"else": "metric('store.s3-error') > 0"},
  "eventAlert": {
    "@type": "Enabled",
    "eventMessage": "%{store.s3-error}% S3 errors since the last restart"
  },
  "emailAlert": {"@type": "Disabled"}
}
```
