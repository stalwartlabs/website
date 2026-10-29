---
title: "Recovering deleted items"
description: "Recover messages and other items deleted by users, after they have been expunged, from the deleted-item archive."
sidebar_position: 3
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Users delete things by mistake, and often notice only after the item has gone from every folder. The deleted-item archive covers that case. It keeps the items that users have deleted for a set period, so that they can be restored after a mistake. This includes messages that have already been expunged from the Deleted Items or Junk folder.

The archive holds messages, files, calendar events, contact cards and Sieve scripts. It is kept on the server's own stores, so it is lost together with them, and it is not a substitute for a [backup](/docs/management/maintenance/backup).

## Enable the archive

The archive is off until a retention period is set. The period is set by [`archiveDeletedItemsFor`](/docs/ref/object/data-retention#archivedeleteditemsfor) on the [DataRetention](/docs/ref/object/data-retention) singleton, in the WebUI under Settings › Storage › Data Retention › Archiving, and is given in milliseconds. When the field is empty, which is the default, deleted items are removed at once and nothing is archived. Setting a duration is therefore what enables the archive.

The choice of period is a balance: a longer period gives users more time to notice a mistake, and keeps deleted items on the stores for longer. The following value keeps deleted items for 30 days:

```json
{
  "archiveDeletedItemsFor": 2592000000
}
```

Deleted accounts have a similar setting. [`archiveDeletedAccountsFor`](/docs/ref/object/data-retention#archivedeletedaccountsfor) delays the deletion of the data of deleted accounts ([Delete an account](/docs/auth/accounts/manage#delete-an-account)), so that an account can be restored during that period. [Restore a deleted account](#restore-a-deleted-account) describes how.

## Restore an item

Each archived item is an [ArchivedItem](/docs/ref/object/archived-item) object of the account it belongs to. The object records two times: when the item was archived (`archivedAt`), and when it will be deleted permanently (`archivedUntil`).

Users see the archived items of their own account in the [Account Manager](/docs/management/webui/account-manager), under <!-- breadcrumb:ArchivedItem --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg> Archived Items<!-- /breadcrumb:ArchivedItem -->. Administrators use the same list, which shows one account at a time: their own, unless they choose another account in the Account filter. Over JMAP, the same filter is an `accountId` condition in `x:ArchivedItem/query`:

```json
["x:ArchivedItem/query", {
  "filter": {"accountId": "b"}
}, "0"]
```

The filter is honoured only for administrators with the [`impersonate`](/docs/ref/permissions) permission. For anyone else the server ignores it and lists the items of their own account.

To restore an item, set its `status` to `requestRestore`, either in the WebUI or with an `x:ArchivedItem/set` update. The server then creates a `RestoreArchivedItem` task, which puts the item back into the account ([Tasks](/docs/management/tasks-actions/tasks)). The following update requests the restoration of the item with id `e`:

```json
["x:ArchivedItem/set", {
  "update": {
    "e": {"status": "requestRestore"}
  }
}, "0"]
```

Deleting an ArchivedItem works differently: it removes the item from the archive permanently.

Reading, changing and deleting archived items require the `sysArchivedItemGet`, `sysArchivedItemQuery`, `sysArchivedItemUpdate` and `sysArchivedItemDestroy` permissions. The default User role holds them for the user's own items, which is what lets users recover their own mail.

## Restore a deleted account

A deleted account remains restorable until its data is deleted. Deleting an account does not remove its data at once. It schedules a `DestroyAccount` [task](/docs/management/tasks-actions/tasks) that is due when the `archiveDeletedAccountsFor` period ends. Deleting that task before it runs restores the account.

The server then re-creates the account with its original id, name and domain, so its mailboxes, messages, calendars, contacts and files are available again. It also schedules a task that rebuilds the account's share index.

The restoration is partial. The other fields of the account are not restored: credentials, group memberships and the remaining settings take their default values, and must be set again before the account is used.

The pending task is listed in the WebUI under <!-- breadcrumb:Task --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Scheduled, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Failed<!-- /breadcrumb:Task -->, and can also be found with the CLI. The following commands list the pending account deletions, whose `accountName` identifies the account, and delete the task with id `b`:

```sh
stalwart-cli query Task --where @type=DestroyAccount
stalwart-cli delete Task --ids b
```

Two failures are possible. A task that is already running cannot be deleted, and the request fails with `Task is currently being processed and cannot be destroyed`. The restoration itself fails with `Account recovery failed` when the account cannot be re-created, for example because another account now has its name.

Deleting a `DestroyAccount` task requires the `taskDestroyAccount` permission.
