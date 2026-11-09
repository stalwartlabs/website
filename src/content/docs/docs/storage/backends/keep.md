---
sidebar_position: 9.5
title: "Stalwart Keep"
description: "Use Stalwart Keep as the in-memory store, the cluster coordinator and the cache swap tier of a Stalwart cluster."
---

[Stalwart Keep](/docs/cluster/keep/) is an ephemeral state and messaging server, and the recommended in-memory backend for a Stalwart cluster. It is a separate program that runs on its own servers, and Stalwart uses it for three purposes:

- As the [in-memory store](/docs/storage/in-memory), which holds rate-limit counters, greylisting entries, locks and short-lived tokens.
- As the [cluster coordinator](/docs/cluster/coordination/keep), which carries cache invalidations and change notifications between nodes. The coordinator's `Default` variant reuses the in-memory store's Keep connection.
- As the tier of the [cache swap](/docs/storage/cache-swap) feature, which keeps snapshots of account caches.

Keep cannot serve as the data store, the blob store or the search store, and it cannot be a member of a [sharded in-memory store](/docs/storage/backends/composite#sharded-in-memory-store).

Keep holds everything in memory and writes nothing to disk. This suits what Stalwart keeps there, but keys written by expressions and Sieve scripts do not survive a member crash. [Redis](/docs/storage/backends/redis) with persistence is the backend to use when they must.

[Connecting Stalwart](/docs/cluster/keep/stalwart) gives the configuration, and the rest of the [Stalwart Keep](/docs/cluster/keep/) section covers installing and running the server.
