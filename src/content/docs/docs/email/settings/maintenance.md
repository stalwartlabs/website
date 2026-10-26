---
sidebar_position: 5
title: "Mail retention"
description: "Automatic expunging of the Trash and Junk folders, retention of sent submissions, and the change history used by JMAP and IMAP clients to synchronise."
---

Without limits, mailboxes and their synchronisation history grow for as long as an account exists. Messages pile up in the Trash and Junk folders, records of sent messages accumulate, and the history that clients use to synchronise keeps growing. Stalwart therefore removes old messages from the Trash and Junk folders, old email submissions and old entries of the change history on a schedule.

The settings that control these processes for mail are part of the [DataRetention](/docs/ref/object/data-retention) singleton, found in the WebUI under <!-- breadcrumb:DataRetention --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry<!-- /breadcrumb:DataRetention -->. The same singleton also holds the retention settings of other data types. When and how the freed disk space is returned to the file system is described in [Data retention and reclaiming disk space](/docs/storage/maintenance).

## Retention settings for mail

Each kind of mail data has its own retention setting, and each removes something different:

| Field | Default | What is removed |
|---|---|---|
| [`expungeTrashAfter`](/docs/ref/object/data-retention#expungetrashafter) | <!-- default:DataRetention.expungeTrashAfter -->30 days<!-- /default --> | Messages in the Trash and Junk folders, once they have been there for longer than this period. |
| [`expungeSubmissionsAfter`](/docs/ref/object/data-retention#expungesubmissionsafter) | <!-- default:DataRetention.expungeSubmissionsAfter -->3 days<!-- /default --> | JMAP email submission records, which track the delivery of messages sent through JMAP. The sent messages themselves are not affected. |
| [`maxChangesHistory`](/docs/ref/object/data-retention#maxchangeshistory) | <!-- default:DataRetention.maxChangesHistory -->10000<!-- /default --> | Entries of the change history beyond this number, per account. |
| [`archiveDeletedItemsFor`](/docs/ref/object/data-retention#archivedeleteditemsfor) | unset | When set, expunged messages are kept in an archive for this period and can be recovered (Enterprise edition). |

Durations are given in milliseconds. Each setting can also be turned off. Setting `expungeTrashAfter` or `expungeSubmissionsAfter` to `null` disables that expiry, and setting `maxChangesHistory` to `null` keeps the full history.

The settings take effect through a scheduled process, auto-expunge, rather than continuously. The process runs at [`expungeSchedule`](/docs/ref/object/data-retention#expungeschedule), <!-- default:DataRetention.expungeSchedule -->daily at 00:00<!-- /default --> unless changed, and processes every account. It deletes the qualifying messages from the Trash and Junk folders, removes expired submissions, and truncates the change history. The following object body keeps messages in the Trash and Junk folders for 14 days, and runs the process at 03:30:

```json
{
  "expungeTrashAfter": 1209600000,
  "expungeSchedule": {"@type": "Daily", "hour": 3, "minute": 30}
}
```

## Deleting and expunging

Deleting a message and removing it from the server are different steps, and clients reach the second step in different ways. A message that a user deletes in a mail client is normally moved to the Trash folder. It stays there until the user empties the folder, or auto-expunge removes it.

The protocols also allow more direct removal. An IMAP client can mark a message with the `\Deleted` flag, in which case the message remains in its folder until the client issues `EXPUNGE` or `CLOSE`. A JMAP client destroys a message directly with `Email/set`. In each case, the message is removed from the account as soon as it is expunged, and its size is credited to the account's [quota](/docs/auth/authorization/quotas) at once.

Expunging is final unless the deleted-item archive is enabled. When [`archiveDeletedItemsFor`](/docs/ref/object/data-retention#archivedeleteditemsfor) is set, expunged messages are kept for that period and can be restored, as described in [Recovering deleted items](/docs/management/maintenance/deleted-items).

:::tip[Enterprise feature]
The deleted-item archive is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Change history

JMAP and IMAP clients synchronise incrementally. Instead of downloading a mailbox again, they ask the server what has changed since a state they saw before. JMAP clients use the `/changes` methods, and IMAP clients use the CONDSTORE and QRESYNC extensions. The server answers from the change history it keeps for each account.

`maxChangesHistory` bounds the number of entries kept per account, and the bound has a consequence for clients that stay away too long. A client whose last known state is older than the oldest entry still kept cannot be told what changed. A JMAP client receives a `cannotCalculateChanges` error, and resynchronises the affected data in full. An IMAP client has to fetch the state of the mailbox again.

The value is therefore a trade-off between storage and synchronisation cost. Raising it lets clients that connect rarely, or accounts with frequent changes, synchronise incrementally for longer, at the cost of more storage per account.
