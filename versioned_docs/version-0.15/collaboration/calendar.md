---
sidebar_position: 3
---

# Calendar

Stalwart includes full support for **calendar management and scheduling** through the **JMAP** and **CalDAV** protocols, enabling users to create, access, and synchronize calendar data across devices and applications.

## JMAP for Calendars

**JMAP for Calendars** is a protocol that provides a modern, JSON-based API for managing calendar data such as events, tasks, and scheduling information. It is designed as a replacement for CalDAV and CalDAV Scheduling, offering the same functionality—creating, reading, updating, deleting, and sharing calendar data—but in a much simpler and more consistent way.

Unlike CalDAV, which is built on top of WebDAV and uses XML combined with embedded iCalendar data, JMAP for Calendars is entirely JSON over HTTPS. It uses the same core request/response model as JMAP for Mail, providing a unified protocol for all personal data types.

## CalDAV

**CalDAV** is a standardized extension of WebDAV that allows clients to interact with calendar data stored on a server. It is widely supported by calendar applications on desktops and mobile devices, including Apple Calendar, Thunderbird, Outlook (with plugins), and many others. CalDAV enables features such as creating events, setting recurring appointments, inviting participants, and viewing shared calendars, all using a common protocol. By supporting CalDAV, Stalwart provides users with a flexible and interoperable calendar system that integrates seamlessly into both personal and organizational workflows. Calendars stored on the server can be accessed and managed from anywhere, ensuring consistent scheduling and collaboration across platforms.

### Accessing Calendars

CalDAV clients can access calendar data on the Stalwart using standardized URLs, ensuring compatibility with a wide range of calendar applications. The recommended method for client configuration is through the **autodiscovery endpoint** located at `/.well-known/caldav`. When a client queries this path, the server redirects the request to the appropriate CalDAV resource associated with the authenticated user. This simplifies setup by allowing most modern clients to automatically locate and configure calendar access without requiring manual URL input.

Alternatively, CalDAV calendars can be accessed directly via the path `/dav/cal/<account_name>`, where `<account_name>` is the username of the account. For example, the calendar for user `alice` would be available at `/dav/cal/alice`. This direct path can be used in clients that support manual CalDAV configuration or when troubleshooting.

Both methods provide access to the same calendar data and are fully compatible with the CalDAV protocol. Stalwart’s support for these endpoints ensures smooth integration with existing CalDAV clients while offering flexibility for both automatic and manual configuration.

## Limits

To ensure optimal performance and protect server resources, Stalwart allows administrators to define limits on calendar-related operations. These settings help prevent abuse or misconfiguration from clients that may attempt to create excessively large or complex calendar entries.

### Recurrence Expansion

The `calendar.max-recurrence-expansions` setting is one of the most important calendar performance settings. The iCalendar format allows clients to define repeating events using **RRULEs** (recurrence rules), which define how an event repeats over time (e.g., every day, every week, etc.). When such an event is created, **Stalwart pre-expands the recurrence pattern into individual instances** and stores them. This approach improves performance by avoiding expensive RRULE calculations on every calendar query.

However, recurrence expansion is a computationally intensive task, especially for long-term or infinitely repeating events. To safeguard the server, the `calendar.max-recurrence-expansions` setting limits the number of instances that will be generated from a recurrence rule. The default value is **3000**, which is sufficient for most realistic scheduling needs (e.g., daily events over several years). If a recurrence rule would exceed this limit, the server will reject or truncate the event, depending on context.

Administrators should be cautious when increasing this value, as very high recurrence expansions may significantly impact server performance.

Example:

```toml
[calendar]
max-recurrence-expansions = 3000
```

### iCalendar Object Size

The `calendar.max-size` setting defines the maximum allowed size (in bytes) of a single iCalendar object (VEVENT, VTODO, etc.) submitted to the server. By default, this limit is set to **512 KB**. This helps prevent clients from uploading unreasonably large calendar entries that could impact memory usage or processing performance. If needed, this value can be increased or decreased depending on your deployment’s use case and client behavior.

Example:

```toml
[calendar]
max-size = 524288
```

### Attendee Limit

The `calendar.max-attendees-per-instance` setting controls the maximum number of attendees allowed per calendar event instance. The default value is **20 attendees**. This helps protect against unusually large meeting invitations that could overwhelm the system or client applications. If your organization regularly schedules large meetings or events, this limit can be raised accordingly.

Example:

```toml
[calendar]
max-attendees-per-instance = 20
```

### JMAP Parsing Limit

When using JMAP to interact with calendar data, the `jmap.calendar.parse.max-items` setting limits how many iCalendar objects can be parsed in a single JMAP `CalendarEvent/parse` request. The default value is **100 items**. This prevents excessively large requests from consuming too many server resources. If your use case requires processing more items in a single request, this limit can be adjusted.

Example:

```toml
[jmap.calendar.parse]
max-items = 100
```

## Default Calendar

To streamline client compatibility and ensure that calendar operations can proceed without manual setup, Stalwart **automatically creates** a default calendar when a user account is accessed and no calendars currently exist for that user.
The location (URL path) of the automatically created calendar is determined by the `calendar.default.href-name` setting. By default, this is set to `"default"`, which means that for a user named `john`, the default calendar will be created at `/dav/cal/john/default`. This behavior ensures that CalDAV clients always have at least one calendar to work with, avoiding errors or empty interfaces when first connecting to the server.

```toml
[calendar.default]
href-name = "default"
```

### Disabling Automatic Creation

If automatic calendar creation is not desired—for example, in environments where calendars are provisioned manually or via external tools—you can disable this feature by setting `calendar.default.href-name` to `false`. Example:

```toml
[calendar.default]
href-name = false
```

When this setting is disabled, Stalwart will **not** create a default calendar automatically, and clients attempting to access calendar data for an account without any calendars will receive an appropriate error response.

### Default Display Name

The display name used for the default calendar (as shown in client applications) is controlled by the `calendar.default.display-name` setting. By default, this value is set to `Stalwart Calendar`.

Example:

```toml
[calendar.default]
display-name = "Stalwart Calendar"
```

This name is assigned to the calendar’s `display-name` property and can be customized to better match your organization's branding or language preferences.

