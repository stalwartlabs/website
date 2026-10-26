---
sidebar_position: 3
title: "Calendar"
---

A calendar is only useful when it is the same on every device its owner uses, and when colleagues can see it where they need to. Stalwart stores calendars for every account and serves them over JMAP for Calendars and CalDAV, so that events can be created, shared and synchronised across devices and applications. This page describes how clients reach the calendars and the limits and defaults an administrator configures. It also explains how the server treats private events, per-user data and recurring events on shared calendars.

## JMAP for Calendars

JMAP for Calendars provides a JSON API for calendar data, such as events, tasks and scheduling information. It is designed as a replacement for CalDAV and CalDAV Scheduling. It offers the same functionality, from creating and updating events to sharing calendars, in a simpler and more consistent way.

The difference lies in the formats. CalDAV is built on WebDAV, and it combines XML with embedded iCalendar data. JMAP for Calendars is JSON over HTTPS throughout. It uses the same request and response model as JMAP for Mail, so one protocol covers every kind of personal data.

## CalDAV

CalDAV is a standardised extension of WebDAV, through which clients work with calendar data stored on a server. Calendar applications on desktops and mobile devices support it, including Apple Calendar, Thunderbird and Outlook (with plugins). It covers creating events, setting recurring appointments, inviting participants and viewing shared calendars.

### Accessing calendars

The recommended way to configure a CalDAV client is through the autodiscovery endpoint at `/.well-known/caldav`. A client that queries this path is redirected to the CalDAV resource of the authenticated account. Most modern clients therefore locate the calendars without a URL being entered by hand.

Clients configured manually, and administrators troubleshooting a client, can use the direct path `/dav/cal/<account_name>`, where `<account_name>` is the username of the account. The calendars of the account `alice`, for example, are at `/dav/cal/alice`. Both methods lead to the same calendar data.

## Limits

Calendar-wide limits protect server resources against clients that create excessively large or complex calendar entries. They are set on the [Calendar](/docs/ref/object/calendar) singleton, found in the WebUI under <!-- breadcrumb:Calendar --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Calendar<!-- /breadcrumb:Calendar -->.

### Recurrence expansion

The iCalendar format describes repeating events with recurrence rules (RRULE), such as "every Monday until June". When such an event is created, Stalwart expands the rule into individual instances and stores them. This spares the server an RRULE calculation on every calendar query.

Expansion is computationally intensive, especially for long-running or infinitely repeating events. [`maxRecurrenceExpansions`](/docs/ref/object/calendar#maxrecurrenceexpansions) therefore limits the number of instances generated from one rule. Its default of <!-- default:Calendar.maxRecurrenceExpansions -->3000<!-- /default --> instances covers most realistic schedules, such as daily events spanning several years.

When a rule would produce more instances, the server still stores the event, but with its expansion truncated at the limit. A time-range search then finds only the instances within it. Requests that must expand more instances than the limit fail instead. A JMAP `CalendarEvent/query` with expansion returns `cannotCalculateOccurrences`, an availability request returns `tooLarge`, and a CalDAV free-busy report returns HTTP 413. A JMAP import is rejected with `invalidProperties` when the event carries more recurrence overrides than the limit.

Raising the limit has a cost. Every expanded instance is stored, so a higher limit increases the storage and indexing work for each recurring event.

### iCalendar object size

[`maxICalendarSize`](/docs/ref/object/calendar#maxicalendarsize) is the largest single iCalendar object (VEVENT, VTODO and so on) the server accepts, <!-- default:Calendar.maxICalendarSize -->512 KiB<!-- /default --> by default. Attachments embedded in an event are limited separately: [`maxAttachmentsSize`](/docs/ref/object/calendar#maxattachmentssize) caps their total size per event, at <!-- default:Calendar.maxAttachmentsSize -->5 MiB<!-- /default --> by default.

### Attendee limit

[`maxAttendees`](/docs/ref/object/calendar#maxattendees) is the largest number of attendees allowed in a single iCalendar instance. The default is <!-- default:Calendar.maxAttendees -->20<!-- /default -->, and deployments that regularly schedule large meetings may raise it.

### Calendars per event

In JMAP, one event can belong to several calendars, and [`maxCalendarsPerEvent`](/docs/ref/object/calendar#maxcalendarsperevent) limits how many.

### Expanded queries

A query can ask the server to expand recurring events into their individual occurrences over a time range that the client gives. [`maxExpandedQueryDuration`](/docs/ref/object/calendar#maxexpandedqueryduration) limits that range, to <!-- default:Calendar.maxExpandedQueryDuration -->365 days<!-- /default --> by default. A longer range fails with the JMAP error `expandDurationTooLarge`, and the server emits the `jmap.expand-duration-too-large` event.

The limits that apply to free/busy queries, `maxAvailabilityDuration` and `availabilityRateLimit`, are described in [Free/busy and availability](/docs/collaboration/availability#limits). [Connection and request limits](/docs/performance/connections#webdav-and-calendar-limits) describes how all of these limits relate to the other request limits.

### JMAP parsing limit

The JMAP `CalendarEvent/parse` method is bounded by [`parseLimitEvent`](/docs/ref/object/jmap#parselimitevent) on the [Jmap](/docs/ref/object/jmap) singleton, which sets the largest number of iCalendar items parsed in a single request. The Jmap singleton is found in the WebUI under <!-- breadcrumb:Jmap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket<!-- /breadcrumb:Jmap -->.

## Default calendar

To improve client compatibility, Stalwart creates a default calendar when an account is accessed and has none. CalDAV clients therefore always see a calendar on their first connection, and calendar operations proceed without manual setup.

The calendar is created under the account's calendar home, with the name set in [`defaultHrefName`](/docs/ref/object/calendar#defaulthrefname) on the Calendar singleton, <!-- default:Calendar.defaultHrefName -->`default`<!-- /default --> by default. Clients show it under the display name in [`defaultDisplayName`](/docs/ref/object/calendar#defaultdisplayname), <!-- default:Calendar.defaultDisplayName -->`Stalwart Calendar`<!-- /default --> by default, which can be changed to match the organisation's branding or language.

### Choosing the default calendar

Each account has one default calendar, which clients use for new events and for scheduling. A JMAP client sets it with the `onSuccessSetIsDefault` argument of `Calendar/set`, which takes the id of a calendar or a reference to one created in the same request. `Calendar/get` reports the current default in `isDefault`. The change applies only when every other change in the request succeeded, and only in the user's own account. Until a default is set, the calendar created first is the default.

### Disabling automatic creation

Clearing `defaultHrefName` turns automatic creation off. Stalwart then creates no default calendar, and an account has no calendar until the user creates one. Invitations that arrive while the account has no calendar are not added.

## Per-account limits

The Calendar singleton also caps the calendar resources of each account:

- [`maxCalendars`](/docs/ref/object/calendar#maxcalendars): the number of calendars an account can create.
- [`maxEvents`](/docs/ref/object/calendar#maxevents): the number of events.
- [`maxParticipantIdentities`](/docs/ref/object/calendar#maxparticipantidentities): the number of participant identities.
- [`maxEventNotifications`](/docs/ref/object/calendar#maxeventnotifications): the number of event notifications.

These values apply to every account unless they are overridden at the account or tenant level.

## Event privacy

A user who shares a calendar may still want some events kept private. The iCalendar `CLASS` property of an event decides how much of it is visible to users who see the calendar through [sharing](/docs/collaboration/sharing). JMAP represents the same information as the `privacy` property:

| iCalendar `CLASS` | JMAP `privacy` | What sharees see |
|---|---|---|
| `PUBLIC` or absent | `public` | The whole event, subject to their rights. |
| `PRIVATE` (and unknown values) | `private` | Only the time of the event: start, duration, time zone, recurrence and free/busy status. Title, description, locations, participants and alerts are removed, the event does not match text searches, and it appears as busy time in [free/busy](/docs/collaboration/availability) queries. |
| `CONFIDENTIAL` | `secret` | Nothing. The event is not listed and does not count towards free/busy time, and requests for it return `404` over CalDAV and `notFound` over JMAP. |

Members of the account that owns the calendar always see the whole event. Only they can set a privacy other than `public`, or change it. Privacy applies to the whole event, including every occurrence of a recurring event, so all events with the same UID must have the same privacy.

Sharees are restricted further. A sharee can neither modify nor delete a private event, and cannot delete a calendar that contains private or secret events. An attempt to change a private event returns `403` over CalDAV, and `forbidden` over JMAP with the description `Private events can only be modified by the calendar owner.`

## Per-user event data

On a shared event, users often want their own reminders or colour without changing the event for everyone else. Some properties of an event therefore belong to each user who sees it. In JMAP these are `keywords`, `color`, `freeBusyStatus`, `alerts` and `useDefaultAlerts`.

A sharee's values for these properties are stored for that sharee only. The shared event, its `SEQUENCE`, the owner's copy and the other sharees' views stay unchanged, and nobody is notified. Changing the values requires write access to the event, or the right to update private properties (JMAP `mayUpdatePrivate`).

CalDAV carries only the alarms among these properties. A sharee sees their own alarms (`VALARM`) in place of the owner's, and a `PUT` that changes only alarms is stored as the sharee's personal data. Personal keywords, colour and free/busy status are available through JMAP only.

## Default alerts

A calendar can define default alerts, separately for events with a time and for all-day events (`defaultAlertsWithTime` and `defaultAlertsWithoutTime` in JMAP). An event with `useDefaultAlerts` set uses the calendar's defaults in place of its own alerts. A change to the defaults therefore applies to existing events at once. Default alerts are stored per user, which lets each sharee have their own.

Alerts, both default and explicit, fire only for users who are subscribed to at least one of the event's calendars. Members of the owning account are subscribed by default, whereas sharees are not subscribed until they subscribe. Display alerts are delivered to JMAP clients as push notifications, and email alerts are sent as described in [Notifications](/docs/collaboration/notifications).

## Hidden attendees

Some events should not reveal who else is invited. An event with `hideAttendees` set in JMAP shows each attendee only the organiser and themselves. JMAP sharees without write access to all of the event's calendars see the same restricted list. Invitations, the [HTTP RSVP](/docs/collaboration/scheduling#http-rsvp) page and alarm emails sent for the event also leave out the other attendees. When a sharee changes the event, the hidden attendees are kept.

## Sharing rights

JMAP and CalDAV express access to a shared calendar under different names. The following table shows how the JMAP rights of a calendar (`myRights` and `shareWith`) appear as WebDAV privileges:

| JMAP right | WebDAV privilege |
|---|---|
| `mayReadFreeBusy` | `CALDAV:read-free-busy` |
| `mayReadItems` | `DAV:read` |
| `mayWriteAll` | `DAV:write` (with `DAV:write-properties`, `DAV:write-content`, `DAV:bind` and `DAV:unbind`) |
| `mayShare` | `DAV:read-acl` and `DAV:write-acl` |
| `mayWriteOwn`, `mayUpdatePrivate`, `mayRSVP`, `mayDelete`, `maySetMetadata` | None. These rights can be granted only through JMAP. |

## Editing single occurrences

A JMAP client that expands a recurring event (`CalendarEvent/query` with `expandRecurrences`) receives an id for each occurrence. Updating such an id changes that occurrence only, by adding or editing an entry in `recurrenceOverrides` of the base event. Destroying it removes the occurrence from the series.

Some changes cannot be made this way. The calendars, the draft state, the privacy and the recurrence rule apply to the whole event, so they cannot be changed on a single occurrence. The base event and its occurrences cannot be changed in the same request. Occurrences covered by a this-and-future change cannot be changed individually either. These rules are those of [JMAP for Calendars](https://datatracker.ietf.org/doc/draft-ietf-jmap-calendars/).
