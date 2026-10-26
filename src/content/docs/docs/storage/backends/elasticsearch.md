---
sidebar_position: 8
title: "ElasticSearch"
description: "Use ElasticSearch as the search store: connection, authentication and index settings."
---

[ElasticSearch](https://www.elastic.co/elasticsearch) is a distributed search engine that can serve as the [search store](/docs/storage/fts). It moves the indexing and search load of a large installation to a cluster of its own, which is scaled separately from Stalwart. Stalwart creates the indexes it needs on first use, so no index has to be prepared in advance.

## Configuration

The backend is selected with the `ElasticSearch` variant of the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->). [`url`](/docs/ref/object/search-store#url) is the address of the ElasticSearch server or of the cluster endpoint. [`timeout`](/docs/ref/object/search-store#timeout) limits the duration of each HTTP request. [`allowInvalidCerts`](/docs/ref/object/search-store#allowinvalidcerts) accepts an invalid TLS certificate, and [`httpHeaders`](/docs/ref/object/search-store#httpheaders) adds headers to every request.

[`httpAuth`](/docs/ref/object/search-store#httpauth) selects how Stalwart authenticates to ElasticSearch. A server without authentication uses `Unauthenticated`. `Basic` sends a `username` and a `secret`, and `Bearer` sends a `bearerToken`, for example an ElasticSearch API key. Secrets can be given as a value, read from an environment variable or read from a file.

The following search store connects to an ElasticSearch cluster with a user name and a password read from a file:

```json
{
  "@type": "ElasticSearch",
  "url": "https://es.example.com:9200",
  "httpAuth": {
    "@type": "Basic",
    "username": "stalwart",
    "secret": {"@type": "File", "filePath": "/run/secrets/es-password"}
  },
  "numReplicas": 1
}
```

## Index settings

Three fields determine the shape of the indexes that Stalwart creates. They are applied only when an index is created, and an existing index keeps the settings it was created with:

- [`numShards`](/docs/ref/object/search-store#numshards): the number of primary shards of each index. ElasticSearch splits an index into shards to spread it over its nodes.
- [`numReplicas`](/docs/ref/object/search-store#numreplicas): the number of replicas of each primary shard, <!-- default:SearchStore.ElasticSearch.numReplicas -->0<!-- /default --> unless changed. A replica is needed for the index to survive the loss of an ElasticSearch node.
- [`includeSource`](/docs/ref/object/search-store#includesource): whether ElasticSearch keeps the original indexed document (the `_source` field) in addition to the index. Enabling it increases the size of the index.

Changing these settings later differs by setting. The number of replicas of an existing index can be changed with the ElasticSearch update index settings API. Changing the number of shards or `includeSource`, on the other hand, requires deleting the indexes in ElasticSearch and [rebuilding the index](/docs/storage/indexing#rebuilding-the-index).
