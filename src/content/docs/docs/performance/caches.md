---
title: "Sizing the caches"
description: "Size the per-account caches and tune cache swapping."
sidebar_position: 2
---

Stalwart keeps account data, directory records and DNS answers in memory caches, so that most requests are answered without reaching the data store, the directory or the resolver. A cache that is too small for the accounts in use loses that benefit: entries are evicted before they are used again, and the requests that needed them go back to the slower source. The result shows up as mailboxes that open slowly, slow searches, and a data store that is busier than the client load explains.

This page maps each of those symptoms to the cache that causes it and describes how to size that cache. The mechanism behind the caches, including how they stay current and why some accounts never fit, is explained in [How caching works](/docs/performance/caching). The signals referred to below are set up in [Measuring performance](/docs/performance/measuring).

All caches are configured on the [Cache](/docs/ref/object/cache) singleton (found in the WebUI under <!-- breadcrumb:Cache --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Cache<!-- /breadcrumb:Cache -->), and the [Cache reference](/docs/ref/object/cache) lists the default size and duration of every cache. Cache sizes are set in bytes and durations in milliseconds. A size is not a number of entries but a weight: it counts the bytes of each key and value plus a fixed overhead per entry, so a full cache uses about its configured size in memory. The settings are read when the server starts, so every change on this page, including the cache swapping settings, takes effect only after a restart.

## Size the message cache

The email data cache holds one entry per account, containing the mailboxes, message identifiers, flags, keywords and thread assignments of that account, and its size is set by [`messages`](/docs/ref/object/cache#messages). IMAP SELECT, FETCH of flags, IDLE, JMAP `Email/get` and synchronisation all read from it. Searches use it too: JMAP `Email/query` and IMAP SEARCH filter and sort on date, size, attachments, keywords, mailbox and thread using this cache. A cache that is too small therefore slows searches as well as synchronisation.

The cache is a single budget of <!-- default:Cache.messages -->320 MiB<!-- /default --> by default, shared by every account cached at the same time. When the budget is too small for the accounts in use, accounts are evicted while their users are still active, and each one is built again from the data store on its next request. A cache in that state shows the following signals:

- The overall hit rate falls and the `cache.miss` and `cache.stale` counters rise under steady load.
- The `cache.miss` events with collection `email` recur for the same accounts within minutes, with a high `elapsed`.
- The `cache.messages-size` gauge stays at the configured `messages` size.
- IMAP SELECT and SEARCH and JMAP `Email/query` are slow for accounts that were fast earlier in the day.

The size the cache needs follows from the accounts it has to hold at the same time. Estimate the number of messages in the accounts that are active at the same time, and multiply it by the cost of one cached message. A message that is in one mailbox costs about 52 bytes, and each additional mailbox it appears in adds 8 bytes. Real accounts also have custom keywords and threads, and on them the measured average is 55 to 60 bytes per message. At these figures, the default size holds about 6 million messages across all cached accounts, for example about 400 accounts of 15000 messages each.

As a worked example, take a server on which 400 accounts of about 25000 messages each are active during working hours. It needs about 10 million cached messages, which is 550 MB to 600 MB. The following command sets the cache to 671088640 bytes (640 MiB), which leaves some room above that estimate:

```sh
stalwart-cli update Cache --field messages=671088640
```

The same change as the body of an `x:Cache/set` update:

```json
{
  "messages": 671088640
}
```

A larger cache is not free: the memory it uses counts towards the node's total. On a host with little free memory, consult [Sizing memory](/docs/performance/memory) before raising it.

## Accounts too large for the message cache

A single cache entry cannot be larger than the cache that holds it. An account whose cached data is about as large as the whole `messages` budget is therefore not admitted to the email data cache. At the default `messages` size, this is an account of about 5.6 million messages.

These accounts are held instead in a separate tier for large accounts, which has its own budget, sized by [`messagesLarge`](/docs/ref/object/cache#messageslarge). At its default size of <!-- default:Cache.messagesLarge -->512 MiB<!-- /default -->, the tier retains one account of up to about 9 million messages. How the tier treats an account depends on whether the account fits within that budget:

- An account whose data fits within `messagesLarge` is retained in this tier between requests. All retained accounts share the `messagesLarge` budget, and when it is full, the least recently used one is released.
- An account larger than `messagesLarge` is never retained. It is built when a request needs it, shared by all requests that use it at the same time, and released when the last of them finishes.

Setting `messagesLarge` to 0 makes every large account behave like the second case. This saves memory, at the cost of rebuilding these accounts whenever no request holds them.

The idle time [`messagesLargeTtl`](/docs/ref/object/cache#messageslargettl) decides how long a retained account stays in the tier: it is released after it has been unused for that long. The choice is between speed and memory. A longer value keeps large mailboxes fast for users who return to them after a break, but keeps their memory reserved in the meantime. A value of 0 keeps them until the space is needed for another large account.

Large accounts show in two signals. The `cache.entry-too-large` event with the `messages` cache name reports an account that did not fit, and its `size` field gives the account's size. The `cache.messages-large-size` gauge reports the memory of the tier. It counts both the accounts retained by the tier and the ones still held by requests in progress, so it can exceed `messagesLarge` while large accounts are in use. When large accounts are slow after a restart or after `messagesLargeTtl` has expired, [cache swapping](#tune-cache-swapping) shortens the rebuild.

## Calendars, contacts and files

Calendars, address books and file storage have caches of their own, which work in the same way as the email data cache. Each holds one entry per account:

- [`events`](/docs/ref/object/cache#events) for calendars
- [`contacts`](/docs/ref/object/cache#contacts) for address books
- [`files`](/docs/ref/object/cache#files) for file storage
- [`scheduling`](/docs/ref/object/cache#scheduling) for calendar scheduling items and event notifications

Each cached calendar event or contact card costs about 180 to 210 bytes, and each file about 150 bytes. At the default `events` size of <!-- default:Cache.events -->48 MiB<!-- /default -->, the calendar cache therefore holds about 270000 events.

An account whose data does not fit in its cache moves to the large-account tier for groupware, [`groupwareLarge`](/docs/ref/object/cache#groupwarelarge). This tier works like the [tier for large email accounts](#accounts-too-large-for-the-message-cache). An account that fits in it is retained until it has been idle for [`groupwareLargeTtl`](/docs/ref/object/cache#groupwarelargettl) or the space is needed. A larger one is built for each request that needs it, which makes CalDAV, CardDAV and WebDAV synchronisation slow for that account, though not for the others. The memory of this tier is included in the `cache.size` gauge.

Such an account shows in the `cache.entry-too-large` event. Its cache name says which of the four caches rejected the account, and its `size` field gives the account's size. The counter of the same name does not say which cache was involved, so only the event identifies it. When such accounts are slow, there are two remedies. Either raise that cache above the largest `size` reported, with room for the account to grow, or raise `groupwareLarge` so that the tier retains them.

## Authentication and directory caches

The authentication and directory caches save the server from repeating work for every request: checking credentials, resolving permissions and looking up accounts, domains and addresses. Their records are small, so these caches rarely need a change. They are the following:

- [`accessTokens`](/docs/ref/object/cache#accesstokens): the resolved permissions and session data of authenticated accounts.
- [`httpAuth`](/docs/ref/object/cache#httpauth): HTTP `Authorization` headers that were already verified, so repeated requests skip the password check.
- [`accounts`](/docs/ref/object/cache#accounts), [`domains`](/docs/ref/object/cache#domains), [`roles`](/docs/ref/object/cache#roles), [`mailingLists`](/docs/ref/object/cache#mailinglists), [`dkimSignatures`](/docs/ref/object/cache#dkimsignatures) and [`tenants`](/docs/ref/object/cache#tenants): the corresponding registry objects. Tenants are an Enterprise feature.
- [`domainNames`](/docs/ref/object/cache#domainnames) and [`emailAddresses`](/docs/ref/object/cache#emailaddresses): name and address lookups, with the negative caches [`domainNamesNegative`](/docs/ref/object/cache#domainnamesnegative) and [`emailAddressesNegative`](/docs/ref/object/cache#emailaddressesnegative) for names that do not exist. Negative entries are kept for [`negativeTtl`](/docs/ref/object/cache#negativettl), which is also the longest time a negative DNS answer is cached.
- [`directoryRecipients`](/docs/ref/object/cache#directoryrecipients): recipients that were resolved against an external directory (LDAP, SQL or OpenID Connect). For [`directoryRecipientsTtl`](/docs/ref/object/cache#directoryrecipientsttl), a cached recipient is accepted without querying the directory again, which removes one directory query for each `RCPT TO` of a known recipient. The cache is cleared when all caches are invalidated and when the negative caches are cleared.

These caches have no counters of their own, so the events are the only sign that one is too small. Raise a cache only when its `cache.miss` events recur for the same keys. The events use internal cache names, such as `account`, `domainName`, `email` (for `emailAddresses`) and `list` (for `mailingLists`).

## DNS and spam lookup caches

A mail server performs DNS lookups for almost every message, both to deliver it and to check the sender. The resolver has no cache of its own, so the DNS caches on the Cache object are the only DNS cache in the server. There is one per record type: [`dnsTxt`](/docs/ref/object/cache#dnstxt), [`dnsMx`](/docs/ref/object/cache#dnsmx), [`dnsIpv4`](/docs/ref/object/cache#dnsipv4), [`dnsIpv6`](/docs/ref/object/cache#dnsipv6), [`dnsPtr`](/docs/ref/object/cache#dnsptr), [`dnsTlsa`](/docs/ref/object/cache#dnstlsa) and [`dnsMtaSts`](/docs/ref/object/cache#dnsmtasts). Their entries expire with the TTL of the DNS answer. A separate cache, [`spamLookup`](/docs/ref/object/cache#spamlookup), holds DNSBL results and resolved URL redirects for the spam filter.

These caches are bounded by TTL and size only. They never emit `cache.entry-too-large`, and they have no hit rate of their own. On most servers the defaults are sufficient. The exception is a busy MTA whose `dns.lookup-time` histogram shows many lookups for the same domains, which benefits from larger DNS caches.

## Tune cache swapping

Rebuilding a large account from the data store is slow, and a restart empties every cache, so large accounts are slow again after each restart. [Cache swapping](/docs/storage/cache-swap) addresses this by persisting snapshots of large account caches. A cache miss then loads a snapshot and applies the recent changes, instead of rebuilding the account from the data store. That page explains when to enable it, which backends are available and how to configure them. This section covers adjusting it once it is enabled.

### Restart

The [`swap`](/docs/ref/object/cache#swap) field and all its settings are read at startup, like every other cache setting, so a change takes effect after a restart.

### Confirm that it helps

Swapping only pays off when snapshots are actually loaded, and the cache swapping events and counters, listed in [Checking that it works](/docs/storage/cache-swap#checking-that-it-works), show whether they are. A high share of `cache.swap-hit` after restarts means that swapping is paying off.

The events show the detail. Record the swap events with the tracer from [Measuring performance](/docs/performance/measuring#log-cache-and-limit-events). After a restart, compare the `elapsed` of `cache.swap-hit` for a large account with the `elapsed` of the `cache.miss` it replaced before swapping was enabled; the difference is the time that swapping saves. A `cache.swap-miss` that repeats for the same account gives its reason in the event details. A `cache.swap-error` is logged at the `warn` level even without the dedicated tracer, and the cache then falls back to a full rebuild.

### Write frequency

A snapshot has to be rewritten as the account changes, and the write frequency is a tradeoff. Frequent writes keep snapshots close to the current state but cost disk or network traffic; infrequent writes save that traffic but let more unwritten changes accumulate.

The `cache.swap-metrics` event shows where a server stands. Every five minutes it reports the snapshots written in the window, the number of accounts tracked, the bytes written per hour, and the median, 95th percentile and maximum age of the changes not yet written. The number tracked includes recently written accounts that have no new changes. No gauge reports the bytes written, so this event is the only source for that figure.

Two settings control the frequency. A snapshot is rewritten after [`flushChanges`](/docs/ref/object/cache#flushchanges) changes, but no sooner than [`flushInterval`](/docs/ref/object/cache#flushinterval) after the previous write. By default `flushChanges` is <!-- default:Cache.LocalFileSwap.flushChanges -->2000<!-- /default -->, or one sixteenth of the account's messages or resources when that is more. Raise either value when the bytes written per hour are too much for the disk, the Redis server or the blob store. Lower them when the 95th percentile or maximum age keeps growing. A graceful shutdown writes every pending snapshot, so these settings matter mainly after a crash, and for other nodes that load the snapshot.

### Very large accounts and the change history

A loaded snapshot is brought up to date from the change history, which keeps a limited number of changes per account: <!-- default:DataRetention.maxChangesHistory -->10000<!-- /default --> by default. For very large accounts, the write threshold of one sixteenth of the account exceeds that number. At the default history size, this applies to accounts of about 160000 messages and more, by estimate.

For these accounts, the history may no longer reach back to the snapshot after a crash, or when another node loads the snapshot. The snapshot is then loaded, discarded, and the account is rebuilt from the data store. No outdated data is served, so the cost is only the wasted load. The signal is a `cache.swap-hit` followed by `cache.stale` for the same account.

To prevent it, raise [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) on the [DataRetention](/docs/ref/object/data-retention) object above the number of changes such an account accumulates between two snapshots. The change history also serves client synchronisation, and [Storage maintenance](/docs/storage/maintenance) describes what else it retains. This setting takes effect after a settings reload.

### Size limits

Not every account benefits from a snapshot, and two settings bound which accounts get one. The lower bound, [`minAccountSize`](/docs/ref/object/cache#minaccountsize), skips accounts whose rebuild costs less than writing their snapshot. At its default of <!-- default:Cache.LocalFileSwap.minAccountSize -->1 MiB<!-- /default -->, this is an account of about 20000 messages. Lowering it persists smaller accounts, but this rarely shortens anything a user notices, because those accounts rebuild quickly anyway.

The upper bound, [`maxAccountSize`](/docs/ref/object/cache#maxaccountsize), skips accounts whose snapshot would be larger, and each skip is reported as `cache.swap-error`. Raise it only when the backend stores and returns objects of that size quickly.

### Trading memory for snapshots

Swapping changes the cost of releasing a large account from memory. Without it, a released account needs a full rebuild when its user returns. With it, a miss on a large account costs one sequential read of the snapshot plus the recent changes. On hosts with little memory, this makes a smaller `messagesLarge` or a shorter `messagesLargeTtl` acceptable. To confirm that the tradeoff holds, measure the `elapsed` of `cache.swap-hit` for the affected accounts before and after the change.
