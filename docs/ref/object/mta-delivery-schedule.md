---
title: MtaDeliverySchedule
description: Defines retry and notification intervals for message delivery.
custom_edit_url: null
---

# MtaDeliverySchedule

Defines retry and notification intervals for message delivery.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Delivery Schedules

## Fields


##### `name`

> Type: <code>String</code> · read-only
>
> Short identifier for the schedule


##### `description`

> Type: <code>String?</code>
>
> A short description of the schedule, which can be used to identify it in the list of schedules


##### `expiry`

> Type: [<code>MtaDeliveryExpiration</code>](#mtadeliveryexpiration) · required
>
> Whether to expire messages after a number of delivery attempts or after certain time (TTL)


##### `notify`

> Type: [<code>MtaDeliveryScheduleIntervalsOrDefault</code>](#mtadeliveryscheduleintervalsordefault) · required
>
> List of delayed delivery DSN notification intervals


##### `queueId`

> Type: <code>Id&lt;</code>[<code>MtaVirtualQueue</code>](./mta-virtual-queue.md)<code>&gt;</code> · required
>
> The name of the virtual queue to use for this schedule


##### `retry`

> Type: [<code>MtaDeliveryScheduleIntervalsOrDefault</code>](#mtadeliveryscheduleintervalsordefault) · required
>
> List of retry intervals for message delivery



## JMAP API

The MtaDeliverySchedule object is available via the `urn:stalwart:jmap` capability.


### `x:MtaDeliverySchedule/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaDeliveryScheduleGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaDeliverySchedule/get",
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



### `x:MtaDeliverySchedule/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaDeliveryScheduleCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaDeliverySchedule/set",
          {
            "create": {
              "new1": {
                "description": "Example",
                "expiry": {
                  "@type": "Ttl",
                  "expire": "3d"
                },
                "notify": {
                  "@type": "Default"
                },
                "queueId": "<MtaVirtualQueue id>",
                "retry": {
                  "@type": "Default"
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

This operation requires the `sysMtaDeliveryScheduleUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaDeliverySchedule/set",
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

This operation requires the `sysMtaDeliveryScheduleDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaDeliverySchedule/set",
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




### `x:MtaDeliverySchedule/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaDeliveryScheduleQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaDeliverySchedule/query",
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




The `x:MtaDeliverySchedule/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get mta-delivery-schedule id1
```


### Create

```sh
stalwart-cli create mta-delivery-schedule \
  --field description=Example \
  --field 'expiry={"@type":"Ttl","expire":"3d"}' \
  --field 'notify={"@type":"Default"}' \
  --field 'queueId=<MtaVirtualQueue id>' \
  --field 'retry={"@type":"Default"}'
```


### Query

```sh
stalwart-cli query mta-delivery-schedule
stalwart-cli query mta-delivery-schedule --where name=example
```


### Update

```sh
stalwart-cli update mta-delivery-schedule id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete mta-delivery-schedule --ids id1
```



## Nested types


### MtaDeliveryExpiration {#mtadeliveryexpiration}

Defines the message expiration policy for undelivered messages.


- **`Ttl`**: Time To Live. Carries the fields of [`MtaDeliveryExpirationTtl`](#mtadeliveryexpirationttl).
- **`Attempts`**: Delivery Attempts. Carries the fields of [`MtaDeliveryExpirationAttempts`](#mtadeliveryexpirationattempts).




#### MtaDeliveryExpirationTtl {#mtadeliveryexpirationttl}

Defines a time-to-live based message expiration policy.



##### `expire`

> Type: <code>Duration</code> · default: `"3d"`
>
> Time after which the message will be expired if it is not delivered





#### MtaDeliveryExpirationAttempts {#mtadeliveryexpirationattempts}

Defines a delivery-attempts based message expiration policy.



##### `maxAttempts`

> Type: <code>UnsignedInt</code> · default: `5` · min: 1
>
> Maximum number of delivery attempts before the message is considered failed





### MtaDeliveryScheduleIntervalsOrDefault {#mtadeliveryscheduleintervalsordefault}

Defines whether to use the default delivery schedule intervals or specify custom intervals.


- **`Default`**: Use default intervals. No additional fields.
- **`Custom`**: Specify custom intervals. Carries the fields of [`MtaDeliveryScheduleIntervals`](#mtadeliveryscheduleintervals).




#### MtaDeliveryScheduleIntervals {#mtadeliveryscheduleintervals}

Defines a custom list of delivery retry or notification intervals.



##### `intervals`

> Type: [<code>MtaDeliveryScheduleInterval</code>](#mtadeliveryscheduleinterval)<code>[]</code> · min items: 1
>
> List of intervals





##### MtaDeliveryScheduleInterval {#mtadeliveryscheduleinterval}

Defines a single time interval entry used in a delivery schedule.



##### `duration`

> Type: <code>Duration</code> · default: `"1h"`
>
> Time interval for retries or notifications





