---
sidebar_position: 3
---

# Tasks

A Task is a background job scheduled for execution. Tasks cover the recurring or deferred work the server performs outside the request path: search indexing, calendar alarm dispatch, outbound DMARC and TLS reports, account destruction, store and spam filter maintenance, ACME renewal, DKIM key rotation, and DNS record updates. Each scheduled job is represented as a [Task](/docs/ref/object/task) object (found in the WebUI under <!-- breadcrumb:Task --><!-- /breadcrumb:Task -->) of one of the variants described below, and whose [`status`](/docs/ref/object/task#status) records whether the task is pending, awaiting retry, or has failed permanently.

Tasks are visible and manageable from the [WebUI](/docs/management/webui/overview) (Management › Tasks › Scheduled and Management › Tasks › Failed), through the [CLI](/docs/management/cli/overview) using `stalwart-cli get task`, `stalwart-cli query task`, and `stalwart-cli create task/<variant-name>`, and over the JMAP API through the `x:Task/get`, `x:Task/query`, and `x:Task/set` methods. Administrators can reschedule, retry, or destroy individual tasks through the same interfaces.

## Variants

Every variant of the [Task](/docs/ref/object/task) object carries a [`status`](/docs/ref/object/task#status) and a [`due`](/docs/ref/object/task#due) timestamp; variants specific to an account, domain, or other object carry the corresponding identifier. The full schema for each is on the reference page.

### Index document

The `IndexDocument` variant indexes a single document for search. The caller supplies the owning [`accountId`](/docs/ref/object/task#accountid), the [`documentId`](/docs/ref/object/task#documentid), and the [`documentType`](/docs/ref/object/task#documenttype), which selects between email, calendar, contacts, and file.

### Unindex document

The `UnindexDocument` variant removes a single document from the search index. The caller supplies the owning [`accountId`](/docs/ref/object/task#accountid), the [`documentId`](/docs/ref/object/task#documentid), and the [`documentType`](/docs/ref/object/task#documenttype) matching the previously indexed document.

### Index trace

The `IndexTrace` variant indexes a telemetry trace so that it becomes queryable. The caller supplies the [`traceId`](/docs/ref/object/task#traceid) of the trace to index.

### Calendar alarm email

The `CalendarAlarmEmail` variant sends the email notification for a calendar alarm at the scheduled time. The server populates the alarm and event identifiers together with the event start and end timestamps and their timezone identifiers, and records the owning [`accountId`](/docs/ref/object/task#accountid) and [`documentId`](/docs/ref/object/task#documentid) of the calendar event.

### Calendar alarm notification

The `CalendarAlarmNotification` variant delivers the in-app notification for a calendar alarm at the scheduled time. Alongside the alarm and event identifiers, the server records an optional [`recurrenceId`](/docs/ref/object/task#recurrenceid) when the alarm targets a specific occurrence of a recurring event.

### Calendar iTIP message

The `CalendarItipMessage` variant delivers one or more iTIP messages for a calendar event to their recipients. The server populates [`messages`](/docs/ref/object/task#messages) with the per-recipient iTIP payloads together with the owning [`accountId`](/docs/ref/object/task#accountid) and [`documentId`](/docs/ref/object/task#documentid).

### Merge threads

The `MergeThreads` variant merges email messages that share a thread identifier into a single thread. The server records the owning [`accountId`](/docs/ref/object/task#accountid), the [`threadName`](/docs/ref/object/task#threadname), and the list of [`messageIds`](/docs/ref/object/task#messageids) to fold into the thread.

### DMARC report

The `DmarcReport` variant submits a DMARC aggregate report to the remote reporting address for a reporting window. The task carries the [`reportId`](/docs/ref/object/task#reportid) of the internal report object holding the aggregated data.

### TLS report

The `TlsReport` variant submits a TLS aggregate report to the remote reporting address for a reporting window. The task carries the [`reportId`](/docs/ref/object/task#reportid) of the internal TLS report object holding the aggregated data.

### Restore archived item

The `RestoreArchivedItem` variant restores an archived item into the owning account before its archive retention expires. The task carries the [`blobId`](/docs/ref/object/task#blobid) of the archived payload, the [`archivedItemType`](/docs/ref/object/task#archiveditemtype) (email, file, calendar event, contact card, or Sieve script), the original [`createdAt`](/docs/ref/object/task#createdat) timestamp, the [`archivedUntil`](/docs/ref/object/task#archiveduntil) deadline after which the item is deleted permanently, and the destination [`accountId`](/docs/ref/object/task#accountid).

### Destroy account

The `DestroyAccount` variant permanently deletes an account and all data associated with it. The caller supplies the [`accountName`](/docs/ref/object/task#accountname) and [`accountDomainId`](/docs/ref/object/task#accountdomainid); the server records the resolved [`accountId`](/docs/ref/object/task#accountid) and [`accountType`](/docs/ref/object/task#accounttype), either user or group.

### Account maintenance

The `AccountMaintenance` variant runs a per-account maintenance operation selected by [`maintenanceType`](/docs/ref/object/task#maintenancetype): purging expired data, reindexing for search, recalculating IMAP UIDs, or recalculating storage quota usage. The task carries the owning [`accountId`](/docs/ref/object/task#accountid).

### Tenant maintenance

The `TenantMaintenance` variant runs a per-tenant maintenance operation selected by [`maintenanceType`](/docs/ref/object/task#maintenancetype); currently, the only operation is recalculating tenant-wide storage quota usage. The task carries the owning [`tenantId`](/docs/ref/object/task#tenantid).

### Store maintenance

The `StoreMaintenance` variant runs a store-wide maintenance operation selected by [`maintenanceType`](/docs/ref/object/task#maintenancetype): reindexing all accounts or telemetry data, purging the data or blob stores, resetting user, tenant, or blob quotas, resetting rate limiters, or removing stale ACME and OAuth tokens, MTA queue locks, task manager locks, DAV locks, Sieve vacation and duplicate ID lists, or greylist entries. For sharded stores, an optional [`shardIndex`](/docs/ref/object/task#shardindex) selects the target shard.

### Spam filter maintenance

The `SpamFilterMaintenance` variant operates on the spam classifier according to [`maintenanceType`](/docs/ref/object/task#maintenancetype): training on the latest samples, retraining on all available samples, aborting an ongoing training run, resetting the classifier model to its default state, or downloading and applying rule updates from the configured source.

### ACME renewal

The `AcmeRenewal` variant renews the ACME-issued TLS certificate for a domain. The task carries the target [`domainId`](/docs/ref/object/task#domainid).

### DKIM rotation

The `DkimManagement` variant performs DKIM key rotation for a domain. The task carries the target [`domainId`](/docs/ref/object/task#domainid).

### DNS record update

The `DnsManagement` variant updates one or more DNS record types for a domain. The [`updateRecords`](/docs/ref/object/task#updaterecords) field selects from DKIM public keys, TLSA, SPF, MX, DMARC, SRV, MTA-STS, TLS-RPT, CAA, Autoconfig (including the legacy variant), and Microsoft Autodiscover records, and [`onSuccessRenewCertificate`](/docs/ref/object/task#onsuccessrenewcertificate) optionally triggers an ACME renewal after a successful update. The task carries the target [`domainId`](/docs/ref/object/task#domainid).

## Retry status

Every task carries a [`status`](/docs/ref/object/task#status) field drawn from the `TaskStatus` nested type. A task awaiting its first execution is `Pending` and carries a [`due`](/docs/ref/object/task#taskstatuspending) timestamp. A task that has failed but is still within its retry budget becomes `Retry` and records the [`attemptNumber`](/docs/ref/object/task#taskstatusretry) and the [`failureReason`](/docs/ref/object/task#taskstatusretry) from the last attempt. A task that has exhausted its retry budget becomes `Failed` and records the [`failedAt`](/docs/ref/object/task#taskstatusfailed) timestamp, the [`failedAttemptNumber`](/docs/ref/object/task#taskstatusfailed), and the terminal [`failureReason`](/docs/ref/object/task#taskstatusfailed).

## Task Manager

Global settings controlling how tasks are retried are held on the [TaskManager](/docs/ref/object/task-manager) singleton (found in the WebUI under <!-- breadcrumb:TaskManager --><!-- /breadcrumb:TaskManager -->). The relevant fields are:

- [`maxAttempts`](/docs/ref/object/task-manager#maxattempts): maximum number of attempts for a task before it is marked as permanently failed. Default `3`, minimum `1`.
- [`strategy`](/docs/ref/object/task-manager#strategy): retry strategy applied to failed tasks. Either the `ExponentialBackoff` variant, configured with a [`factor`](/docs/ref/object/task-manager#taskretrystrategybackoff), an [`initialDelay`](/docs/ref/object/task-manager#taskretrystrategybackoff), a [`maxDelay`](/docs/ref/object/task-manager#taskretrystrategybackoff), and an optional [`jitter`](/docs/ref/object/task-manager#taskretrystrategybackoff) toggle, or the `FixedDelay` variant, configured with a single [`delay`](/docs/ref/object/task-manager#taskretrystrategyfixed).
- [`totalDeadline`](/docs/ref/object/task-manager#totaldeadline): total time budget across all attempts before a task is marked as failed regardless of remaining attempts. Default `"6h"`.

Example using exponential backoff with jitter:

```json
{
  "maxAttempts": 5,
  "strategy": {
    "@type": "ExponentialBackoff",
    "factor": 2.0,
    "initialDelay": "1m",
    "maxDelay": "30m",
    "jitter": true
  },
  "totalDeadline": "6h"
}
```

TaskManager settings are read through `x:TaskManager/get` with id `singleton` and updated through `x:TaskManager/set` (only the `update` argument is accepted). The CLI equivalents are `stalwart-cli get task-manager` and `stalwart-cli update task-manager`. Access is gated by the `sysTaskManagerGet` and `sysTaskManagerUpdate` permissions.
