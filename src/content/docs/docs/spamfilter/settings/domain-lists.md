---
sidebar_position: 4
title: "Domain lists"
description: "The lookup lists that the spam filter consults: trusted domains, blocked domains, URL redirectors and free and disposable mail providers, with the limits on resolving redirected links."
---

Some knowledge about domains cannot be derived from a message: whether a domain belongs to a reputable service, whether its mail is unwanted on this server, whether it hides links behind redirections, or whether it hands out free or disposable addresses. Several checks of the spam filter take that knowledge from lists of domains. Most of these lists are filled by the rule set that Stalwart downloads on first start, and administrators add their own entries to them.

The entries of the static lists are [MemoryLookupKey](/docs/ref/object/memory-lookup-key) objects. The [`namespace`](/docs/ref/object/memory-lookup-key#namespace) of an entry names the list, and its [`key`](/docs/ref/object/memory-lookup-key#key) holds the domain. The WebUI shows these objects under <!-- breadcrumb:MemoryLookupKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg> Lookups › In-Memory Keys, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › Blocked Domains, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › Spam Traps, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › Trusted Domains, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › URL Redirectors<!-- /breadcrumb:MemoryLookupKey -->. The following object adds `example.com` to the trusted domains:

```json
{
  "namespace": "trusted-domains",
  "key": "example.com"
}
```

The lists are [lookup lists](/docs/configuration/expressions/lookup/) like any other. Rules and Sieve scripts can therefore test them with `key_exists`, and use them for checks of their own.

## Trusted domains

The `trusted-domains` list holds domains whose mail is considered legitimate when it is authenticated, such as large mail providers and well-known services. The rule set provides about 800 entries.

A domain in the list has two effects. The first concerns the score. A message whose `From` domain is in the list and passes [DMARC](/docs/mta/authentication/dmarc) receives the `TRUSTED_DOMAIN` tag, which scores -7.0. Because DMARC must pass, a forged `From` address in a trusted domain does not receive the tag.

The second effect saves work. Addresses, domains and links in a trusted domain are not looked up in the [DNS blocklists](/docs/spamfilter/dnsbl), which saves queries. Domains hosted on the server are treated as trusted for this purpose too.

## Blocked domains

The `blocked-domains` list holds domains whose mail is refused. A message whose `From` domain is in the list receives the `BLOCKED_DOMAIN` tag, which the rule set defines as a reject tag, so the message is refused at the end of DATA whatever its score. The rule set provides no entries for this list.

## URL redirectors

The `url-redirectors` list holds the domains of link-shortening and redirection services, such as `bit.ly`. The rule set provides about 1000 entries.

A link whose domain is in the list hides its real destination, so the filter follows the redirection, and analyses the final link, with its host and domain, in the same way as the other links of the message. The final destination is also what the [AI classifier](/docs/spamfilter/ai/) is given. A link to a redirector receives the `REDIRECTOR_URL` tag.

Redirections can be chained, so the filter sets a limit. At most three redirections are followed for each link. A longer chain receives the `URL_REDIRECTOR_NESTED` tag (1.0), and is not followed further.

Following a link means contacting a server chosen by the sender of the message, so the requests are restricted:

- Only `https://` links are followed. A redirector link, or a redirection step, that uses plain `http://` is never fetched, and the message receives the `URL_REDIRECTOR_INSECURE` tag (2.0).
- Only servers with public addresses are contacted. A link whose host resolves to a private, loopback or link-local address is not followed.
- Each request reads the `Location` of the redirection without following it automatically, and validates the server's TLS certificate.

Each request also takes time, and a message can contain many redirector links. The following fields of [SpamSettings](/docs/ref/object/spam-settings) limit the work done per message:

| Field | Default | Limit |
|---|---|---|
| [`maxRedirectUrls`](/docs/ref/object/spam-settings#maxredirecturls) | <!-- default:SpamSettings.maxRedirectUrls -->10<!-- /default --> | Redirection requests made for one message. Results found in the cache do not count. |
| [`redirectTimeout`](/docs/ref/object/spam-settings#redirecttimeout) | <!-- default:SpamSettings.redirectTimeout -->5 seconds<!-- /default --> | Time allowed for each request. |
| [`redirectCacheTtl`](/docs/ref/object/spam-settings#redirectcachettl) | <!-- default:SpamSettings.redirectCacheTtl -->1 day<!-- /default --> | How long a resolved link is remembered. |

Resolved links are cached. They are kept in the spam lookup cache, which also holds the DNS blocklist results, and whose size is [`spamLookup`](/docs/ref/object/cache#spamlookup) on the [Cache](/docs/ref/object/cache) singleton. A request that fails is remembered for [`negativeTtl`](/docs/ref/object/cache#negativettl), <!-- default:Cache.negativeTtl -->1 hour<!-- /default --> by default, so that the same broken link is not requested for every message.

## Free and disposable mail providers

Free and disposable addresses cost nothing to obtain, which makes them attractive to spammers. Two lists identify addresses at such providers: one for providers of free mailboxes, and one for providers of disposable, short-lived addresses.

These two are not static lists. They are [HTTP lookups](/docs/configuration/expressions/lookup/remote) that the rule set defines and Stalwart downloads periodically. `stwt_free_domains` is refreshed every 30 days, and `stwt_disposable_domains` daily.

An address at one of these providers receives a tag named after the provider type and the location, such as `FREEMAIL_FROM` or `DISPOSABLE_REPLY_TO`. The locations checked are the envelope sender and the `From`, `Reply-To`, `To`, `Cc`, `Bcc` and `Disposition-Notification-To` headers.

On their own, the tags score 0 in the rule set, except `DISPOSABLE_DNT`, which scores 0.5. Their value lies in combination: rules combine them with other findings, for example a `From` address at one free provider with a `Reply-To` at another. To stop downloading a list, set `enable` to `false` on its HTTP lookup.
