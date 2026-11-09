---
sidebar_position: 9
title: "Tuning"
description: "Tune Stalwart Keep and its hosts: CPU placement, TCP retransmission timeout, NIC queues and IRQ affinity, huge pages, spinning, stream coalescing and the memory cap."
---

Keep is designed to run well without tuning, and most deployments need only the first three sections of this page. The rest concern hosts that serve very high request rates or have strict latency targets. Keep's latency is measured in tens of microseconds, so small settings on the host can be larger than anything in the server.

Measurements on this page come from Azure virtual machines. Other NICs and clouds have not been measured, so treat them as guidance on what to check.

## CPU placement

Keep runs one shard per CPU in its budget. The budget is the smaller of the cpuset and the cgroup `cpu.max` quota, and never the number of CPUs on the host. Getting this number right is the most important decision, because a server with too many shards spends its quota on being throttled: 16 pinned shards under a 4-CPU quota were throttled in every period, with a 99th percentile latency above 70 milliseconds. A 4-shard server under the same quota showed no such effect.

In a cluster, the `members` list states each member's shard count, and it takes precedence. A CPU limit that no longer matches the list needs a [member-list change](/docs/cluster/keep/operations#member-list-changes). On cgroup v1, Keep cannot read the quota, and logs `keep: cgroup v1 CPU quota is not read; set --shards to the quota`.

Keep pins each shard to its CPU when the budget is exclusive and has a CPU for every shard, and it logs the outcome in the `pinned` field of its startup line. `--cpus` limits which CPUs are used, and `--pin never` disables pinning. Pinning is not required: unpinned shards cost 3 to 4% of throughput at saturation.

Sharing CPUs with other busy processes costs far more than that. An equal-weight neighbour that spins multiplied the 99th percentile latency 44 times, so give Keep exclusive cores, or a CPU weight at least 100 times that of its neighbours. The hosts that run Keep are best given to it alone.

## TCP retransmission timeout

A lost packet stalls a TCP connection until the retransmission timer fires, and the Linux default minimum of 200 milliseconds is thousands of times longer than a Keep request. Keep and its client therefore use a minimum of 5 milliseconds.

On kernel 6.15 and later, each end sets this per socket and nothing needs configuring. On earlier kernels, including the 6.12 minimum, set it on the host. Do this on the Keep members and on the Stalwart nodes as well, because each end retransmits on its own timer:

```bash
echo 'net.ipv4.tcp_rto_min_us = 5000' | sudo tee /etc/sysctl.d/90-keep.conf
sudo sysctl --system
```

The startup line reports `rto_min false` where the per-socket option is missing, and on such a kernel this setting is required. Keep also sets `TCP_USER_TIMEOUT` to 1 second on both ends, which needs no configuration.

## Heartbeat receive buffer

Members exchange a heartbeat every 25 milliseconds, and a member's receive buffer must hold bursts of them. If `net.core.rmem_max` limits it too far, Keep logs the size it needs:

```text
keep: heartbeat receive buffer is <n> bytes, below the <n> its members need; raise net.core.rmem_max
```

The buffer needed is 16 KiB for each other member, so this appears only in larger clusters or on hosts with an unusually low limit. Raise the limit to at least the stated value, in the same sysctl file.

## NIC queues and IRQ affinity

Keep performs best when a connection's packets, interrupts and requests all stay on one core. Keep calls this CPU steering, and it uses it when every shard is pinned and each shard's CPU owns exactly one NIC receive queue. Otherwise it spreads connections by hash, logs the reason, and clients still reach the correct shard through forwarding:

```text
keep: CPU steering is off: CPU <cpu> takes <n> receive queues, not one
```

Two settings on the NIC matter on Azure's MANA adapters:

- Leave the driver's IRQ affinity in place. Concentrating the queue interrupts on a few CPUs caused 41 to 125 TCP retransmission timeouts every 15 seconds, and a 99th percentile latency of 190 to 590 milliseconds.
- Raise the receive ring. Debian's 6.12 kernel defaults this adapter's ring to 512 entries, which overflows under bursts. The following command raises it to 8192. On Azure, the interface is the accelerated one that uses the `mana` driver, which `ethtool -i` identifies, and not the `hv_netvsc` interface `eth0`:

```bash
sudo ethtool -G <interface> rx 8192
```

The setting does not survive a reboot, so apply it from a udev rule or the host's network configuration. The driver's queue map is sometimes uneven on smaller VM sizes, which is one of the reasons for the steering fallback.

## Huge pages

Keep requests huge pages for its large memory regions, and restarts itself once at startup with the glibc tunable `glibc.malloc.hugetlb=1`, so that the heap can use them too. This needs no setting and works best with transparent huge pages in `madvise` mode. An explicit value of `GLIBC_TUNABLES` in the environment is respected.

The tunable needs glibc 2.35. On glibc 2.34, the heap gets huge pages only with transparent huge pages set to `always`, although Keep's own regions are requested on every glibc. Fresh Debian 13 images boot with `enabled=always` and `defrag=madvise`. The `never` mode is supported, but its cost has not been measured.

## Spinning

A shard with nothing to do parks until the kernel wakes it, and that wake-up costs time. `--spin-us` makes an idle shard keep polling for up to that many microseconds before it parks, up to 1,000. It trades CPU for latency, so it suits hosts given wholly to Keep, and it takes effect only when shards are pinned, no `cpu.max` quota is in force and the host is not on cgroup v1. Keep logs `keep: --spin-us is off: shards are not pinned or a CPU quota applies` otherwise.

Going further, a VM given wholly to Keep can boot with `idle=poll`, for the lowest tail latency at the cost of every vCPU at 100% at all times. This suits only instance types with one vCPU per core. It is not otherwise recommended, and on most hosts the minimum retransmission timeout is the setting that counts.

The Stalwart nodes matter too. A client VM that has to wake from a halted state adds about 10 microseconds to the 99th percentile, and only the client side can remove it.

## Stream coalescing

Delivering each event with its own write is wasteful when many subscribers are receiving a fast stream. Keep therefore holds a busy subscriber's output for a short span and combines events into fewer writes, flushing early at 16 KiB. `--stream-coalesce-us` sets the span, 100 microseconds by default, and `--stream-coalesce-fanout` sets the number of subscriber connections required before it applies, 16 by default.

The setting trades delivery latency for CPU. Small Stalwart clusters stay under the fan-out threshold, so it does not apply to them. A value of 0 for `--stream-coalesce-us` disables coalescing. The `windows` and `heldus` statistics show how often output is held, and for how long.

## Memory cap

`--memory` sets a cap in bytes. By default there is no cap, so an unbounded workload can run the host out of memory. A cap is recommended on any host that runs anything else.

The cap is divided evenly between the shards, and each shard enforces its own share. A shard with more than its share of data can therefore start evicting before the server as a whole reaches the cap. The cap counts values and the key table, but not connection buffers, so leave a margin for those.

When a shard reaches its share, inserting a new key evicts entries from the same part of the table. Writing to an existing key never evicts. Counters with the lowest values go first, and then the entries closest to expiry. Locks, along with OAuth and ACME entries, are in pinned key classes that are never evicted. In Stalwart, this means that rate-limit counters and greylisting entries are the ones sacrificed, and a lost rate-limit counter starts again from zero. When there is no room for a new entry even after eviction, the write is refused with `Full`.

A small key with a small value costs about 49 bytes in all at 10 million keys, and 84 bytes with the key sizes of Stalwart's workload. Values from 1 KiB up go to separate memory chunks. Sizing is otherwise simple: allow for the active in-memory data, and for the cache swap snapshots if Keep holds them. The snapshots are usually the larger share by far, as [Memory for in-memory snapshots](/docs/storage/cache-swap#memory-for-in-memory-snapshots) explains.
