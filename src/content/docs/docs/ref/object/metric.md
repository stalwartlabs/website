---
title: "Metric"
description: "Stores a collected server metric data point."
custom_edit_url: null
---

Stores a collected server metric data point.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

## Fields

Metric is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Counter"`

Counter metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Count associated with the metric


##### `metric`

> Type: [<code>MetricType</code>](/docs/ref/metrics) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry


##### `nodeId`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Id of the cluster node that recorded the data point



### `@type: "Gauge"`

Gauge metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Count associated with the metric


##### `metric`

> Type: [<code>MetricType</code>](/docs/ref/metrics) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry


##### `nodeId`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Id of the cluster node that recorded the data point



### `@type: "Histogram"`

Histogram metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of observations recorded since the previous data point from the same node


##### `sum`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Sum of the observations recorded since the previous data point from the same node


##### `metric`

> Type: [<code>MetricType</code>](/docs/ref/metrics) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry


##### `nodeId`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Id of the cluster node that recorded the data point




## JMAP API

The Metric object is available via the `urn:stalwart:jmap` capability.


### `x:Metric/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMetricGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/get",
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



### `x:Metric/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMetricQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/query",
          {
            "filter": {
              "nodeId": 1
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




The `x:Metric/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `nodeId` | integer |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Metric id1
```


### Query

```sh
stalwart-cli query Metric
stalwart-cli query Metric --where nodeId=1
```



