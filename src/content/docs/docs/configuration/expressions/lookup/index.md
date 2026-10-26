---
sidebar_position: 1
title: "Overview"
description: "Lookup lists hold sets of keys and key-value pairs that expressions and Sieve scripts query by namespace: local lists, remote lists fetched over HTTP, and external databases."
---

Expressions and Sieve scripts often need to check a value against a list: whether a sender domain is on a blocklist, whether a recipient belongs to a set of trusted domains, or which value is associated with a key. Lookup lists provide these lists. Each list has a name, called its namespace, and the lookup functions query the list by that name.

The server relies on lookup lists itself as well. The spam filter keeps its lists of blocked domains, spam traps, trusted domains and URL redirectors as lookup lists.

## Kinds of lookup lists

Lookup lists come in three kinds. They differ in where their content comes from, and in when that content changes:

| Kind | Defined by | Content | Changes at run time |
|---|---|---|---|
| [Local lists](/docs/configuration/expressions/lookup/local) | [MemoryLookupKey](/docs/ref/object/memory-lookup-key) and [MemoryLookupKeyValue](/docs/ref/object/memory-lookup-key-value) objects, one per entry | Keys, or keys with values, entered by the administrator | No. Reloaded by the `ReloadLookupStores` action or a restart. |
| [Remote lists](/docs/configuration/expressions/lookup/remote) | An [HttpLookup](/docs/ref/object/http-lookup) object | A list or CSV file downloaded from a URL | No. Downloaded again at a fixed interval. |
| [Store lookups](#store-lookups) | A [StoreLookup](/docs/ref/object/store-lookup) object | An external SQL database or Redis server | Yes, as the external data changes. |

Local and remote lists are held in memory and are read-only, so the lookup functions can read them but not modify them.

Saving a lookup list or store lookup object does not reload the lists. The change takes effect when the `ReloadLookupStores` [action](/docs/management/tasks-actions/actions) runs, or when the server restarts. The action also reloads the lists on the other nodes of a cluster.

## Lookup functions

[Expressions](/docs/configuration/expressions/) query lookup lists with the following functions, whose first argument is the namespace:

- `key_exists(namespace, key)` returns `true` when the key is in the list.
- `key_get(namespace, key)` returns the value associated with the key, or an empty value when the key is not present.

For example, `key_exists('blocked-domains', sender_domain)` is true when the sender's domain is in the list with the namespace `blocked-domains`.

The same lists are available to Sieve scripts. Sieve provides functions with the same names and arguments, described in the [Sieve function reference](/docs/sieve/reference).

An empty namespace (`''`) does not name a lookup list. It refers to the [in-memory store](/docs/storage/in-memory), the runtime store that holds rate-limit counters and similar short-lived data.

Unlike the lists, that store is writable, so two further functions apply to it. `key_set(namespace, key, value)` stores a value. `key_incr(namespace, key, amount)` increments a counter and returns its new value, which `key_get` can also read back. Expressions use these functions to keep their own state, such as per-account counters. Writing to a local or remote lookup list is not possible.

## Store lookups

Some data changes too often to be copied into a list, or is maintained by another system, such as a customer database. A store lookup makes such an external database available under a namespace, so that expressions and scripts can query it directly. It is a StoreLookup object, found in the WebUI under <!-- breadcrumb:StoreLookup --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg> Lookups › Store Lookups<!-- /breadcrumb:StoreLookup -->.

The [`store`](/docs/ref/object/store-lookup#store) field of the object selects the backend. `PostgreSql`, `MySql` and `Sqlite` select an SQL database. `Redis`, `RedisCluster`, `RedisSentinel` and `Sharded` select a Redis deployment. `Sharded` requires the [Enterprise edition](/docs/server/enterprise). The connection settings are the same as those of the corresponding [storage backends](/docs/storage/backends/).

The backend decides which functions apply. With a Redis store, `key_get`, `key_exists`, `key_set` and `key_incr` read and write Redis keys directly. With an SQL store, the `sql_query(namespace, query, arguments)` function runs a query against the database and returns its result. The query is passed to the database unchanged, so it uses the database's own placeholder syntax: `?` for MySQL and SQLite, and `$1`, `$2` and so on for PostgreSQL. For example, `sql_query('crm', 'SELECT quota FROM users WHERE address = ?', [rcpt])` reads a value from the `crm` store.

The [`namespace`](/docs/ref/object/store-lookup#namespace) is set when the object is created, and must be unique among all lookup lists and store lookups. A clash is handled in one of two ways. A second store lookup or remote list with the same namespace is not loaded, and the server logs an error that the namespace already exists. A local list whose namespace equals that of a store lookup, however, replaces the store lookup without any message, so queries for that namespace read the local list.

The [expression functions](/docs/configuration/expressions/functions) page describes each function and its arguments.
