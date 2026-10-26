---
title: "Rate limits"
description: "Throttling inbound SMTP connections, senders and recipients: keys, conditions, the stage at which each throttle applies, the default throttles and the replies clients receive."
sidebar_position: 9
---

Inbound rate limits, called throttles, slow down spam runs and dictionary attacks, in which a client tries addresses to find out which ones exist. They also protect the server from clients that open connections faster than it can serve them. A throttle caps how often something may happen in an SMTP session within a period of time, such as connections from one IP address, messages from one sender, or messages to one recipient.

A client that exceeds a throttle is deferred rather than refused. A legitimate sending server therefore retries later, and its mail is delayed, not lost.

Each throttle is an [MtaInboundThrottle](/docs/ref/object/mta-inbound-throttle) object (found in the WebUI under <!-- breadcrumb:MtaInboundThrottle --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Rates & Quotas › Inbound Rate Limits<!-- /breadcrumb:MtaInboundThrottle -->). Outbound deliveries have throttles of their own ([Outbound rate limits](/docs/mta/outbound/rate-limit)).

## Defining a throttle

A throttle answers three questions: how many events are allowed, what is counted, and which sessions it applies to.

The number of events is set by [`rate`](/docs/ref/object/mta-inbound-throttle#rate), the only required field. It holds the number of events allowed (`count`) per period (`period`, in milliseconds).

What is counted is set by [`key`](/docs/ref/object/mta-inbound-throttle#key), which lists the properties that separate the counters. A throttle keyed on `remoteIp` keeps a counter for each client address. One keyed on `senderDomain` and `rcpt` keeps a counter for each pair of sender domain and recipient. With no key, one counter covers all sessions. The available keys are `listener`, `remoteIp`, `localIp`, `authenticatedAs`, `heloDomain`, `sender`, `senderDomain`, `rcpt` and `rcptDomain`.

The sessions a throttle applies to are set by [`match`](/docs/ref/object/mta-inbound-throttle#match), an [expression](/docs/configuration/expressions/) that restricts the throttle to some sessions. Finally, [`enable`](/docs/ref/object/mta-inbound-throttle#enable) decides whether the throttle is active at all.

The following throttle allows each sending domain at most six messages per minute to any one recipient:

```json
{
  "key": {"senderDomain": true, "rcpt": true},
  "rate": {"count": 6, "period": 60000}
}
```

The following throttle uses `match` to limit only the connections from one network, to 30 per minute per address:

```json
{
  "key": {"remoteIp": true},
  "match": {"else": "is_ip_in_cidr(remote_ip, '192.0.2.0/24')"},
  "rate": {"count": 30, "period": 60000}
}
```

Without a `match` expression, a throttle applies on every SMTP listener, including the submission ports. To limit it to mail from other servers, restrict it with `match`, for example with `local_port == 25`.

The counters are kept in the [in-memory store](/docs/storage/in-memory). In a cluster with a shared in-memory store, all nodes therefore count together.

## Evaluation stages

A throttle can only be checked once the properties it counts are known. The sender, for example, is known only from `MAIL FROM`. Each throttle is therefore checked at the first stage at which all the properties it uses are known, both those in its keys and the variables that its `match` expression refers to:

| Throttle uses | Checked at | Effect when exceeded |
|---|---|---|
| `rcpt` or `rcptDomain` | Each `RCPT TO` | The recipient is refused with `452 4.4.5 Rate limit exceeded, try again later.` Other recipients of the message are not affected. |
| `sender`, `senderDomain`, `heloDomain` or `authenticatedAs`, and no recipient property | `MAIL FROM` | The sender is refused with `452 4.4.5 Rate limit exceeded, try again later.` |
| Only `listener`, `remoteIp` or `localIp`, or no key | The connection | The connection is closed without a greeting. |

The stage decides what a throttle actually counts. A throttle that limits messages per sender counts `MAIL FROM` commands. One keyed on `rcpt` counts recipients, and one keyed on `rcptDomain` counts each recipient domain once per message. Exceeded throttles are logged as `smtp.rate-limit-exceeded`, with the throttle and its limit.

## Default throttles

A new installation has two throttles:

| Description | Key | Rate |
|---|---|---|
| Sender IP throttle | `remoteIp` | 5 connections per second |
| Sender address to recipient throttle | `senderDomain`, `rcpt` | 25 per hour |

The second throttle applies to authenticated users as well. A user who sends more than 25 messages per hour from one domain to the same recipient is therefore deferred. Where that volume is expected, for example for automated notifications, adjust the throttle or restrict it with `match`.
