---
title: Alert
description: Defines an alert rule triggered by metric conditions.
custom_edit_url: null
---

# Alert

Defines an alert rule triggered by metric conditions.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Alerts

## Fields


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> The condition that triggers the alert.


##### `emailAlert`

> Type: [<code>AlertEmail</code>](#alertemail) · required
>
> Email notification settings


##### `eventAlert`

> Type: [<code>AlertEvent</code>](#alertevent) · required
>
> Event notification settings


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the alert



## JMAP API

The Alert object is available via the `urn:stalwart:jmap` capability.


### `x:Alert/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysAlertGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Alert/get",
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



### `x:Alert/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysAlertCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Alert/set",
          {
            "create": {
              "new1": {
                "condition": {
                  "else": "Example",
                  "match": {}
                },
                "emailAlert": {
                  "@type": "Disabled"
                },
                "eventAlert": {
                  "@type": "Disabled"
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

This operation requires the `sysAlertUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Alert/set",
          {
            "update": {
              "id1": {
                "condition": {
                  "else": "Example",
                  "match": {}
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

This operation requires the `sysAlertDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Alert/set",
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




### `x:Alert/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysAlertQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Alert/query",
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
stalwart-cli get Alert id1
```


### Create

```sh
stalwart-cli create Alert \
  --field 'condition={"else":"Example","match":{}}' \
  --field 'emailAlert={"@type":"Disabled"}' \
  --field 'eventAlert={"@type":"Disabled"}'
```


### Query

```sh
stalwart-cli query Alert
```


### Update

```sh
stalwart-cli update Alert id1 --field condition='{"else":"Example","match":{}}'
```


### Delete

```sh
stalwart-cli delete Alert --ids id1
```



## Nested types


### Expression

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





#### ExpressionMatch

A single condition-result pair in an expression.



##### `if`

> Type: <code>String</code> · required
>
> If condition


##### `then`

> Type: <code>String</code> · required
>
> Then clause





### AlertEmail

Defines email notification settings for alerts.


- **`Disabled`**: Disabled. No additional fields.
- **`Enabled`**: Enabled. Carries the fields of [`AlertEmailProperties`](#alertemailproperties).




#### AlertEmailProperties

Alert email notification settings.



##### `body`

> Type: <code>Text</code> · required
>
> The body of the email


##### `fromAddress`

> Type: <code>EmailAddress</code> · required
>
> The email address of the sender


##### `fromName`

> Type: <code>String?</code>
>
> The name of the sender


##### `subject`

> Type: <code>String</code> · required
>
> The subject of the email


##### `to`

> Type: <code>EmailAddress[]</code> · min items: 1
>
> The email address of the recipient(s)





### AlertEvent

Defines event notification settings for alerts.


- **`Disabled`**: Disabled. No additional fields.
- **`Enabled`**: Enabled. Carries the fields of [`AlertEventProperties`](#alerteventproperties).




#### AlertEventProperties

Alert event notification settings.



##### `eventMessage`

> Type: <code>Text?</code>
>
> The message of the event to trigger





