---
sidebar_position: 3
---

# Full-text search

Stalwart Mail Server supports full-text search (FTS) capabilities that greatly improve the user experience when searching through email content. The FTS indexes are stored directly in the database using bloom filters, which are a space-efficient probabilistic data structure that can be used to determine whether an element is a member of a set. It’s important to note that, while bloom filters do not provide encryption, they do offer a level of privacy. This is because bloom filters obscure individual data items while allowing for effective searching, meaning that the content of your emails is not directly exposed in the search index.

Before indexing a message, the system will try to automatically detect its language. However, in certain scenarios where language detection may not be possible (for instance, if the text is too short or doesn't have clear language characteristics), the system will default to using the configured default language for text processing and indexing determined by the `jmap.fts.default-language` attribute. For example:

```toml
[jmap.fts]
default-language = "en"
```
