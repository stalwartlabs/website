---
title: Task
description: Represents a background task scheduled for execution.
custom_edit_url: null
---

# Task

Represents a background task scheduled for execution.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Scheduled<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Failed

## Fields

Task is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "IndexDocument"`

Index document


##### `documentType`

> Type: [<code>IndexDocumentType</code>](#indexdocumenttype) · read-only
>
> Type of document associated with the task


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account associated with this task


##### `documentId`

> Type: <code>Id</code> · read-only
>
> Identifier of the document associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "UnindexDocument"`

Unindex document


##### `documentType`

> Type: [<code>IndexDocumentType</code>](#indexdocumenttype) · read-only
>
> Type of document associated with the task


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account associated with this task


##### `documentId`

> Type: <code>Id</code> · read-only
>
> Identifier of the document associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "IndexTrace"`

Index telemetry trace


##### `traceId`

> Type: <code>Id&lt;</code>[<code>Trace</code>](/docs/ref/object/trace)<code>&gt;</code> · read-only
>
> Identifier of the trace associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "CalendarAlarmEmail"`

Calendar alarm e-mail


##### `alarmId`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Identifier of the calendar alarm associated with this task


##### `eventId`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Identifier of the calendar event associated with this task


##### `eventStart`

> Type: <code>UTCDateTime</code> · server-set
>
> Start date and time of the calendar event


##### `eventEnd`

> Type: <code>UTCDateTime</code> · server-set
>
> End date and time of the calendar event


##### `eventStartTz`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Timezone identifier for the start date and time


##### `eventEndTz`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Timezone identifier for the end date and time


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account associated with this task


##### `documentId`

> Type: <code>Id</code> · read-only
>
> Identifier of the document associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "CalendarAlarmNotification"`

Calendar alarm notification


##### `alarmId`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Identifier of the calendar alarm associated with this task


##### `eventId`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Identifier of the calendar event associated with this task


##### `recurrenceId`

> Type: <code>Integer?</code> · server-set
>
> Recurrence identifier for the alarm, if applicable


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account associated with this task


##### `documentId`

> Type: <code>Id</code> · read-only
>
> Identifier of the document associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "CalendarItipMessage"`

Calendar iTIP message


##### `messages`

> Type: [<code>TaskCalendarItipContents</code>](#taskcalendaritipcontents)<code>[]</code> · server-set
>
> List of iTIP messages associated with this task


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account associated with this task


##### `documentId`

> Type: <code>Id</code> · read-only
>
> Identifier of the document associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "MergeThreads"`

Merge email threads


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · server-set
>
> Identifier of the account associated with this task


##### `threadName`

> Type: <code>String</code> · server-set
>
> Name of the thread to be merged


##### `messageIds`

> Type: <code>String[]</code> · server-set
>
> Message-IDs of the email messages to be merged into the thread


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "DmarcReport"`

Send DMARC report to remote server


##### `reportId`

> Type: <code>Id&lt;</code>[<code>DmarcInternalReport</code>](/docs/ref/object/dmarc-internal-report)<code>&gt;</code> · server-set
>
> Identifier for the DMARC aggregate report associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "TlsReport"`

Send TLS report to remote server


##### `reportId`

> Type: <code>Id&lt;</code>[<code>TlsInternalReport</code>](/docs/ref/object/tls-internal-report)<code>&gt;</code> · server-set
>
> Identifier for the TLS aggregate report associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "RestoreArchivedItem"`

Restore archived item


##### `blobId`

> Type: <code>BlobId</code> · server-set
>
> Identifier of the archived blob to be restored


##### `archivedItemType`

> Type: [<code>ArchivedItemType</code>](#archiveditemtype) · server-set
>
> Type of the archived item associated with the blob


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Timestamp when the item was originally created


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · server-set
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · server-set
>
> Identifier of the account to which the archived item belongs


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "DestroyAccount"`

Destroy account and all associated data


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · server-set
>
> Identifier of the account to be destroyed


##### `accountName`

> Type: <code>String</code> · required
>
> Name of the account to be destroyed


##### `accountDomainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](/docs/ref/object/domain)<code>&gt;</code> · required
>
> Domain identifier of the account to be destroyed, if applicable


##### `accountType`

> Type: [<code>AccountType</code>](#accounttype) · server-set
>
> Type of the deleted account (user or group)


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "AccountMaintenance"`

Perform account maintenance operations


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier of the account to be maintained


##### `maintenanceType`

> Type: [<code>TaskAccountMaintenanceType</code>](#taskaccountmaintenancetype) · read-only
>
> Type of maintenance operation to perform on the account


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "TenantMaintenance"`

Perform tenant maintenance operations


##### `tenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;</code> · read-only
>
> Identifier of the tenant to be maintained


##### `maintenanceType`

> Type: [<code>TaskTenantMaintenanceType</code>](#tasktenantmaintenancetype) · read-only
>
> Type of maintenance operation to perform on the tenant


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "StoreMaintenance"`

Perform store maintenance operations


##### `maintenanceType`

> Type: [<code>TaskStoreMaintenanceType</code>](#taskstoremaintenancetype) · read-only
>
> Type of maintenance operation to perform on the store


##### `shardIndex`

> Type: <code>UnsignedInt?</code>
>
> Index of the shard to perform maintenance on, if applicable for the maintenance type


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "SpamFilterMaintenance"`

Perform spam filter maintenance operations


##### `maintenanceType`

> Type: [<code>TaskSpamFilterMaintenanceType</code>](#taskspamfiltermaintenancetype) · read-only
>
> Type of maintenance operation to perform on the spam filter


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "AcmeRenewal"`

Perform ACME certificate renewal for a domain


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](/docs/ref/object/domain)<code>&gt;</code> · read-only
>
> Identifier of the domain associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "DkimManagement"`

Perform DKIM key rotation for a domain


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](/docs/ref/object/domain)<code>&gt;</code> · read-only
>
> Identifier of the domain associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task



### `@type: "DnsManagement"`

Perform DNS management for a domain


##### `updateRecords`

> Type: [<code>DnsRecordType</code>](#dnsrecordtype)<code>[]</code>
>
> Which DNS records should be updated for the domain as part of this task


##### `onSuccessRenewCertificate`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to automatically renew the domain's TLS certificate using ACME after successfully updating DNS records


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](/docs/ref/object/domain)<code>&gt;</code> · read-only
>
> Identifier of the domain associated with this task


##### `status`

> Type: [<code>TaskStatus</code>](#taskstatus) · required
>
> Current status of the task


##### `due`

> Type: <code>UTCDateTime?</code> · server-set
>
> Due date and time for the task




## JMAP API

The Task object is available via the `urn:stalwart:jmap` capability.


### `x:Task/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysTaskGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Task/get",
          {
            "ids": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:Task/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysTaskCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Task/set",
          {
            "create": {
              "new1": {
                "@type": "IndexDocument",
                "status": {
                  "@type": "Pending",
                  "due": "2026-01-01T00:00:00Z"
                }
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Update

This operation requires the `sysTaskUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Task/set",
          {
            "update": {
              "id1": {
                "status": {
                  "@type": "Pending",
                  "due": "2026-01-01T00:00:00Z"
                }
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Destroy

This operation requires the `sysTaskDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Task/set",
          {
            "destroy": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




### `x:Task/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysTaskQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Task/query",
          {
            "filter": {
              "@type": "value"
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




The `x:Task/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `@type` | enum: TaskType |
| `status` | enum: TaskStatusType |
| `due` | date |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Task id1
```


### Create

```sh
stalwart-cli create Task/IndexDocument \
  --field 'status={"@type":"Pending","due":"2026-01-01T00:00:00Z"}'
```


### Query

```sh
stalwart-cli query Task
stalwart-cli query Task --where @type=value
```


### Update

```sh
stalwart-cli update Task id1 --field status='{"@type":"Pending","due":"2026-01-01T00:00:00Z"}'
```


### Delete

```sh
stalwart-cli delete Task --ids id1
```



## Nested types


### TaskStatus

Execution status of a background task.


- **`Pending`**: Pending task awaiting execution. Carries the fields of [`TaskStatusPending`](#taskstatuspending).
- **`Retry`**: Task scheduled for retry. Carries the fields of [`TaskStatusRetry`](#taskstatusretry).
- **`Failed`**: Failed task. Carries the fields of [`TaskStatusFailed`](#taskstatusfailed).




#### TaskStatusPending

Pending task status details.



##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Date and time when the task was created


##### `due`

> Type: <code>UTCDateTime</code> · required
>
> Due date and time for the task





#### TaskStatusRetry

Task retry status details.



##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Date and time when the task was created


##### `due`

> Type: <code>UTCDateTime</code> · required
>
> Due date and time for the task


##### `attemptNumber`

> Type: <code>UnsignedInt</code> · default: `1`
>
> Number of attempts made to complete the task


##### `failureReason`

> Type: <code>Text</code> · required
>
> Reason for the last failure





#### TaskStatusFailed

Failed task status details.



##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Date and time when the task was created


##### `failedAt`

> Type: <code>UTCDateTime</code> · required
>
> Date and time when the task failed


##### `failedAttemptNumber`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of attempts made before the task failed


##### `failureReason`

> Type: <code>Text</code> · required
>
> Reason for task failure





### TaskCalendarItipContents

Contents of an iTIP message to be delivered.



##### `from`

> Type: <code>EmailAddress</code> · server-set
>
> Email address of the sender of the iTIP message


##### `to`

> Type: <code>EmailAddress[]</code> · server-set
>
> Email addresses of the recipients of the iTIP message


##### `isFromOrganizer`

> Type: <code>Boolean</code> · server-set · default: `false`
>
> Indicates whether the sender is the organizer of the calendar event


##### `iCalendarData`

> Type: <code>String</code> · server-set
>
> iCalendar data associated with the iTIP message


##### `summary`

> Type: <code>String</code> · server-set
>
> Summary of the calendar event associated with the iTIP message





## Enums


### IndexDocumentType



| Value | Label |
|---|---|
| `email` | Email |
| `calendar` | Calendar |
| `contacts` | Contacts |
| `file` | File |


### ArchivedItemType



| Value | Label |
|---|---|
| `Email` | Archived Email message |
| `FileNode` | Archived File |
| `CalendarEvent` | Archived Calendar Event |
| `ContactCard` | Archived Contact Card |
| `SieveScript` | Archived Sieve Script |


### AccountType



| Value | Label |
|---|---|
| `User` | User account |
| `Group` | Group account |


### TaskAccountMaintenanceType



| Value | Label |
|---|---|
| `purge` | Purge expired data from the account |
| `reindex` | Reindex the account's data for search |
| `recalculateImapUid` | Recalculate IMAP UIDs for the account's email messages |
| `recalculateQuota` | Recalculate storage quota usage for the account |


### TaskTenantMaintenanceType



| Value | Label |
|---|---|
| `recalculateQuota` | Recalculate storage quota usage for the tenant |


### TaskStoreMaintenanceType



| Value | Label |
|---|---|
| `reindexAccounts` | Reindex all accounts' data for search |
| `reindexTelemetry` | Reindex all telemetry data for search |
| `purgeAccounts` | Purge expired data from all accounts |
| `purgeData` | Purge data store |
| `purgeBlob` | Purge blob store |
| `resetRateLimiters` | Reset all rate limiters |
| `resetUserQuotas` | Reset all user quotas |
| `resetTenantQuotas` | Reset all tenant quotas |
| `resetBlobQuotas` | Reset all blob quotas |
| `removeAuthTokens` | Delete all temporary ACME and OAuth tokens |
| `removeLockQueueMessage` | Delete all MTA queue message locks |
| `removeLockTask` | Delete all task manager locks |
| `removeLockDav` | Delete all DAV locks |
| `removeSieveId` | Delete all Sieve vacation and duplicate ID lists |
| `removeGreylist` | Delete all spam filter grey list entries |


### TaskSpamFilterMaintenanceType



| Value | Label |
|---|---|
| `train` | Train the spam classifier with the latest samples |
| `retrain` | Retrain the spam classifier with all available samples |
| `abort` | Abort the ongoing training process of the spam classifier |
| `reset` | Delete the spam classifier's model and reset it to the default state |
| `updateRules` | Download and update the spam filter rules from the configured source |


### DnsRecordType



| Value | Label |
|---|---|
| `dkim` | DKIM public keys |
| `tlsa` | TLSA records |
| `spf` | SPF records |
| `mx` | MX records |
| `dmarc` | DMARC policy |
| `srv` | SRV records |
| `mtaSts` | MTA-STS policy record |
| `tlsRpt` | TLS reporting record |
| `caa` | CAA records |
| `autoConfig` | Autoconfig records |
| `autoConfigLegacy` | Legacy Autoconfig records |
| `autoDiscover` | Microsoft Autodiscover records |


