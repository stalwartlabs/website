---
sidebar_position: 6
title: "DNS blocklists"
description: "How the spam filter queries DNS blocklists and allowlists for IP addresses, domains, email addresses and URLs, how answers become tags, caching and limits, and what the BLOCKED tags mean."
---

Much of what identifies spam is not in the message itself but in the reputation of the addresses and names it contains. Organisations such as Spamhaus track that reputation and publish it as DNS blocklists (DNSBL): lists of IP addresses, domains or URLs known to send or advertise spam, served as special DNS zones.

A mail server checks an address by querying a name built from it under the list's zone. An answer means that the address is listed, and the IP address returned encodes the reason. DNS allowlists (DNSWL) work the same way, for senders known to be legitimate. Because the lookups are ordinary DNS queries, they are fast, and their answers can be cached.

The spam filter queries these lists for the addresses and names it finds in a message. It checks four kinds of item. The first is IP addresses: the address of the connecting client, the addresses in the `Received` headers, and IP addresses that appear in the body or in attachments. The second is domains, both of the email addresses in the headers and of the links in the message. The third is the email addresses in the headers themselves, for lists of known spammer addresses. The last is the links in the message as whole URLs, for lists of known spam and phishing URLs, including lists that publish hashes of URLs.

Some items are never queried: loopback, multicast and unspecified IP addresses, the domains in the [trusted domains](/docs/spamfilter/settings/domain-lists#trusted-domains) list, and domains hosted on the server.

## Blocklist servers

Each list is a [SpamDnsblServer](/docs/ref/object/spam-dnsbl-server) object, found in the WebUI under <!-- breadcrumb:SpamDnsblServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › DNSBL › Servers<!-- /breadcrumb:SpamDnsblServer -->. Its variant selects the kind of item the list is queried for: `Ip`, `Domain`, `Email` or `Url`. The object also accepts the variants `Header`, `Body` and `Any`, but servers of those variants are not queried. The rule set provides 18 servers, among them Spamhaus, Spamcop, Barracuda, Mailspike, SURBL and DNSWL.

Lists differ in how they are queried and in what their answers mean, so each server describes both with an [expression](/docs/configuration/expressions/). One expression builds the query, and the other interprets the answer.

### Query

The [`zone`](/docs/ref/object/spam-dnsbl-server#zone) expression returns the DNS name to query for the current item, or `false` to skip the item. It sees the same variables as a [rule](/docs/spamfilter/rules) of that variant.

For an IP address, these are `ip` and `ip_reverse`. The second is the address with its parts reversed, as blocklists expect it: `4.3.2.1` for `1.2.3.4`. For a URL, the variables are `url`, `host` and `sld`. For an email address, they are `email`, `local` and `domain`, and for a domain, `value`. The variable `location` tells where the item was found, for example `tcp` for the connecting client and `received` for an address from a `Received` header. A server can use it to query only the items for which its list is meant.

### Answer

The [`tag`](/docs/ref/object/spam-dnsbl-server#tag) expression is evaluated once for each IP address in the answer, and returns the tag to add, or `false`. In this expression, `ip` and `octets` describe the returned address. Most lists encode the reason for the listing in its last part, `octets[3]`.

The variables that describe the whole message are available here as well, and so is `location`. The variables of the queried item are not. Some lists encode several reasons as bits of one octet, and these are decoded with the `bit_and` [function](/docs/configuration/expressions/functions), for example `bit_and(octets[3], 4) != 0`.

A query that returns no answer adds no tag. Each tag is added once per message, however many items match, so a message that repeats a listed link many times is not counted many times.

### Example

The following object queries the Mailspike reputation list for the connecting client. It maps the answers to blocklist (`RBL_`) and allowlist (`RWL_`) tags:

```json
{
  "@type": "Ip",
  "name": "LOCAL_RBL_MAILSPIKE",
  "enable": true,
  "zone": {
    "match": {"0": {"if": "location == 'tcp'", "then": "ip_reverse + '.rep.mailspike.net'"}},
    "else": "false"
  },
  "tag": {
    "match": {
      "0": {"if": "octets[0] != 127", "then": "false"},
      "1": {"if": "octets[3] == 10", "then": "'RBL_MAILSPIKE_WORST'"},
      "2": {"if": "octets[3] == 11", "then": "'RBL_MAILSPIKE_VERYBAD'"},
      "3": {"if": "octets[3] == 12", "then": "'RBL_MAILSPIKE_BAD'"},
      "4": {"if": "octets[3] >= 13 && octets[3] <= 16", "then": "'RWL_MAILSPIKE_NEUTRAL'"},
      "5": {"if": "octets[3] == 17", "then": "'RWL_MAILSPIKE_POSSIBLE'"},
      "6": {"if": "octets[3] == 18", "then": "'RWL_MAILSPIKE_GOOD'"},
      "7": {"if": "octets[3] == 19", "then": "'RWL_MAILSPIKE_VERYGOOD'"},
      "8": {"if": "octets[3] == 20", "then": "'RWL_MAILSPIKE_EXCELLENT'"}
    },
    "else": "false"
  }
}
```

The `zone` expression queries only the connecting client, because its first branch tests `location`. In the `tag` expression, the first branch ignores answers outside `127.0.0.0/8`, which are not listing codes. As with rules, the tags only affect the score when a [SpamTag](/docs/ref/object/spam-tag) gives them one.

### Servers of the rule set

The servers of the rule set are named `STWT_*`. Every [rule set update](/docs/spamfilter/settings/general#rule-set-updates) replaces them with their latest version and keeps only their `enable` setting. To change one of them, disable it and create a server with a different name, which updates leave alone.

## Blocked queries

Most blocklist operators refuse queries from public DNS resolvers, such as those of Google, Cloudflare or Quad9, and from resolvers that send a high volume of queries without a subscription. A public resolver sends the queries of many users from one address, so it exceeds these limits quickly.

A refused query does not fail. Instead of an answer about the address, the list returns a special code, usually `127.255.255.254` or `127.255.255.255`. The rule set maps these codes to tags ending in `_BLOCKED` or `_BLOCKED_OPENRESOLVER`, such as `RBL_SPAMHAUS_BLOCKED`, `DBL_BLOCKED` or `URIBL_BLOCKED`.

These tags score 0, because they do not mean that the sender is listed. They mean that the list gave no information, which leaves the filter working with less evidence than intended.

Real answers require a recursive DNS resolver that runs on the server or in its network and queries the authoritative servers directly. Set up such a resolver and point Stalwart to it, as described in [DNS resolver](/docs/server/dns/resolver). For high query volumes, operators such as Spamhaus also offer subscriptions.

## Caching and limits

A busy server sees the same addresses and links in many messages, so blocklist answers are cached. They are kept in the spam lookup cache, whose size is [`spamLookup`](/docs/ref/object/cache#spamlookup) on the [Cache](/docs/ref/object/cache) singleton. Positive answers are kept for the time-to-live of the DNS record. Negative answers, which mean that an address is not listed, are kept for the negative time-to-live published by the list, at most one hour.

A message can also contain hundreds of links or addresses, so the number of queries made for one message is limited on the [SpamDnsblSettings](/docs/ref/object/spam-dnsbl-settings) singleton, found in the WebUI under <!-- breadcrumb:SpamDnsblSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › DNSBL › Settings<!-- /breadcrumb:SpamDnsblSettings -->. Each kind of item has its own limit:

| Field | Default | Queries per message |
|---|---|---|
| [`ipLimit`](/docs/ref/object/spam-dnsbl-settings#iplimit) | <!-- default:SpamDnsblSettings.ipLimit -->50<!-- /default --> | IP addresses |
| [`domainLimit`](/docs/ref/object/spam-dnsbl-settings#domainlimit) | <!-- default:SpamDnsblSettings.domainLimit -->50<!-- /default --> | Domains |
| [`emailLimit`](/docs/ref/object/spam-dnsbl-settings#emaillimit) | <!-- default:SpamDnsblSettings.emailLimit -->50<!-- /default --> | Email addresses |
| [`urlLimit`](/docs/ref/object/spam-dnsbl-settings#urllimit) | <!-- default:SpamDnsblSettings.urlLimit -->50<!-- /default --> | URLs |

When a limit is reached, the remaining items of that kind are not checked. With the defaults, a message with hundreds of links therefore costs at most <!-- default:SpamDnsblSettings.urlLimit -->50<!-- /default --> URL queries. Answers found in the cache do not count towards the limits.

## Learning from blocklists

Blocklist results can also teach the [statistical classifier](/docs/spamfilter/classifier/). A message that is classified as spam and is listed by several blocklists can be used to train the classifier automatically, as described in [Automatic learning](/docs/spamfilter/classifier/autolearn#dns-blocklists).
