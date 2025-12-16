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

Example:

```toml
[store."meilisearch"]
type = "meilisearch"
url = "https://localhost:9200"

[store."meilisearch".auth]
token = "API_KEY_HERE"

[store."meilisearch".tls]
allow-invalid-certs = true

```

## Limitations

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
