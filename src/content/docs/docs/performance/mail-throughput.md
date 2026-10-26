---
title: "Tuning mail throughput"
description: "Tune outbound delivery concurrency, DNS lookups and the per-message cost of spam filtering and AI classification."
sidebar_position: 6
---

Mail throughput is the rate at which a server moves mail, and it is limited on two sides. On the outbound side, the limit is concurrency: the number of deliveries a node runs at the same time decides how fast the queue drains. On the inbound side, the limit is the cost of each message. Every message passes through the spam filter, DNS checks and, when enabled, external classifiers before it is stored, and each of them adds time per message.

This page covers both sides. The [memory budget](/docs/performance/memory), which limits how many messages are processed at the same time, is described separately.

## Outbound queue throughput

Outbound messages wait in [virtual queues](/docs/mta/outbound/queue) until a delivery thread picks them up. Each [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) (found in the WebUI under <!-- breadcrumb:MtaVirtualQueue --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Virtual Queues<!-- /breadcrumb:MtaVirtualQueue -->) has its own number of threads, [`threadsPerNode`](/docs/ref/object/mta-virtual-queue#threadspernode), which limits the deliveries the queue runs in parallel on each node. A new installation is created with four queues: `local` with 25 threads, `remote` with 50, `dsn` with 16 and `report` with 8. A queue created later starts with <!-- default:MtaVirtualQueue.threadsPerNode -->25<!-- /default -->.

A queue that has too few threads shows back pressure. When a queue is at its limit while messages are waiting, the `queue.back-pressure` counter increases, and a `queue.back-pressure` event at the `warn` level names the queue and its limit. The event is emitted at most once a minute per queue. Two other signals show the state of delivery: the `delivery.active-connections` gauge shows the delivery attempts in progress, and `queue.count` shows the messages in the queue.

The remedy is to raise `threadsPerNode` for the queue that reports back pressure. The change takes effect after a settings reload, and the following command raises the limit of a queue to 100 threads:

```sh
stalwart-cli update MtaVirtualQueue <id> --field threadsPerNode=100
```

More threads do not help when the threads are busy waiting. A delivery holds its thread until the remote host answers or a timeout expires. The [connection strategy](/docs/mta/outbound/connection#timeouts) gives each step of the transaction its own timeout, from the connection and greeting through EHLO, `MAIL FROM` and `RCPT TO` to the message data. Their defaults are measured in minutes (<!-- default:MtaConnectionStrategy.dataTimeout -->10 minutes<!-- /default --> for the message data), so a few unresponsive hosts can occupy many threads. Shorter timeouts free the threads sooner, at the risk of abandoning deliveries to slow but working hosts.

Delivery can also be slowed on purpose, by [outbound rate limits](/docs/mta/outbound/rate-limit) and concurrency limits. When one of them defers a delivery, the server emits `queue.rate-limit-exceeded` or `queue.concurrency-limit-exceeded`. These events point to a configured limit rather than a shortage of threads, so raising `threadsPerNode` does not help with them.

## DNS lookups

Both sides of mail flow depend on DNS. Outbound delivery looks up the recipient's mail servers, and the inbound checks query DNS too: SPF, DKIM, DMARC, DNSBL, MTA-STS and DANE. A slow resolver therefore slows both.

The resolver settings are on the [DnsResolver](/docs/ref/object/dns-resolver) object (found in the WebUI under <!-- breadcrumb:DnsResolver --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Resolver<!-- /breadcrumb:DnsResolver -->). [`maxConcurrentRequests`](/docs/ref/object/dns-resolver#maxconcurrentrequests) is the number of name servers queried in parallel for each lookup, [`attempts`](/docs/ref/object/dns-resolver#attempts) the number of retries, and [`timeout`](/docs/ref/object/dns-resolver#timeout) the time to wait for an answer. The `dns.lookup-time` histogram shows the lookup latency. Resolver changes take effect after a settings reload.

Answers are cached only in the [DNS caches](/docs/performance/caches#dns-and-spam-lookup-caches), so the size of those caches also decides how many lookups reach the name servers.

## Inbound processing cost

The spam filter analyses the text of each message, and the amount of text it reads drives its CPU cost. Three settings on [SpamSettings](/docs/ref/object/spam-settings) (found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->) bound that amount:

- [`maxBodyText`](/docs/ref/object/spam-settings#maxbodytext) limits the text read from each body part.
- [`maxAttachmentText`](/docs/ref/object/spam-settings#maxattachmenttext) limits the text read from each other text part, such as a text attachment.
- [`maxMessageText`](/docs/ref/object/spam-settings#maxmessagetext) limits the text read per message across all parts.

Lower values reduce the CPU time per message, at the cost of examining less of it.

The filter also follows URL redirects in messages to find their final destination, which costs network requests rather than CPU. By default it sends at most <!-- default:SpamSettings.maxRedirectUrls -->10<!-- /default --> such requests per message, not counting redirects already cached, and waits up to <!-- default:SpamSettings.redirectTimeout -->5 seconds<!-- /default --> for each. A message with many links to slow redirect services can therefore take several seconds longer to process. The limits are [`maxRedirectUrls`](/docs/ref/object/spam-settings#maxredirecturls) and [`redirectTimeout`](/docs/ref/object/spam-settings#redirecttimeout). Resolved redirects are kept in the `spamLookup` cache for [`redirectCacheTtl`](/docs/ref/object/spam-settings#redirectcachettl), so a redirect seen again within that time costs no request.

[Pyzor](/docs/spamfilter/digests) is <!-- default:SpamPyzor.enable as=enabled -->disabled<!-- /default --> by default. When it is enabled, it adds a network round trip to the Pyzor server for each message, bounded by its `timeout`.

These settings take effect after a settings reload. The time to store each accepted message is reported by the `message-ingest.time` histogram.

:::tip[Enterprise feature]
AI spam classification is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

[AI spam classification](/docs/spamfilter/ai/) sends a message to an AI model and waits for its verdict, so its cost is the time spent waiting. On each [AiModel](/docs/ref/object/ai-model) (found in the WebUI under <!-- breadcrumb:AiModel --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></svg> AI<!-- /breadcrumb:AiModel -->), three settings bound it. [`maxConcurrentRequests`](/docs/ref/object/ai-model#maxconcurrentrequests) limits the requests sent at the same time, [`timeout`](/docs/ref/object/ai-model#timeout) the wait for a response, and the optional [`rateLimit`](/docs/ref/object/ai-model#ratelimit) the requests per period.

The most effective way to bound the cost is to choose which messages are sent to the model at all, as described on the AI classification page. The `ai.request-time` histogram shows the time spent waiting for the model. The `ai.breaker-open` counter and event report a model that failed repeatedly and is skipped until its cooldown ends.

## Inbound sessions

An SMTP session holds a connection for as long as it lasts, and a slow or idle client can hold one much longer than it needs. The [MtaInboundSession](/docs/ref/object/mta-inbound-session) settings (found in the WebUI under <!-- breadcrumb:MtaInboundSession --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Session<!-- /breadcrumb:MtaInboundSession -->) bound what one session can hold:

- Its total duration, with [`maxDuration`](/docs/ref/object/mta-inbound-session#maxduration)
- The time it may stay idle, with [`idleTimeout`](/docs/ref/object/mta-inbound-session#idletimeout)
- The bytes it may transfer, with [`transferLimit`](/docs/ref/object/mta-inbound-session#transferlimit)

These settings are expressions, so they can differ by listener or remote address. Lower values release connections held by slow or idle clients sooner. The effect of the memory budget on message intake is described in [Sizing memory](/docs/performance/memory#set-the-memory-budget).
