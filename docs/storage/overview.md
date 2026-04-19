---
sidebar_position: 1
---

# Overview

Stalwart splits storage into four separate stores, each covering a different aspect of server operation. Every store is an independent singleton with its own backend, so the storage technology can be matched to the requirements of each layer (a fast embedded database for metadata, an object-storage service for large blobs, a dedicated search index, and so on).

The [data store](/docs/storage/data) is the primary metadata store, configured through the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><!-- /breadcrumb:DataStore -->). It holds every structured record the server needs: mailbox state, account settings, domains, calendars, contacts, and most configuration objects themselves.

The [blob store](/docs/storage/blob) is configured through the [BlobStore](/docs/ref/object/blob-store) object (found in the WebUI under <!-- breadcrumb:BlobStore --><!-- /breadcrumb:BlobStore -->) and holds the raw bytes of messages, attachments, Sieve scripts, and other large files. Small blobs below the per-backend threshold are kept inline in the data store; larger blobs spill into the blob store backend.

The [search store](/docs/storage/fts) is configured through the [SearchStore](/docs/ref/object/search-store) object (found in the WebUI under <!-- breadcrumb:SearchStore --><!-- /breadcrumb:SearchStore -->) and indexes message bodies and attachments so that full-text search queries return quickly.

The [in-memory store](/docs/storage/in-memory) is configured through the [InMemoryStore](/docs/ref/object/in-memory-store) object (found in the WebUI under <!-- breadcrumb:InMemoryStore --><!-- /breadcrumb:InMemoryStore -->) and backs rate limiters, authentication tokens, session data, and other short-lived state.

Each object supports multiple backend variants (RocksDB, PostgreSQL, MySQL, SQLite, FoundationDB, S3, Redis, and others), and switching backend is a matter of selecting a different variant on the relevant object. Backend-specific options, defaults, and trade-offs are documented under [Storage backends](/docs/storage/backends/overview).

## Clean-up and maintenance

Scheduled clean-up is not configured per store. It is managed centrally through the [DataRetention](/docs/ref/object/data-retention) object (found in the WebUI under <!-- breadcrumb:DataRetention --><!-- /breadcrumb:DataRetention -->), which sets when the expunge, data-store clean-up, and blob clean-up tasks run. The relevant fields are [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule), [`dataCleanupSchedule`](/docs/ref/object/data-retention#datacleanupschedule) and [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule). Default values are listed on the object reference page; each accepts a cron expression.

## Un-deleting emails

Stalwart Enterprise edition provides a feature that allows recovery of emails deleted by users, even after these emails have been expunged from the Deleted Items or Junk Mail folders. This allows emails to be retrieved within a specified period, giving organisations a data recovery option.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

### Configuration

The retention period is controlled by [`archiveDeletedItemsFor`](/docs/ref/object/data-retention#archivedeleteditemsfor) on the [DataRetention](/docs/ref/object/data-retention) object. The value is a duration, for example `"30d"` to retain deleted emails for thirty days before they are permanently removed. Leaving the field unset disables archiving, in which case deleted items are removed immediately.

<!-- review: The previous docs described a single on/off-or-duration setting. In the new model, disabling archiving is expressed by leaving `archiveDeletedItemsFor` unset. Confirm this is the intended mapping and that no separate enable flag exists. -->

### Recovery

Administrators can restore archived emails from the [WebUI](/docs/management/webui/overview), which surfaces archived items through a dedicated recovery view. The same operation is available over the JMAP API for automation through the [ArchivedItem](/docs/ref/object/archived-item) object and the [CLI](/docs/management/cli/overview).

<!-- review: Verify which WebUI page hosts the recovery workflow and whether restoring an ArchivedItem uses a standard `x:ArchivedItem/set` patch or a dedicated Action variant. If an Action is involved, link to it here. -->
