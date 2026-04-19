---
sidebar_position: 4
---

# Domain lists

Several of the lookup lists used by the spam filter categorise domains according to their behaviour. These lists inform rule evaluation and allow the filter to react differently to messages involving specific kinds of domain.

The entries in each list are stored as [MemoryLookupKey](/docs/ref/object/memory-lookup-key) objects (found in the WebUI under <!-- breadcrumb:MemoryLookupKey --><!-- /breadcrumb:MemoryLookupKey -->). The [`namespace`](/docs/ref/object/memory-lookup-key#namespace) field selects which list the entry belongs to, and the [`key`](/docs/ref/object/memory-lookup-key#key) field carries the domain itself.

## Trusted domains

Entries in the `trusted-domains` namespace list domain names considered trustworthy. Messages associated with these domains bypass DNS block-list checks.

## Disposable domains

Entries in the `disposable-providers` namespace identify domains associated with providers offering disposable email addresses. Such addresses are typically used for temporary communication and can be discarded after use. Messages from these domains do not directly affect the spam score, but they can shift the score when combined with other rule results.

## Free domains

Entries in the `freemail-providers` namespace list domain names associated with providers that offer free email accounts, such as popular webmail services. Messages from these domains do not directly alter the spam score, but the filter can adjust it when these domains appear in combination with other signals. For example, a message whose `From` address uses one free-mail provider and whose `Reply-To` uses another may be flagged as suspicious.

## URL redirectors

Entries in the `url-redirectors` namespace list domain names that belong to URL redirector services (for example, bit.ly). When the spam filter encounters a URL from one of these domains inside a message body, it follows the redirect to determine the final destination. Nested redirects are also followed, so that multi-layered chains are fully resolved before further analysis.

<!-- review: The previous docs referenced these lists by the lookup identifiers `trusted-domains`, `disposable-providers`, `freemail-providers`, and `url-redirectors`. Confirm that these are the exact namespace values used by MemoryLookupKey in the current schema, or update the prose accordingly. -->
