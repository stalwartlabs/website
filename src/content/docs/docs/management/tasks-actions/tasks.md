---
sidebar_position: 2
title: "Tasks"
description: "Background jobs run by Stalwart: the task variants, maintenance operations on accounts, tenants, the store and the spam filter, retry behaviour, and the search index queue."
---

Much of the work of a mail server happens at a later time than the request that caused it. A calendar alarm is due at a set hour, a DMARC report is sent at the end of its reporting period, and a certificate is renewed before it expires. Some work also depends on services that may be unavailable at the moment it is attempted. Stalwart runs all of this as tasks: background jobs that the server stores, runs when they are due and retries when they fail.

Typical tasks send a calendar alarm, deliver an outbound DMARC or TLS report, renew a certificate, delete the data of a removed account, or run a maintenance operation. Each task is a [Task](/docs/ref/object/task) object, found in the WebUI under <!-- breadcrumb:Task --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Scheduled, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Failed<!-- /breadcrumb:Task -->. The object has a variant, which names the job, and a `status`. The status records whether the task is pending, waiting for a retry, stalled after repeated failures, or failed.

A task is deleted when it completes. The list of tasks therefore shows only two kinds of work: work still to be done, and work that failed.

The server creates most tasks itself. Administrators create maintenance tasks, for example to recalculate a quota or retrain the spam classifier, and can reschedule, retry or delete existing tasks. With the CLI, tasks are listed with `stalwart-cli query Task` and created with `stalwart-cli create Task/<Variant>`. Through the management API, the methods are `x:Task/query`, `x:Task/get` and `x:Task/set`. Creating a task requires two permissions: `sysTaskCreate`, and the permission of its variant, `task<Variant>`.

## Maintenance tasks

Maintenance tasks are the tasks that administrators create, to repair or recompute data on demand. There are four variants, one for each scope of work: an account, a tenant, the whole store, or the spam filter.

Every maintenance task takes two fields. `maintenanceType` selects the operation within the variant. `status` is of type `Pending`, with the time at which the task is `due`. A `due` time in the past runs the task at once. The following command recalculates the disk usage of the account `c` immediately:

```sh
stalwart-cli create Task/AccountMaintenance \
  --field accountId=c \
  --field maintenanceType=recalculateQuota \
  --field 'status={"@type":"Pending","due":"2026-10-15T00:00:00Z"}'
```

`AccountMaintenance` operates on one account, named by `accountId`:

| `maintenanceType` | Operation |
|---|---|
| `purge` | Delete expired data of the account, such as messages past their retention |
| `reindex` | Rebuild the account's search index |
| `recalculateImapUid` | Assign new IMAP UIDs to the account's messages |
| `recalculateQuota` | Recompute the account's disk usage |
| `rebuildShares` | Rebuild the sharing index of the items the account has shared |

`TenantMaintenance` operates on one tenant, named by `tenantId` (Enterprise). It has a single operation, `recalculateQuota`, which recomputes the tenant's disk usage.

`StoreMaintenance` operates on the whole store. For sharded stores, `shardIndex` selects the shard to work on:

| `maintenanceType` | Operation |
|---|---|
| `reindexAccounts` | Rebuild the search index of every account, for example after an import |
| `reindexTelemetry` | Rebuild the search index of the stored telemetry |
| `purgeAccounts` | Delete expired data of every account |
| `purgeData`, `purgeBlob` | Purge the data store, or the blob store of unreferenced blobs |
| `resetRateLimiters` | Reset every rate limiter |
| `resetUserQuotas`, `resetTenantQuotas`, `resetBlobQuotas` | Reset the stored usage of all accounts, of all tenants (Enterprise), or the blob quotas |
| `removeAuthTokens` | Delete the temporary ACME and OAuth data, such as pending authorization codes and cached client metadata documents |
| `removeLockQueueMessage`, `removeLockTask`, `removeLockDav` | Delete stale locks of the outbound queue, the task manager or WebDAV |
| `removeGreylist` | Delete every greylisting entry |

`SpamFilterMaintenance` operates on the spam filter and its classifier:

| `maintenanceType` | Operation |
|---|---|
| `train` | Train the classifier with the samples collected since the last training |
| `retrain` | Train the classifier again with every available sample |
| `abort` | Stop a training run in progress |
| `reset` | Delete the classifier model and return to the default state |
| `updateRules` | Download the spam filter rules from the configured source and apply them |

## Tasks created by the server

The other variants are created by the server in the course of normal operation. They rarely need attention unless they fail:

| Variant | Job |
|---|---|
| `CalendarAlarmEmail`, `CalendarAlarmNotification` | Send a calendar alarm by email or as a notification, at the alarm time. `targetAccountId` names the receiving account when it is not the event's owner, and `recurrenceId` the occurrence of a recurring event. |
| `CalendarItipMessage` | Send calendar invitations, replies and updates to their recipients. |
| `MergeThreads` | Merge messages that belong to one conversation into a single thread. |
| `DmarcReportWindow`, `TlsReportWindow` | Close an hourly window of collected DMARC or TLS results and create the aggregate reports for it ([DMARC reports](/docs/mta/reports/dmarc)). These tasks cannot be created by clients. |
| `DmarcReport`, `TlsReport` | Send an aggregate DMARC or TLS report at the end of its reporting period. |
| `RestoreArchivedItem` | Restore an item from the deleted-item archive (Enterprise; [Recovering deleted items](/docs/management/maintenance/deleted-items)). |
| `DestroyAccount` | Delete the data of a removed account; `memberGroupIds` records the groups it belonged to ([Delete an account](/docs/auth/accounts/manage#delete-an-account)). |
| `ShareRevokeCleanup` | Remove the per-user data left after a share has been revoked, for a mailbox, calendar, address book or file node (`objectType`). |
| `AcmeRenewal` | Renew the ACME certificate of a domain. |
| `DkimManagement` | Create or rotate the DKIM keys of a domain. |
| `DnsManagement` | Publish the DNS records of a domain listed in `updateRecords`, and optionally renew its certificate afterwards. |

## Retries

A task can fail for two very different reasons, and the server treats them differently. Some failures may succeed on a later attempt, such as an unreachable DNS provider, ACME server or mail server. Others cannot be fixed by any retry, such as corrupted data, a missing configuration or a request that the remote side rejects as invalid. Retrying the first kind lets a task recover on its own, while retrying the second kind would only repeat the same error.

The status of a task follows these outcomes. A new task starts as `Pending`, with its `due` time.

### Temporary failures

After a failure that may succeed later, the status becomes `Retry`. It records four values:

- `attemptNumber`, the number of failed attempts
- `firstFailedAt`, the time of the first failure
- `failureReason`, the reason of the last failure
- `due`, the time of the next attempt

A task in this state is retried until it succeeds, without a limit on the number of attempts. A task that depends on an external service therefore completes on its own once the service is back.

Endless retries can hide a problem that needs attention, so the server raises an alert after a set number of failures. Once the number of failed attempts reaches [`alertAfter`](/docs/ref/object/task-manager#alertafter), the status becomes `Stalled`, which carries the same fields. `alertAfter` is a field of the [TaskManager](/docs/ref/object/task-manager) singleton, found in the WebUI under <!-- breadcrumb:TaskManager --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> Task Manager<!-- /breadcrumb:TaskManager -->. A stalled task is still retried, but the server logs a `task-manager.task-stalled` event at the `warn` level, once per task, as a signal that the cause of the failures needs attention.

### Permanent failures

A failure that no retry can fix sets the status to `Failed`. The status records `failedAt`, `failedAttemptNumber` and the final `failureReason`, and the server logs a `task-manager.task-failed` event at the `warn` level.

The server never runs a failed task again. The task remains listed in the WebUI until an administrator acts on it, either by fixing the cause and setting its status back to `Pending`, or by deleting it.

### Discarded tasks

Some tasks are discarded instead of retried, because retrying them no longer serves a purpose:

- A task whose work is no longer needed is removed without running, and logs a `task-manager.task-ignored` event. An example is the certificate renewal or DKIM rotation of a domain that has been switched to manual management or deleted.
- Calendar messages lose their value when they arrive too late. Calendar invitations, replies and updates are discarded when their next attempt would fall more than three days after the task was created, and a calendar alarm more than a day overdue is not sent. The server logs a `task-manager.task-expired` event for each.

### Retry delay

The delay between attempts is set by [`strategy`](/docs/ref/object/task-manager#strategy), and the choice is between two shapes:

- `FixedDelay` waits the same `delay` before every attempt.
- `ExponentialBackoff` starts with `initialDelay` and multiplies the delay by `factor` after each failure, up to `maxDelay`, so it retries quickly at first and spaces out the attempts during a long outage. With the optional `jitter`, each delay is chosen at random between half the computed delay and the full delay.

Two cases override the strategy. A failure caused by a conflicting write to the data store is retried within a few seconds for its first three attempts, before the strategy applies. When a remote service names the time after which to try again, the task waits at least that long.

The following value starts after one minute, doubles the delay up to six hours, and marks a task as stalled after five failed attempts:

```json
{
  "alertAfter": 5,
  "strategy": {
    "@type": "ExponentialBackoff",
    "factor": 2.0,
    "initialDelay": 60000,
    "maxDelay": 21600000,
    "jitter": true
  }
}
```

### Changing and deleting tasks

A task cannot be changed or deleted while a node is running it. The attempt fails with `Task is currently being processed and cannot be updated` or `Task is currently being processed and cannot be destroyed`.

The `AcmeRenewal` and `DkimManagement` tasks of a domain under automatic management are protected in the same way. They cannot be deleted while the domain stays under automatic management, and the attempt fails with an error that asks for the domain to be switched to manual certificate or DKIM management first.

Creating an `AcmeRenewal`, `DkimManagement` or maintenance task identical to one already scheduled replaces the existing task. The same job is therefore never scheduled twice for a domain, account or store.

## Search index queue

Search indexing does not use tasks. Changed documents are placed in an index queue per partition, where a partition is an account or a telemetry bucket, and indexed from there ([Search indexing](/docs/storage/indexing)).

The state of each queue is shown as an [IndexQueueStatus](/docs/ref/object/index-queue-status) object, found in the WebUI under <!-- breadcrumb:IndexQueueStatus --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Index Queue<!-- /breadcrumb:IndexQueueStatus -->. The object shows:

- The `index` the queue belongs to, and its `partition`
- The number of `queuedUpdates` and `queuedDeletions`, counted up to 10,000 per request
- The `status` of the queue

Setting the `status` of a failed queue to `Running` retries it immediately. Reading and changing the queues requires the `sysIndexQueueStatusGet`, `sysIndexQueueStatusQuery` and `sysIndexQueueStatusUpdate` permissions.
