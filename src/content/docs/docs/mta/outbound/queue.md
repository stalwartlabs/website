---
sidebar_position: 2
title: "Queues"
description: "The outbound message queue and the virtual queues that divide it, each with its own number of delivery threads per node; how they are created, selected and sized."
---

The queue holds every message that Stalwart has accepted but not yet finished delivering. It separates receiving a message from delivering it: the server can accept mail as fast as clients send it, and deliver it at the pace that remote servers and its own resources allow. Knowing how the queue is organised matters when one kind of traffic starts to delay another, or when the server must deliver more mail at once.

Every message that Stalwart accepts for delivery passes through the queue, whether it goes to a local mailbox or to another server. The message is written to the queue before the client receives its `250` reply. It stays in the queue until every recipient has been delivered, has failed permanently, or has expired.

Queued messages are stored in the [data store](/docs/storage/data), not in the memory of the node that received them. A restart therefore loses nothing. In a cluster, the queue is shared as well, so a message accepted by one node can be delivered by any node that runs the `outboundMta` [task](/docs/cluster/configuration/roles).

## Virtual queues

A single queue with a single pool of delivery threads would let one kind of traffic hold up all the others. For this reason the queue is divided into virtual queues, each with its own set of delivery threads. A backlog of mail to a slow remote domain then does not delay local delivery, and a burst of bounces does not delay user mail.

Each recipient is assigned to a virtual queue by its [delivery schedule](/docs/mta/outbound/schedule). The schedule is in turn selected by the `schedule` expression of the [outbound strategy](/docs/mta/outbound/strategy), so the expression decides indirectly which queue delivers each recipient.

Each virtual queue is an [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) object (found in the WebUI under <!-- breadcrumb:MtaVirtualQueue --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Virtual Queues<!-- /breadcrumb:MtaVirtualQueue -->). Its [`name`](/docs/ref/object/mta-virtual-queue#name) has at most eight characters. Its [`threadsPerNode`](/docs/ref/object/mta-virtual-queue#threadspernode) is the number of deliveries the queue can perform at the same time on each node, and it is the setting that sizes the queue. Each delivery thread holds one connection to a remote server for the duration of a delivery. The number of threads therefore bounds two things at once: the throughput of the queue, and the number of outbound connections it opens.

A new installation has four virtual queues, one for each kind of traffic that the default schedules separate:

| Queue | Threads per node | Traffic |
|---|---|---|
| `local` | 25 | Delivery to local mailboxes. |
| `remote` | 50 | Delivery to other servers. |
| `dsn` | 16 | Delivery status notifications. |
| `report` | 8 | DMARC and TLS reports. |

The following object defines a queue with 200 threads per node for transactional mail:

```json
{
  "name": "transact",
  "description": "Transactional mail",
  "threadsPerNode": 200
}
```

A delivery schedule refers to its queue by the queue's identifier, in its `queueId` field, not by the queue's name. When a schedule's `queueId` names a queue that does not exist, the schedule is reported as a configuration error, `Virtual queue ID '<id>' does not exist.`, and is not loaded. The recipients that the expression assigns to that schedule then get the built-in fallback schedule ([Missing strategies](/docs/mta/outbound/strategy#missing-strategies)).

A queue can also be deleted while recipients are still waiting in it. Such recipients are delivered through a fallback queue with 25 threads. [Tuning mail throughput](/docs/performance/mail-throughput) describes how to size the queues.

## Managing queued messages

Administrators can list, inspect, reschedule and cancel queued messages, and can pause and resume queue processing for the whole cluster. [Queue management](/docs/mta/management) describes these operations.
