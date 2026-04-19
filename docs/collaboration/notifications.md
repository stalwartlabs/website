---
sidebar_position: 5
---

# Notifications

Calendar email notifications in Stalwart deliver alerts for upcoming events directly to an account's email inbox. These notifications are triggered by alarms defined within calendar entries using the iCalendar standard.

When a calendar event includes a `VALARM` component with the action type set to `EMAIL`, Stalwart processes the alarm and generates an email message to the account at the scheduled time. This provides reminders for upcoming meetings, deadlines, or other events without requiring a calendar application to be actively running.

Email notifications include the details of the event, such as the summary, start time, location, and description, and are delivered to the email address associated with the calendar account. Delivery is automatic and follows the iCalendar specification.

## Client limitations

Most mainstream CalDAV clients do not support the `ACTION:EMAIL` alarm type. In many cases, alarms configured with this action are ignored entirely. Some clients, such as Apple Calendar, actively remove `VALARM` components that specify `ACTION:EMAIL`, preventing the alarm from ever reaching the server.

To work around these limitations, Stalwart allows any alarm to be marked as an email notification even if the action type is something else (for example, `DISPLAY`). The marker is the literal string `@email` placed anywhere in the alarm's summary or description fields.

When Stalwart detects this marker, it treats the alarm as if it were configured with `ACTION:EMAIL` and sends the email notification regardless of the `ACTION` field. Users can therefore continue using their preferred calendar clients while still receiving timely email alerts for important events.

## Enabling notifications

Calendar alarm email notifications are enabled by default. Configuration is carried on the [CalendarAlarm](/docs/ref/object/calendar-alarm) singleton (found in the WebUI under <!-- breadcrumb:CalendarAlarm --><!-- /breadcrumb:CalendarAlarm -->). When an event includes a supported alarm (either a standard `VALARM` with `ACTION:EMAIL` or one marked with the `@email` hint), Stalwart automatically delivers the corresponding notification.

Global disabling is achieved by setting [`enable`](/docs/ref/object/calendar-alarm#enable) to `false`. With that field disabled, Stalwart ignores all email alarms regardless of their configuration or presence in the calendar data.

For finer control, email notifications can also be disabled on a per-account basis through [permissions](/docs/auth/authorization/permissions). Revoking the appropriate permission selectively prevents individual accounts from receiving alarm-triggered emails while leaving the feature enabled for others.

## Limits

### Notification interval

[`minTriggerInterval`](/docs/ref/object/calendar-alarm#mintriggerinterval) specifies the shortest duration allowed between consecutive email notifications for a single account. The default is `"1h"`, meaning no more than one email alarm is sent per account within a one-hour window even if multiple alarms trigger in quick succession. This guards against excessive notification volume caused by misconfigured or malicious calendar entries.

### External recipients

By default, Stalwart restricts email alarm delivery to an account's registered email addresses so that notifications go only to trusted destinations. [`allowExternalRcpts`](/docs/ref/object/calendar-alarm#allowexternalrcpts) controls this policy; setting it to `true` permits alarms that deliver notifications to arbitrary email addresses, including those outside the organisation. This can be useful for shared calendars or external participants, but should be enabled with care where tighter control over outbound communication is required.

A representative CalendarAlarm configuration:

```json
{
  "enable": true,
  "minTriggerInterval": "1h",
  "allowExternalRcpts": false
}
```

## Sender details

The sender information used in calendar alarm emails is configurable on the CalendarAlarm singleton. By default, notification emails are sent with the From name set to `"Stalwart Calendar"` and the From address generated as `calendar-notification@<user_domain>`, where `<user_domain>` corresponds to the domain of the account receiving the notification.

The display name used in the From field is set through [`fromName`](/docs/ref/object/calendar-alarm#fromname) and the sender address is set through [`fromEmail`](/docs/ref/object/calendar-alarm#fromemail). A representative override:

```json
{
  "fromName": "My Organization Calendar",
  "fromEmail": "calendar-notification@myorg.com"
}
```

## Branding and templating

Stalwart supports custom branding and templating for calendar alarm notifications so that the visual appearance and content of email alerts can be aligned with organisational branding.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

### Template

Stalwart ships with a built-in default HTML template for alarm email notifications. The template can be overridden by setting [`template`](/docs/ref/object/calendar-alarm#template) on the CalendarAlarm singleton to a custom HTML string. The template is written in standard HTML and supports dynamic placeholders for event-specific information (event summary, time, location, alarm details), styles, logos, and layout adjustments.

### Logo

The alarm email template includes a logo, which by default is the system-wide branding logo configured for the server. The logo can be overridden per tenant or per domain so that different user groups, business units, or hosted domains display their own logo in alarm emails. For details, refer to the [Branding](/docs/management/webui/branding) section.
