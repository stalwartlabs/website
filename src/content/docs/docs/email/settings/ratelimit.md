---
sidebar_position: 4
title: "Rate limiting"
description: "Per-account limits on concurrent sessions and on the request rate for IMAP, POP3 and ManageSieve."
---

A misbehaving client, or a compromised account, can open many sessions and issue commands far faster than any person would. Stalwart limits both: how many sessions an account may hold open, and how many commands it may issue in a period of time. No single account can then monopolise the server.

The limits are counted per account, not per connection or per IP address. One set of counters covers IMAP, POP3 and ManageSieve, so a session opened over any of these protocols counts towards the same limits. Both limits are fields of the [Imap](/docs/ref/object/imap) singleton, found in the WebUI under <!-- breadcrumb:Imap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › IMAP<!-- /breadcrumb:Imap -->.

## Concurrent sessions

An account may hold <!-- default:Imap.maxConcurrentConnections -->16<!-- /default --> authenticated sessions at the same time unless [`maxConcurrentConnections`](/docs/ref/object/imap#maxconcurrentconnections) says otherwise. IMAP, POP3 and ManageSieve sessions are counted together.

The limit refuses new sessions rather than closing old ones. A login that would exceed the limit fails with a `NO [LIMIT]` response (IMAP) or an error response (POP3 and ManageSieve), and the sessions already open are not affected. In a cluster, each server counts the sessions it holds.

The value should leave room for every device of a user. Mail clients commonly open several IMAP connections per device, so a user with a desktop client, a phone and a tablet can reach ten connections or more.

A change to the limit does not reach every account at once. The limit is applied to an account when its session data is loaded into the access token cache. An account that is already cached therefore keeps its previous limit, until its entry is evicted or the `InvalidateCaches` action runs.

The following object body allows eight sessions per account:

```json
{
  "maxConcurrentConnections": 8
}
```

## Request rate

The number of commands an account may issue within a period is set by [`rateLimit`](/docs/ref/object/imap#ratelimit), given as a `count` and a `period` in milliseconds. It is <!-- default:Imap.rateLimit -->2000 per minute<!-- /default --> unless changed.

Each command sent after authentication counts towards the limit, on every session of the account. When the limit is reached, further commands fail with `NO [LIMIT] Too many requests, retry in <n> seconds` until the period has elapsed. The reply tells a well-behaved client how long to wait. In a cluster, the counters are shared through the [in-memory store](/docs/storage/in-memory), and the limit is enforced approximately.

Accounts that hold the `unlimitedRequests` [permission](/docs/auth/authorization/permissions) are exempt from the request rate, although the session limit still applies to them.

The following object body allows 600 commands per minute:

```json
{
  "rateLimit": {"count": 600, "period": 60000}
}
```

Setting either field to `null` removes that limit. JMAP and other HTTP requests are limited separately, as described in [JMAP limits](/docs/http/jmap/protocol). [Connection and request limits](/docs/performance/connections) discusses how these values interact with server capacity.
