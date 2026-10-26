---
sidebar_position: 5
title: "Notifications"
---

A calendar that only records events is easy to forget about. Users also need to be reminded when an event is near, and to learn when someone else changes a calendar they share. Stalwart notifies users about calendar events in two ways. Alarm emails remind a user of an upcoming event at the time an alarm in the event specifies, so the reminder arrives even when no calendar application is running. Event notifications tell the users of a shared calendar that someone else created, changed or deleted an event. This page covers both.

## Alarm emails

An iCalendar event carries its reminders as `VALARM` components, each with an action that says how the reminder is delivered. When an alarm with the action `EMAIL` (JMAP `"action": "email"`) is due, Stalwart sends an email with the event's summary, time, location and description. Alarms with any other action, such as `DISPLAY`, are never emailed. Stalwart delivers them to JMAP clients as push notifications instead.

The recipient of the email depends on the address that the alarm names. The email goes to the attendee named in the alarm when that address belongs to the account, or to any named address when [`allowExternalRcpts`](#external-recipients) is enabled. Otherwise it goes to the account's primary address. For a sharee's own alarm on a shared calendar, the email goes to the sharee.

Several conditions restrict which alarms are sent at all. Alarms fire only for users subscribed to one of the event's calendars. They are not sent for draft events. For a sharee, they are sent only when the event is public, as described in [Event privacy](/docs/collaboration/calendar#event-privacy). Finally, sending them requires the `calendarAlarmsSend` permission on the recipient account.

### Marking an alarm for email

Many CalDAV clients offer no way to create an alarm with the action `EMAIL`, which would leave their users without alarm emails. As a workaround, Stalwart treats any alarm whose summary or description contains the literal text `@email` as an email alarm, whatever its action. Users can therefore create an ordinary reminder in their client and add `@email` to its description to receive it by email. Descriptions that a client generates automatically (marked `DERIVED=TRUE`) do not count.

## Enabling alarm emails

Alarm emails are configured on the [CalendarAlarm](/docs/ref/object/calendar-alarm) singleton, found in the WebUI under <!-- breadcrumb:CalendarAlarm --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Alarms<!-- /breadcrumb:CalendarAlarm -->. They are <!-- default:CalendarAlarm.enable as=enabled -->enabled<!-- /default --> by default. While they are enabled, every event that includes a supported alarm produces an email when the alarm is due. A supported alarm is either a `VALARM` with `ACTION:EMAIL`, or one marked with the `@email` hint.

Alarm emails can be turned off at two levels. Disabling [`enable`](/docs/ref/object/calendar-alarm#enable) turns them off for the whole server, and Stalwart then ignores all email alarms in the calendar data. To stop alarm emails for some accounts only, revoke the corresponding [permission](/docs/auth/authorization/permissions) from them, which leaves the feature enabled for the others.

## Limits

Two settings on the CalendarAlarm singleton limit how often, and to whom, alarm emails are sent.

### Notification interval

An event with many closely spaced alarms would otherwise flood its users with reminders. [`minTriggerInterval`](/docs/ref/object/calendar-alarm#mintriggerinterval) guards against this. It is the shortest time between two alarms of the same event for the same user, <!-- default:CalendarAlarm.minTriggerInterval -->1 hour<!-- /default --> by default. After an alarm of an event fires, further alarms of that event that would fire within this interval are skipped. The interval applies to email and display alarms alike, and alarms of different events do not affect each other.

### External recipients

[`allowExternalRcpts`](/docs/ref/object/calendar-alarm#allowexternalrcpts) decides whether alarm emails may leave the account's registered addresses. It is <!-- default:CalendarAlarm.allowExternalRcpts as=enabled -->disabled<!-- /default --> by default. While it is disabled, alarms are delivered only to the account's own addresses, so that notifications go only to trusted destinations.

Enabling it permits alarms that deliver notifications to arbitrary addresses, including those outside the organisation. This can be useful for shared calendars or external participants. It should be done with care, however, where outbound communication must be tightly controlled.

The following configuration keeps alarm emails enabled, sets the interval to 30 minutes and allows external recipients:

```json
{
  "enable": true,
  "minTriggerInterval": 1800000,
  "allowExternalRcpts": true
}
```

## Sender details

Alarm emails are sent with the display name in [`fromName`](/docs/ref/object/calendar-alarm#fromname), <!-- default:CalendarAlarm.fromName -->`Stalwart Calendar`<!-- /default --> by default. The sender address is set through [`fromAddress`](/docs/ref/object/calendar-alarm#fromaddress). When it is unset, the address is generated as `calendar-notification@<user_domain>`, where `<user_domain>` is the domain of the account receiving the notification.

The following override sends alarm emails under the organisation's own name and address:

```json
{
  "fromName": "My Organization Calendar",
  "fromAddress": "calendar-notification@myorg.com"
}
```

## Branding and templating

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

The appearance and content of alarm emails can be aligned with the organisation's branding, through a custom template and a logo.

### Template

Stalwart ships with a built-in HTML template for alarm emails. Setting [`template`](/docs/ref/object/calendar-alarm#template) on the CalendarAlarm singleton to a custom HTML string replaces it. The template is standard HTML, with its own styles, logos and layout, and it supports placeholders for event-specific information, such as the event summary, time, location and alarm details.

### Logo

The alarm email template includes a logo. It is the system-wide branding logo configured for the server, unless it is overridden for a tenant or a domain. Different user groups, business units or hosted domains can therefore display their own logo in alarm emails. [Branding](/docs/management/webui/branding) describes the overrides.

## Event notifications

On a shared calendar, users need to know what others have changed. Stalwart records a calendar event notification when another user creates, changes or deletes an event in a shared calendar. It also records one when an incoming invitation, reply or cancellation changes an event. JMAP clients read these as `CalendarEventNotification` objects, defined by [JMAP for Calendars](https://datatracker.ietf.org/doc/draft-ietf-jmap-calendars/), and show them as a list of recent changes. Each notification names the type of change (`created`, `updated` or `destroyed`) and the user who made it.

A notification is shown to the users who can read the calendar and are subscribed to it, except the user who made the change. Members of the account that owns the calendar, including the members of a group account, are subscribed by default, whereas sharees see notifications once they subscribe. Some events reveal more than others, so their notifications are restricted. Changes to private and secret events, and to events with hidden attendees, are shown only to members of the owning account. For events with hidden attendees, they are also shown to sharees who may write all of the event's calendars.

Each user dismisses a notification independently, by destroying it in JMAP, and the notification remains for the other users. Notifications count towards the account's disk quota, and three mechanisms remove them:

- When an account reaches the [`maxEventNotifications`](/docs/ref/object/calendar#maxeventnotifications) limit on the Calendar object, the oldest notification is replaced by the new one. The number is unlimited while the field is unset.
- Notifications are removed when their calendars are deleted.
- Notifications older than [`expungeSchedulingInboxAfter`](/docs/ref/object/data-retention#expungeschedulinginboxafter), <!-- default:DataRetention.expungeSchedulingInboxAfter -->30 days<!-- /default --> by default, are removed by the regular account clean-up.
