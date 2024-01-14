---
sidebar_position: 4
---

# Full-text store

Stalwart Mail Server supports full-text search (FTS) capabilities that greatly improve the user experience when searching through email content. Full-text indexing can be done internally using any of the supported data store backends, or externally using a third-party solution such as ElasticSearch:

- [ElasticSearch](/docs/storage/fts) Delegate full-text search to ElasticSearch, a distributed, RESTful search and analytics engine.
- [Internal](/docs/storage/data): Use any of the supported [data store backends](/docs/storage/data) as a full-text index store.

## Choosing a full-text store

The main advantages of using the internal full-text indexing are privacy, multi-language support and simplicity:

- **Privacy**: Stalwart stores full-text indexes directly in the database using bloom filters, which are a space-efficient probabilistic data structure that can be used to determine whether an element is a member of a set. It’s important to note that, while bloom filters do not provide encryption, they do offer a level of privacy. This is because bloom filters obscure individual data items while allowing for effective searching, meaning that the content of your emails is not directly exposed in the search index.
- **Automatic multi-language support**: Before indexing a message, Stalwart will try to automatically detect its language and use the appropriate analyzer for indexing. This allows for more accurate indexing and searching of messages in different languages.
- **Simplicity**: Using the internal full-text indexing is the simplest way to enable full-text search in Stalwart. It does not require any additional configuration or external dependencies.

Full-text indexing engines such as ElasticSearch offer the following advantages:

- **Advanced Text Analysis and Relevance Scoring**: They provide sophisticated text analysis features, including synonyms, and custom analyzers. This results in more relevant search results. They also use sophisticated algorithms for relevance scoring, helping users find the most pertinent results quickly.
- **Ranking and Sorting**: They allow for more nuanced control over ranking and sorting of search results. They use a variety of factors (like text relevance, field values, and custom algorithms) to rank the results, giving users more accurate and tailored outputs.
- **Storage efficient**: They use index structures that are designed and optimized for full-text search, allowing for more efficient use of storage space.

:::tip Encryption and full-text search

It is important to note that when [encryption at rest](/docs/encryption/overview) is enabled, only the message headers will be stored in the full-text index.

:::


## Configuration

To configure the full-text store, you need to specify the ID of the store you wish to use under the `storage.fts` attribute in the configuration file. For example, to use the `postgresql` store as the full-text store:

```toml
[storage]
fts = "postgresql"
```

Before indexing a message in the internal store, Stalwart attempts to automatically detect its language. However, in certain scenarios where language detection may not be possible (for instance, if the text is too short or doesn't have clear language characteristics), the system will default to using the configured default language for text processing and indexing determined by the `storage.fts.default-language` attribute. For example:

```toml
[storage.fts]
default-language = "en"
```
