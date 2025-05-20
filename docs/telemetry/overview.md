---
sidebar_position: 1
---

# Overview

Telemetry is the automated process of collecting, transmitting, and analyzing data from a system to monitor its performance, diagnose issues, and optimize operations. In the context of Stalwart, telemetry is crucial for gaining insights into system behavior, tracking performance metrics, and ensuring the reliability and security of the mail service.

Stalwart offers several mechanisms to facilitate the collection of logs, traces, and metrics, enabling administrators and developers to comprehensively monitor and analyze the system's performance. The available telemetry mechanisms include:

- [Tracing and logging](/docs/telemetry/tracing/overview): Detailed tracing and logging information to help users monitor and understand the behavior of Stalwart. The logging mechanisms can be configured to output to a file, standard output, or send tracing information to OpenTelemetry, providing valuable insights into system events and activities.
- [Metrics](/docs/telemetry/metrics/overview): A set of quantitative measurements that track the performance and behavior of Stalwart. Metrics can include information such as resource usage, network traffic, and response times, allowing administrators to monitor system health and identify performance bottlenecks.
- [Webhooks](/docs/telemetry/webhooks): A method for sending real-time notifications to external systems or services. Stalwart can trigger webhooks based on specific events or conditions, providing instant updates and allowing for automated responses or further analysis.
- [Live telemetry](/docs/telemetry/live): A mechanism for streaming real-time events and metrics over HTTP. This allows clients to subscribe to specific events or metrics and receive updates as they occur, facilitating real-time monitoring and alerting.
- [Alerts](/docs/telemetry/alerts): A system for defining and triggering alerts based on specific conditions or thresholds. Alerts can notify administrators of critical issues, performance degradations, or security incidents, enabling rapid response and issue resolution.
- [History](/docs/telemetry/history): A record of past events, activities and metrics within the system. By maintaining a history of events, administrators can review past actions, diagnose issues, and analyze trends over time.

By leveraging these telemetry mechanisms, administrators can gain valuable insights into the operational state of Stalwart, quickly identify and resolve issues, and optimize performance for better user experiences.
