---
sidebar_position: 9
---

# Meilisearch

Meilisearch is an open-source search engine designed for fast, relevance-focused queries with minimal configuration. It offers features such as typo tolerance, synonyms, filters, and faceted search.

## Configuration

The Meilisearch backend is selected by choosing the `Meilisearch` variant on the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->). The variant exposes the following fields:

- [`url`](/docs/ref/object/search-store#url): URL of the Meilisearch server (required).
- [`timeout`](/docs/ref/object/search-store#timeout): maximum time to wait for an HTTP response. Default: `"30s"`.
- [`allowInvalidCerts`](/docs/ref/object/search-store#allowinvalidcerts): when `true`, accepts connections with invalid TLS certificates. Default: `false`.
- [`httpAuth`](/docs/ref/object/search-store#httpauth): authentication method used for HTTP requests (required). For the Meilisearch API key, select the `Bearer` variant of `httpAuth` and supply the API key as the bearer token.
- [`httpHeaders`](/docs/ref/object/search-store#httpheaders): additional headers attached to every HTTP request.
- [`pollInterval`](/docs/ref/object/search-store#pollinterval): interval between polls for Meilisearch task completion. Default: `"500ms"`.
- [`maxRetries`](/docs/ref/object/search-store#maxretries): maximum number of times to poll for task completion before giving up. Default: `120`.
- [`failOnTimeout`](/docs/ref/object/search-store#failontimeout): when `true`, the operation fails if the task does not complete within the polling retries. Default: `true`.

## Limitations

### Number of Results

By default, Meilisearch limits the total number of documents returned by a search query to **1,000 results**. This limit applies even if more documents match the query. For many use cases this default is not an issue: typical search interfaces display only a small page of results and rely on pagination.

However, this behaviour can be problematic for **email search workloads**. IMAP and JMAP clients commonly request **all matching message IDs** for a given search expression, not just the first page of results. When the number of matching messages exceeds Meilisearch's default limit, the result set is **silently truncated** to the first 1,000 documents. Clients may miss valid matches without any indication that the result set is incomplete.

#### Increasing the Limit

This limit can be raised by increasing the `maxTotalHits` setting in Meilisearch. A larger `maxTotalHits` allows Meilisearch to return a larger number of matching document IDs, which is often required to correctly support IMAP and JMAP search semantics. This setting is changed through the [Meilisearch server configuration](https://www.meilisearch.com/docs/reference/api/settings#pagination-object) directly; it is not configurable through Stalwart.

#### Performance Considerations

Meilisearch explicitly warns about increasing this value:

> Setting `maxTotalHits` to a value higher than the default will negatively impact search performance. Setting `maxTotalHits` to values over **20,000** may result in queries taking seconds to complete.

Administrators should balance correctness and performance when tuning this setting. For mailboxes with very large folders or frequent broad searches, raising `maxTotalHits` may be necessary to avoid truncated results, but can significantly increase query latency and resource usage.

This limitation is inherent to Meilisearch's pagination model and should be considered when evaluating it as a full-text search backend for large or heavily queried mail stores.

### Query Mapping

Meilisearch separates search expressions into two fundamentally different components:

* **`q`**: A full-text search query, applied across one or more searchable text fields.
* **`filter`**: A boolean expression applied to structured or faceted fields (such as flags, dates, folders, or keywords).

This split works well for many simple queries but introduces limitations when mapping more complex IMAP and JMAP search expressions. IMAP and JMAP allow arbitrarily nested boolean logic that can freely combine text searches and structured filters at different levels of the query tree. Meilisearch, by contrast, does not support nesting full-text searches inside filtered sub-expressions or mixing text and filter logic at multiple levels.

Consider the following IMAP search query:

```
OR
  (AND
    (FROM "alice@example.com")
    (OR
      (SUBJECT "report")
      (BODY "quarterly")
    )
  )
  (AND
    (TO "bob@example.com")
    (SINCE 1-Jan-2024)
  )
```

This query combines text searches (`FROM`, `SUBJECT`, `BODY`, `TO`), structured filters (`SINCE`), and nested boolean logic (`OR` and `AND`) at multiple levels.

In Meilisearch, full-text conditions must be collapsed into a single `q` parameter, while structured conditions must be expressed separately as `filter`. There is no way to accurately represent the above query structure because it requires text searches and filters to be evaluated together within nested logical groups.

When an IMAP or JMAP query cannot be accurately mapped to Meilisearch's `q` and `filter` model, Stalwart executes the closest possible approximation of the query. No errors are returned to the client, and the search request appears to succeed.

However, because the original query semantics cannot be fully preserved, the results returned may differ from what some end users expect. This can include missing messages, extra matches, or results that do not strictly follow the intended logical structure of the original IMAP or JMAP query.

These limitations are inherent to Meilisearch's query model and should be taken into account when deciding whether it is suitable as a search backend for workloads that rely heavily on complex, deeply nested IMAP or JMAP search expressions.
