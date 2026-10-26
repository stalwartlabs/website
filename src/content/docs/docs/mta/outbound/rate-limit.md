---
sidebar_position: 8
title: "Rate limits"
description: "Outbound throttles: limiting how fast Stalwart delivers to a remote host, IP address or domain, or sends for a sender, and what happens to messages that exceed a limit."
---

Receiving servers limit how much mail they accept from one sender in a period of time. A server that exceeds the limit receives temporary errors, and one that exceeds it repeatedly ends up with a lower reputation. A sending server therefore does better to pace its own deliveries than to run into the receivers' limits. Outbound throttles do this pacing: they cap the rate at which Stalwart delivers, so that it stays within the limits that receivers set.

A throttle can count deliveries per destination host, per remote IP address, per recipient domain, per local IP address or per sender. A delivery that would exceed a throttle is postponed, not refused. Throttling therefore delays mail without losing it.

Each throttle is an [MtaOutboundThrottle](/docs/ref/object/mta-outbound-throttle) object (found in the WebUI under <!-- breadcrumb:MtaOutboundThrottle --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Rates & Quotas › Outbound Rate Limits<!-- /breadcrumb:MtaOutboundThrottle -->). Inbound sessions have separate throttles of their own ([Inbound rate limits](/docs/mta/inbound/rate-limit)).

## Defining a throttle

A throttle has two required fields. [`description`](/docs/ref/object/mta-outbound-throttle#description) names it, and [`rate`](/docs/ref/object/mta-outbound-throttle#rate) sets the number of deliveries allowed (`count`) per period (`period`, in milliseconds).

The [`key`](/docs/ref/object/mta-outbound-throttle#key) decides what is counted separately. The available keys are `mx` (the MX host name), `remoteIp`, `localIp`, `rcptDomain`, `sender` and `senderDomain`, and each distinct value of the key gets its own counter. With no key, one counter covers all deliveries. [`match`](/docs/ref/object/mta-outbound-throttle#match) is an [expression](/docs/configuration/expressions/) over the [host variables](/docs/ref/expression/variable/mta-queue-host-variable) that restricts the throttle to some deliveries. [`enable`](/docs/ref/object/mta-outbound-throttle#enable) decides whether the throttle is active.

The keys also decide when the throttle is checked:

- A throttle keyed on `sender` or `senderDomain`, or with no key, is checked once for each message, before the message is routed. Its `match` can therefore use only the variables that describe the message, such as `sender`, `sender_domain`, `source`, `priority` and `size`. Host variables such as `mx` are empty at that point.
- A throttle keyed on `rcptDomain` is checked once for each recipient domain of the message.
- A throttle keyed on `mx`, `remoteIp` or `localIp`, or whose `match` uses those variables, is checked before each connection to a remote host.

The local address of the connection is chosen before that last check. A throttle keyed on `localIp` therefore keeps a separate counter for each [local address](/docs/mta/outbound/connection#local-ip-addresses).

The following throttle delivers at most 25 messages per hour to each recipient domain:

```json
{
  "description": "Per recipient domain",
  "key": {"rcptDomain": true},
  "rate": {"count": 25, "period": 3600000}
}
```

The following throttle limits the deliveries to one large provider's servers, identified by the MX host name, to 100 per minute for each host:

```json
{
  "description": "Provider MX hosts",
  "key": {"mx": true},
  "match": {"else": "ends_with(mx, '.mail.provider.example')"},
  "rate": {"count": 100, "period": 60000}
}
```

The counters are kept in the [in-memory store](/docs/storage/in-memory). In a cluster with a shared in-memory store, all nodes therefore count together, and a limit applies to the cluster as a whole.

## Exceeded throttles

When a delivery would exceed a throttle, the recipients affected are put back in the queue with a temporary status, `Rate limited`. Their next attempt is scheduled for when the throttle allows deliveries again.

A postponement of this kind is not treated as a failure. It does not count as a failed attempt towards an [`Attempts` expiry](/docs/mta/outbound/schedule), and it does not change the recipient's retry interval. A time-based expiry, however, continues to run, so a recipient that stays rate limited for long enough can still expire.

The postponement is visible in two places. The events `delivery.rate-limit-exceeded` and `queue.rate-limit-exceeded` are logged with the throttle's identifier, limit and period. The strategy expressions see `last_error` as `rate`, so they can react to it.

A throttle checked before a connection affects every recipient of that connection. When it is exceeded, every recipient routed to that remote host is postponed. Stalwart does not try another local address or another IP address of the host instead.

Stalwart has no IP warm-up schedule, so a new local address is warmed up with a throttle. The throttle is keyed on `localIp`, its `match` selects the address (for example `local_ip == '192.0.2.11'`), and its `count` is raised over time. The volume sent to each destination can be limited in the same way, with throttles keyed on `mx` or `rcptDomain`.

Warming up an address this way has a side effect. The local address is picked at random for each connection, so reaching the limit of the new address also postpones messages that the other addresses could have sent.
