---
title: CalendarAlarm
description: Configures calendar alarm email notifications.
custom_edit_url: null
---

# CalendarAlarm

Configures calendar alarm email notifications.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Alarms

## Fields


##### `allowExternalRcpts`

> Type: <code>Boolean</code> · default: `false`
>
> Allows calendar alarms to be sent to external recipients, enabling notifications to users outside the server


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enables the calendar alarms feature, allowing users to set alarms for events and receive notifications via e-mail


##### `fromEmail`

> Type: <code>EmailAddress?</code>
>
> Specifies the e-mail address that will appear in the 'From' field of calendar alarm e-mails, ensuring that users can reply to or contact the sender


##### `fromName`

> Type: <code>String</code> · default: `"Stalwart Calendar"`
>
> Specifies the name that will appear in the 'From' field of calendar alarm e-mails, providing a recognizable sender name for users


##### `minTriggerInterval`

> Type: <code>Duration</code> · default: `"1h"`
>
> Specifies the minimum interval for calendar alarms, ensuring that alarms are not triggered too frequently


##### `template`

> Type: <code>Html?</code> · [enterprise](/docs/server/enterprise)
>
> Specifies the HTML template used for rendering calendar alarm e-mails, allowing customization of the alarm notification format



## JMAP API

The CalendarAlarm singleton is available via the `urn:stalwart:jmap` capability.


### `x:CalendarAlarm/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCalendarAlarmGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:CalendarAlarm/get",
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



### `x:CalendarAlarm/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCalendarAlarmUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:CalendarAlarm/set",
          {
            "update": {
              "singleton": {
                "fromName": "updated value"
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get CalendarAlarm
```


### Update

```sh
stalwart-cli update CalendarAlarm --field fromName='updated value'
```



