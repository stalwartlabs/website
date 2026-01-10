---
sidebar_position: 6
---

# Alerts

The Alerts feature in the Stalwart is designed to proactively notify administrators when specific conditions are met within the server’s operations. This feature is essential for maintaining optimal server performance and ensuring that potential issues are addressed promptly. By setting up alerts, you can stay informed about critical metrics and take immediate action when necessary, minimizing downtime and enhancing the overall reliability of your mail server.

Alerts work by monitoring various server metrics and sending a notification when those metrics reach predefined thresholds. Notifications can be delivered via email or through a webhook, depending on your preference and the needs of your monitoring infrastructure. This flexibility allows you to integrate alerts seamlessly into your existing systems, ensuring that you receive timely information in the most convenient way possible.

The condition that triggers an alert is configured using an expression that can combine one or multiple metrics. These expressions allow for complex conditions to be set, ensuring that alerts are only triggered when specific criteria are met. For example, an alert can be configured with an expression like `server_memory > 1024 * 1024 * 1024 && queue_count > 5000`, which would notify you if the server memory usage exceeds 1 GB while the message queue count surpasses 5,000. This capability to combine metrics into a single alert condition provides precise control over when and how you are notified.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

## Configuration

Alerts are configured in the `metrics.alerts.<id>` section of the configuration file, where `<id>` is a unique identifier for the alert. The following parameters can be configured for alerts:

- `enable`: A boolean parameter that determines whether the alert is active. Setting this to `true` enables the alert, while `false` disables it. Default is `false`.
- `condition`: The condition that triggers the alert. This is an [expression](/docs/configuration/expressions/overview) that combines one or multiple metrics using logical operators (e.g., `&&` for AND, `||` for OR). The expression should evaluate to `true` when the alert should be triggered. Due to the fact that variable names can only contain alphanumeric characters and underscores, metric and event names in the expression should be formatted accordingly, for example `security_brute_force_ban` instead of `security.brute-force-ban`.

### Event Notification

Alerts can be configured to trigger an event which can then be collected by a [webhook](/docs/telemetry/webhooks). The following parameters can be configured for event notifications:

- `notify.event.enable`: A boolean parameter that determines whether an event notification should be triggered when the alert condition is met. Setting this to `true` enables the event notification, while `false` disables it. Default is `false`.
- `notify.event.message`: The message to be included in the event notification. This message can contain placeholders for the metrics that triggered the alert, which will be replaced with the actual values when the event is generated.

### Email Notification

Alerts can also be configured to send email notifications when the alert condition is met. The following parameters can be configured for email notifications:

- `notify.email.enable`: A boolean parameter that determines whether an email notification should be sent when the alert condition is met. Setting this to `true` enables the email notification, while `false` disables it. Default is `false`.
- `notify.email.from-name`: The name of the sender that will appear in the email notification.
- `notify.email.from-addr`: The email address of the sender that will appear in the email notification.
- `notify.email.to`: A list of email addresses to which the notification should be sent.
- `notify.email.subject`: The subject line of the email notification. The subject can contains placeholders for the metrics that triggered the alert, which will be replaced with the actual values when the email is sent.
- `notify.email.body`: The body of the email notification. This message can contain placeholders for the metrics that triggered the alert, which will be replaced with the actual values when the email is sent.

## Example

```toml
[metrics.alerts.too-many-db-errors]
enable = true
condition = "store_foundationdb_error > 100 || store_s3_error > 100"

[metrics.alerts.too-many-db-errors.notify.event]
enable = true
message = "Yikes! We're having database errors (FDB: %{store.foundationdb-error}%, S3: %{store.s3-error}% )"

[metrics.alerts.too-many-db-errors.notify.email]
enable = true
from-name = "Alert Subsystem"
from-addr = "alert@example.com"
to = ["jdoe@example.com"]
subject = "Found %{store.foundationdb-error}% FDB and %{store.s3-error}% S3 errors"
body = "Sorry for the bad news, but we found %{store.foundationdb-error}% FDB and %{store.s3-error}% S3 errors."
```
