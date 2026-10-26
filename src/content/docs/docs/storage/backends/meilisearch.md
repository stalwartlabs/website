---
sidebar_position: 9
title: "Meilisearch"
description: "Use Meilisearch as the search store: connection settings, task polling, and the result and query limitations that affect IMAP and JMAP searches."
---

[Meilisearch](https://www.meilisearch.com/) is a search engine that can serve as the [search store](/docs/storage/fts), holding the full-text index of messages, calendar events, contacts, files and delivery traces outside the mail server. Stalwart creates the indexes it needs on first use, so no index has to be prepared in advance. The [limitations](#limitations) below describe where its search model differs from IMAP and JMAP searches.

## Configuration

The backend is selected with the `Meilisearch` variant of the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->). [`url`](/docs/ref/object/search-store#url) is the address of the Meilisearch server. The Meilisearch API key is given with the `Bearer` variant of [`httpAuth`](/docs/ref/object/search-store#httpauth), and a server without a key uses `Unauthenticated`. [`httpHeaders`](/docs/ref/object/search-store#httpheaders) adds headers to every request, [`timeout`](/docs/ref/object/search-store#timeout) limits the duration of each request, and [`allowInvalidCerts`](/docs/ref/object/search-store#allowinvalidcerts) accepts an invalid TLS certificate.

Meilisearch does not complete a write before answering. It accepts each write request as a task and processes it asynchronously, so Stalwart has to ask afterwards whether the task succeeded. After each write, it polls the task status every [`pollInterval`](/docs/ref/object/search-store#pollinterval), up to [`maxPolls`](/docs/ref/object/search-store#maxpolls) times. With the defaults, that means a poll every <!-- default:SearchStore.Meilisearch.pollInterval -->500 milliseconds<!-- /default --> for up to <!-- default:SearchStore.Meilisearch.maxPolls -->120<!-- /default --> polls.

A task that has still not completed after the last poll leaves a decision, which [`failOnTimeout`](/docs/ref/object/search-store#failontimeout) makes. The field is <!-- default:SearchStore.Meilisearch.failOnTimeout as=enabled -->enabled<!-- /default --> by default, and the write then fails with `Timed out waiting for Meilisearch task`. The [index queue](/docs/storage/indexing#indexing-failures) retries the batch later. When the field is disabled, the write is treated as successful without confirmation. Indexing then continues without waiting, but a task that later fails in Meilisearch leaves those documents out of the index, and no error appears in Stalwart.

A task that Meilisearch reports as failed is always treated as an error, whatever the setting.

The following search store connects to a Meilisearch server with an API key read from an environment variable:

```json
{
  "@type": "Meilisearch",
  "url": "https://meili.example.com",
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {"@type": "EnvironmentVariable", "variableName": "MEILI_API_KEY"}
  }
}
```

## Limitations

### Number of results

Meilisearch limits the number of documents a search can return, through its `maxTotalHits` setting, 1,000 by default. That limit does not suit mail. IMAP and JMAP clients usually request all the matching messages, not a page of them, so the limit would silently truncate searches in large mailboxes. Stalwart therefore sets `maxTotalHits` to 100,000 on each of its indexes, and stops reading results at that point. A text search that matches more than 100,000 documents returns the first 100,000 and logs a `store.meilisearch-error` event with the reason `Search results were truncated`. Searches without a text component are not affected.

Stalwart checks `maxTotalHits` on every existing index when it starts, and resets it to 100,000 when it differs. A value changed through the Meilisearch [settings API](https://www.meilisearch.com/docs/reference/api/settings) therefore does not persist across restarts. The other index settings, namely the searchable, filterable and sortable attributes, are applied only when Stalwart creates an index, so an index created by hand does not receive them.

The higher limit has a cost. Meilisearch warns that high values slow down searches, and a search with many matches can take seconds to complete.

### Query mapping

Meilisearch accepts a search as two separate parts. A full-text query (`q`) is applied to the text fields, and a `filter` expression applies to structured fields such as mailboxes, flags and dates. IMAP and JMAP, by contrast, allow both kinds of condition to be nested freely, for example a subject match inside an `OR` alongside a date condition:

```text
OR (FROM "alice@example.com" SUBJECT "report") (TO "bob@example.com" SINCE 1-Jan-2024)
```

Stalwart has to translate such a query into the two parts. It keeps the nesting of the structured conditions in the filter. The text conditions, however, are combined into a single query, in which every term must match in one of the fields searched. A text condition inside an `OR` or a `NOT` is therefore not evaluated as written: it is neither alternated nor negated.

No error is returned when this happens. The search succeeds, but its results can include messages that do not match the original query, and miss messages that do.
