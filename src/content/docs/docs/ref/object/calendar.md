---
title: "Calendar"
description: "Configures calendar settings including iCalendar limits and default names."
custom_edit_url: null
---

Configures calendar settings including iCalendar limits and default names.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Calendar"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Calendar</span>

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

> Type: <code>Size</code> · default: `524288`
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


##### `maxCalendarsPerEvent`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Maximum number of calendars a single calendar event can belong to


##### `maxExpandedQueryDuration`

> Type: <code>Duration</code> · default: `31536000000`
>
> Maximum time span between the after and before arguments of a calendar event query that expands recurrences


##### `maxAvailabilityDuration`

> Type: <code>Duration</code> · default: `31536000000`
>
> Maximum time span that can be requested when querying the availability (free/busy) of a principal


##### `availabilityRateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":100,"period":60000}`
>
> Maximum rate at which an account can query principal availability


##### `maxAttachmentsSize`

> Type: <code>Size</code> · default: `5242880`
>
> Maximum total size of the attachments embedded in a single calendar event



## JMAP API

The Calendar singleton is available via the `urn:stalwart:jmap` capability.


### `x:Calendar/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCalendarGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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


This method requires the `sysCalendarUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
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



## Nested types


### Rate

Defines a rate limit as a count over a time period.



##### `count`

> Type: <code>UnsignedInt</code> · default: `0` · min: 1 · max: 1000000
>
> Count


##### `period`

> Type: <code>Duration</code> · default: `0` · min: 1
>
> Period





