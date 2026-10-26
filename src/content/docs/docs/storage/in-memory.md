---
sidebar_position: 5
title: "In-memory store"
description: "The in-memory store holds rate-limit counters, greylisting entries, locks and short-lived tokens. The local default for single nodes, Redis for clusters, and what is lost on restart."
---

Some of the data a server works with is written often, read often and needed only briefly: a counter that tracks how many messages a client sent in the last minute, or a lock that stops two tasks from processing the same message. The in-memory store holds this kind of data. The entries the server writes there carry an expiry, and they disappear once they have served their purpose.

Keeping this data out of the [data store](/docs/storage/data) has two benefits. It avoids writing short-lived records to disk, and in a cluster it gives every node the same view of the counters and locks.

## Contents

The in-memory store holds the following data:

- Rate-limit counters: inbound and outbound SMTP throttles, recipient limits, HTTP and IMAP request limits, the contact form limit, the JMAP availability (free/busy) limit, and the limit on fetching OAuth client metadata documents.
- The counters of the [automatic IP blocking](/docs/server/auto-ban) feature, which counts authentication failures, port scans and loitering connections per address.
- [Greylisting](/docs/spamfilter/greylist) entries, which record the sender and recipient pairs that have been deferred once.
- Locks that keep two nodes, or two tasks on one node, from processing the same item: queued messages, background tasks and search index partitions.
- Active WebDAV locks taken by clients with the `LOCK` method.
- OAuth authorization codes, device codes and user codes, and a cache of OAuth client metadata documents fetched from client URLs.
- ACME challenge data used while a TLS certificate is being issued.
- Counters for the space used by blobs uploaded through JMAP before they are attached to a message.
- Keys and counters written by expressions and Sieve scripts with the `key_set` and `key_incr` functions.

Sieve vacation and `duplicate` tracking are not part of this list. They are kept in the data store, so they survive restarts.

## Backends

The backend is selected by the `@type` of the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › In-Memory Store<!-- /breadcrumb:InMemoryStore -->):

| `@type` | Backend | Use |
|---|---|---|
| `Default` | A local store in the memory of the server process | Single nodes; the default |
| `Redis` | A standalone [Redis or Valkey](/docs/storage/backends/redis) server | Clusters, or single nodes that keep state across restarts |
| `RedisCluster` | A Redis Cluster deployment | Clusters |
| `RedisSentinel` | A Redis deployment managed by Redis Sentinel | Clusters |
| `Sharded` | Several Redis, Redis Cluster or Redis Sentinel deployments, with keys distributed among them ([composite stores](/docs/storage/backends/composite#sharded-in-memory-store), Enterprise) | Large clusters |

The fields of the Redis variants are described on the [Redis](/docs/storage/backends/redis) page.

### Local store

The `Default` store lives in the memory of the server process and needs no configuration. It holds up to 1048576 entries, and it removes expired entries as it writes new ones. When it is full, it makes room by evicting entries: counters go first, starting with those closest to expiry, and then the other entries closest to expiry. Locks are never evicted. If the store fills up with locks, writes fail and the server logs `In-memory store is full`.

The local store is visible only to its own process, and every restart empties it. On a single node this loss is harmless. Rate-limit windows and IP blocking counters start again from zero. Senders that had passed greylisting are greylisted once more. OAuth and device codes that were being exchanged must be requested again, and active WebDAV locks are released. Messages, accounts and other persistent data are not affected.

## Single node or cluster

In a cluster, the nodes must share their rate-limit counters and locks, and a store that lives inside one process cannot provide that. The local store can therefore not be used in a cluster. When the [Coordinator](/docs/ref/object/coordinator), which connects the nodes of a cluster, is set to anything other than `Disabled`, the in-memory store must be `Redis`, `RedisCluster`, `RedisSentinel` or `Sharded`.

The server enforces this rule by refusing any change that would combine a coordinator with the `Default` store. The two settings are therefore changed in the order described in [Order of configuration](/docs/cluster/configuration/coordination#order-of-configuration). The [cluster overview](/docs/cluster/) lists the other stores that every node of a cluster must share.

Changes to the in-memory store take effect after a restart. Switching from the local store to Redis does not carry over the entries the local store held. They are rebuilt as traffic arrives.

## Persistence

Redis can persist its data to disk, and a Redis server used as the in-memory store mostly does not need this. Every entry that Stalwart writes itself is either short-lived or can be rebuilt, so the server works correctly without persistence. Persistence only spares the effects listed under [Local store](#local-store) when Redis restarts.

Keys written by expressions and Sieve scripts are the exception. A Redis restart without persistence loses them, so persistence has to be enabled when they must survive. The memory limit and the eviction policy that Redis should use are described in [Redis](/docs/storage/backends/redis#memory-limit-and-eviction-policy).

## Lookup lists

Static lists, such as domain blocklists, are not kept in the in-memory store. These [lookup lists](/docs/configuration/expressions/lookup/) are loaded from the configuration or from remote URLs and held separately, one list per namespace. The in-memory store is instead where the `key_set` and `key_incr` functions write at run time, and where `key_get` reads those values back.
