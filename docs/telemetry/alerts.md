---
sidebar_position: 6
---

# Alerts

Alerts notify administrators when a server metric, or a combination of metrics, crosses a defined threshold. The condition is evaluated continuously against the live metrics stream, and when it holds, a notification is emitted. Notifications can be delivered as an in-server event (which a [webhook](/docs/telemetry/webhooks) can forward downstream) or as an email message.

The trigger is an expression that can reference one or more metrics. Expressions support logical operators, so conditions such as `store_foundationdb_error > 100 || store_s3_error > 100` can be built up directly. Metric identifiers in the expression use underscores in place of dots and hyphens (`security_brute_force_ban` rather than `security.brute-force-ban`) because the expression language restricts variable names to alphanumeric characters and underscores.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

Each alert is represented by an [Alert](/docs/ref/object/alert) object (found in the WebUI under <!-- breadcrumb:Alert --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Alerts<!-- /breadcrumb:Alert -->). The relevant fields are:

- [`enable`](/docs/ref/object/alert#enable): whether the alert is active. Default `true`.
- [`condition`](/docs/ref/object/alert#condition): the expression evaluated against incoming metrics. The alert fires when the expression evaluates to true.
- [`eventAlert`](/docs/ref/object/alert#eventalert): event notification settings. A nested type with variants `Disabled` and `Enabled`.
- [`emailAlert`](/docs/ref/object/alert#emailalert): email notification settings. A nested type with variants `Disabled` and `Enabled`.

### Event notification

When the `Enabled` variant of [`eventAlert`](/docs/ref/object/alert#eventalert) is selected, the alert emits a `telemetry.alert` event whenever [`condition`](/docs/ref/object/alert#condition) holds. The event can be captured by a [WebHook](/docs/ref/object/web-hook) so that downstream systems receive the notification.

The fields on the `Enabled` variant are:

- [`eventMessage`](/docs/ref/object/alert#alerteventproperties): message carried by the emitted event. May reference metric values using placeholders.

### Email notification

When the `Enabled` variant of [`emailAlert`](/docs/ref/object/alert#emailalert) is selected, the server sends an email each time the condition becomes true. The fields on the `Enabled` variant are:

- [`fromName`](/docs/ref/object/alert#alertemailproperties): optional display name of the sender.
- [`fromAddress`](/docs/ref/object/alert#alertemailproperties): sender email address.
- [`to`](/docs/ref/object/alert#alertemailproperties): list of recipient addresses.
- [`subject`](/docs/ref/object/alert#alertemailproperties): subject line. May reference metric values using placeholders.
- [`body`](/docs/ref/object/alert#alertemailproperties): message body. May reference metric values using placeholders.

## Example

The following Alert fires when the count of FoundationDB or S3 errors exceeds one hundred. It raises an event notification carrying a message with the current counts and also sends an email with the same information:

```json
{
  "enable": true,
  "condition": {
    "else": "store_foundationdb_error > 100 || store_s3_error > 100"
  },
  "eventAlert": {
    "@type": "Enabled",
    "eventMessage": "Database errors: FDB %{store.foundationdb-error}%, S3 %{store.s3-error}%"
  },
  "emailAlert": {
    "@type": "Enabled",
    "fromName": "Alert Subsystem",
    "fromAddress": "alert@example.com",
    "to": ["jdoe@example.com"],
    "subject": "Found %{store.foundationdb-error}% FDB and %{store.s3-error}% S3 errors",
    "body": "We found %{store.foundationdb-error}% FDB and %{store.s3-error}% S3 errors."
  }
}
```
