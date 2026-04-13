---
sidebar_position: 9
---

# Meilisearch

Meilisearch is an open-source, lightning-fast, and hyper-relevant search engine that is easy to deploy and use. It is designed to provide an intuitive search experience with minimal configuration, making it a great choice for applications that require powerful search capabilities without the complexity of traditional search engines. Meilisearch offers features such as typo tolerance, synonyms, filters, and faceted search, allowing users to find relevant information quickly and efficiently.

## Configuration

The following configuration settings are available for Meilisearch, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store, set to `"meilisearch"` for Meilisearch.
- `url`: The URL of the Meilisearch server.
- `auth.token`: The API key used for authentication.
- `tls.allow-invalid-certs`: Determines whether to allow connections with invalid TLS certificates. This is a boolean setting, and setting it to `true` can be useful in development or testing environments.
- `task.poll-interval`: The interval (in milliseconds) at which to poll for task completion. Default is `500ms`.
- `task.poll-retries`: The number of times to retry polling for task completion. Default is `60`.

Example:

```toml
[store."meilisearch"]
type = "meilisearch"
url = "https://localhost:9200"

[store."meilisearch".task]
poll-interval = "500ms"
poll-retries = 60

[store."meilisearch".auth]
token = "API_KEY_HERE"

[store."meilisearch".tls]
allow-invalid-certs = true

```

## Limitations

### Number of Results

By default, Meilisearch limits the total number of documents returned by a search query to **1,000 results**. This limit applies even if more documents match the query. For many use cases, this default is not an issue. Typical search interfaces only display a small subset of results and rely on pagination, making it unnecessary to retrieve every matching document.

However, this behavior can be problematic for **email search workloads**. IMAP and JMAP clients commonly request **all matching message IDs** for a given search expression, not just the first page of results. When the number of matching messages exceeds Meilisearch’s default limit, the result set will be **silently truncated** to the first 1,000 documents. As a result, clients may miss valid matches without receiving any indication that the result set is incomplete.

#### Increasing the Limit

This limit can be raised by increasing the `maxTotalHits` setting in Meilisearch. Increasing `maxTotalHits` allows Meilisearch to return a larger number of matching document IDs, which is often required to correctly support IMAP and JMAP search semantics. To change this setting, you will need to update the [Meilisearch server configuration](https://www.meilisearch.com/docs/reference/api/settings#pagination-object) directly, as it is not configurable through Stalwart.

#### Performance Considerations

Meilisearch explicitly warns about increasing this value:

> Setting `maxTotalHits` to a value higher than the default will negatively impact search performance. Setting `maxTotalHits` to values over **20,000** may result in queries taking seconds to complete.

Administrators should carefully balance correctness and performance when tuning this setting. For mailboxes with very large folders or frequent broad searches, raising `maxTotalHits` may be necessary to avoid truncated results, but doing so can significantly increase query latency and resource usage.

This limitation is inherent to Meilisearch’s pagination model and should be considered when evaluating it as a full-text search backend for large or heavily queried mail stores.

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

When an IMAP or JMAP query cannot be accurately mapped to Meilisearch’s `q` and `filter` model, Stalwart will still execute the closest possible approximation of the query. No errors will be returned to the client, and the search request will appear to succeed.

However, because the original query semantics cannot be fully preserved, the results returned may differ from what some end users expect. This can include missing messages, extra matches, or results that do not strictly follow the intended logical structure of the original IMAP or JMAP query.

These limitations are inherent to Meilisearch’s query model and should be taken into account when deciding whether it is suitable as a search backend for workloads that rely heavily on complex, deeply nested IMAP or JMAP search expressions.
