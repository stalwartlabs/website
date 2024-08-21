---
sidebar_position: 7
---

# History

The Tracing History feature provides administrators with a practical mechanism for retaining and reviewing significant server events. Unlike [live tracing](/docs/telemetry/live), which focuses on real-time monitoring, Tracing History is designed to store specific event spans, such as incoming or delivered messages, in a dedicated database. This storage capability ensures that key activities are preserved for future analysis, enabling a deeper understanding of the server's past operations and facilitating effective troubleshooting.

By capturing and retaining critical events, Tracing History allows administrators to look back at the server's activity and identify patterns, issues, or anomalies that may have occurred. These stored events can be queried through a specialized API, providing a flexible and powerful tool for accessing historical data. The API allows administrators to retrieve specific spans based on various criteria, making it easier to pinpoint particular activities or issues that need attention.

To enhance usability, the Tracing History feature is fully integrated into the [WebAdmin](/docs/management/webadmin/overview) interface. Through this interface, administrators can easily filter and visualize the stored event spans, ensuring that they can quickly locate the information they need. The WebAdmin tool presents the historical data in a clear and organized manner, allowing for efficient analysis and informed decision-making.

:::tip Enterprise feature

This feature is available exclusively in the Enterprise Edition of Stalwart Mail Server and not included in the Community Edition.

:::

## Configuration

The Tracing History feature is controlled through the server's configuration file, where you can define the settings for storing and managing historical event spans. The configuration parameters for Tracing History are available under the `tracing.history` key and include the following settings:

- `enable`: A boolean parameter that determines whether the Tracing History feature is active. Setting this to `true` enables the storage of event spans, while `false` disables the feature. Default is `false`.
- `store`: The [data storage backend](/docs/storage/data) used to store historical event spans. 
- `retention`: The duration for which event spans are retained in the history database. This value is specified in days, hours, or minutes (e.g., "7d" for 7 days, "12h" for 12 hours, "30m" for 30 minutes). Default is "30d".

Example:

```toml
[tracing.history]
enable = true
store = "rocksdb"
retention = "30d"
```
