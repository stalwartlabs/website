---
sidebar_position: 4
title: "Search store"
description: "The search store holds the full-text index of messages, calendar events, contacts and files. Choosing a search backend, and selecting what is indexed."
---

When a user searches a mailbox for a word, the server cannot read every message to find it. It looks the word up in a full-text index instead, a structure that maps each word to the items that contain it. The search store holds this index for messages, calendar events, contacts and files.

The index answers the searches that involve text. For mail, these are IMAP `SEARCH` with the `TEXT`, `BODY` or `SUBJECT` criteria or with address criteria, and JMAP `Email/query` with text filters. The equivalent searches on calendar events, contacts and files use it as well. Searches that do not involve text, such as filtering by mailbox, flag, date or size, and sorting, are answered from the account's data and do not touch the search store.

Items are not indexed at the moment they are stored. New and changed items are added to the index in the background, so an item can take a short time to become searchable. [Search indexing](/docs/storage/indexing) describes the process, how to check it and how to rebuild the index.

## Backends

The backend is selected by the `@type` of the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Search Store<!-- /breadcrumb:SearchStore -->):

| `@type` | Index |
|---|---|
| `Default` | Kept in the data store (default). On RocksDB, SQLite and FoundationDB, Stalwart's built-in full-text index; on PostgreSQL and MySQL, the database's own full-text search. |
| `ElasticSearch` | An [ElasticSearch](/docs/storage/backends/elasticsearch) server or cluster. |
| `Meilisearch` | A [Meilisearch](/docs/storage/backends/meilisearch) server. |
| `PostgreSql`, `MySql`, `FoundationDb` | A database separate from the data store, used in the same way as with `Default`. |

## Choosing a search store

The built-in index needs no other service, and most single-node installations use it. It splits each message into words and detects the language of the message. For 18 languages it then reduces each word to its stem, the common root of its forms, so that a search for one form of a word also finds the others. The languages are English, Russian, Spanish, Portuguese, Italian, French, German, Arabic, Norwegian, Danish, Swedish, Finnish, Turkish, Dutch, Hungarian, Greek, Romanian and Tamil. Text in other languages is indexed as plain words.

ElasticSearch and Meilisearch take a different approach. They move the indexing and search load to a separate service that can be scaled on its own, which suits large installations and clusters with heavy search traffic. The price is one more service to operate and secure.

Every backend has limitations that matter for mail:

| Backend | Limitations |
|---|---|
| Built-in index | The index of a single document is limited to about 1 MiB. For very large documents only part of the text is searchable; the attachment text is the first to be cut. |
| PostgreSQL | Each field is limited to 250,000 characters of text. Stemming is available only for the languages whose text search configuration is installed in PostgreSQL; other text is indexed without stemming. See [PostgreSQL](/docs/storage/backends/postgresql#full-text-search-limitations). |
| MySQL, MariaDB | No stemming and no language handling; short words are not indexed by default. See [MySQL](/docs/storage/backends/mysql#full-text-search-limitations). |
| ElasticSearch | A JVM-based service with substantial memory requirements. |
| Meilisearch | Queries that combine text and other criteria inside nested `OR` or `NOT` expressions are approximated, and text searches return at most 100,000 results. See [Meilisearch](/docs/storage/backends/meilisearch#limitations). |

Changing the search store does not move the existing index, so the new store starts empty. After a change, rebuild the index as described in [Rebuilding the index](/docs/storage/indexing#rebuilding-the-index). Until the rebuild completes, text searches return incomplete results. The change itself takes effect after a restart.

## Indexed items and fields

Indexing every field of every item is not always wanted, and the [Search](/docs/ref/object/search) object (found in the WebUI under <!-- breadcrumb:Search --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search<!-- /breadcrumb:Search -->) decides which items are indexed and which of their fields.

The first decision is which kinds of item to index at all. [`indexEmail`](/docs/ref/object/search#indexemail), [`indexCalendar`](/docs/ref/object/search#indexcalendar), [`indexContacts`](/docs/ref/object/search#indexcontacts) and [`indexFiles`](/docs/ref/object/search#indexfiles) each enable indexing of one kind. When one of them is disabled, text searches on that kind of item find nothing. Files are a partial exception: the file name is always searchable, and `indexFiles` controls only the indexing of the file contents.

The second decision is which fields of each item to index. The fields are listed in [`indexEmailFields`](/docs/ref/object/search#indexemailfields), [`indexCalendarFields`](/docs/ref/object/search#indexcalendarfields) and [`indexContactFields`](/docs/ref/object/search#indexcontactfields). For email, the default set is <!-- default:Search.indexEmailFields -->`attachment`, `bcc`, `body`, `cc`, `from`, `subject` and `to`<!-- /default -->. The `headers` field, which indexes the other header fields, is not part of it and must be added explicitly. An empty set indexes every field except `headers`. For calendar events and contacts, the defaults include every field, and an empty set does the same.

A search on a field that is not indexed finds nothing. In particular, removing `attachment` stops the indexing of text extracted from attachments, which is described in [Attachment text extraction](/docs/storage/text-extraction).

Dates, sizes, flags and similar properties are not part of the full-text index at all. Searches and sorts on them therefore work regardless of the search store and of these settings. A change to the indexed fields applies only to items indexed afterwards, so after changing them, [rebuild the index](/docs/storage/indexing#rebuilding-the-index) to bring the existing items in line with the new settings.

## Languages

Stemming depends on knowing the language of the text, so each message's language is detected before it is indexed. Detection chooses only among the languages enabled in [`supportedLanguages`](/docs/ref/object/search#supportedlanguages). Out of the box that set is <!-- default:Search.supportedLanguages -->`en-US`<!-- /default -->, so the languages of a multilingual user base have to be added to it.

Detection does not always succeed, for example when the text is too short. The language in [`defaultLanguage`](/docs/ref/object/search#defaultlanguage) is then used. Languages are given as locale codes such as `de-DE` or `fr-FR`.

## Encrypted messages

When [encryption at rest](/docs/encryption/) is enabled for an account, messages are encrypted before they are stored, and the index is built from the encrypted form. Only the parts that remain readable can be indexed. The sender and recipient addresses and the subject stay unencrypted in the outer message, so they are searchable. The other unencrypted header fields are searchable too when `headers` is indexed. The body and the attachments are not searchable.
