---
title: Trace
description: Stores a message delivery trace with associated events.
custom_edit_url: null
---

# Trace

Stores a message delivery trace with associated events.

:::info[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Inbound Delivery<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › History › Outbound Delivery

## Fields


##### `events`

> Type: [<code>TraceEvent</code>](#traceevent)<code>[]</code>
>
> List of events associated with the trace entry


##### `timestamp`

> Type: <code>UTCDateTime</code> · server-set
>
> Timestamp of the trace entry


##### `from`

> Type: <code>String</code> · server-set
>
> Sender address


##### `to`

> Type: <code>String</code> · server-set
>
> Recipient addresses


##### `size`

> Type: <code>Size</code> · server-set
>
> Size of the message



## JMAP API

The Trace object is available via the `urn:stalwart:jmap` capability.


### `x:Trace/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysTraceGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Trace/get",
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



### `x:Trace/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysTraceCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Trace/set",
          {
            "create": {
              "new1": {
                "events": []
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

This operation requires the `sysTraceUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Trace/set",
          {
            "update": {
              "id1": {
                "events": []
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

This operation requires the `sysTraceDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Trace/set",
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




### `x:Trace/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysTraceQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Trace/query",
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




The `x:Trace/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `timestamp` | date |
| `queueId` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get trace id1
```


### Create

```sh
stalwart-cli create trace \
  --field 'events=[]'
```


### Query

```sh
stalwart-cli query trace
```


### Update

```sh
stalwart-cli update trace id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete trace --ids id1
```



## Nested types


### TraceEvent {#traceevent}

A single event within a delivery trace.



##### `event`

> Type: [<code>EventType</code>](../events.md) · required
>
> Event type


##### `timestamp`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the event occurred


##### `keyValues`

> Type: [<code>TraceKeyValue</code>](#tracekeyvalue)<code>[]</code>
>
> List of key-value pairs associated with the trace entry





#### TraceKeyValue {#tracekeyvalue}

A key-value pair associated with a trace event.



##### `key`

> Type: [<code>Key</code>](../events.md#keys) · required
>
> Key name


##### `value`

> Type: [<code>TraceValue</code>](#tracevalue) · required
>
> Key value





##### TraceValue {#tracevalue}

A typed value in a trace key-value pair.


- **`String`**: String value. Carries the fields of [`TraceValueString`](#tracevaluestring).
- **`UnsignedInt`**: Unsigned integer value. Carries the fields of [`TraceValueUnsignedInt`](#tracevalueunsignedint).
- **`Integer`**: Integer value. Carries the fields of [`TraceValueInteger`](#tracevalueinteger).
- **`Boolean`**: Boolean value. Carries the fields of [`TraceValueBoolean`](#tracevalueboolean).
- **`Float`**: Float value. Carries the fields of [`TraceValueFloat`](#tracevaluefloat).
- **`UTCDateTime`**: UTC date and time value. Carries the fields of [`TraceValueUTCDateTime`](#tracevalueutcdatetime).
- **`Duration`**: Duration value in seconds. Carries the fields of [`TraceValueDuration`](#tracevalueduration).
- **`IpAddr`**: IP address value. Carries the fields of [`TraceValueIpAddr`](#tracevalueipaddr).
- **`List`**: Value list. Carries the fields of [`TraceValueList`](#tracevaluelist).
- **`Event`**: Nested event value. Carries the fields of [`TraceValueEvent`](#tracevalueevent).
- **`Null`**: Null value. No additional fields.




##### TraceValueString {#tracevaluestring}

A string trace value.



##### `value`

> Type: <code>String</code> · required
>
> String value





##### TraceValueUnsignedInt {#tracevalueunsignedint}

An unsigned integer trace value.



##### `value`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Unsigned integer value





##### TraceValueInteger {#tracevalueinteger}

An integer trace value.



##### `value`

> Type: <code>Integer</code> · default: `0`
>
> Integer value





##### TraceValueBoolean {#tracevalueboolean}

A boolean trace value.



##### `value`

> Type: <code>Boolean</code> · default: `false`
>
> Boolean value





##### TraceValueFloat {#tracevaluefloat}

A floating-point trace value.



##### `value`

> Type: <code>Float</code> · default: `0`
>
> Float value





##### TraceValueUTCDateTime {#tracevalueutcdatetime}

A UTC date-time trace value.



##### `value`

> Type: <code>UTCDateTime</code> · required
>
> UTC date and time value





##### TraceValueDuration {#tracevalueduration}

A duration trace value in seconds.



##### `value`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Duration value in seconds





##### TraceValueIpAddr {#tracevalueipaddr}

An IP address trace value.



##### `value`

> Type: <code>IpAddr</code> · required
>
> IP address value





##### TraceValueList {#tracevaluelist}

A list of trace values.



##### `value`

> Type: [<code>TraceValue</code>](#tracevalue)<code>[]</code>
>
> Value list





##### TraceValueEvent {#tracevalueevent}

A nested event trace value.



##### `event`

> Type: [<code>EventType</code>](../events.md) · required
>
> Event type


##### `value`

> Type: [<code>TraceKeyValue</code>](#tracekeyvalue)<code>[]</code>
>
> List of key-value pairs associated with the trace entry





