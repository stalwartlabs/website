---
sidebar_position: 2
---

# Local

Local lookup lists hold key-only membership sets and key-value pairs entirely in memory. They are well suited to small, slow-changing sets of static data, consulted from expressions or Sieve filters.

## Key-only lists

Key-only lists, useful for membership tests such as allow-lists and deny-lists, are defined through the [MemoryLookupKey](/docs/ref/object/memory-lookup-key) object (found in the WebUI under <!-- breadcrumb:MemoryLookupKey --><!-- /breadcrumb:MemoryLookupKey -->). Each record has:

- [`namespace`](/docs/ref/object/memory-lookup-key#namespace): the lookup namespace the key belongs to (required). All records sharing a namespace form a single lookup list.
- [`key`](/docs/ref/object/memory-lookup-key#key): the key name (required, up to 255 characters).
- [`isGlobPattern`](/docs/ref/object/memory-lookup-key#isglobpattern): when `true`, the key is interpreted as a glob pattern, matching multiple concrete keys (for example `*.example.com` or `mx?.example.org`). Default: `false`.

To build a list of allowed domains, for instance, create one MemoryLookupKey record per entry, all sharing the namespace `allow-list-domain`, with the domain as the key.

## Key-value lists

Lists that associate a value with each key are defined through the [MemoryLookupKeyValue](/docs/ref/object/memory-lookup-key-value) object (found in the WebUI under <!-- breadcrumb:MemoryLookupKeyValue --><!-- /breadcrumb:MemoryLookupKeyValue -->). Each record has the same [`namespace`](/docs/ref/object/memory-lookup-key-value#namespace), [`key`](/docs/ref/object/memory-lookup-key-value#key), and [`isGlobPattern`](/docs/ref/object/memory-lookup-key-value#isglobpattern) fields as MemoryLookupKey, plus:

- [`value`](/docs/ref/object/memory-lookup-key-value#value): the value associated with the key (required).
