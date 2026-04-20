---
sidebar_position: 5
---

# Maintenance

Stalwart includes an automated maintenance process that manages and optimises the use of server space. The process runs on a schedule to maintain the performance and reliability of the mail server, and performs several functions across user accounts.

It permanently removes emails that users have marked for deletion, reclaiming space occupied by unwanted emails. It expunges old messages from the "Deleted Items" and "Junk Mail" folders on a retention policy, preventing these folders from accumulating indefinitely. It also removes old entries from the changelog used by synchronisation features such as the IMAP CONDSTORE extension and JMAP, which keeps the synchronisation mechanisms efficient and bounds their storage cost.

Maintenance schedules and retention durations are configured on the [DataRetention](/docs/ref/object/data-retention) singleton (found in the WebUI under <!-- breadcrumb:DataRetention --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry<!-- /breadcrumb:DataRetention -->).

## Schedule

The data-store clean-up schedule is controlled by [`dataCleanupSchedule`](/docs/ref/object/data-retention#datacleanupschedule), which takes a `Cron` value. The default runs daily at 02:00.

For example, to run the clean-up every day at midnight:

```json
{
  "dataCleanupSchedule": {"@type": "Daily", "hour": 0, "minute": 0}
}
```

Related schedules on the same object include [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule) (auto-expunge run frequency, default daily at 00:00) and [`blobCleanupSchedule`](/docs/ref/object/data-retention#blobcleanupschedule) (blob-store clean-up, default daily at 04:00).

## Auto-Expunge

Auto-expunge automates the management of email storage by systematically removing older messages from the "Deleted Items" and "Junk Mail" folders within all user accounts. This keeps mailboxes organised and bounds server storage usage.

The retention period is controlled by [`expungeTrashAfter`](/docs/ref/object/data-retention#expungetrashafter), which expects a duration. The default is `"30d"`: messages older than thirty days are expunged from those folders on the next run of [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule). Setting [`expungeTrashAfter`](/docs/ref/object/data-retention#expungetrashafter) to `null` disables auto-expunge.

For example, to retain deleted and junk messages for thirty days before expunging:

```json
{
  "expungeTrashAfter": "30d"
}
```

## Changes History

Stalwart maintains a changelog, known as the changes history, which is used for synchronisation between the server and client email applications. The changelog is consumed by modern email clients over JMAP and by IMAP clients that support the `CONDSTORE`/`QRESYNC` extensions.

The changes history records modifications to mailboxes and messages, allowing clients to synchronise changes efficiently without fetching a full snapshot of the mailbox state each time. Keeping the changelog bounded conserves disk space and maintains server performance.

The number of changes retained per account is controlled by [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory), which defaults to `10000`. Setting the value to `null` disables the cap.

For example:

```json
{
  "maxChangesHistory": 10000
}
```
