---
sidebar_position: 8
---

# History

The Tracing History feature provides administrators with a practical mechanism for retaining and reviewing significant server events and metrics. Unlike [live telemetry](/docs/telemetry/live), which focuses on real-time monitoring, Telemetry History is designed to store specific event spans (such as incoming or delivered messages) as well as metrics in a dedicated database. This storage capability ensures that key activities and performance indicators are preserved for future analysis, enabling a deeper understanding of the server's past operations and facilitating effective troubleshooting.

By capturing and retaining critical events and metrics, Telemetry History allows administrators to look back at the server's activity and identify patterns, issues, or anomalies that may have occurred. These stored events and metrics can be queried through a specialized [API](/docs/api/management/overview), providing a flexible and powerful tool for accessing historical data. The API allows administrators to retrieve specific spans and metrics based on various criteria, making it easier to pinpoint particular activities or issues that need attention.

To enhance usability, the Telemetry History feature is fully integrated into the [WebAdmin](/docs/management/webadmin/overview) interface under the `Dashboard` and `History` sections. Through this interface, administrators can easily filter and visualize the stored event spans, ensuring that they can quickly locate the information they need. The WebAdmin tool presents the historical data in a clear and organized manner, allowing for efficient analysis and informed decision-making.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

## Tracing Configuration

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

## Metrics Configuration

The Metrics History feature is controlled through the server's configuration file, where you can define the settings for storing and managing historical metrics data. The configuration parameters for Metrics History are available under the `metrics.history` key and include the following settings:

- `enable`: A boolean parameter that determines whether the Metrics History feature is active. Setting this to `true` enables the storage of metrics data, while `false` disables the feature. Default is `false`.
- `store`: The [data storage backend](/docs/storage/data) used to store historical metrics data.
- `retention`: The duration for which metrics data is retained in the history database. This value is specified in days, hours, or minutes (e.g., "7d" for 7 days, "12h" for 12 hours, "30m" for 30 minutes). Default is "90d".
- `interval`: The time interval at which metrics data is sampled and stored in the history database. This value is specified as a [simple cron](/docs/configuration/values/cron) and the default is `0 * *`.

Example:

```toml
[metrics.history]
enable = true
store = "rocksdb"
retention = "90d"
interval = "0 * *"
```
