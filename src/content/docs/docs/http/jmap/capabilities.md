---
title: "JMAP capabilities"
description: "The JMAP capabilities Stalwart advertises in the session resource, the specification behind each, the settings that limit it, and when it is offered to an account."
sidebar_position: 5
---

JMAP is extensible: mail, calendars, contacts and the other kinds of data are each defined by their own specification. A client therefore needs to know which extensions a server supports before it uses them. A JMAP server announces each extension it supports as a capability, identified by a URI, in the session resource at `/jmap/session`.

The session lists the capabilities at two levels. Under `capabilities`, it lists those of the server as a whole, with the server-wide limits. Under each account in `accounts`, it lists those available for that account. A client uses a capability only when it appears for the account, and it names the capability in the `using` list of each request.

## Capabilities

The following table lists the capabilities that Stalwart advertises, with the specification behind each and the settings that limit it:

| Capability | Specification | Provides | Limited by |
|---|---|---|---|
| `urn:ietf:params:jmap:core` | [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620) | Requests, uploads, downloads, push | [JMAP limits](/docs/http/jmap/protocol) |
| `urn:ietf:params:jmap:mail` | [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621) | Mailboxes, messages, threads, search | [Message and mailbox limits](/docs/email/settings/jmap) |
| `urn:ietf:params:jmap:submission` | [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621) | Sending messages, identities | |
| `urn:ietf:params:jmap:vacationresponse` | [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621) | Automatic replies | |
| `urn:ietf:params:jmap:mail:share` | [draft-ietf-jmap-mail-sharing](https://datatracker.ietf.org/doc/draft-ietf-jmap-mail-sharing/) | Sharing mailboxes with other accounts | |
| `urn:ietf:params:jmap:emailpush` | [draft-ietf-jmap-emailpush](https://datatracker.ietf.org/doc/draft-ietf-jmap-emailpush/) | Message contents in push notifications | `maxPushSize` on the [Jmap](/docs/ref/object/jmap) object |
| `urn:ietf:params:jmap:contacts` | [RFC 9610](https://www.rfc-editor.org/rfc/rfc9610) | Address books and contacts | `maxAddressBooksPerCard` on the [AddressBook](/docs/ref/object/address-book) object |
| `urn:ietf:params:jmap:contacts:parse` | [RFC 9610](https://www.rfc-editor.org/rfc/rfc9610) | Parsing vCard files | `parseLimitContact` |
| `urn:ietf:params:jmap:calendars` | [draft-ietf-jmap-calendars](https://datatracker.ietf.org/doc/draft-ietf-jmap-calendars/) | Calendars and events | `maxCalendarsPerEvent`, `maxAttendees` and `maxExpandedQueryDuration` on the [Calendar](/docs/ref/object/calendar) object |
| `urn:ietf:params:jmap:calendars:parse` | draft-ietf-jmap-calendars | Parsing iCalendar files | `parseLimitEvent` |
| `urn:ietf:params:jmap:principals` | [RFC 9670](https://www.rfc-editor.org/rfc/rfc9670) | Users, groups and resources the account can share with | |
| `urn:ietf:params:jmap:principals:owner` | [RFC 9670](https://www.rfc-editor.org/rfc/rfc9670) | The principal that owns each account | |
| `urn:ietf:params:jmap:principals:availability` | draft-ietf-jmap-calendars | [Free/busy](/docs/collaboration/availability) information | `maxAvailabilityDuration` on the Calendar object |
| `urn:ietf:params:jmap:filenode` | [draft-ietf-jmap-filenode](https://datatracker.ietf.org/doc/draft-ietf-jmap-filenode/) | Files and folders | |
| `urn:ietf:params:jmap:sieve` | [RFC 9661](https://www.rfc-editor.org/rfc/rfc9661) | Sieve scripts | Limits on the [SieveUserInterpreter](/docs/ref/object/sieve-user-interpreter) object |
| `urn:ietf:params:jmap:blob` | [RFC 9404](https://www.rfc-editor.org/rfc/rfc9404) | Blob upload, copying and lookup | `maxRequestSize`, `maxMethodCalls` |
| `urn:ietf:params:jmap:quota` | [RFC 9425](https://www.rfc-editor.org/rfc/rfc9425) | The account's quotas | |
| `urn:ietf:params:jmap:websocket` | [RFC 8887](https://www.rfc-editor.org/rfc/rfc8887) | JMAP over [WebSocket](/docs/http/jmap/websockets) | WebSocket settings on the Jmap object |
| `urn:ietf:params:jmap:webpush-vapid` | [RFC 9749](https://www.rfc-editor.org/rfc/rfc9749) | VAPID for [push subscriptions](/docs/http/jmap/push#push-subscriptions) | Advertised while `webPushKey` is set |
| `urn:ietf:params:jmap:metadata` | [draft-ietf-jmap-metadata](https://datatracker.ietf.org/doc/draft-ietf-jmap-metadata/) | [Object metadata](/docs/server/metadata) | The [Metadata](/docs/ref/object/metadata) object; advertised only when it enables at least one data type |
| `urn:stalwart:jmap` | Stalwart | The configuration and management API | Permissions of the account |

The limits that a capability publishes, such as `maxSizeUpload` and `maxObjectsInGet` in `core`, are taken from the settings named in the last column.

## Capability visibility

A capability appears for an account only when the user holds the permission to use it. For example, `jmapEmailGet` is required for `mail`, `mail:share` and `emailpush`, `jmapEmailSubmissionCreate` for `submission`, `jmapCalendarEventGet` for `calendars`, `jmapContactCardGet` for `contacts`, `jmapFileNodeGet` for `filenode`, `jmapSieveScriptGet` for `sieve`, and `jmapMetadataGet` for `metadata`. Four capabilities need no such permission: `websocket`, `principals`, `principals:availability` and `urn:stalwart:jmap` are listed for every account. [Permissions](/docs/auth/authorization/permissions) lists all of them.

Some capabilities make sense only for the user's own account. For an account shared with the user by another user, `submission`, `vacationresponse`, `sieve`, `quota` and `emailpush` are therefore not listed. A request authenticated with an OAuth token lists only the capabilities its scopes allow.

## Errors

Besides the errors of RFC 8620, the calendar extension can return the method error `expandDurationTooLarge`, when a query asks to expand recurring events over a longer period than `maxExpandedQueryDuration`.
