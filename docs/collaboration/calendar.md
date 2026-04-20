---
sidebar_position: 3
---

# Calendar

Stalwart includes full support for calendar management and scheduling through the JMAP and CalDAV protocols, covering creation, access, and synchronization of calendar data across devices and applications.

## JMAP for Calendars

JMAP for Calendars is a protocol that provides a JSON-based API for managing calendar data such as events, tasks, and scheduling information. It is designed as a replacement for CalDAV and CalDAV Scheduling, offering the same functionality (creating, reading, updating, deleting, and sharing calendar data) but in a simpler and more consistent way.

Unlike CalDAV, which is built on top of WebDAV and uses XML combined with embedded iCalendar data, JMAP for Calendars is entirely JSON over HTTPS. It uses the same core request/response model as JMAP for Mail, providing a unified protocol for all personal data types.

## CalDAV

CalDAV is a standardized extension of WebDAV that allows clients to interact with calendar data stored on a server. It is supported by calendar applications on desktops and mobile devices, including Apple Calendar, Thunderbird, and Outlook (with plugins). CalDAV covers creating events, setting recurring appointments, inviting participants, and viewing shared calendars.

### Accessing calendars

CalDAV clients can access calendar data on Stalwart using standardized URLs. The recommended method for client configuration is through the autodiscovery endpoint located at `/.well-known/caldav`. When a client queries this path, the server redirects the request to the appropriate CalDAV resource associated with the authenticated account. This simplifies setup by allowing most modern clients to automatically locate and configure calendar access without manual URL input.

Alternatively, CalDAV calendars can be accessed directly via the path `/dav/cal/<account_name>`, where `<account_name>` is the username of the account. For example, the calendar for the account `alice` is available at `/dav/cal/alice`. This direct path can be used in clients that support manual CalDAV configuration or when troubleshooting.

Both methods provide access to the same calendar data and are fully compatible with the CalDAV protocol.

## Limits

Calendar-wide limits are configured on the [Calendar](/docs/ref/object/calendar) singleton (found in the WebUI under <!-- breadcrumb:Calendar --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Calendar<!-- /breadcrumb:Calendar -->). They protect server resources against clients that attempt to create excessively large or complex calendar entries.

### Recurrence expansion

The iCalendar format allows clients to define repeating events using RRULEs (recurrence rules). When such an event is created, Stalwart pre-expands the recurrence pattern into individual instances and stores them, avoiding expensive RRULE calculations on every calendar query.

Recurrence expansion is computationally intensive, especially for long-term or infinitely repeating events. The [`maxRecurrenceExpansions`](/docs/ref/object/calendar#maxrecurrenceexpansions) field on the Calendar singleton limits the number of instances generated from a recurrence rule. The default value is `3000`, sufficient for most realistic scheduling needs (for example, daily events spanning several years). If a recurrence rule would exceed this limit, the server rejects or truncates the event depending on context. Raising the value may significantly affect server performance.

### iCalendar object size

[`maxICalendarSize`](/docs/ref/object/calendar#maxicalendarsize) defines the maximum accepted size of a single iCalendar object (VEVENT, VTODO, and so on). The default is `"512kb"`. Lowering or raising the limit protects against unreasonably large calendar entries while accommodating deployment-specific client behaviour.

### Attendee limit

[`maxAttendees`](/docs/ref/object/calendar#maxattendees) controls the maximum number of attendees allowed in a single iCalendar instance. The default is `20`. Deployments that regularly schedule large meetings may raise this value.

### JMAP parsing limit

The JMAP `CalendarEvent/parse` method is bounded by [`parseLimitEvent`](/docs/ref/object/jmap#parselimitevent) on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket<!-- /breadcrumb:Jmap -->), which sets the maximum number of iCalendar items that can be parsed in a single request. The default is `10`.

## Default calendar

To improve client compatibility and allow calendar operations to proceed without manual setup, Stalwart automatically creates a default calendar when an account is accessed and no calendars currently exist for it. The URL path of the auto-created calendar is controlled by [`defaultHrefName`](/docs/ref/object/calendar#defaulthrefname) on the Calendar singleton. The default value is `"default"`, so for an account named `john` the default calendar is created at `/dav/cal/john/default`. CalDAV clients then always see at least one calendar on first connection.

### Disabling automatic creation

Automatic creation can be suppressed by clearing [`defaultHrefName`](/docs/ref/object/calendar#defaulthrefname) (leaving it unset). In that case, Stalwart does not create a default calendar and clients that connect to an account with no calendars receive an appropriate error response.

### Default display name

The display name assigned to the auto-created calendar (as shown in client applications) is controlled by [`defaultDisplayName`](/docs/ref/object/calendar#defaultdisplayname). The default is `"Stalwart Calendar"`; the value can be adjusted to match organisational branding or language preferences.

## Per-account limits

The Calendar singleton also sets default caps on per-account calendar resources: [`maxCalendars`](/docs/ref/object/calendar#maxcalendars) caps the number of calendars an account can create (default `250`), [`maxEvents`](/docs/ref/object/calendar#maxevents) caps the number of events, [`maxParticipantIdentities`](/docs/ref/object/calendar#maxparticipantidentities) caps participant identities (default `100`), and [`maxEventNotifications`](/docs/ref/object/calendar#maxeventnotifications) caps event notifications. These apply unless overridden at the account or tenant level.
