---
sidebar_position: 8
title: "ElasticSearch"
---

Elasticsearch is an open-source, distributed search and analytics engine built on Apache Lucene. It handles textual, numerical, geospatial, structured, and unstructured data, providing high scalability and near real-time search. When full-text search volumes grow beyond what the internal engine handles comfortably, Elasticsearch is a common choice as an external search backend.

## Configuration

The Elasticsearch backend is selected by choosing the `ElasticSearch` variant on the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->). The variant exposes the following fields:

- [`url`](/docs/ref/object/search-store#url): URL of the Elasticsearch server or cluster endpoint (required).
- [`timeout`](/docs/ref/object/search-store#timeout): maximum time to wait for an HTTP response. Default: `"30s"`.
- [`allowInvalidCerts`](/docs/ref/object/search-store#allowinvalidcerts): when `true`, accepts connections with invalid TLS certificates. Default: `false`.
- [`httpAuth`](/docs/ref/object/search-store#httpauth): authentication method used for HTTP requests (required). The `Unauthenticated`, `Basic`, and `Bearer` variants are supported.
- [`httpHeaders`](/docs/ref/object/search-store#httpheaders): additional headers attached to every HTTP request.

### Authentication

For HTTP Basic authentication, select the `Basic` variant of [`httpAuth`](/docs/ref/object/search-store#httpauth) and supply `username` and `secret`. For bearer-token authentication, select the `Bearer` variant and supply `bearerToken`. Secrets may be provided inline, read from an environment variable, or loaded from a file.

### Index settings

Stalwart maps its search data to an Elasticsearch index whose shape is controlled by the following fields:

- [`numShards`](/docs/ref/object/search-store#numshards): number of primary shards for the index. Default: `3`.
- [`numReplicas`](/docs/ref/object/search-store#numreplicas): number of replica shards per primary. Default: `0`.
- [`includeSource`](/docs/ref/object/search-store#includesource): when `true`, indexes the full source document alongside the inverted index. Default: `false`.
