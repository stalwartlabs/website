---
title: ClusterRole
description: Defines a cluster node role with enabled tasks and listeners.
custom_edit_url: null
---

# ClusterRole

Defines a cluster node role with enabled tasks and listeners.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Roles

## Fields


##### `name`

> Type: <code>String</code> · read-only
>
> Unique identifier for the role


##### `description`

> Type: <code>String?</code>
>
> Description of the role


##### `tasks`

> Type: [<code>ClusterTaskGroup</code>](#clustertaskgroup) · required
>
> Which tasks are enabled for this cluster role


##### `listeners`

> Type: [<code>ClusterListenerGroup</code>](#clusterlistenergroup) · required
>
> Which network listeners are enabled for this cluster role



## JMAP API

The ClusterRole object is available via the `urn:stalwart:jmap` capability.


### `x:ClusterRole/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysClusterRoleGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ClusterRole/get",
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



### `x:ClusterRole/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysClusterRoleCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ClusterRole/set",
          {
            "create": {
              "new1": {
                "listeners": {
                  "@type": "EnableAll"
                },
                "tasks": {
                  "@type": "EnableAll"
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

This operation requires the `sysClusterRoleUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ClusterRole/set",
          {
            "update": {
              "id1": {
                "description": "updated value"
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

This operation requires the `sysClusterRoleDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ClusterRole/set",
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




### `x:ClusterRole/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysClusterRoleQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ClusterRole/query",
          {
            "filter": {
              "name": "example"
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




The `x:ClusterRole/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get ClusterRole id1
```


### Create

```sh
stalwart-cli create ClusterRole \
  --field 'tasks={"@type":"EnableAll"}' \
  --field 'listeners={"@type":"EnableAll"}'
```


### Query

```sh
stalwart-cli query ClusterRole
stalwart-cli query ClusterRole --where name=example
```


### Update

```sh
stalwart-cli update ClusterRole id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete ClusterRole --ids id1
```



## Nested types


### ClusterTaskGroup

Defines which cluster tasks are enabled for a cluster role.


- **`EnableAll`**: Enable all tasks. No additional fields.
- **`DisableAll`**: Disable all tasks. No additional fields.
- **`EnableSome`**: Enable some tasks. Carries the fields of [`ClusterTaskGroupProperties`](#clustertaskgroupproperties).
- **`DisableSome`**: Disable some tasks. Carries the fields of [`ClusterTaskGroupProperties`](#clustertaskgroupproperties).




#### ClusterTaskGroupProperties

Specifies which tasks are enabled or disabled.



##### `taskTypes`

> Type: [<code>ClusterTaskType</code>](#clustertasktype)<code>[]</code>
>
> Tasks to enable or disable for this group





### ClusterListenerGroup

Defines which network listeners are enabled for a cluster role.


- **`EnableAll`**: Enable all network listeners. No additional fields.
- **`DisableAll`**: Disable all network listeners. No additional fields.
- **`EnableSome`**: Enable some network listeners. Carries the fields of [`ClusterListenerGroupProperties`](#clusterlistenergroupproperties).
- **`DisableSome`**: Disable some network listeners. Carries the fields of [`ClusterListenerGroupProperties`](#clusterlistenergroupproperties).




#### ClusterListenerGroupProperties

Specifies which listeners are enabled or disabled.



##### `listenerIds`

> Type: <code>Id&lt;</code>[<code>NetworkListener</code>](/docs/ref/object/network-listener)<code>&gt;[]</code>
>
> List of network listeners to enable or disable for this group





## Enums


### ClusterTaskType



| Value | Label |
|---|---|
| `storeMaintenance` | Store Maintenance |
| `accountMaintenance` | Account Maintenance |
| `metricsCalculate` | Calculate Metrics |
| `metricsPush` | Push Metrics |
| `pushNotifications` | Push Notifications |
| `searchIndexing` | Search Indexing |
| `spamClassifierTraining` | Spam Classifier Training |
| `outboundMta` | Outbound Email MTA |
| `taskQueueProcessing` | Task Queue Processing |
| `taskScheduler` | Task Scheduling |


