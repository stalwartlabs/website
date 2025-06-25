---
sidebar_position: 5
---

# Notifications

Calendar email notifications in Stalwart allow users to receive alerts for upcoming events directly in their email inbox. These notifications are triggered by **alarms** defined within calendar entries using the iCalendar standard.

When a calendar event includes a `VALARM` component with the action type set to `EMAIL`, Stalwart processes the alarm and generates an email message to notify the user at the scheduled time. This can be used to remind users of upcoming meetings, deadlines, or other important events without requiring them to have a calendar application actively running.

Email notifications include the details of the event, such as the summary, start time, location, and description, and are delivered to the email address associated with the calendar user. This ensures that users stay informed and on schedule, even if they are not currently using a CalDAV client or web calendar interface.

Stalwart handles the delivery of these messages automatically based on the alarm's trigger settings and ensures reliable, standards-compliant behavior in line with the iCalendar specification.

## Client Limitations

Unfortunately, most mainstream CalDAV clients **do not support the `ACTION:EMAIL` alarm type**. In many cases, alarms configured with this action are ignored entirely. Some clients, such as **Apple Calendar**, go further by actively **removing `VALARM` components** that specify `ACTION:EMAIL`, preventing the alarm from ever reaching the server.

To work around these limitations, Stalwart allows users to **mark any alarm as an email notification**, even if the action type is something else (such as `DISPLAY`). This is done by including the special marker string **`@email`** anywhere in the alarm's **summary** or **description** fields.

When Stalwart detects this marker, it treats the alarm as if it were configured with `ACTION:EMAIL` and will send an email notification accordingly, regardless of what the actual `ACTION` field says. This allows users to continue using their preferred calendar clients while still receiving timely email alerts for important events.

This workaround offers a practical and reliable solution for enabling email-based alarms in environments where client support is lacking or inconsistent.

## Enabling Notifications

Calendar Email Notifications are **enabled by default** in Stalwart, allowing users to receive email alerts for calendar alarms without requiring additional configuration. When an event includes a supported alarm—either a standard `VALARM` with `ACTION:EMAIL` or one marked with the `@email` hint—Stalwart will automatically deliver the corresponding notification to the user’s email address.

Administrators who wish to **disable email notifications globally** can do so by setting the configuration option `calendar.alarms.enabled` to `false`. When this option is disabled, Stalwart will ignore all email alarms, regardless of their configuration or presence in the calendar data.

For more granular control, email notifications can also be **disabled on a per-user basis** by adjusting the user's [permissions](/docs/auth/authorization/permissions). This is useful in multi-tenant environments or when applying user-specific notification policies. By revoking the appropriate permission, administrators can selectively prevent individual users from receiving alarm-triggered emails while leaving the feature enabled for others.

## Limits

### Notification Interval

By default, Stalwart enforces a **minimum interval** between email alarms for a single user. This is controlled by the `calendar.alarms.minimum-interval`setting, which specifies the shortest duration allowed between consecutive email notifications. The default value is `1h`, meaning that no more than one email alarm will be sent per user within a one-hour window, even if multiple alarms are triggered in quick succession. This helps protect the system from excessive notification volume due to misconfigured or malicious calendar entries.

### External Recipients

Additionally, Stalwart restricts email alarm delivery to a user’s **registered email addresses** by default. This ensures that notifications are only sent to trusted, verified destinations associated with the user’s account. To allow users to send alarm notifications to **external recipients**, administrators must explicitly enable this behavior by setting `calendar.alarms.allow-external-recipients` to `true`.

When this setting is enabled, users can configure alarms that deliver notifications to arbitrary email addresses, including those outside the organization. This can be useful for shared calendars or coordinating with external participants, but should be enabled with care in environments where tighter control over outbound communication is required.

Example:

```toml
[calendar.alarms]
enabled = true
minimum-interval = "1h"
allow-external-recipients = false
```

## Sender Details

Stalwart allows administrators to customize the **sender information** used in calendar email notifications, providing greater flexibility and alignment with organizational branding or mail handling policies.

By default, notification emails are sent with the **From Name** set to `Stalwart Calendar` and the **From Email** address is automatically generated as`calendar-notification@<user_domain>` where `<user_domain>` corresponds to the domain of the user receiving the notification.

These defaults can be overridden using the `calendar.alarms.from.name` option, which sets a custom display name to appear in the From field of the email header, and the `calendar.alarms.from.email` option, which specifies a custom email address to be used as the sender.

Example:

```toml
[calendar.alarms.from]
name = "My Organization Calendar"
email = "calendar-notification@myorg.com"
```

## Branding and Templating

Stalwart provides support for **custom branding and templating** in its calendar alarm notification system, allowing administrators to fully control the visual appearance and content of email alerts generated from calendar alarms. This ensures a consistent and professional experience for users receiving reminders via email and allows for alignment with organizational branding.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

### Template

Stalwart includes a built-in default HTML template for alarm email notifications, but this template can be fully customized by administrators. Customizing the template allows organizations to include their branding, messaging, and any additional contextual details that may improve clarity or user trust.

The template is written in standard HTML and supports dynamic placeholders for inserting event-specific information such as the event summary, time, location, and alarm details. It can also include styles, logos, and layout adjustments to match an organization’s visual identity.

To override the default template, administrators can set the `calendar.alarms.template` configuration option with a custom HTML string. This controls how the email alarm will appear to recipients when triggered by a calendar event.

Example configuration:

```toml
[calendar.alarms]
template = "<html> .. custom email alarm template .. </html>"
```

### Logo

The alarm email template includes a **logo**, which by default is the system-wide branding logo configured for the server. This logo can be **overridden per tenant or per domain**, allowing organizations to present appropriate branding to different user groups. For instance, separate business units, clients, or hosted domains can each display their own logo in alarm emails.

For details on how to configure branding overrides, refer to the [Branding](/docs/management/webadmin/branding) section of the documentation.

