---
title: Search
description: Configures full-text search indexing for emails, calendars, contacts, and tracing.
custom_edit_url: null
---

# Search

Configures full-text search indexing for emails, calendars, contacts, and tracing.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search

## Fields


##### `indexBatchSize`

> Type: <code>UnsignedInt</code> · default: `100` · min: 1
>
> Number of items to process in each batch during indexing operations


##### `defaultLanguage`

> Type: [<code>Locale</code>](../enum/locale.md) · default: `"en_US"`
>
> Default language to use when language detection is not possible


##### `disableLanguages`

> Type: [<code>Locale</code>](../enum/locale.md)<code>[]</code>
>
> List of languages to disable for full-text search


##### `indexCalendar`

> Type: <code>Boolean</code> · default: `true`
>
> Enable full-text search indexing for calendar data


##### `indexCalendarFields`

> Type: [<code>SearchCalendarField</code>](#searchcalendarfield)<code>[]</code> · default: `["title","description","location","owner","attendee","start","uid"]`
>
> List of calendar fields to index


##### `indexContacts`

> Type: <code>Boolean</code> · default: `true`
>
> Enable full-text search indexing for contacts data


##### `indexContactFields`

> Type: [<code>SearchContactField</code>](#searchcontactfield)<code>[]</code> · default: `["member","kind","name","nickname","organization","email","phone","onlineService","address","note","uid"]`
>
> List of contact fields to index


##### `indexEmail`

> Type: <code>Boolean</code> · default: `true`
>
> Enable full-text search indexing for email content and metadata


##### `indexEmailFields`

> Type: [<code>SearchEmailField</code>](#searchemailfield)<code>[]</code> · default: `["from","to","cc","bcc","subject","body","attachment","receivedAt","sentAt","size","hasAttachment"]`
>
> List of email fields to index


##### `indexTelemetry`

> Type: <code>Boolean</code> · [enterprise](/docs/server/enterprise) · default: `true`
>
> Enable full-text search indexing for tracing data


##### `indexTracingFields`

> Type: [<code>SearchTracingField</code>](#searchtracingfield)<code>[]</code> · [enterprise](/docs/server/enterprise) · default: `["eventType","queueId","keywords"]`
>
> List of tracing fields to index



## JMAP API

The Search singleton is available via the `urn:stalwart:jmap` capability.


### `x:Search/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSearchGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Search/get",
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



### `x:Search/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSearchUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Search/set",
          {
            "update": {
              "singleton": {
                "indexBatchSize": 100
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
stalwart-cli get search
```


### Update

```sh
stalwart-cli update search --field description='Updated'
```



## Enums


### SearchCalendarField {#searchcalendarfield}



| Value | Label |
|---|---|
| `title` | Event Title |
| `description` | Event Description |
| `location` | Event Location |
| `owner` | Event Owner |
| `attendee` | Event Attendee |
| `start` | Event Start Date |
| `uid` | Event UID |


### SearchContactField {#searchcontactfield}



| Value | Label |
|---|---|
| `member` | Group Member |
| `kind` | Contact Kind |
| `name` | Contact Name |
| `nickname` | Contact Nickname |
| `organization` | Contact Organization |
| `email` | Contact Email |
| `phone` | Contact Phone |
| `onlineService` | Contact Online Service |
| `address` | Contact Address |
| `note` | Contact Note |
| `uid` | Contact UID |


### SearchEmailField {#searchemailfield}



| Value | Label |
|---|---|
| `from` | From Address |
| `to` | To Address |
| `cc` | Cc Address |
| `bcc` | Bcc Address |
| `subject` | Subject |
| `body` | Body Content |
| `attachment` | Attachment Content |
| `receivedAt` | Received Date |
| `sentAt` | Sent Date |
| `size` | Message Size |
| `hasAttachment` | Has Attachment |
| `headers` | Email Headers |


### SearchTracingField {#searchtracingfield}



| Value | Label |
|---|---|
| `eventType` | Event Type |
| `queueId` | Queue ID |
| `keywords` | Keywords |


