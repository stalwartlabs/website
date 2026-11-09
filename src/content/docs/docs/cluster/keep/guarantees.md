---
sidebar_position: 3
title: "Guarantees"
description: "What Stalwart Keep promises for locks, keys, counters and event streams under crashes, pauses and network partitions, what each promise costs, and what it does not claim."
---

A store that hands out locks has to be right when things break, so Keep states precisely what it guarantees. This page summarises those guarantees. The [design document](https://github.com/stalwartlabs/keep/blob/main/docs/DESIGN.md) gives the formal statements that the [tests](/docs/cluster/keep/testing) check.

## Failure model

The guarantees hold under the following kinds of failure:

- Servers and clients can crash, including `kill -9` and power loss, and can pause for any length of time. A crashed server restarts with no state. Malicious servers are not considered.
- The network can lose, delay, duplicate or reorder messages, and partitions can be symmetric, one-way or flapping, of any length.

They also rest on the following assumptions, which are the deployment's responsibility:

- Each server's raw clock runs within 833 ppm of real time, and it stands still for at most `max-stop` in total within any span as long as the quarantine. See [Requirements](/docs/cluster/keep/installation#requirements).
- Every member has the same member list, peer secret and `max-lock-ttl`, and the list changes one member at a time.
- The peer port is reachable only from members.
- Locks use the pinned key classes, as Stalwart's do.
- `bootstrap` is used only for a first start, or a restart together with every client.

## Locks

Holds of a lock by two different clients never overlap in real time. This holds through crashes and restarts of any members, pauses of any process, partitions of any shape, and moves of the lock between members. The guarantee relies on three mechanisms:

- The client counts a hold from the moment it sent the request, not from when it got the reply, and takes off the 833 ppm clock margin. Network delay and queueing therefore cannot stretch a hold past what the server granted.
- A member that cannot confirm a majority stops granting within 1 second, so a cut-off member cannot grant a lock that another member has taken over.
- After a slot changes owner without its data, or after a restart, the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine) refuses new locks on absent keys until any earlier hold must have ended.

Costs fall on availability, not on safety. New locks on affected keys wait out the quarantine, about ten minutes by default. A lock lost with a crashed server answers `NotFound` to renewal and release, so its holder learns at its next renewal that it lost the lock. A handoff can lengthen a lock's life by the transfer time plus up to 2 seconds, and never shortens it.

## Keys and counters

Three levels of guarantee apply, depending on what happens to the key's slot:

- **While a slot stays on one member**, operations on a key are linearizable: each takes effect at one instant between its send and its reply, in an order consistent with real time.
- **When a slot moves by handoff**, which covers a clean leave, a rejoin or a late start, every write acknowledged before the move is on the new owner, and the first level continues across the move. This holds only for membership changes made one at a time. A key's handoff that runs out of time loses its entries, without two members serving it at once.
- **When a slot moves without handoff**, because its owner crashed or was cut off, a read returns the value of some write to that key, or nothing. It never invents a value.

The last level allows several things that the administrator should expect:

- A crashed owner's entries are lost.
- Between the takeover and the old owner's self-fencing, which is at most about a second, both can serve the slot, so reads can be stale and writes can land on either side.
- When a cut heals, a slot covered with data ends with the entries of the members that took over. The returning owner's own entries for that slot are dropped, so its counters and tokens restart.
- If nobody covered the slot during the cut, it opens with the returning owner's entries. Writes acknowledged elsewhere during the cut are then lost, a deleted key can come back, and a counter can fall back.

Counters follow the same rules. The client never resends an increment after an unknown outcome, so a count is never doubled by a retry. Across a failover, a count can split or restart, so a rate-limit window can admit up to its limit again.

Requests for several keys are pipelines of single-key operations. Each operation is covered on its own, and the batch as a whole is not atomic. Deleting by prefix is not atomic either, and it is not ordered with concurrent writes.

## Event streams

Three guarantees apply to each subscription, all of them limited to one server:

- **Order.** Events carry consecutive sequence numbers, and events published on one connection to one server arrive in publish order.
- **No silent loss.** Every event a server assigned to a subscription either arrives, or the subscriber sees the loss: a sequence gap, a heartbeat or end marker ahead of its last event, or the connection ending. Idle subscriptions receive a heartbeat within 100 milliseconds, so a loss at the tail shows within that time. A confirmed publish has been assigned to every subscription of its topic on that server.
- **Drain barrier.** The end marker a server sends when it drains a subscription counts every event assigned to it, on every shard.

## Claims not made

The following are explicitly outside what Keep promises, and behaviour in these areas is not a defect:

- Durability. A crash loses every entry and subscription of the crashed server.
- Replication. Each slot has one owner, and there are no replicas.
- Atomicity or isolation across keys, or order between different keys.
- Linearizability across a failover, across members that disagree on configuration, or when a membership change starts before the previous one has settled.
- Entries across a member-list change, which loses every key.
- Availability of a server cut off in one direction, which fences for the whole cut.
- Fencing tokens. A lock grant carries no token that the protected resource could check, so Stalwart's critical sections read before they write.
- Exactly-once execution. An operation whose outcome is unknown may or may not have taken effect.
- Delivery of events across servers, order across publishers, or persistence and replay. A plain publish that is lost with its connection is not reported to anyone, which is why Stalwart uses confirmed publish.
- Safety of member lists that differ by more than one member, beyond what servers can observe.
