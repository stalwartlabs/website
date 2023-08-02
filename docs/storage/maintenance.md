---
sidebar_position: 5
---

# Maintenance

Stalwart Mail Server runs periodically automated tasks that perform essential maintenance to ensure efficient use of storage and optimal database operations. The schedule for these task is configured using a simplified cron-like syntax:

```txt
<minute> <hour> <week-day>
```

Where:

- ``<minute>``: minute to run the job, an integer ranging from 0 to 59.
- ``<hour>``: hour to run the job, an integer ranging from 0 to 23, or ``*`` to run the job every hour.
- ``<week-day>``: day of the week to run the job, ranging from ``1`` (Monday) to ``7`` (Sunday), or ``*`` to run the job every day. 

All values have to be specified using the server's local time. For example, to run the job every day at 3am local time the syntax would be `0 3 *`. Or, to run the job every Tuesday at 5:45am local time, the syntax would be `45 5 2`.

## Database compaction

The database compaction task takes care of removing expired entries and compacting logs. The schedule for this task can be configured in the `jmap.purge.schedule.db` section using the simplified cron-like syntax described above.

For example, to run the job every day at 3am local time:

```toml
[jmap.purge.schedule]
db = '0 3 *"
```

## Blob purging

Temporary blobs are binary files that users upload to the JMAP server. In some instances, these uploaded files may not be used or accessed beyond a certain period of time, known as their [Time-To-Live (TTL)](/docs/jmap/protocol#upload-limits). When a temporary blob exceeds its TTL without being accessed, Stalwart identifies it as "expired". The blob purge task runs at a configurable interval, and during each run, it identifies and deletes these expired temporary blobs, freeing up storage space and reducing clutter in the storage system.

The schedule for this task can be configured in the `jmap.purge.schedule.blobs` section using the simplified cron-like syntax described above. For example, to run the job every Tuesday at 5:45am local time:

```toml
[jmap.purge.schedule]
blobs = "45 5 2"
```

