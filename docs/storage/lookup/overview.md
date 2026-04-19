---
sidebar_position: 1
---

# Overview

Lookup lists serve a similar role to in-memory stores such as Redis, but with one key distinction: they are read-only at runtime. They hold key-value pairs that remain unchanged during server operation and are well suited to cases where a fixed set of values is consulted from configuration expressions or scripts.

The primary way to interact with lookup lists is through [expressions](/docs/configuration/expressions/overview), using specialised functions such as `key_get`, `counter_get`, and others. These functions allow administrators to query values from the lists and evaluate configuration dynamically based on predefined key-value pairs.

Stalwart supports both local and remote lookup lists:

- [Local lookup lists](/docs/storage/lookup/local) are held as records managed through the [MemoryLookupKey](/docs/ref/object/memory-lookup-key) and [MemoryLookupKeyValue](/docs/ref/object/memory-lookup-key-value) objects. They are suitable for cases where all key-value pairs are known in advance and managed directly by the administrator.
- [Remote lookup lists](/docs/storage/lookup/remote) are fetched over HTTP and defined through the [HttpLookup](/docs/ref/object/http-lookup) object. They are useful in dynamic environments where configuration is managed centrally or updated independently of the server.

Additionally, the [StoreLookup](/docs/ref/object/store-lookup) object exposes an external data store as a lookup namespace, which is convenient when an existing database already holds the data the server should consult.
