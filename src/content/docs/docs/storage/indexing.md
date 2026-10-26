---
title: "Search indexing"
description: "How new and changed items are added to the full-text index in the background, how to check the index queue, what happens when indexing fails, and how to rebuild the index."
sidebar_position: 4.2
---

Building the full-text index entry of a message takes work: its text has to be extracted, split into words and written to the [search store](/docs/storage/fts). If that work happened while the message was being stored, every delivery and every client request would wait for it. Stalwart therefore indexes in the background. Messages, calendar events, contacts, files and delivery traces are recorded in an index queue when they are stored. Indexing nodes later take them from the queue, extract their text and write it to the search store.

This design has one visible consequence. An item becomes searchable only once it has been indexed, and until then text searches do not find it. Searches by mailbox, flag or date, and the message list itself, do not depend on the index, so they show the item at once.

## Index queue

The queue is divided into partitions. Each account has one partition for each kind of item (email, calendar, contacts, files), and delivery traces have partitions of their own.

An indexing node works through the queue one partition at a time. It takes a partition and reads up to [`indexBatchSize`](/docs/ref/object/search#indexbatchsize) queued items from it. It then builds their index entries and writes them to the search store as one batch, and it continues with the next batch until the partition is empty. A node processes up to [`maxConcurrentIndexTasks`](/docs/ref/object/search#maxconcurrentindextasks) partitions at a time, <!-- default:Search.maxConcurrentIndexTasks -->5<!-- /default --> unless changed. Both settings are on the [Search](/docs/ref/object/search) object (found in the WebUI under <!-- breadcrumb:Search --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search<!-- /breadcrumb:Search -->).

Only one worker indexes a given partition at a time, and this decides how work is spread. Many accounts with pending work are indexed in parallel. A large import into a single mailbox, by contrast, is indexed sequentially, and more workers or more nodes do not speed it up. ElasticSearch and Meilisearch are handled slightly differently: documents from several partitions are combined into bulk requests of up to `indexBatchSize` documents.

Indexing a message also includes extracting the text of its attachments, as described in [Attachment text extraction](/docs/storage/text-extraction). [Speeding up search indexing](/docs/performance/search-indexing) covers how to make indexing faster on busy servers.

## Indexing nodes

The queue is processed only by the nodes whose [cluster role](/docs/cluster/configuration/roles) includes the `searchIndexing` task. A node without a role assignment runs every task, indexing included.

In a cluster with several indexing nodes, the nodes share the queue without duplicating work. While one node holds a partition, the others skip it. If no node runs `searchIndexing`, on the other hand, nothing processes the queue: it keeps growing, and new items never become searchable.

## Checking the queue

The [IndexQueueStatus](/docs/ref/object/index-queue-status) object (found in the WebUI under <!-- breadcrumb:IndexQueueStatus --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Index Queue<!-- /breadcrumb:IndexQueueStatus -->) shows what is waiting to be indexed, with one entry for each partition that has pending work. The [`index`](/docs/ref/object/index-queue-status#index) field names the kind of item: `email`, `calendar`, `contacts`, `file` or `telemetry`. The [`partition`](/docs/ref/object/index-queue-status#partition) field names the account, or a telemetry time bucket. Two counts give the size of the backlog: [`queuedUpdates`](/docs/ref/object/index-queue-status#queuedupdates) is the number of documents waiting to be indexed, and [`queuedDeletions`](/docs/ref/object/index-queue-status#queueddeletions) the number waiting to be removed from the index. Finally, the [`status`](/docs/ref/object/index-queue-status#status) is `Running` or `Failed`.

The counts of one request are limited to 10000 queued items in total. On a large backlog the numbers are therefore lower bounds, and later partitions may show zero even though they have pending work.

The entries can be listed with the CLI or the JMAP API, and filtered by `index`, `partition` or `status`:

```sh
stalwart-cli query IndexQueueStatus
```

Reading the entries requires the `sysIndexQueueStatusGet` and `sysIndexQueueStatusQuery` permissions, and changing their status requires `sysIndexQueueStatusUpdate`.

For a view of the whole server, the gauges `search-index.pending-email`, `search-index.pending-calendar`, `search-index.pending-contacts`, `search-index.pending-file` and `search-index.pending-tracing` report the number of documents waiting in each queue. They are refreshed every five minutes. The count stops at 250000, so a gauge at that level means that at least that many documents are waiting.

## Indexing failures

A batch can fail to be indexed, for example because an external search engine is unreachable. The partition is then marked `Failed`, and its status records what happened: [`reason`](/docs/ref/object/index-queue-status#reason) carries the error, and [`nextRetry`](/docs/ref/object/index-queue-status#nextretry) the time of the next attempt.

Failed partitions are retried automatically. The first retry comes after 30 seconds, and each further delay doubles, up to 30 minutes. Each failure is logged as a `search-index.partition-retry` event at debug level, with the index, the partition, the reason and the time of the next attempt, and it is counted in the metric of the same name.

Once the cause has been fixed, there is no need to wait for the next scheduled attempt. Setting the partition's status back to `Running` retries it at once:

```sh
stalwart-cli update IndexQueueStatus <id> --field status='{"@type":"Running"}'
```

## Rebuilding the index

Some changes leave the index out of step with the data, and the index then has to be rebuilt. This is the case after the search store has been changed, and after the indexed fields have been changed. It is also the case after data has been imported with the [database migration](/docs/management/maintenance/migration) tool, because its export does not include the search index.

A rebuild queues every item again, at a rate of at most 10,000 items per second for each rebuild task. Existing index entries are overwritten as the items are indexed.

A rebuild is started by creating a [Task](/docs/ref/object/task), in the WebUI under Management › Tasks or with the CLI. Three kinds of task cover the different scopes:

- `StoreMaintenance` with `maintenanceType` set to `reindexAccounts` rebuilds the index of every account. It schedules one task per account, spread over the following five minutes.
- `AccountMaintenance` with `maintenanceType` set to `reindex` and the `accountId` of one account rebuilds that account's index.
- `StoreMaintenance` with `maintenanceType` set to `reindexTelemetry` rebuilds the index of the stored delivery traces (Enterprise).

The following command rebuilds the index of every account:

```sh
stalwart-cli create Task/StoreMaintenance \
  --field maintenanceType=reindexAccounts \
  --field 'status={"@type":"Pending","due":"2026-01-01T00:00:00Z"}'
```

A task whose `due` time has already passed runs at once. Store tasks run on the nodes with the `storeMaintenance` cluster task, and account tasks on the nodes with the `accountMaintenance` task. Either way, the items they queue are then indexed by the `searchIndexing` nodes.

## Search results are incomplete after an import

After a large import, text searches can miss messages for two different reasons, and IndexQueueStatus tells them apart.

In the first case, the queue has simply not been processed yet. The imported accounts show entries with `queuedUpdates` above zero and status `Running`, and the counts decrease over time. Searches become complete once the queue is empty.

In the second case, the items were never queued, which is what happens after an import with the database migration tool. IndexQueueStatus then shows no entries for the affected accounts, even though searches miss their messages. Start a rebuild as described above.

A partition in status `Failed` is a third case. Its `reason` names the cause, as described in [Indexing failures](#indexing-failures).

## Signals

The following metrics report indexing activity:

- `search-index.index-time`: a histogram of the time taken to build and write one batch.
- `search-index.batch-indexed`: the number of batches written.
- `search-index.partition-retry`: the number of failed batches that were rescheduled.
- `search-index.document-truncated`: the number of documents only partly indexed because they reached the per-document limit of the built-in index.
- `search-index.pending-*`: the queue depths described above.

The events of the `search-index` group report the same activity in more detail. All of them are logged at debug level, except `search-index.manager-started`. For each batch, `search-index.batch-indexed` gives the index, the partition, the number of documents and the elapsed time. `search-index.document-ignored` reports a queued item with nothing to index, typically one that was deleted before the indexer reached it. `search-index.document-truncated` gives the account, the document, the indexed size and the limit. The complete list is in the [event reference](/docs/ref/events).
