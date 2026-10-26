---
title: "How caching works"
description: "How Stalwart's account, directory and DNS caches are filled, kept current and evicted."
sidebar_position: 9
---

Many requests a mail server answers concern data it read a moment ago: the same mailbox listing, the same account record, the same domain's MX records. Stalwart keeps such data in memory caches, so that most requests are answered without a read from the data store, a directory query or a DNS lookup. The caches hold three kinds of data: account data, directory records and DNS answers.

This page explains the mechanism behind them: how the caches are filled, how a cached account stays current when it changes, and why some accounts never fit. The settings, and the signals that show whether a cache is large enough, are on [Sizing the caches](/docs/performance/caches).

## One entry per account

The data caches are organised by account. Each holds one entry per account and collection, so one entry covers, for example, one account's mail or one account's calendars. The email data cache holds an account's mailboxes, message identifiers, flags, keywords and thread assignments. The calendar, contact, file and scheduling caches hold the corresponding groupware resources.

The caches hold this index data only. Message bodies and attachments are never cached, so they are read from the blob store whenever a client requests them.

An entry is built the first time a request needs the account. Building it costs a read of the account's index data from the data store, and later requests for the same account are then served from memory. The other caches work per record rather than per account: directory records, such as accounts, domains, roles, mailing lists and DKIM signatures, are cached one record at a time, and so are DNS answers.

The size of each cache is a weight in bytes rather than a number of entries. Each entry weighs the memory of its key and value. In the caches of directory records and DNS answers, a fixed overhead per entry is added. A full cache therefore uses about its configured size. One cache budget is shared by all accounts that are cached at the same time, which means that a cache holds either many small accounts or a few large ones.

## Cache freshness

A cached account is a copy, and the data store may change after the copy was made, for example when a message arrives or another client moves one. The server therefore checks a cached account for changes, but not on every request. For five seconds after the account was last brought up to date, it is used without checking the data store. This freshness window is fixed.

After the window, the next request reads the account's change log from the data store. The change log is the per-account history of changes, and the server applies only the changes made since the cached state. This is much cheaper than building the entry again.

The change log keeps a limited number of changes per account: <!-- default:DataRetention.maxChangesHistory -->10000<!-- /default --> unless [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) is changed. When more changes were made since the cached state than the log still holds, the delta can no longer be computed, and the entry is rebuilt in full. The change log also serves client synchronisation, and [Storage maintenance](/docs/storage/maintenance) describes how it is pruned.

Directory objects are handled differently, and their changes take effect at once. Saving an account, domain, role, tenant, mailing list or DKIM signature removes the affected cache entries on the local node. When a cluster coordinator is configured, it removes them on the other nodes as well.

## Accounts too large for a cache

A single entry can use at most about the whole budget of its cache. An account whose data is larger is therefore not admitted, and the server emits the `cache.entry-too-large` event with the account's size and the cache's limit.

Such accounts move instead to a separate tier for large accounts, which has its own budget. For email, the budget is [`messagesLarge`](/docs/ref/object/cache#messageslarge). For groupware data, it is [`groupwareLarge`](/docs/ref/object/cache#groupwarelarge), shared by the calendar, contact, file and scheduling caches.

An account that fits in the tier's budget is retained between requests. It stays until it has been idle for [`messagesLargeTtl`](/docs/ref/object/cache#messageslargettl) or [`groupwareLargeTtl`](/docs/ref/object/cache#groupwarelargettl), or until the space is needed for another large account. An account larger than the tier's budget is not retained at all: it is built for the requests that need it, shared while they run, and released when they finish.

## Eviction

When a cache is full, it has to evict an entry to make room for a new one, and the choice of entry decides how well the cache works. Stalwart evicts the entry least likely to be used again. The policy is Clock-PRO, which distinguishes entries that are used repeatedly from entries that are used once. A burst of lookups for accounts that are used once therefore does not push out the accounts that are used all day.

## Cache snapshots

Building a very large account from the data store can take seconds. A restart empties every cache, so the first requests after a restart pay that cost for every large account. [Cache swapping](/docs/storage/cache-swap) reduces it by writing snapshots of large account caches to a file, Redis or the blob store. A miss then loads the snapshot and applies the recent changes from the change log, instead of building the account from scratch. When the change log no longer reaches back to a snapshot, the snapshot is discarded, so a snapshot never serves outdated data.

## Caches in a cluster

Each node of a cluster has its own caches. An account used on several nodes is therefore cached on each of them, and each node brings its own entry up to date from the change log after the freshness window. The consequences for sizing are described in [Tuning a cluster](/docs/performance/cluster).

The counters, gauges and events that report cache activity are listed in [Measuring performance](/docs/performance/measuring).
