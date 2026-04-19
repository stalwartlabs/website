---
title: CalendarScheduling
description: Configures calendar scheduling, iTIP messaging, and HTTP RSVP settings.
custom_edit_url: null
---

# CalendarScheduling

Configures calendar scheduling, iTIP messaging, and HTTP RSVP settings.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Scheduling

## Fields


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enables the scheduling features for calendar events, allowing users to send and receive invitations


##### `httpRsvpEnable`

> Type: <code>Boolean</code> · default: `true`
>
> Enables the HTTP RSVP feature for calendar invitations, allowing users to respond via a web interface.


##### `httpRsvpLinkExpiry`

> Type: <code>Duration</code> · default: `"90d"`
>
> Sets the expiration duration for HTTP RSVP links, after which they will no longer be valid.


##### `httpRsvpUrl`

> Type: <code>Uri?</code>
>
> Specifies a custom URL for the HTTP RSVP endpoint, where users can respond to calendar invitations.


##### `autoAddInvitations`

> Type: <code>Boolean</code> · default: `false`
>
> Automatically adds incoming invitations to the user's calendar.


##### `itipMaxSize`

> Type: <code>Size</code> · default: `"512kb"` · min: 100
>
> Sets the maximum iCalendar object size for incoming iTIP messages.


##### `maxRecipients`

> Type: <code>UnsignedInt</code> · default: `100` · min: 1
>
> Sets the maximum number of recipients for outbound iTIP messages.


##### `emailTemplate`

> Type: <code>Html?</code> · [enterprise](/docs/server/enterprise)
>
> Specifies the HTML template used for rendering iMIP invitations.


##### `httpRsvpTemplate`

> Type: <code>Html?</code> · [enterprise](/docs/server/enterprise)
>
> Specifies the HTML template used for rendering HTTP RSVP confirmations.



## JMAP API

The CalendarScheduling singleton is available via the `urn:stalwart:jmap` capability.


### `x:CalendarScheduling/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysCalendarSchedulingGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:CalendarScheduling/get",
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



### `x:CalendarScheduling/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysCalendarSchedulingUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:CalendarScheduling/set",
          {
            "update": {
              "singleton": {
                "enable": true
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get calendar-scheduling
```


### Update

```sh
stalwart-cli update calendar-scheduling --field description='Updated'
```



