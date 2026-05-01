---
sidebar_position: 4
title: "Search store"
---

Full-text search (FTS) indexes message bodies, attachments, contacts, and calendar events so that search queries return quickly across large mailboxes. The backend used for full-text indexing is configured independently from the data store, allowing the search engine to be chosen to match query volume, language requirements, and operational constraints.

Backend selection is made on the [SearchStore](/docs/ref/object/search-store) singleton (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->). The object is a multi-variant type. The supported variants are:

- [ElasticSearch](/docs/storage/backends/elasticsearch): a distributed, RESTful search engine.
- [Meilisearch](/docs/storage/backends/meilisearch): a fast, relevance-focused search engine with minimal configuration.
- The `Default` variant, which uses the configured data store as the full-text index. Supported for all data store variants, it stores indexes directly in the database using bloom filters.
- FoundationDB, PostgreSQL, and MySQL may also be selected as dedicated search backends when their indexing characteristics are preferred.

## Choosing a search store

The internal (data-store-backed) full-text index offers several advantages:

- **Privacy**: indexes are kept in the database using bloom filters, a space-efficient probabilistic data structure that allows membership testing without exposing indexed tokens directly. While bloom filters do not encrypt data, they obscure individual terms.
- **Automatic multi-language support**: message language is detected before indexing, and a language-appropriate analyser is applied.
- **Simplicity**: no additional services are required.

External engines offer their own strengths:

- **Advanced text analysis and relevance scoring**: synonyms, custom analysers, and sophisticated ranking algorithms.
- **Ranking and sorting flexibility**: more control over how results are ordered, combining text relevance with structured fields.
- **Storage efficiency**: purpose-built index structures designed for full-text search.

:::tip Encryption and full-text search

When [encryption at rest](/docs/encryption/) is enabled, only message headers are stored in the full-text index.

:::

### Limitations

Every FTS backend involves trade-offs. No single engine is optimal for every deployment; each backend makes design choices that affect scalability, accuracy, resource usage, and query expressiveness. Administrators should consider these in the context of expected mail volume, query patterns, and operational constraints.

The following table summarises the primary limitations of each supported engine:

| Full Text Search Engine | Key Limitations                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Elasticsearch           | Memory intensive and Java based, which can increase operational complexity and resource usage. |
| Meilisearch             | Single-node architecture and [limited support](/docs/storage/backends/meilisearch#limitations) for complex, deeply nested query expressions.     |
| PostgreSQL              | Maximum indexable email content size of approximately [650 KB per message](/docs/storage/backends/postgresql#fts-limitations).                      |
| MySQL                   | [No stemming support](/docs/storage/backends/mysql#fts-limitations) and no support for indexing multiple languages within the same column.     |
| Internal FTS            | Higher write amplification compared to external full text search backends.                     |

These limitations are not defects but consequences of architectural choices. If search accuracy, language support, scalability, or operational simplicity is a critical requirement, evaluating multiple backends may be necessary.

## Configuration

To change the search backend, update the SearchStore singleton and select the appropriate variant. Variant-specific fields such as [`url`](/docs/ref/object/search-store#url), [`httpAuth`](/docs/ref/object/search-store#httpauth), [`numShards`](/docs/ref/object/search-store#numshards), and [`numReplicas`](/docs/ref/object/search-store#numreplicas) apply to the ElasticSearch variant; [`url`](/docs/ref/object/search-store#url), [`pollInterval`](/docs/ref/object/search-store#pollinterval), and [`maxRetries`](/docs/ref/object/search-store#maxretries) apply to the Meilisearch variant. See the [SearchStore reference](/docs/ref/object/search-store) for the full field list per variant.

### Index configuration

Which entities are indexed, and which of their fields, is controlled through the [Search](/docs/ref/object/search) object (found in the WebUI under <!-- breadcrumb:Search --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search<!-- /breadcrumb:Search -->). Indexing for each entity type can be enabled or disabled independently through [`indexEmail`](/docs/ref/object/search#indexemail), [`indexContacts`](/docs/ref/object/search#indexcontacts), [`indexCalendar`](/docs/ref/object/search#indexcalendar), and [`indexTelemetry`](/docs/ref/object/search#indextelemetry).

The fields indexed per entity are controlled through [`indexEmailFields`](/docs/ref/object/search#indexemailfields), [`indexContactFields`](/docs/ref/object/search#indexcontactfields), [`indexCalendarFields`](/docs/ref/object/search#indexcalendarfields), and [`indexTracingFields`](/docs/ref/object/search#indextracingfields). Each accepts a list of field names; if the list is empty, all supported fields for that entity are registered.

### Default language

When language detection fails (for example, when the text is too short or ambiguous), the server falls back to the language configured in [`defaultLanguage`](/docs/ref/object/search#defaultlanguage) on the Search object. The default is `"en_US"`. Specific languages can be excluded from detection through [`disableLanguages`](/docs/ref/object/search#disablelanguages).
