---
title: "Speeding up search indexing"
description: "Speed up full-text indexing and drain the index queue faster."
sidebar_position: 5
---

The server adds new and changed messages, calendar events, contacts and files to the search index in the background, not at the moment they are stored. As a result, a message can be delivered and read before it becomes searchable. While indexing keeps up, the delay is short. When it cannot keep up, the queue of documents waiting to be indexed grows, and searches miss recent items.

This page covers indexing throughput only. How the index queue works, how to read [IndexQueueStatus](/docs/ref/object/index-queue-status), and how to retry failed partitions or reindex are described in [Search indexing](/docs/storage/indexing). Which attachment formats are extracted, and the limits that apply, are described in [Attachment text extraction](/docs/storage/text-extraction).

## Confirm that indexing is the bottleneck

A growing queue alone does not mean that indexing needs tuning. A queue that grows after a large import or a migration and then drains needs no tuning. Indexing is a bottleneck only when the queue keeps growing during normal load. Two signals show whether the queue keeps up:

- The `search-index.pending-email`, `-calendar`, `-contacts`, `-file` and `-tracing` gauges count the documents waiting per index type, and IndexQueueStatus gives the same counts per partition. The gauges are refreshed every five minutes and capped at 250000, so a capped value means at least that many.
- The `search-index.index-time` histogram gives the time to build and write one batch, and the `search-index.batch-indexed` event gives the elapsed time of each batch.

Some indexing problems are not about speed. The `search-index.partition-retry` counter and event show partitions that failed and are scheduled for another attempt. A failed partition is a correctness problem, covered in [Search indexing](/docs/storage/indexing), and tuning throughput does not fix it. Indexing is also one of several background tasks, and the `task-manager.due` gauge shows whether background tasks in general are falling behind.

## Index more accounts in parallel

The unit of indexing work is the partition: one account's index of one type. The email and calendar queues of the same account are separate partitions, so they can be indexed in parallel, but one partition is always processed by one worker at a time.

[`maxConcurrentIndexTasks`](/docs/ref/object/search#maxconcurrentindextasks) on the [Search](/docs/ref/object/search) singleton (found in the WebUI under <!-- breadcrumb:Search --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search<!-- /breadcrumb:Search -->) is the number of partitions processed at the same time on each indexing node, <!-- default:Search.maxConcurrentIndexTasks -->5<!-- /default --> unless changed. Raising the value therefore speeds up indexing across many accounts, but it does not speed up the import of a single large mailbox, which remains one partition.

[`indexBatchSize`](/docs/ref/object/search#indexbatchsize) is the number of documents written per batch. With ElasticSearch and Meilisearch, documents from several partitions are combined into one bulk request of up to `indexBatchSize` documents, and a request is also sent once it reaches 128 MiB of text.

Both settings take effect after a restart. Higher values are not free: they use more CPU and more data store writes on the indexing node. Raise them in steps, and watch `search-index.index-time` and the data store write latency (`store.data-write-time`) after each step. The following command indexes ten accounts at a time:

```sh
stalwart-cli update Search --field maxConcurrentIndexTasks=10
```

## Spend less per document

The other way to speed up indexing is to do less work per document, because the cost of indexing depends on how much is indexed. Two kinds of setting reduce it:

- [`indexEmailFields`](/docs/ref/object/search#indexemailfields) lists the email fields that are indexed. Removing `attachment` skips attachment text extraction, and removing `body` skips the message text. Messages can then no longer be found by that content.
- [`indexFiles`](/docs/ref/object/search#indexfiles), [`indexCalendar`](/docs/ref/object/search#indexcalendar) and [`indexContacts`](/docs/ref/object/search#indexcontacts) switch off indexing for file storage, calendars and contacts where nobody searches them. File names stay searchable without `indexFiles`.

These changes apply to documents indexed after a settings reload. Documents indexed earlier keep their index entries until they are reindexed, as described in [Search indexing](/docs/storage/indexing).

The text of an attachment has to be extracted before it can be indexed. The `maxExtract*` settings bound that extraction per document, and they take effect after a settings reload. On small hosts, three of them matter most:

- [`maxExtractDocumentSize`](/docs/ref/object/search#maxextractdocumentsize), the largest attachment from which text is extracted
- [`maxExtractDecompressedSize`](/docs/ref/object/search#maxextractdecompressedsize), the decompressed size allowed per document
- [`maxExtractTextSize`](/docs/ref/object/search#maxextracttextsize), the extracted text kept per document

Lowering them bounds the CPU time and memory spent on each attachment. The full list is on [Attachment text extraction](/docs/storage/text-extraction).

With the internal search store, a very large document is only partly searchable, because its index is limited to about 1 MiB independently of `maxExtractTextSize`. Each cut document increments the `search-index.document-truncated` counter, as described in [Limits](/docs/storage/text-extraction#limits).

## Move indexing to dedicated nodes

In a cluster, indexing can be kept away from the nodes that serve clients. Only nodes that run the `searchIndexing` task index documents (see [Node roles](/docs/cluster/configuration/roles)). Give this task to nodes with spare CPU, and remove it from the nodes that serve clients, so that indexing does not compete with IMAP and JMAP requests. Adding indexing nodes spreads the accounts across them, although one account is still indexed by one node at a time.

## External search engines

With [ElasticSearch](/docs/storage/backends/elasticsearch) or [Meilisearch](/docs/storage/backends/meilisearch) as the search store, most of the indexing cost moves to the search engine. Stalwart then only extracts the text and sends it in bulk requests. A slow `search-index.index-time` therefore usually points to the engine, which is tuned as described in the engine's own documentation.
