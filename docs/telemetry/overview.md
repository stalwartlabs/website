---
sidebar_position: 1
---

# Overview

Telemetry is the automated process of collecting, transmitting, and analyzing data from a system to monitor its performance, diagnose issues, and optimize operations. In the context of Stalwart Mail Server, telemetry is crucial for gaining insights into system behavior, tracking performance metrics, and ensuring the reliability and security of the mail service.

Stalwart offers several mechanisms to facilitate the collection of logs, traces, and metrics, enabling administrators and developers to comprehensively monitor and analyze the system's performance. The available telemetry mechanisms include:

- [OpenTelemetry](/docs/telemetry/tracing/opentelemetry): A vendor-neutral standard that provides a set of tools and APIs for collecting distributed traces and metrics. It enables seamless integration with various observability platforms, allowing for consistent monitoring across different systems and services.
- [Webhooks](/docs/telemetry/webhooks): A method for sending real-time notifications to external systems or services. Stalwart can trigger webhooks based on specific events or conditions, providing instant updates and allowing for automated responses or further analysis.
- [Log Files](/docs/telemetry/tracing/log): Traditional text-based files where Stalwart records detailed logs of system events and activities. These logs can be stored locally and accessed for troubleshooting, auditing, or analysis.
- [Journald](/docs/telemetry/tracing/journal): A system service for collecting and managing log data, particularly in Linux environments. Journald provides structured and centralized logging, making it easier to search, filter, and manage logs.
- [Console](/docs/telemetry/tracing/console): The standard output and error streams where Stalwart can display real-time logs and messages. This is useful for debugging and monitoring the system during active sessions.
- [HTTP Event Streams](/docs/telemetry/overview): A mechanism for streaming real-time events over HTTP. This allows clients to subscribe to specific events and receive updates as they occur, facilitating real-time monitoring and alerting.

By leveraging these telemetry mechanisms, administrators can gain valuable insights into the operational state of Stalwart Mail Server, quickly identify and resolve issues, and optimize performance for better user experiences.
