---
title: Metric
description: Stores a collected server metric data point.
custom_edit_url: null
---

# Metric

Stores a collected server metric data point.

## Fields

Metric is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Counter"`

Counter metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Count associated with the metric


##### `metric`

> Type: [<code>MetricType</code>](../metrics.md) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry



### `@type: "Gauge"`

Gauge metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Count associated with the metric


##### `metric`

> Type: [<code>MetricType</code>](../metrics.md) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry



### `@type: "Histogram"`

Histogram metric


##### `count`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Value associated with the metric


##### `sum`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Sum associated with the metric


##### `metric`

> Type: [<code>MetricType</code>](../metrics.md) · required
>
> Metric event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp of the metric entry




## JMAP API

The Metric object is available via the `urn:stalwart:jmap` capability.


### `x:Metric/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMetricGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
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



### `x:Metric/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMetricCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/set",
          {
            "create": {
              "new1": {
                "@type": "Counter",
                "count": 0
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

This operation requires the `sysMetricUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/set",
          {
            "update": {
              "id1": {
                "id": "id1"
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

This operation requires the `sysMetricDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/set",
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




### `x:Metric/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMetricQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metric/query",
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get metric id1
```


### Create

```sh
stalwart-cli create metric/counter \
  --field count=0
```


### Query

```sh
stalwart-cli query metric
```


### Update

```sh
stalwart-cli update metric id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete metric --ids id1
```



