---
sidebar_position: 1
---

# Overview

Stalwart MTA supports both the **generation** and **analysis** of a variety of email-related reports to aid in message delivery transparency, authentication monitoring, and transport security compliance. These reports provide valuable insight into the health and trustworthiness of your mail infrastructure, and can be used both operationally and for long-term policy evaluation.

Stalwart can generate and send multiple types of standardized reports, which help ensure that sending domains maintain a good reputation and that outgoing messages are properly authenticated and securely delivered. The following types of reports are supported:

- [Delivery Status Notifications (DSNs)](/docs/mta/reports/dsn): These reports inform senders about delivery issues, such as delays, soft failures, or permanent bounces. DSNs are sent automatically based on delivery outcomes and configuration.
- [DMARC Aggregate Reports](/docs/mta/reports/dmarc#aggregate): Summarize authentication results (SPF, DKIM) for messages claiming to come from a domain. These are typically sent daily and allow domain owners to see how their email is being handled across the internet.
- [DMARC Failure Reports](/docs/mta/reports/dmarc#failures): Sent when a message claiming to be from your domain fails DMARC alignment. These can help identify spoofing or unauthorized senders.
- [TLS Aggregate Reports](/docs/mta/reports/tls): Provide a summary of the success or failure of STARTTLS connections with other mail servers. These are useful for detecting misconfigurations or policy enforcement failures in transport layer security.
- [DKIM Failure Reports](/docs/mta/reports/dkim): Triggered when a message fails DKIM validation checks. These can be used to diagnose signing issues or policy misconfigurations.
- [SPF Failure Reports](/docs/mta/reports/spf): Sent when a message fails SPF checks. These reports help identify unauthorized senders or misconfigured SPF records.

In addition to sending reports, Stalwart can [receive and automatically analyze](/docs/mta/reports/analysis) a wide range of incoming email security reports. This includes **DMARC Aggregate Reports**, **SMTP TLS Aggregate Reports**, **Authentication Failure Reports** (e.g., DKIM, SPF, and DMARC failures) and **ARF Reports** (Abuse Reporting Format, used for spam complaints and security incidents). Upon receipt, these reports are parsed and stored for visualization within the [WebAdmin interface](/docs/management/webadmin/overview). This enables administrators to review authentication trends, detect anomalies, and track policy enforcement results over time.

If any problems are detected—such as unusually high failure rates or authentication misalignments—Stalwart can generate **warnings** which are forwarded to the configured [logging or tracing](/docs/telemetry/overview) mechanism. Additionally, these warnings can be configured to trigger [webhooks](/docs/telemetry/webhooks), allowing integration with external monitoring systems, dashboards, or automated response workflows.

## Configuration

### Report Domain

The `report.domain` setting specifies the default domain to be used as the organizational identity in outgoing reports. This domain appears in the sender address as well as fields such as the `Reporting-MTA` in DSNs, the `reporting-org` in DMARC aggregate reports, and the domain of the `report-id` used for message correlation.

This setting ensures consistency and traceability across all reports originating from the MTA. It should typically be set to the domain responsible for the mail infrastructure.

For example:

```toml
[report]
domain = "example.org"
```
If not explicitly defined, the domain portion of the system's hostname will be used as a fallback.

### Submitter Address

The `report.submitter` setting defines the hostname or identifier to use in the `Submitter` field of certain report types, such as DMARC aggregate reports. This helps identify which specific MTA instance or system submitted the report, which can be useful in multi-node or distributed environments.

If not configured, the default value is derived dynamically using the expression `config_get("server.hostname")`, which retrieves the local server's hostname from the runtime configuration.

For example:

```toml
[report]
submitter = "'mx.example.org'"
```

This setting is especially useful for distinguishing reports in deployments where multiple relays or clusters may be operating under the same reporting domain.
