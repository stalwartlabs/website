---
title: Calendar
description: Configures calendar settings including iCalendar limits and default names.
custom_edit_url: null
---

# Calendar

Configures calendar settings including iCalendar limits and default names.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Calendar

## Fields


##### `defaultDisplayName`

> Type: <code>String?</code> · default: `"Stalwart Calendar"`
>
> Specifies the default display name for a calendar when it is created


##### `defaultHrefName`

> Type: <code>String?</code> · default: `"default"`
>
> Specifies the default href name for a calendar when it is created


##### `maxAttendees`

> Type: <code>UnsignedInt</code> · default: `20` · max: 100000
>
> Specifies the maximum number of attendees that can be included in a single iCalendar instance


##### `maxRecurrenceExpansions`

> Type: <code>UnsignedInt</code> · default: `3000`
>
> Specifies the maximum number of instances that can be generated from a recurring iCalendar event


##### `maxICalendarSize`

> Type: <code>Size</code> · default: `"512kb"`
>
> Specifies the maximum size of an iCalendar file that can be uploaded to the server


##### `maxCalendars`

> Type: <code>UnsignedInt?</code> · default: `250` · min: 1
>
> The default maximum number of calendars a user can create


##### `maxEvents`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The default maximum number of calendar events a user can create


##### `maxParticipantIdentities`

> Type: <code>UnsignedInt?</code> · default: `100` · min: 1
>
> The default maximum number of participant identities a user can create


##### `maxEventNotifications`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The default maximum number of notifications a user can create for calendar events



## JMAP API

The Calendar singleton is available via the `urn:stalwart:jmap` capability.


### `x:Calendar/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCalendarGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Calendar/get",
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



### `x:Calendar/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCalendarUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Calendar/set",
          {
            "update": {
              "singleton": {
                "defaultDisplayName": "updated value"
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
stalwart-cli get Calendar
```


### Update

```sh
stalwart-cli update Calendar --field defaultDisplayName='updated value'
```



