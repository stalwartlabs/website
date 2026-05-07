---
sidebar_position: 6
title: "DNS blocklists"
---

In email security and spam filtering, two widely used tools are DNSBL (DNS-based Block List) and DNSWL (DNS-based Allowlist). Both are maintained by external organisations and updated continuously to reflect the latest information about spam and malicious activity. The lists are queried over DNS, so lookups are fast and cacheable, and are used to decide whether to accept, reject, or further scrutinise an incoming message.

A **DNSBL** lists IP addresses or domain names known to be sources of spam, malicious activity, or other undesirable content. When a message is received, the mail server queries the DNSBL to determine whether the sender appears on any of the lists. A positive match can cause the message to be flagged, rejected, or subjected to additional checks, depending on configuration.

A **DNSWL** is the converse: a list of trusted IP addresses or domain names known to send legitimate email. Querying a DNSWL allows the mail server to identify and prioritise messages from reputable senders, reducing false positives.

The following DNSBL checks are performed by Stalwart:

- **IP address**: the reputation of the remote host, as well as of every IP address found in the `Received` headers of a message, is verified against configured lists. Checking the full received chain improves the accuracy of spam detection and reduces the risk of legitimate messages being misclassified.
- **Domain**: domain names extracted from incoming messages are checked against DNS-based block and allow lists.
- **URL**: URLs embedded in messages are checked against URL-oriented blocklists to identify malicious links.
- **Hashes**: hashes of specific components of the message are checked against hash-based blocklists, so that threats can be identified even when senders slightly modify their tactics or domain names.

## DNSBL checks

Each DNSBL check is defined as a [SpamDnsblServer](/docs/ref/object/spam-dnsbl-server) object (found in the WebUI under <!-- breadcrumb:SpamDnsblServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › DNSBL › Servers<!-- /breadcrumb:SpamDnsblServer -->). This is a multi-variant object: the variant selects which part of the message the DNSBL applies to (`Ip`, `Domain`, `Url`, `Email`, `Header`, `Body`, or `Any`).

Each SpamDnsblServer instance carries:

- [`enable`](/docs/ref/object/spam-dnsbl-server#enable): whether the server is active.
- [`zone`](/docs/ref/object/spam-dnsbl-server#zone): an [`Expression`](/docs/ref/object/spam-dnsbl-server#expression) that evaluates to the DNS zone to query. If the expression evaluates to `false`, the DNSBL server is skipped for that message.
- [`tag`](/docs/ref/object/spam-dnsbl-server#tag): an [`Expression`](/docs/ref/object/spam-dnsbl-server#expression) that evaluates to the tag to apply to the message based on the DNS query result. If the expression evaluates to `false`, no tag is applied.

Example reproducing the Mailspike IP DNSBL using the `Ip` variant:

```json
{
  "@type": "Ip",
  "name": "STWT_RBL_MAILSPIKE_IP",
  "enable": true,
  "zone": {
    "match": [{"if": "location == 'tcp'", "then": "ip_reverse + '.rep.mailspike.net'"}],
    "else": "false"
  },
  "tag": {
    "match": [
      {"if": "octets[0] != 127", "then": "false"},
      {"if": "octets[3] == 10", "then": "'RBL_MAILSPIKE_WORST'"},
      {"if": "octets[3] == 11", "then": "'RBL_MAILSPIKE_VERYBAD'"},
      {"if": "octets[3] == 12", "then": "'RBL_MAILSPIKE_BAD'"},
      {"if": "octets[3] >= 13 && octets[3] <= 16", "then": "'RWL_MAILSPIKE_NEUTRAL'"},
      {"if": "octets[3] == 17", "then": "'RWL_MAILSPIKE_POSSIBLE'"},
      {"if": "octets[3] == 18", "then": "'RWL_MAILSPIKE_GOOD'"},
      {"if": "octets[3] == 19", "then": "'RWL_MAILSPIKE_VERYGOOD'"},
      {"if": "octets[3] == 20", "then": "'RWL_MAILSPIKE_EXCELLENT'"}
    ],
    "else": "false"
  }
}
```

## Core DNSBL servers

Stalwart ships a set of predefined DNSBL server definitions maintained by Stalwart Labs. These are identified by a name starting with `STWT_` and cover Spamhaus, Spamcop, Barracuda, and dozens of other popular providers. Core DNSBL servers are regularly updated to remain effective against the latest threat sources.

The latest version of the core list is maintained in the [Spam Filter repository](https://github.com/stalwartlabs/spam-filter). Stalwart can be configured to download and apply the latest definitions automatically; see [updates](/docs/spamfilter/settings/general#updates).

Core definitions should not be modified directly, because any changes are overwritten on the next update. The only safe in-place modification is toggling [`enable`](/docs/ref/object/spam-dnsbl-server#enable) on a core entry, which is preserved across updates. To apply custom behaviour beyond enabling or disabling a core entry, disable the core server and create a custom SpamDnsblServer with the desired values.

For example, to disable a core entry and add a custom server:

```json
{
  "@type": "Ip",
  "name": "STWT_DNSBL_SERVER",
  "enable": false
}
```

```json
{
  "@type": "Ip",
  "name": "STWT_MY_DNSBL_SERVER",
  "enable": true,
  "zone": {"else": "zone expression"},
  "tag": {"else": "tag expression"}
}
```

This keeps customisations intact while still benefiting from ongoing updates to the core list.

## Limits

The maximum number of DNSBL queries that can be performed per message is configured on the [SpamDnsblSettings](/docs/ref/object/spam-dnsbl-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamDnsblSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › DNSBL › Settings<!-- /breadcrumb:SpamDnsblSettings -->). The per-message limits are:

- [`ipLimit`](/docs/ref/object/spam-dnsbl-settings#iplimit): maximum number of IP address queries.
- [`domainLimit`](/docs/ref/object/spam-dnsbl-settings#domainlimit): maximum number of domain name queries.
- [`emailLimit`](/docs/ref/object/spam-dnsbl-settings#emaillimit): maximum number of email address queries.
- [`urlLimit`](/docs/ref/object/spam-dnsbl-settings#urllimit): maximum number of URL queries.

All four limits default to 50.
