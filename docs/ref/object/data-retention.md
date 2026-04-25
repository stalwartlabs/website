---
title: DataRetention
description: Configures data retention policies, expunge schedules, and archival settings.
custom_edit_url: null
---

# DataRetention

Configures data retention policies, expunge schedules, and archival settings.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry

## Fields


##### `expungeTrashAfter`

> Type: <code>Duration?</code> · default: `"30d"`
>
> How long to keep messages in the Trash and Junk Mail folders before auto-expunging


##### `expungeSubmissionsAfter`

> Type: <code>Duration?</code> · default: `"3d"`
>
> How long to keep sent e-mail submissions before auto-expunging


##### `expungeShareNotifyAfter`

> Type: <code>Duration?</code> · default: `"30d"`
>
> Specifies the duration for which the JMAP share notification history is retained before it is automatically purged.


##### `expungeSchedulingInboxAfter`

> Type: <code>Duration?</code> · default: `"30d"`
>
> Sets the duration after which the iTIP inbox will automatically expunge old messages.


##### `expungeSchedule`

> Type: [<code>Cron</code>](#cron) · default: `{"@type":"Daily","hour":0,"minute":0}`
>
> Specifies when to run the auto-expunge process


##### `dataCleanupSchedule`

> Type: [<code>Cron</code>](#cron) · default: `{"@type":"Daily","hour":2,"minute":0}`
>
> How often to purge the data store. Expects a cron expression.


##### `blobCleanupSchedule`

> Type: [<code>Cron</code>](#cron) · default: `{"@type":"Daily","hour":4,"minute":0}`
>
> How often to purge the data store. Expects a cron expression.


##### `maxChangesHistory`

> Type: <code>UnsignedInt?</code> · default: `10000`
>
> How many changes to keep in the history for each account. This is used to determine the changes that have occurred since the last time the client requested changes.


##### `archiveDeletedItemsFor`

> Type: <code>Duration?</code> · [enterprise](/docs/server/enterprise)
>
> How long to keep deleted items in the archive before they are permanently deleted. If null, deleted items will not be archived and will be permanently deleted immediately.


##### `archiveDeletedAccountsFor`

> Type: <code>Duration?</code> · [enterprise](/docs/server/enterprise)
>
> How long to keep deleted accounts in the archive before they are permanently deleted. If null, deleted accounts will be permanently deleted immediately.


##### `holdMtaReportsFor`

> Type: <code>Duration?</code> · default: `"30d"`
>
> The duration for which MTA reports should be stored before being deleted, or None to disable storage


##### `holdTracesFor`

> Type: <code>Duration?</code> · [enterprise](/docs/server/enterprise) · default: `"30d"`
>
> How long to keep message delivery history before it is permanently deleted.


##### `holdMetricsFor`

> Type: <code>Duration?</code> · [enterprise](/docs/server/enterprise) · default: `"90d"`
>
> How long to keep metrics history before it is permanently deleted.


##### `metricsCollectionInterval`

> Type: [<code>Cron</code>](#cron) · [enterprise](/docs/server/enterprise) · default: `{"@type":"Hourly","minute":0}`
>
> Specifies how often to collect metrics history.



## JMAP API

The DataRetention singleton is available via the `urn:stalwart:jmap` capability.


### `x:DataRetention/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysDataRetentionGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DataRetention/get",
          {
            "ids": [
              "singleton"
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



### `x:DataRetention/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysDataRetentionUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DataRetention/set",
          {
            "update": {
              "singleton": {
                "expungeTrashAfter": "30d"
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get DataRetention
```


### Update

```sh
stalwart-cli update DataRetention --field expungeTrashAfter=30d
```



## Nested types


### Cron {#cron}

Defines a recurring schedule.


- **`Daily`**: Every day. Carries the fields of [`CronDaily`](#crondaily).
- **`Weekly`**: Every week. Carries the fields of [`CronWeekly`](#cronweekly).
- **`Hourly`**: Every hour. Carries the fields of [`CronHourly`](#cronhourly).




#### CronDaily {#crondaily}

A daily recurring schedule at a specific time.



##### `hour`

> Type: <code>UnsignedInt</code> · default: `0` · max: 23
>
> Hour


##### `minute`

> Type: <code>UnsignedInt</code> · default: `0` · max: 59
>
> Minute





#### CronWeekly {#cronweekly}

A weekly recurring schedule on a specific day and time.



##### `day`

> Type: <code>UnsignedInt</code> · default: `0` · max: 6
>
> Day


##### `hour`

> Type: <code>UnsignedInt</code> · default: `0` · max: 23
>
> Hour


##### `minute`

> Type: <code>UnsignedInt</code> · default: `0` · max: 59
>
> Minute





#### CronHourly {#cronhourly}

An hourly recurring schedule at a specific minute.



##### `minute`

> Type: <code>UnsignedInt</code> · default: `0` · max: 59
>
> Minute





