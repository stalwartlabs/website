---
sidebar_position: 8
title: "Operations"
description: "Run a Stalwart Keep cluster day to day: restarts and rolling upgrades, the lock quarantine, member-list changes, VM maintenance, logs and statistics."
---

Keep needs little attention while nothing changes. The rules on this page concern the moments when something does: a member restarts, the list of members changes, or a host is paused for maintenance.

All of them rest on one rule: make one membership change at a time. A change is in flight from its first action until the cluster is settled, which is shown by the [ready file](/docs/cluster/keep/setup#readiness) or the `settled` field of the [control line](#statistics) on every member. A leave, a start, a restart and a rejoin after a network failure all count as changes.

## Stop a member

SIGTERM makes a member leave the cluster gracefully. It first freezes its shards, during which requests that use keys are answered `Busy`, a reply that tells the client to retry, for at most 1 second. It then announces that it is leaving, and the members that gain its keys pull them over the peer port before they serve them. This takes at most 11 seconds, so a stop can take up to 16 seconds with its margins. The [systemd unit](/docs/cluster/keep/installation#run-under-systemd), the [Docker command](/docs/cluster/keep/installation#run-with-docker) and the [Kubernetes manifest](/docs/cluster/keep/kubernetes#termination) all allow for this.

The handoff preserves everything acknowledged before the move, locks included. A key's expiry can grow by the transfer time plus up to 2 seconds, and never shrinks.

A log sequence such as the following shows a successful leave:

```text
keep: draining
keep: leaving the cluster; handing over the slots
keep: slots handed over; draining the shards
```

If the limit runs out, the log reports `leave limit reached after <ms> ms at epoch <n>`, with the keys left behind. Those keys are lost, as they would be in a crash, but no two members serve them at the same time.

## Restarts and rolling upgrades

A restarted member comes back empty, and it takes back its share of the keys. A rolling restart therefore goes one member at a time, and it waits for every member to report `settled` before moving on. Keep needs at least 1.25 seconds to settle after a restart.

To perform a rolling upgrade on a host:

1. Check that every member reports `settled`.
2. Replace the binary or image.
3. Restart the member with `sudo systemctl restart keep`, which sends SIGTERM and starts the server in the default `rejoin` mode.
4. Wait until every member reports `settled` again, then repeat on the next member.

Trust a `settled` report only from about 2 seconds after an event, because every server still reports `settled` for about 225 milliseconds after a member dies. The ready file is the most direct check. The control line is printed only every `stats-interval` seconds, so a rollout that reads it needs a short interval, such as 1 second.

Each restart has a cost for locks, described next, which applies even though the handoff preserved the keys.

## Lock quarantine

Keep stores nothing on disk, but clients keep acting on the locks they were granted. After a server crash, a client may still be working under a lock whose record has vanished. If the member that took over granted that lock to someone else, two clients would hold it at once.

Keep therefore refuses new locks on absent keys for a period long enough that any earlier lock must have expired. This period is the quarantine. During it, a request for a lock that is not on record is answered `Conflict`, and a request to renew or release a lock that was lost is answered `NotFound`. Ordinary keys and counters are served at once, and locks that are already held keep working.

The quarantine applies to the keys of a member in three situations:

- A key moved to a new owner without its data, because a member crashed or was cut off.
- A member restarted, in the `rejoin` mode. All of its keys are affected, including the ones it received by handoff.
- A member joined or came back and gained keys, even if their entries arrived by handoff.

The only moves that skip it are keys handed over by a leaving member whose own quarantine had already ended.

The length is derived from `max-lock-ttl`, the longest lock a client may hold, and from `max-stop`, the longest pause with a stopped clock, each described in the [Configuration reference](/docs/cluster/keep/reference). It is calculated as follows, with the last term rounded up to the millisecond:

```text
quarantine = max-lock-ttl + 3 s + max-stop + max(1 s, (2 x max-lock-ttl + max-stop + 5 s) / 1199)
```

With the defaults of 600 and 30 seconds, a cluster member's quarantine is 634.031 seconds. A single server has no `max-stop` term in this sum, and its quarantine is 604.006 seconds. Stalwart needs `max-lock-ttl` of at least 600 seconds, so the quarantine of a Keep cluster that serves Stalwart cannot fall much below ten minutes.

In a Stalwart cluster, the quarantine means that a share of queued messages and search index partitions wait longer for their lock. Tasks are affected in the same way. Nothing is lost, and work resumes when the quarantine ends. Each restart quarantines all of that member's keys for the whole period, so a quick rolling upgrade stalls new locks on nearly every key for about ten minutes, while locks already held keep working. Passes over the same member are best spaced by the length of the quarantine.

## Member-list changes

Every member must have the same list, so adding or removing a member means restarting every server. Change the list one member at a time, and restart every server with the new list before the next change.

To change the list:

1. To add a member under raw public keys, add its public key to `servers.pem` on every member and every Stalwart node first. A new member refuses to start unless the file lists its own key.
2. To remove a member, stop it with SIGTERM first, so that the keys it leaves behind are not quarantined.
3. Update `members` in the configuration of every remaining or new member.
4. Restart the members one at a time. Within one list change, each restart waits only for the client port to accept connections, because a server on the new list cannot settle until a majority of the new list runs.
5. Wait until every member reports `settled` before making another change.
6. If `servers.pem` changed, restart the Stalwart nodes, which read it only when the store opens. Update `hosts` if a seed address changed.

A list change loses every key, and it quarantines the locks that moved, as a restart of the whole cluster does. A removal also leaves a window without a majority between two of its restarts, during which the cluster answers `Busy`. In a Stalwart cluster, plan it like any brief in-memory store outage.

Never change two members at once. Servers that hear a list more than one member away fence themselves, which means that they stop serving as [described below](#failure-behaviour), and the cluster stays unavailable until the servers on the old list are restarted or stopped. The log shows the cause:

```text
keep: peer <node> runs a member list of <n> members against this server's <n>, more than one member apart; fenced while it is heard
```

Servers cannot detect a change that leaves no member on both lists running, and that makes two separate clusters that can disagree.

## Pauses and VM maintenance

Keep treats two kinds of pause differently. A process pause of any length, such as SIGSTOP or a scheduler stall, is safe, because the raw clock keeps counting through it. A pause with a stopped clock, such as a VM freeze or an OS suspend, is safe only up to the `max-stop` setting in total, within any span as long as the quarantine, because two freezes inside one lock's life add up.

An administrator who freezes or suspends a Keep VM for longer than `max-stop` must restart Keep afterwards. Keep detects an OS suspend, logs the following line and handles it as a loss of the clock:

```text
keep: the system was suspended for <ms> ms, which the server clock does not count; clock loss declared
```

## Failure behaviour

A member is declared dead after 225 milliseconds of silence, and the members ranked next for its keys take over. Clients learn the new placement from the members and follow the view that a majority reports. A server that does not own a key answers `Moved`, and the client follows it.

A member that cannot confirm a majority stops serving keys and locks 1 second after the last confirmed heartbeat round, and answers `Busy`. This is known as fencing, and it appears in the log as `keep: fenced (lapses <n>)`, followed by `keep: serving (lapses <n>)` on recovery. Streams keep working on a fenced member.

A member cut off in one direction, which is heard by the others but hears no majority itself, fences for the whole cut. Its peers never declare it dead, so nobody takes over its keys. Nothing is lost and no lock is at risk, but its share of keys is unavailable until the cut heals, and clients retry until their deadline. The `fenced` field of the control line shows this state.

## Logs

Keep writes all of its logs to standard error, so under systemd they are in the journal (`journalctl -u keep`), and in Docker they are in the container log. The following lines are the ones to watch:

- `keep: member <node> <alive|suspect|dead>[, lock-dead], <Active|Joining|Leaving> (view epoch <n>)` records each change of a member's state.
- `keep: waiting for members <nodes> to echo this server's restart; it does not place itself yet` shows a restarted member waiting for its peers, and repeats once per second.
- `keep: the kernel corrects this host's clock by <ppm> ppm (NTP frequency and slew); Keep assumes its raw clock within 833 ppm of real time, so if this does not end, check the clock source` shows a clock correction above 500 ppm. A short excursion is an NTP slew. One that never ends means that the host fails the [clock requirement](/docs/cluster/keep/installation#requirements).
- `keep: heartbeat receive buffer is <n> bytes, below the <n> its members need; raise net.core.rmem_max` asks for the [host setting](/docs/cluster/keep/tuning#heartbeat-receive-buffer).

Keep logs nothing on a failed handshake, a rejected client or a malformed frame. It closes the connection. A rejected heartbeat increases the `refused` counter of the control line.

## Statistics

Keep has no metrics endpoint. It reports its counters on standard error, once every `stats-interval` seconds, and a log shipper can parse them from there. `stats-shards` adds one line per shard. The following lines show the format:

```text
keep: stats requests <n> forwarded <n> remote <n> busy <n> conns <n> turns <n> parks <n> published <n> delivered <n> skipped <n> slow <n> skipruns <n> windows <n> heldus <n>
keep: control epoch <n> fenced <bool> lapses <n> awaiting <n> refused <n> unsent <n> runouts <n> settled <bool>
```

The fields of the first line are changes since the previous line, except for `conns` and `slow`, which are current values. These are the fields that matter most in operation:

| Field | Meaning |
|---|---|
| `requests` | Requests received on client connections |
| `forwarded` | Requests passed to another shard of this server. A high share means that clients are not routing to shards, usually for lack of the cluster secret |
| `busy` | Requests refused with `Busy`, because the server was fenced, overloaded or waiting for a handoff |
| `conns` | Open client connections |
| `delivered` | Events written to subscribers |
| `skipped`, `slow` | Events not written to, and subscriptions falling behind, because a subscriber had 16 MiB of pending output. Subscribers are told that they lost events |
| `epoch` | The current cluster view, which changes with each membership change |
| `fenced` | Whether this member has stopped serving because it cannot confirm a majority |
| `lapses` | How many times the member's lease ended |
| `refused` | Rejected heartbeat packets. A steady count can indicate a member with the wrong secret, or unwanted traffic on the peer port |
| `runouts` | Keys whose handoff ran out of time |
| `settled` | Whether a membership change can start |

Keep exits with status 2 on a syntax error, an unknown key or an invalid value, and with status 1 on any other failure, including settings that do not fit together.
