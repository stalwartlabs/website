---
sidebar_position: 9
title: "Quotas"
description: "Queue quotas: limits on the number and total size of queued messages, overall or per sender, recipient or domain, and the reply clients receive when a quota is full."
---

Messages that cannot be delivered at once wait in the queue to be retried, and while they wait they occupy storage. Some events, however, make the queue grow without bound. A remote domain that stops accepting mail leaves every message addressed to it waiting, and a compromised account that sends in bulk adds messages faster than they can leave. Without limits, either can fill the queue and the disk.

A queue quota sets such a limit. It caps how many messages, or how many bytes, may wait in the queue at once, either overall or for one sender, recipient or domain. When a quota is full, Stalwart defers the new messages that would exceed it, and the clients retry later.

Each quota is an [MtaQueueQuota](/docs/ref/object/mta-queue-quota) object (found in the WebUI under <!-- breadcrumb:MtaQueueQuota --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Rates & Quotas › Queue Quotas<!-- /breadcrumb:MtaQueueQuota -->). Defining one involves three choices.

The first choice is what the quota counts separately. Its [`key`](/docs/ref/object/mta-queue-quota#key) divides the queued messages into groups, by `sender`, `senderDomain`, `rcpt` or `rcptDomain` ([MtaQueueQuotaKey](/docs/ref/object/mta-queue-quota#mtaqueuequotakey)), and the limit applies to each group on its own. With no key, one group covers the whole queue.

The second choice is the size of the limit. For each group, [`messages`](/docs/ref/object/mta-queue-quota#messages) sets the number of messages allowed in the queue, and [`size`](/docs/ref/object/mta-queue-quota#size) their total size in bytes. A quota may set `messages`, `size` or both.

The third choice is which messages the quota applies to. [`match`](/docs/ref/object/mta-queue-quota#match) is an expression that restricts the quota to some messages, and [`enable`](/docs/ref/object/mta-queue-quota#enable) decides whether the quota is active at all.

A new installation has one quota, which protects the whole queue. It is the following object, which caps the queue at 100000 messages and 10 GiB:

```json
{
  "messages": 100000,
  "size": 10737418240
}
```

A key narrows the limit to one sender, recipient or domain at a time. The following quota allows at most 10 queued messages for any one recipient:

```json
{
  "key": {"rcpt": true},
  "messages": 10
}
```

A key and a `match` together limit one kind of traffic. The following quota allows 900 messages and 7 MiB per recipient, only for messages from one sender domain:

```json
{
  "key": {"rcpt": true},
  "match": {"else": "sender_domain == 'example.org'"},
  "messages": 900,
  "size": 7340032
}
```

## Full quotas

The quotas are checked when a message is about to be queued, at the end of the DATA stage. A message that would exceed a quota is refused with `452 4.3.1 Mail system full, try again later.` The refusal comes after the client has transferred the message. Stalwart logs the event `queue.quota-exceeded`, with the quota and the kind of group.

The `452` code is a temporary failure, so sending servers keep the message and retry. A full quota therefore delays mail without losing it, as long as the condition clears before the sender's retry period ends.

Not every message is treated in this way. Messages sent by Sieve scripts, such as vacation replies, are dropped when a quota is full, and the event `sieve.quota-exceeded` is logged. Delivery status notifications and reports are not subject to the quotas at all.

A message counts towards the quotas from the moment it is queued. It stops counting once each of its recipients has been delivered, has failed permanently, or has expired.
