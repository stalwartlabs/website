---
title: "IndexQueueStatus"
description: "Represents the processing state of a search index queue."
custom_edit_url: null
---

Represents the processing state of a search index queue.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="IndexQueueStatus"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Index Queue</span>

## Fields


##### `index`

> Type: [<code>IndexType</code>](#indextype) · server-set
>
> Search index the queue belongs to


##### `partition`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Account or telemetry bucket the queued documents belong to


##### `queuedUpdates`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Number of documents awaiting indexing


##### `queuedDeletions`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Number of documents awaiting deletion from the index


##### `status`

> Type: [<code>IndexStatus</code>](#indexstatus) · default: `{"@type":"Running"}`
>
> Current processing state of the queue



## JMAP API

The IndexQueueStatus object is available via the `urn:stalwart:jmap` capability.


### `x:IndexQueueStatus/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysIndexQueueStatusGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:IndexQueueStatus/get",
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



### `x:IndexQueueStatus/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the update operation only.


This method requires the `sysIndexQueueStatusUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:IndexQueueStatus/set",
          {
            "update": {
              "id1": {
                "status": {
                  "@type": "Running"
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



### `x:IndexQueueStatus/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysIndexQueueStatusQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:IndexQueueStatus/query",
          {
            "filter": {}
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get IndexQueueStatus id1
```


### Query

```sh
stalwart-cli query IndexQueueStatus
```


### Update

```sh
stalwart-cli update IndexQueueStatus id1 --field status='{"@type":"Running"}'
```



## Nested types


### IndexStatus

Processing state of a search index queue.


- **`Running`**: Queue is being processed normally. No additional fields.
- **`Failed`**: Last indexing attempt failed. Carries the fields of [`IndexStatusFailed`](#indexstatusfailed).




#### IndexStatusFailed

Details of the last failed indexing attempt.



##### `reason`

> Type: <code>Text</code> · required
>
> Error reported by the last indexing attempt


##### `nextRetry`

> Type: <code>UTCDateTime</code> · required
>
> Date and time when indexing will be retried





## Enums


### IndexType



| Value | Label |
|---|---|
| `telemetry` | Telemetry |
| `email` | Email |
| `calendar` | Calendar |
| `contacts` | Contacts |
| `file` | File |


