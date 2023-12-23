---
sidebar_position: 3
---

# Blob store



## Blob purging

Temporary blobs are binary files that users upload to the JMAP server. In some instances, these uploaded files may not be used or accessed beyond a certain period of time, known as their [Time-To-Live (TTL)](/docs/jmap/protocol#upload-limits). When a temporary blob exceeds its TTL without being accessed, Stalwart identifies it as "expired". The blob purge task runs at a configurable interval, and during each run, it identifies and deletes these expired temporary blobs, freeing up storage space and reducing clutter in the storage system.

The schedule for this task can be configured in the `jmap.purge.schedule.blobs` section using the simplified cron-like syntax. For example, to run the job every Tuesday at 5:45am local time:

```toml
[jmap.purge.schedule]
blobs = "45 5 2"
```

